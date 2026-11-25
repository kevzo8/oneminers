import { NextResponse } from "next/server";
import { answerFromKnowledge, buildSystemPrompt, type ChatMessage } from "@/lib/chat";
import { getMarket } from "@/lib/market";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const windowMs = 60_000;
const maxRequests = 30;
const hits = new Map<string, number[]>();
const SESSION_PATTERN = /^[a-zA-Z0-9-]{16,64}$/;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > maxRequests;
}

function parseMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (item): item is ChatMessage =>
        !!item &&
        typeof item === "object" &&
        ((item as ChatMessage).role === "user" || (item as ChatMessage).role === "assistant") &&
        typeof (item as ChatMessage).content === "string"
    )
    .map((item) => ({ role: item.role, content: item.content.slice(0, 2_000) }))
    .slice(-8);
}

async function convexClient() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  const [{ ConvexHttpClient }, { api }] = await Promise.all([import("convex/browser"), import("@/convex/_generated/api")]);
  return { client: new ConvexHttpClient(url), api };
}

/** Earlier messages for this browser's conversation, read from the database. */
async function loadHistory(sessionId: string | null): Promise<ChatMessage[] | null> {
  if (!sessionId) return null;
  try {
    const convex = await convexClient();
    if (!convex) return null;
    const rows = await convex.client.query(convex.api.chat.history, { sessionId, limit: 12 });
    return rows.map((row) => ({ role: row.role, content: row.content }));
  } catch (err) {
    console.warn("[chat] history unavailable", err);
    return null;
  }
}

async function saveTurn(sessionId: string | null, user: string, assistant: string) {
  if (!sessionId) return false;
  try {
    const convex = await convexClient();
    if (!convex) return false;
    await convex.client.mutation(convex.api.chat.appendTurn, { sessionId, user, assistant });
    return true;
  } catch (err) {
    console.warn("[chat] could not save turn", err);
    return false;
  }
}

function sessionFrom(value: unknown) {
  return typeof value === "string" && SESSION_PATTERN.test(value) ? value : null;
}

/** GET /api/chat?sessionId=… → the saved conversation, so it survives page reloads. */
export async function GET(request: Request) {
  const sessionId = sessionFrom(new URL(request.url).searchParams.get("sessionId"));
  if (!sessionId) return NextResponse.json({ messages: [] });
  const history = await loadHistory(sessionId);
  return NextResponse.json({ messages: history ?? [] });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
  }

  let body: { messages?: unknown; sessionId?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sessionId = sessionFrom(body.sessionId);
  const clientMessages = parseMessages(body.messages);
  const question = [...clientMessages].reverse().find((m) => m.role === "user");
  if (!question) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  // The database is the source of truth for the conversation; the browser copy is the fallback.
  const [history, market] = await Promise.all([loadHistory(sessionId), getMarket()]);
  const messages: ChatMessage[] = history ? [...history.slice(-10), question] : clientMessages;

  let reply: string | null = null;
  let source: "model" | "knowledge" = "knowledge";

  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const base = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    try {
      const response = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: 450,
          messages: [{ role: "system", content: buildSystemPrompt(market) }, ...messages],
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (response.ok) {
        const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
        const text = data.choices?.[0]?.message?.content;
        if (typeof text === "string" && text.trim()) {
          reply = text.trim();
          source = "model";
        }
      } else {
        console.warn("[chat] model error", response.status);
      }
    } catch (err) {
      console.warn("[chat] model unavailable", err);
    }
  }

  if (!reply) reply = answerFromKnowledge(messages, market);
  const saved = await saveTurn(sessionId, question.content, reply);

  return NextResponse.json({ reply, source, saved });
}

import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LeadPayload = {
  name?: unknown;
  email?: unknown;
  interest?: unknown;
  message?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
  const email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  const interest = typeof body.interest === "string" ? body.interest.trim().slice(0, 80) : "General";
  const message = typeof body.message === "string" ? body.message.trim().slice(0, 2_000) : "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!emailPattern.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const lead = { id: crypto.randomUUID(), name, email, interest, message, createdAt: new Date().toISOString() };

  if (process.env.LEADS_WEBHOOK_URL) {
    try {
      await fetch(process.env.LEADS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
    } catch {
      // The lead is still acknowledged; the webhook can be retried by the owner.
    }
  }

  // Optionally persist to Convex if a deployment URL is configured.
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (convexUrl) {
    try {
      const { ConvexHttpClient } = await import("convex/browser");
      const { api } = await import("@/convex/_generated/api");
      const client = new ConvexHttpClient(convexUrl);
      await client.mutation(api.leads.create, { name, email, interest, message });
    } catch (e) {
      console.warn("Failed to write lead to Convex", e);
    }
  }

  console.log("[lead]", JSON.stringify({ id: lead.id, name, email, interest }));

  return NextResponse.json({ ok: true, id: lead.id });
}

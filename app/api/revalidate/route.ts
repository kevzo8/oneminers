import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Sellers' portal calls this after saving, so public pages show their changes right away.
// Only directory pages can be refreshed, and requests are rate-limited per IP.
const ALLOWED = [/^\/$/, /^\/miners$/, /^\/miners\/[a-z0-9-]{3,100}$/, /^\/vendors$/, /^\/vendors\/[a-z0-9-]{1,80}$/];
const hits = new Map<string, number[]>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 30) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  hits.set(ip, [...recent, now]);

  let body: { paths?: unknown };
  try {
    body = (await request.json()) as { paths?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const paths = Array.isArray(body.paths) ? body.paths.filter((p): p is string => typeof p === "string").slice(0, 10) : [];
  const valid = paths.filter((path) => ALLOWED.some((pattern) => pattern.test(path)));
  for (const path of valid) revalidatePath(path);
  return NextResponse.json({ ok: true, revalidated: valid });
}

import { NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TARGET_HOST = "oneminers.com";
const MAX_BYTES = 2_000_000;
const MAX_REDIRECTS = 3;

function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 6) {
    const lower = address.toLowerCase();
    if (lower === "::1" || lower === "::") return true;
    if (lower.startsWith("fc") || lower.startsWith("fd") || lower.startsWith("fe80")) return true;
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    return mapped ? isPrivateAddress(mapped[1]) : false;
  }
  const [a, b] = address.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

/** Only public http(s) hosts on default ports, whose DNS resolves to public addresses. */
async function assertPublicUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("That doesn't look like a valid URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Use an http or https URL.");
  if (url.port) throw new Error("Custom ports aren't supported.");
  if (url.username || url.password) throw new Error("URLs with credentials aren't supported.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || !host.includes(".")) {
    throw new Error("Enter your public website address.");
  }
  const records = await lookup(host, { all: true }).catch(() => []);
  if (records.length === 0) throw new Error("We couldn't find that website.");
  if (records.some((record) => isPrivateAddress(record.address))) throw new Error("Enter your public website address.");
  return url;
}

async function readLimited(res: Response) {
  const reader = res.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    size += value.length;
  }
  await reader.cancel().catch(() => undefined);
  return new TextDecoder().decode(Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))));
}

export async function POST(request: Request) {
  let body: { url?: unknown };
  try {
    body = (await request.json()) as { url?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.url !== "string" || body.url.length > 500) {
    return NextResponse.json({ error: "Enter the page URL that links to us." }, { status: 400 });
  }

  try {
    let url = await assertPublicUrl(body.url.trim());
    let res: Response | null = null;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      res = await fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": "MinerDirectoryLinkCheck/1.0", Accept: "text/html" },
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        url = await assertPublicUrl(new URL(location, url).toString());
        continue;
      }
      break;
    }
    if (!res || !res.ok) {
      return NextResponse.json({ ok: true, found: false, status: res?.status ?? 0, checkedUrl: url.toString(), links: [] });
    }

    const html = await readLimited(res);
    const anchors = Array.from(html.matchAll(/<a\b[^>]*>/gi)).map((match) => match[0]);
    const links = anchors
      .map((tag) => {
        const href = tag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
        const rel = tag.match(/rel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "";
        return { href, rel };
      })
      .filter((link) => {
        try {
          const target = new URL(link.href, url);
          return target.hostname === TARGET_HOST || target.hostname.endsWith(`.${TARGET_HOST}`);
        } catch {
          return false;
        }
      })
      .slice(0, 10)
      .map((link) => ({
        href: link.href,
        nofollow: /\b(nofollow|sponsored|ugc)\b/.test(link.rel),
      }));

    return NextResponse.json({ ok: true, found: links.length > 0, status: res.status, checkedUrl: url.toString(), links });
  } catch (err) {
    const message = err instanceof Error && !err.name.includes("Abort") ? err.message : "The page took too long to respond.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

"use node";

import { ConvexError, v } from "convex/values";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

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
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

/** Only public http(s) hosts on default ports whose DNS resolves to public addresses. */
async function assertPublicUrl(raw: string) {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new ConvexError("That doesn't look like a valid URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new ConvexError("Use an http or https URL.");
  if (url.port) throw new ConvexError("Custom ports aren't supported.");
  if (url.username || url.password) throw new ConvexError("URLs with credentials aren't supported.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) || host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || !host.includes(".")) {
    throw new ConvexError("Enter your public website address.");
  }
  const records = await lookup(host, { all: true }).catch(() => []);
  if (records.length === 0) throw new ConvexError("We couldn't find that website.");
  if (records.some((record) => isPrivateAddress(record.address))) throw new ConvexError("Enter your public website address.");
  return url;
}

async function check(rawUrl: string): Promise<{ status: "found" | "missing" | "error"; nofollow: boolean; message?: string; url: string }> {
  try {
    let url = await assertPublicUrl(rawUrl.trim());
    let res: Response | null = null;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      res = await fetch(url, {
        redirect: "manual",
        headers: { "User-Agent": "MinerDirectoryLinkCheck/1.0", Accept: "text/html" },
        signal: AbortSignal.timeout(8000),
      });
      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        url = await assertPublicUrl(new URL(location, url).toString());
        continue;
      }
      break;
    }
    if (!res || !res.ok) return { status: "missing", nofollow: false, url: url.toString(), message: `The page returned HTTP ${res?.status ?? 0}.` };

    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (reader && size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      chunks.push(value);
      size += value.length;
    }
    await reader?.cancel().catch(() => undefined);
    const html = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString("utf8");

    const links = Array.from(html.matchAll(/<a\b[^>]*>/gi))
      .map((match) => ({
        href: match[0].match(/href\s*=\s*["']([^"']+)["']/i)?.[1] ?? "",
        rel: match[0].match(/rel\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase() ?? "",
      }))
      .filter((link) => {
        try {
          const target = new URL(link.href, url);
          return target.hostname === TARGET_HOST || target.hostname.endsWith(`.${TARGET_HOST}`);
        } catch {
          return false;
        }
      });

    if (links.length === 0) return { status: "missing", nofollow: false, url: url.toString(), message: "No link to oneminers.com found on that page." };
    return { status: "found", nofollow: links.every((link) => /\b(nofollow|sponsored|ugc)\b/.test(link.rel)), url: url.toString() };
  } catch (err) {
    const message = err instanceof Error && !err.name.includes("Abort") ? err.message : "The page took too long to respond.";
    return { status: "error", nofollow: false, url: rawUrl, message };
  }
}

/** A seller checks the page on their site that links to oneminers.com. The result is saved server-side. */
export const checkMine = action({
  args: { url: v.string() },
  handler: async (ctx, { url }) => {
    if (url.length > 500) throw new ConvexError("URL is too long.");
    const vendor = await ctx.runQuery(internal.seller.vendorForPartnerCheck, {});
    if (!vendor) throw new ConvexError("Sign in and create your company profile first.");
    const result = await check(url);
    await ctx.runMutation(internal.seller.savePartnerResult, {
      vendorId: vendor._id,
      url: result.url,
      status: result.status,
      nofollow: result.nofollow,
      message: result.message,
    });
    return result;
  },
});

/** Weekly re-check of every approved seller's partner link (see crons.ts). */
export const recheckAll = internalAction({
  args: {},
  handler: async (ctx): Promise<number> => {
    const vendors: { _id: Id<"vendors">; url: string }[] = await ctx.runQuery(internal.seller.vendorsWithPartnerLinks, {});
    for (const vendor of vendors) {
      const result = await check(vendor.url);
      await ctx.runMutation(internal.seller.savePartnerResult, {
        vendorId: vendor._id,
        url: result.url,
        status: result.status,
        nofollow: result.nofollow,
        message: result.message,
      });
    }
    return vendors.length;
  },
});

// Site assistant: system prompt and offline answers, both built from the same live data the
// directory pages show (miner catalog + WhatToMine network data + vendors and offers).

import { allRows, offersForVendor, type Directory } from "./directory";
import { BRAND } from "./brand";
import { HOSTING_PROVIDER, HOSTING_SITES } from "./hosting";
import { dailyProfit, DEFAULT_SETTINGS, formatEfficiency, formatHashrate, formatUsd, type MarketSnapshot } from "./economics";
import type { MinerRow } from "@/components/directory/MinerExplorer";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const HOSTED_RATE = 0.036;

type RankedRow = MinerRow & { profitDefault: number; profitHosted: number };

function rank(dir: Directory, market: MarketSnapshot): RankedRow[] {
  return allRows(dir, market).map((row) => {
    const income = row.topCoin?.usdPerDay ?? 0;
    return {
      ...row,
      profitDefault: dailyProfit(income, row.powerW, DEFAULT_SETTINGS).profit,
      profitHosted: dailyProfit(income, row.powerW, { ...DEFAULT_SETTINGS, electricity: HOSTED_RATE }).profit,
    };
  });
}

function minerLine(row: RankedRow) {
  return [
    `${row.manufacturer} ${row.model}`,
    row.algorithm,
    formatHashrate(row.hashrate, row.unit),
    `${row.powerW} W`,
    formatEfficiency(row.powerW, row.hashrate, row.unit),
    `${row.cooling}${row.category === "Home" ? ", home miner" : ""}`,
    `mines ${row.topCoin?.tag ?? "?"}, income ${formatUsd(row.topCoin?.usdPerDay ?? 0)}/day`,
    `profit ${formatUsd(row.profitDefault)}/day at $0.07/kWh, ${formatUsd(row.profitHosted)}/day at 3.6¢ hosted`,
    `best price ${row.bestPrice ? formatUsd(row.bestPrice, 0) : "n/a"} (${row.offerCount} offers)`,
    `page /miners/${row.slug}`,
  ].join(" | ");
}

/**
 * Full details only for the miners relevant to this conversation (top earners, cheapest profitable,
 * and any model the visitor mentions), plus every model name. Keeps the prompt small enough for
 * free-tier rate limits while the assistant still knows the whole catalog exists.
 */
function relevantRows(all: RankedRow[], conversation: string) {
  const byProfit = [...all].sort((a, b) => b.profitDefault - a.profitDefault);
  const picked = new Map<string, RankedRow>();
  const add = (row: RankedRow) => picked.set(row.slug, row);

  byProfit.slice(0, 6).forEach(add);
  [...all].sort((a, b) => b.profitHosted - a.profitHosted).slice(0, 3).forEach(add);
  all
    .filter((row) => row.bestPrice && row.profitDefault > 0)
    .sort((a, b) => (a.bestPrice ?? 0) - (b.bestPrice ?? 0))
    .slice(0, 3)
    .forEach(add);

  const words = conversation.toLowerCase().split(/[^a-z0-9+]+/).filter((word) => word.length >= 2);
  for (const row of all) {
    const tokens = `${row.manufacturer} ${row.model} ${row.algorithm} ${row.topCoin?.tag ?? ""}`.toLowerCase().split(/[^a-z0-9+]+/);
    const modelHit = tokens.some((token) => /\d/.test(token) && words.includes(token));
    const coinOrAlgoHit = [row.topCoin?.tag?.toLowerCase(), row.algorithm.toLowerCase()].some((t) => t && words.includes(t));
    const makerHit = words.includes(row.manufacturer.toLowerCase());
    if (modelHit || (picked.size < 18 && (coinOrAlgoHit || makerHit))) add(row);
  }
  return [...picked.values()].sort((a, b) => b.profitDefault - a.profitDefault);
}

export function buildSystemPrompt(dir: Directory, market: MarketSnapshot, conversation = "") {
  const all = rank(dir, market);
  const rows = relevantRows(all, conversation);
  const catalog = all.map((row) => row.model).join(", ");
  const updated = new Date(market.updatedAt).toISOString().slice(0, 16).replace("T", " ");
  const vendors = dir.vendors.map(
    (vendor) =>
      `${vendor.name} (${vendor.country}, ${vendor.tier} plan${vendor.verified ? ", verified" : ""}${vendor.hosting ? ", offers hosting" : ""}, ${offersForVendor(dir, vendor.slug).length} listings${vendor.sample ? ", SAMPLE vendor" : ""}) page /vendors/${vendor.slug}`
  ).join("\n");

  return `You are the assistant on ${BRAND.name}, an independent ASIC miner directory. Answer from the DATA below only.

Rules:
- Be concise: 2-5 short sentences. Use exact numbers from the data and link the relevant page path (e.g. /miners/...).
- Profit figures assume today's difficulty and prices and are not guaranteed. Never give investment advice.
- Vendors marked SAMPLE are placeholders until real sellers join, so their prices are not real. Say so if asked about buying from them.
- If the data doesn't cover a question, say so and suggest the contact form (/#contact). Never invent miners, prices, people or company facts.
- Electricity cost decides profitability: compare $0.07/kWh with the listed hosting rates (from 3.6¢/kWh) when relevant.
- Never invent sellers, prices, ratings, stock or company facts. If no seller lists a miner, say so.

DATA (network data ${market.source === "live" ? "live" : "snapshot"} as of ${updated} UTC, BTC $${Math.round(market.btcUsd).toLocaleString("en-US")}):

All ${all.length} miners in the directory: ${catalog}.

Details for the miners relevant to this conversation, most profitable first at $0.07/kWh and 1% pool fee:
${rows.map(minerLine).join("\n")}
If asked about a listed miner without details here, give its page /miners and say the page has live numbers.

Vendors:
${vendors}

Hosting provider listed on the directory: ${HOSTING_PROVIDER} (oneminers.com). Published sites: ${HOSTING_SITES.map((site) => `${site.name} ${(site.rate * 100).toFixed(1)}¢/kWh`).join(", ")}. Compare per miner on /#hosting.

Selling on this directory (/sell): launch promo, the first 6 months are free, then $100/month, no commission, cancel anytime. Listings go live as soon as they're added. Sellers add a partner link to oneminers.com on their site within 14 days (checked automatically). Seller portal: /vendor-portal.

Other pages: all miners /miners, vendors /vendors, profit calculator /#calculator, hosting comparison by site /#hosting, contact /#contact.`;
}

function findMiner(rows: RankedRow[], q: string) {
  const words = q.split(/[^a-z0-9+]+/).filter((word) => word.length >= 2);
  let best: { row: RankedRow; score: number } | null = null;
  for (const row of rows) {
    const name = `${row.manufacturer} ${row.model}`.toLowerCase();
    const tokens = name.split(/[^a-z0-9+]+/).filter(Boolean);
    const score = tokens.filter((token) => token.length >= 2 && words.includes(token)).length;
    const modelHit = tokens.some((token) => /\d/.test(token) && words.includes(token));
    if (modelHit && (!best || score > best.score)) best = { row, score };
  }
  return best?.row ?? null;
}

/** Offline answers when no AI model is configured or reachable. Uses the same live data. */
export function answerFromKnowledge(messages: ChatMessage[], dir: Directory, market: MarketSnapshot) {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const q = (last?.content ?? "").toLowerCase();
  const rows = rank(dir, market);
  const byProfit = [...rows].sort((a, b) => b.profitDefault - a.profitDefault);

  if (!q.trim()) return "Ask me about miner profitability, prices, hosting, or listing your company.";

  const miner = findMiner(rows, q);
  if (miner) {
    return `The ${miner.manufacturer} ${miner.model} (${formatHashrate(miner.hashrate, miner.unit)}, ${miner.powerW} W) earns about ${formatUsd(
      miner.topCoin?.usdPerDay ?? 0
    )}/day mining ${miner.topCoin?.tag}. Profit is ${formatUsd(miner.profitDefault)}/day at $0.07/kWh or ${formatUsd(
      miner.profitHosted
    )}/day hosted at 3.6¢. ${miner.bestPrice ? `Best listed price: ${formatUsd(miner.bestPrice, 0)}.` : "No seller lists it yet."} Details: /miners/${miner.slug}`;
  }

  if (/(sell|list my|listing|vendor|reseller|partner|subscription)/.test(q)) {
    return "Launch promo: list free for the first 6 months, then $100/month with no commission, cancel anytime. Your listings go live as soon as you add them; add a partner link to oneminers.com within 14 days. Start at /vendor-portal.";
  }

  if (/(host|hosting|electric|kwh|power cost|energy)/.test(q)) {
    const top = [...rows].sort((a, b) => b.profitHosted - a.profitHosted)[0];
    return `Hosting is listed from 3.6¢/kWh (${HOSTING_PROVIDER}). At that rate the ${top.model} makes about ${formatUsd(
      top.profitHosted
    )}/day. Compare any miner at your own power price on /miners.`;
  }

  if (/(profit|best|top|earn|recommend|which miner|roi)/.test(q)) {
    const top = byProfit.slice(0, 3).map((row) => `${row.model} (${formatUsd(row.profitDefault)}/day)`);
    return `Most profitable right now at $0.07/kWh: ${top.join(", ")}. Figures use today's difficulty and prices. See the full ranking at /miners.`;
  }

  if (/(cheap|budget|price|cost|how much)/.test(q)) {
    const cheap = rows
      .filter((row) => row.bestPrice && row.profitDefault > 0)
      .sort((a, b) => (a.bestPrice ?? 0) - (b.bestPrice ?? 0))
      .slice(0, 3)
      .map((row) => `${row.model} from ${formatUsd(row.bestPrice ?? 0, 0)}`);
    return `Lowest-priced miners that are profitable at $0.07/kWh: ${cheap.join(", ")}. Prices marked Sample are placeholders. Compare offers on each miner page.`;
  }

  if (/(site|land|marketplace|lease|mw)/.test(q)) {
    return `Listed hosting sites: ${HOSTING_SITES.map((site) => site.name).join(", ")}, from 3.6¢/kWh. Compare a miner's profit at each site on /#hosting.`;
  }

  if (/(hi|hello|hey|good (morning|afternoon|evening))/.test(q)) {
    return "Hi! I can compare miner profitability, find prices across vendors, explain hosting, or help you list your company. What are you looking for?";
  }

  return "I can help with miner profitability, prices, hosting and listing your company. Try asking about a model like the Antminer S21 XP Hyd, or see /miners.";
}

// Site assistant: system prompt and offline answers, both built from the same live data the
// directory pages show (miner catalog + WhatToMine network data + vendors and offers).

import { offersForVendor, VENDORS } from "./catalog";
import { allRows } from "./directory";
import { dailyProfit, DEFAULT_SETTINGS, formatEfficiency, formatHashrate, formatUsd, type MarketSnapshot } from "./economics";
import type { MinerRow } from "@/components/directory/MinerExplorer";

export type ChatMessage = { role: "user" | "assistant"; content: string };

const HOSTED_RATE = 0.036;

type RankedRow = MinerRow & { profitDefault: number; profitHosted: number };

function rank(market: MarketSnapshot): RankedRow[] {
  return allRows(market).map((row) => {
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

export function buildSystemPrompt(market: MarketSnapshot) {
  const rows = rank(market).sort((a, b) => b.profitDefault - a.profitDefault);
  const updated = new Date(market.updatedAt).toISOString().slice(0, 16).replace("T", " ");
  const vendors = VENDORS.map(
    (vendor) =>
      `${vendor.name} (${vendor.country}, ${vendor.tier} plan${vendor.verified ? ", verified" : ""}${vendor.hosting ? ", offers hosting" : ""}, ${offersForVendor(vendor.slug).length} listings${vendor.sample ? ", SAMPLE vendor" : ""}) page /vendors/${vendor.slug}`
  ).join("\n");

  return `You are the assistant on a mining-hardware directory run with OneMiners. Answer from the DATA below only.

Rules:
- Be concise: 2-5 short sentences. Use exact numbers from the data and link the relevant page path (e.g. /miners/...).
- Profit figures assume today's difficulty and prices and are not guaranteed. Never give investment advice.
- Vendor prices and every vendor except OneMiners are SAMPLE data in this demo. Say so if asked about buying or prices.
- If the data doesn't cover a question, say so and suggest the contact form (/#contact). Never invent miners, prices, people or company facts.
- Electricity cost decides profitability: compare $0.07/kWh with OneMiners hosting from 3.6¢/kWh when relevant.

DATA (network data ${market.source === "live" ? "live" : "snapshot"} as of ${updated} UTC, BTC $${Math.round(market.btcUsd).toLocaleString("en-US")}):

Miners, most profitable first at $0.07/kWh and 1% pool fee:
${rows.map(minerLine).join("\n")}

Vendors:
${vendors}

OneMiners (real company facts): sells ASIC miners and hosts them from 3.6¢/kWh in locations including Nigeria, Ethiopia, Dubai, USA (Texas, Georgia, South Carolina, Kansas), Norway, Finland, Canada, Brazil, Paraguay and Czechia. Hosted miners get a 7-year warranty; non-hosted 12 months. Customers manage miners in the OneMiners app (Android/iOS, app.oneminers.com). Website oneminers.com.

Selling on this directory (/sell): resellers list free for 6 months, then $100/month, no commission, cancel anytime. They must link to oneminers.com from their site (partner link, checked automatically) and get company verification. Seller portal: /vendor-portal.

Other pages: all miners /miners, vendors /vendors, profit calculator /#calculator, mining sites marketplace /#marketplace (sample listings).`;
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
export function answerFromKnowledge(messages: ChatMessage[], market: MarketSnapshot) {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const q = (last?.content ?? "").toLowerCase();
  const rows = rank(market);
  const byProfit = [...rows].sort((a, b) => b.profitDefault - a.profitDefault);

  if (!q.trim()) return "Ask me about miner profitability, prices, hosting, or listing your company.";

  const miner = findMiner(rows, q);
  if (miner) {
    return `The ${miner.manufacturer} ${miner.model} (${formatHashrate(miner.hashrate, miner.unit)}, ${miner.powerW} W) earns about ${formatUsd(
      miner.topCoin?.usdPerDay ?? 0
    )}/day mining ${miner.topCoin?.tag}. Profit is ${formatUsd(miner.profitDefault)}/day at $0.07/kWh or ${formatUsd(
      miner.profitHosted
    )}/day hosted at 3.6¢. Best sample price: ${miner.bestPrice ? formatUsd(miner.bestPrice, 0) : "n/a"}. Details: /miners/${miner.slug}`;
  }

  if (/(sell|list my|listing|vendor|reseller|partner|subscription)/.test(q)) {
    return "Resellers list free for 6 months, then $100/month with no commission, and can cancel anytime. You'll need company verification and a link to oneminers.com from your site. Apply at /sell, then manage listings at /vendor-portal.";
  }

  if (/(host|hosting|electric|kwh|power cost|energy)/.test(q)) {
    const top = [...rows].sort((a, b) => b.profitHosted - a.profitHosted)[0];
    return `OneMiners hosts miners from 3.6¢/kWh, with a 7-year warranty on hosted machines. At that rate the ${top.model} makes about ${formatUsd(
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
    return `Lowest-priced miners that are profitable at $0.07/kWh: ${cheap.join(", ")}. Prices in this demo are sample data. Compare offers on each miner page.`;
  }

  if (/(site|land|marketplace|lease|mw)/.test(q)) {
    return "The mining-sites marketplace on the homepage (/#marketplace) shows sample energized sites for sale, lease and hosting. Use the contact form (/#contact) to ask about real availability.";
  }

  if (/(hi|hello|hey|good (morning|afternoon|evening))/.test(q)) {
    return "Hi! I can compare miner profitability, find prices across vendors, explain hosting, or help you list your company. What are you looking for?";
  }

  return "I can help with miner profitability, prices, hosting and listing your company. Try asking about a model like the Antminer S21 XP Hyd, or see /miners.";
}

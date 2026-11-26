import { v } from "convex/values";
import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { CURATED_TO_BACKPOW, RETIRED_CURATED } from "../lib/backpow-map";
import { bestUnit } from "../lib/economics";

// BackPoW — The Proof of Work Oracle (https://backpow.com). Free public JSON; attribution requested.
const BASE = "https://backpow.com";
const HEADERS = { "User-Agent": "NowMining/1.0 (+miner directory; attribution: BackPoW)" };

const TICKERS: Record<string, string> = {
  Bitcoin: "BTC",
  BitcoinCash: "BCH",
  Fractal: "FB",
  eCash: "XEC",
  Litecoin: "LTC",
  Dogecoin: "DOGE",
  Kaspa: "KAS",
  Zcash: "ZEC",
  EthereumClassic: "ETC",
  Dash: "DASH",
  Nervos: "CKB",
  Sia: "SC",
  Alephium: "ALPH",
  Kadena: "KDA",
  Aleo: "ALEO",
};

function prettyName(coinId: string) {
  return coinId.replace(/-/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2");
}

async function getJson(url: string, attempts = 3): Promise<unknown> {
  let last: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.ok) return await res.json();
      last = new Error(`HTTP ${res.status}`);
    } catch (err) {
      last = err;
    }
    await new Promise((resolve) => setTimeout(resolve, 800 * (i + 1)));
  }
  throw last;
}

const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : Number(value));

// ---------------------------------------------------------------------------------------------
// Coins (hourly)

const vCoin = v.object({
  coinId: v.string(),
  tag: v.string(),
  name: v.string(),
  algorithm: v.string(),
  nethashHs: v.number(),
  blockTimeSec: v.number(),
  blockReward: v.number(),
  priceUsd: v.number(),
  priceConfidence: v.optional(v.string()),
  marketCapUsd: v.optional(v.number()),
  volume24hUsd: v.optional(v.number()),
  history: v.array(v.object({ date: v.string(), priceUsd: v.number(), nethashHs: v.number() })),
});

/** Coin ids that ASICs in the hardware index can mine (plus whatever is already stored). */
export const knownCoinIds = internalQuery({
  args: {},
  handler: async (ctx) => {
    const ids = new Set<string>();
    for (const coin of await ctx.db.query("coins").take(500)) ids.add(coin.coinId);
    return Array.from(ids);
  },
});

export const saveCoins = internalMutation({
  args: { coins: v.array(vCoin) },
  handler: async (ctx, { coins }) => {
    const now = Date.now();
    for (const coin of coins) {
      const existing = await ctx.db.query("coins").withIndex("by_coinId", (q) => q.eq("coinId", coin.coinId)).unique();
      if (existing) await ctx.db.patch(existing._id, { ...coin, updatedAt: now });
      else await ctx.db.insert("coins", { ...coin, updatedAt: now });
    }
  },
});

/** Fetch every coin's network data. A failed coin keeps its previous values. */
export const importCoins = internalAction({
  args: { coinIds: v.optional(v.array(v.string())) },
  handler: async (ctx, { coinIds }): Promise<{ saved: number; failed: string[] }> => {
    let ids = coinIds ?? [];
    if (!ids.length) {
      const index = (await getJson(`${BASE}/hardwareIndex.json`)) as { type: string; coins: { coinId: string }[] }[];
      const fromIndex = new Set(index.filter((d) => d.type === "ASIC").flatMap((d) => d.coins.map((c) => c.coinId)));
      const stored: string[] = await ctx.runQuery(internal.backpow.knownCoinIds, {});
      ids = Array.from(new Set([...fromIndex, ...stored]));
    }

    const saved: (typeof vCoin.type)[] = [];
    const failed: string[] = [];
    const queue = [...ids];
    const worker = async () => {
      while (queue.length) {
        const coinId = queue.shift() as string;
        try {
          const d = (await getJson(`${BASE}/coins-data/${encodeURIComponent(coinId)}.json`)) as Record<string, unknown>;
          const nethashHs = num(d["Nethash"]);
          const blockTimeSec = num(d["Block time"]);
          const blockReward = num(d["Bl. reward"]);
          const priceUsd = num(d["usdPrice"]);
          if (!(nethashHs > 0 && blockTimeSec > 0 && blockReward >= 0 && priceUsd >= 0)) throw new Error("invalid numbers");
          const emission = (d["emission"] ?? {}) as { ticker?: string };
          const history = Array.isArray(d["history30d"])
            ? (d["history30d"] as { date?: string; usdPrice?: number; nethash?: number }[]).flatMap((row) =>
                row.date && num(row.usdPrice) >= 0 && num(row.nethash) > 0
                  ? [{ date: String(row.date), priceUsd: num(row.usdPrice), nethashHs: num(row.nethash) }]
                  : []
              )
            : [];
          saved.push({
            coinId,
            tag: TICKERS[coinId] ?? emission.ticker ?? coinId,
            name: prettyName(coinId),
            algorithm: String(d["Algorithm"] ?? "Unknown"),
            nethashHs,
            blockTimeSec,
            blockReward,
            priceUsd,
            priceConfidence: typeof d["priceConfidence"] === "string" ? (d["priceConfidence"] as string) : undefined,
            marketCapUsd: num(d["marketCapUsd"]) > 0 ? num(d["marketCapUsd"]) : undefined,
            volume24hUsd: num(d["volume24hUsd"]) > 0 ? num(d["volume24hUsd"]) : undefined,
            history,
          });
        } catch {
          failed.push(coinId);
        }
      }
    };
    await Promise.all(Array.from({ length: 3 }, worker));

    for (let i = 0; i < saved.length; i += 20) {
      await ctx.runMutation(internal.backpow.saveCoins, { coins: saved.slice(i, i + 20) });
    }
    return { saved: saved.length, failed };
  },
});

// ---------------------------------------------------------------------------------------------
// Miners (daily)

const vMinerRow = v.object({
  backpowSlug: v.string(),
  manufacturer: v.string(),
  model: v.string(),
  algorithm: v.string(),
  hashrate: v.number(),
  unit: v.string(),
  powerW: v.number(),
  cooling: v.union(v.literal("Air"), v.literal("Hydro"), v.literal("Immersion")),
  category: v.union(v.literal("Industrial"), v.literal("Home")),
  coins: v.array(v.object({ coinId: v.string(), hashrateHs: v.number(), watts: v.number() })),
  priceRange: v.optional(
    v.object({ min: v.number(), max: v.number(), median: v.number(), count: v.number(), condition: v.string(), estimated: v.boolean() })
  ),
});

export const coinAlgorithms = internalQuery({
  args: {},
  handler: async (ctx) => {
    const coins = await ctx.db.query("coins").take(500);
    return coins.map((coin) => ({ coinId: coin.coinId, algorithm: coin.algorithm }));
  },
});

/** Upsert one batch. Curated miners keep their slug/specs and gain BackPoW data; others use BackPoW's slug. */
export const saveMiners = internalMutation({
  args: { rows: v.array(vMinerRow) },
  handler: async (ctx, { rows }) => {
    const curatedFor = new Map(Object.entries(CURATED_TO_BACKPOW).map(([curated, bp]) => [bp, curated]));
    const now = Date.now();
    for (const row of rows) {
      const backpowData = { coins: row.coins, priceRange: row.priceRange, backpowSlug: row.backpowSlug, updatedAt: now };
      const curatedSlug = curatedFor.get(row.backpowSlug);
      if (curatedSlug) {
        const curated = await ctx.db.query("miners").withIndex("by_slug", (q) => q.eq("slug", curatedSlug)).unique();
        if (curated) {
          await ctx.db.patch(curated._id, { ...backpowData, source: "manual", refPrice: row.priceRange?.median ?? curated.refPrice });
          continue;
        }
      }
      const existing = await ctx.db.query("miners").withIndex("by_backpow", (q) => q.eq("backpowSlug", row.backpowSlug)).unique();
      const doc = {
        slug: curatedSlug ?? row.backpowSlug,
        manufacturer: row.manufacturer,
        model: row.model,
        algorithm: row.algorithm,
        hashrate: row.hashrate,
        unit: row.unit,
        powerW: row.powerW,
        cooling: row.cooling,
        category: row.category,
        refPrice: row.priceRange?.median ?? 0,
        active: true,
        source: "backpow" as const,
        ...backpowData,
      };
      if (existing) await ctx.db.patch(existing._id, { ...doc, release: existing.release });
      else await ctx.db.insert("miners", doc);
    }
  },
});

/** BackPoW miners missing from the latest index, and retired curated entries, are hidden (never deleted). */
export const deactivateMissing = internalMutation({
  args: { present: v.array(v.string()) },
  handler: async (ctx, { present }) => {
    const keep = new Set(present);
    let hidden = 0;
    for (const miner of await ctx.db.query("miners").take(4000)) {
      const retired = miner.slug in RETIRED_CURATED;
      const gone = miner.source === "backpow" && miner.backpowSlug && !keep.has(miner.backpowSlug);
      if ((retired || gone) && miner.active) {
        await ctx.db.patch(miner._id, { active: false });
        hidden += 1;
      }
    }
    return hidden;
  },
});

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { manufacturer: parts[0], model: parts.slice(1).join(" ") || parts[0] };
}

function coolingOf(name: string): "Air" | "Hydro" | "Immersion" {
  if (/\b(hyd|hydro|water)\b/i.test(name) || /\bhyd\.?/i.test(name)) return "Hydro";
  if (/\b(imm|immersion)\b/i.test(name)) return "Immersion";
  return "Air";
}

/** Import the ASIC list. Run after importCoins so every coin's algorithm is known. */
export const importMiners = internalAction({
  args: {},
  handler: async (ctx): Promise<{ imported: number; skipped: number; hidden: number }> => {
    const index = (await getJson(`${BASE}/hardwareIndex.json`)) as {
      name: string;
      slug: string;
      type: string;
      coins: { coinId: string; hashrate: number; watts: number }[];
      price: { min: number; max: number; median: number; count: number; condition: string; estimated: boolean } | null;
    }[];
    const algorithms: { coinId: string; algorithm: string }[] = await ctx.runQuery(internal.backpow.coinAlgorithms, {});
    const algoOf = new Map(algorithms.map((row) => [row.coinId, row.algorithm]));

    const rows: (typeof vMinerRow.type)[] = [];
    let skipped = 0;
    for (const device of index) {
      if (device.type !== "ASIC" || !device.slug || !device.name) continue;
      const coins = device.coins
        .filter((c) => algoOf.has(c.coinId) && num(c.hashrate) > 0 && num(c.watts) > 0)
        .map((c) => ({ coinId: c.coinId, hashrateHs: num(c.hashrate), watts: num(c.watts) }));
      if (!coins.length) {
        skipped += 1;
        continue;
      }
      const counts = new Map<string, number>();
      for (const c of coins) counts.set(algoOf.get(c.coinId) as string, (counts.get(algoOf.get(c.coinId) as string) ?? 0) + 1);
      const algorithm = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const main = coins.filter((c) => algoOf.get(c.coinId) === algorithm).sort((a, b) => b.hashrateHs - a.hashrateHs)[0];
      const { value, unit } = bestUnit(main.hashrateHs, algorithm);
      const price = device.price;
      rows.push({
        backpowSlug: device.slug,
        ...splitName(device.name),
        algorithm,
        hashrate: value,
        unit,
        powerW: main.watts,
        cooling: coolingOf(device.name),
        // Home vs industrial is decided from published power draw, not guessed from the name.
        category: main.watts <= 1200 ? "Home" : "Industrial",
        coins,
        priceRange:
          price && num(price.median) > 0
            ? {
                min: num(price.min),
                max: num(price.max),
                median: num(price.median),
                count: num(price.count),
                condition: String(price.condition ?? "new"),
                estimated: Boolean(price.estimated),
              }
            : undefined,
      });
    }

    for (let i = 0; i < rows.length; i += 100) {
      await ctx.runMutation(internal.backpow.saveMiners, { rows: rows.slice(i, i + 100) });
    }
    const hidden: number = await ctx.runMutation(internal.backpow.deactivateMissing, { present: rows.map((r) => r.backpowSlug) });
    return { imported: rows.length, skipped, hidden };
  },
});

/** One-off / daily: coins first, then miners, then today's history point. */
export const importAll = internalAction({
  args: {},
  handler: async (ctx): Promise<{ coins: { saved: number; failed: string[] }; miners: { imported: number; skipped: number; hidden: number } }> => {
    const coins: { saved: number; failed: string[] } = await ctx.runAction(internal.backpow.importCoins, {});
    const miners: { imported: number; skipped: number; hidden: number } = await ctx.runAction(internal.backpow.importMiners, {});
    return { coins, miners };
  },
});

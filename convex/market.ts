import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// History snapshots are built from the `coins` table (BackPoW), refreshed hourly by backpow.importCoins.
// Snapshot coins are keyed by BackPoW coin id in the `tag` field.

/** Hourly: record every coin's network state so we keep our own profitability history. */
export const takeSnapshot = internalMutation({
  args: {},
  handler: async (ctx) => {
    const coins = await ctx.db.query("coins").take(500);
    if (!coins.length) return 0;
    const btc = coins.find((coin) => coin.coinId === "Bitcoin");
    await ctx.db.insert("marketSnapshots", {
      takenAt: Date.now(),
      btcUsd: btc?.priceUsd ?? 0,
      coins: coins.map((coin) => ({
        tag: coin.coinId,
        nethashHs: coin.nethashHs,
        blockReward: coin.blockReward,
        blockTimeSec: coin.blockTimeSec,
        priceUsd: coin.priceUsd,
      })),
    });
    return coins.length;
  },
});

/**
 * One-off: backfill daily history from BackPoW's 30-day series (real recorded daily price and network
 * hashrate; block time and reward use the current values). Skips days that already have a snapshot.
 */
export const backfillFromHistory = internalMutation({
  args: {},
  handler: async (ctx) => {
    const coins = await ctx.db.query("coins").take(500);
    const days = new Map<string, Map<string, { priceUsd: number; nethashHs: number }>>();
    for (const coin of coins) {
      for (const point of coin.history) {
        if (!days.has(point.date)) days.set(point.date, new Map());
        days.get(point.date)?.set(coin.coinId, { priceUsd: point.priceUsd, nethashHs: point.nethashHs });
      }
    }
    let added = 0;
    for (const [date, values] of [...days.entries()].sort()) {
      const takenAt = Date.parse(`${date}T12:00:00Z`);
      if (!Number.isFinite(takenAt) || takenAt > Date.now()) continue;
      const dayStart = Date.parse(`${date}T00:00:00Z`);
      const existing = await ctx.db
        .query("marketSnapshots")
        .withIndex("by_takenAt", (q) => q.gte("takenAt", dayStart).lt("takenAt", dayStart + 86_400_000))
        .first();
      if (existing) continue;
      const rows = coins.flatMap((coin) => {
        const point = values.get(coin.coinId);
        return point ? [{ tag: coin.coinId, nethashHs: point.nethashHs, blockReward: coin.blockReward, blockTimeSec: coin.blockTimeSec, priceUsd: point.priceUsd }] : [];
      });
      if (!rows.length) continue;
      await ctx.db.insert("marketSnapshots", { takenAt, btcUsd: values.get("Bitcoin")?.priceUsd ?? 0, coins: rows });
      added += 1;
    }
    return added;
  },
});

/** Removes snapshots recorded before the BackPoW switch (they used WhatToMine tickers as keys). */
export const clearLegacySnapshots = internalMutation({
  args: { before: v.number() },
  handler: async (ctx, { before }) => {
    const rows = await ctx.db.query("marketSnapshots").withIndex("by_takenAt", (q) => q.lt("takenAt", before)).take(2000);
    let removed = 0;
    for (const row of rows) {
      if (row.coins.some((coin) => coin.tag === "BTC")) {
        await ctx.db.delete(row._id);
        removed += 1;
      }
    }
    return removed;
  },
});

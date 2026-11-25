import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { normalizeWtm } from "../lib/market-core";

/** Hourly: record network difficulty, rewards and prices so we build our own profit history. */
export const takeSnapshot = internalAction({
  args: {},
  handler: async (ctx) => {
    const res = await fetch("https://whattomine.com/asic.json", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MinerDirectoryDemo/1.0)" },
    });
    if (!res.ok) throw new Error(`WhatToMine returned ${res.status}`);
    const parsed = normalizeWtm(await res.json());
    if (!parsed || parsed.coins.length < 3) throw new Error("WhatToMine data incomplete");
    await ctx.runMutation(internal.market.saveSnapshot, {
      btcUsd: parsed.btcUsd,
      coins: parsed.coins.map((coin) => ({
        tag: coin.tag,
        nethashHs: coin.nethashHs,
        blockReward: coin.blockReward,
        blockTimeSec: coin.blockTimeSec,
        priceUsd: coin.priceUsd,
      })),
    });
  },
});

export const saveSnapshot = internalMutation({
  args: {
    btcUsd: v.number(),
    coins: v.array(
      v.object({ tag: v.string(), nethashHs: v.number(), blockReward: v.number(), blockTimeSec: v.number(), priceUsd: v.number() })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("marketSnapshots", { takenAt: Date.now(), ...args });
  },
});

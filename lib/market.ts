// Server-side market data for the website: WhatToMine's ASIC feed, cached 10 minutes, with a
// saved snapshot as fallback. Parsing lives in market-core.ts (shared with Convex).

import type { MarketSnapshot } from "./economics";
import { isUsable, snapshotMarket, toNetwork, TRACKED, SNAPSHOT, SNAPSHOT_BTC_USD, type WtmCoin } from "./market-core";

export { normalizeWtm } from "./market-core";

export async function getMarket(): Promise<MarketSnapshot> {
  try {
    const res = await fetch("https://whattomine.com/asic.json", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; MinerDirectoryDemo/1.0)" },
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return snapshotMarket();
    const json = (await res.json()) as { coins?: Record<string, Partial<WtmCoin>> };
    const live = json.coins ?? {};

    const btcRaw = live.Bitcoin;
    const btcUsd = isUsable(btcRaw) ? Number(btcRaw.exchange_rate) : SNAPSHOT_BTC_USD;

    const coins = Object.keys(TRACKED).map((key) => {
      const raw = live[key];
      return isUsable(raw) ? toNetwork(key, raw, btcUsd) : toNetwork(key, SNAPSHOT[key], btcUsd);
    });

    return { coins, btcUsd, updatedAt: Date.now(), source: "live" };
  } catch {
    return snapshotMarket();
  }
}

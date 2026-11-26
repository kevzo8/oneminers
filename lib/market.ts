// Server-side market data for the website.
// Network state per coin comes from BackPoW (stored hourly in Convex `coins`). Prices for the major
// coins are refreshed from CoinGecko every 10 minutes. Coins without a real market are excluded.
// If the database is unreachable, a saved snapshot is used (market-core.ts).

import { cache } from "react";
import type { CoinNetwork, MarketSnapshot } from "./economics";
import { snapshotMarket } from "./market-core";

/** CoinGecko ids for coins whose price we refresh live. Keyed by BackPoW coin id. */
const LIVE_PRICE_IDS: Record<string, string> = {
  Bitcoin: "bitcoin",
  BitcoinCash: "bitcoin-cash",
  Fractal: "fractal-bitcoin",
  eCash: "ecash",
  Litecoin: "litecoin",
  Dogecoin: "dogecoin",
  Kaspa: "kaspa",
  Zcash: "zcash",
  EthereumClassic: "ethereum-classic",
  Dash: "dash",
  Nervos: "nervos-network",
  Monero: "monero",
};

export type MarketCoin = CoinNetwork & {
  marketCapUsd?: number;
  volume24hUsd?: number;
  priceConfidence?: string;
  history: { date: string; priceUsd: number; nethashHs: number }[];
};

export type Market = Omit<MarketSnapshot, "coins"> & { coins: MarketCoin[] };

async function livePrices(): Promise<Record<string, number>> {
  try {
    const ids = Object.values(LIVE_PRICE_IDS).join(",");
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`, {
      next: { revalidate: 600 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return {};
    const data = (await res.json()) as Record<string, { usd?: number }>;
    const out: Record<string, number> = {};
    for (const [coinId, geckoId] of Object.entries(LIVE_PRICE_IDS)) {
      const price = data[geckoId]?.usd;
      if (price && price > 0) out[coinId] = price;
    }
    return out;
  } catch {
    return {};
  }
}

/** Loaded once per request. */
export const getMarket = cache(async (): Promise<Market> => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (url) {
    try {
      const [{ ConvexHttpClient }, { api }] = await Promise.all([import("convex/browser"), import("@/convex/_generated/api")]);
      const [rows, prices] = await Promise.all([new ConvexHttpClient(url).query(api.directory.marketCoins, {}), livePrices()]);
      const coins: MarketCoin[] = rows
        .filter((row) => row.priceConfidence !== "no_market" && row.nethashHs > 0)
        .map((row) => ({
          id: row.coinId,
          tag: row.tag,
          name: row.name,
          algorithm: row.algorithm,
          blockTimeSec: row.blockTimeSec,
          blockReward: row.blockReward,
          nethashHs: row.nethashHs,
          priceUsd: prices[row.coinId] ?? row.priceUsd,
          marketCapUsd: row.marketCapUsd,
          volume24hUsd: row.volume24hUsd,
          priceConfidence: row.priceConfidence,
          history: row.history,
        }))
        .filter((coin) => coin.priceUsd > 0);
      if (coins.length) {
        const btc = coins.find((coin) => coin.id === "Bitcoin");
        return {
          coins,
          btcUsd: btc?.priceUsd ?? 0,
          updatedAt: Math.max(...rows.map((row) => row.updatedAt)),
          source: "live",
        };
      }
    } catch (err) {
      console.warn("[market] database unavailable, using saved snapshot", err);
    }
  }
  const fallback = snapshotMarket();
  return { ...fallback, coins: fallback.coins.map((coin) => ({ ...coin, history: [] })) };
});

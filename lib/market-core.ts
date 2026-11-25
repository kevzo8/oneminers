// Market data parsing shared by the website (lib/market.ts) and Convex (convex/market.ts).
// No Next.js-specific APIs here.

import type { Algorithm, CoinNetwork, MarketSnapshot } from "./economics";

export type WtmCoin = {
  tag: string;
  algorithm: string;
  block_time: number | string;
  block_reward: number;
  nethash: number;
  exchange_rate: number;
  exchange_rate_curr: string;
};

/** WhatToMine coin key -> our coin definition. */
export const TRACKED: Record<string, { tag: string; name: string; algorithm: Algorithm }> = {
  Bitcoin: { tag: "BTC", name: "Bitcoin", algorithm: "SHA-256" },
  BitcoinCash: { tag: "BCH", name: "Bitcoin Cash", algorithm: "SHA-256" },
  "Fractal Bitcoin": { tag: "FB", name: "Fractal Bitcoin", algorithm: "SHA-256" },
  eCash: { tag: "XEC", name: "eCash", algorithm: "SHA-256" },
  Litecoin: { tag: "LTC", name: "Litecoin", algorithm: "Scrypt" },
  Dogecoin: { tag: "DOGE", name: "Dogecoin", algorithm: "Scrypt" },
  Kaspa: { tag: "KAS", name: "Kaspa", algorithm: "kHeavyHash" },
  Zcash: { tag: "ZEC", name: "Zcash", algorithm: "Equihash" },
  EthereumClassic: { tag: "ETC", name: "Ethereum Classic", algorithm: "Etchash" },
  Dash: { tag: "DASH", name: "Dash", algorithm: "X11" },
  Nervos: { tag: "CKB", name: "Nervos", algorithm: "Eaglesong" },
};

// Snapshot of the same feed taken 25 Nov 2026. Used when the live feed is unreachable.
export const SNAPSHOT_BTC_USD = 58919.73;
export const SNAPSHOT: Record<string, Omit<WtmCoin, "tag" | "algorithm" | "exchange_rate_curr">> = {
  Bitcoin: { block_time: 604, block_reward: 3.1485848325, nethash: 958715185471325165562, exchange_rate: SNAPSHOT_BTC_USD },
  BitcoinCash: { block_time: 567, block_reward: 3.125, nethash: 3837159658585627865, exchange_rate: 0.0033067478815908343 },
  "Fractal Bitcoin": { block_time: 49.5, block_reward: 6.250028, nethash: 80594703340303434, exchange_rate: 3.8136630972341524e-6 },
  eCash: { block_time: 573, block_reward: 1812500, nethash: 48207151629112076, exchange_rate: 8.418232737997951e-11 },
  Litecoin: { block_time: 161, block_reward: 6.25, nethash: 2425262567017091, exchange_rate: 0.0006851694670019702 },
  Dogecoin: { block_time: 63, block_reward: 10000, nethash: 2718486227452358, exchange_rate: 9.160732660902019e-7 },
  Kaspa: { block_time: 0.1001, block_reward: 1.94454365, nethash: 295381045746497402, exchange_rate: 4.361866559809422e-7 },
  Zcash: { block_time: 24, block_reward: 0.41666668, nethash: 40603070186, exchange_rate: 0.012261627657987984 },
  EthereumClassic: { block_time: 13.5926, block_reward: 1.589248, nethash: 176958800664787, exchange_rate: 9.699342391356786e-5 },
  Dash: { block_time: 156, block_reward: 0.4109450935094223, nethash: 3005725370595430, exchange_rate: 0.0005743432588808651 },
  Nervos: { block_time: 9.5188, block_reward: 635.9007010870001, nethash: 71275450801018857, exchange_rate: 1.3220220606718412e-8 },
};
const SNAPSHOT_TIME = Date.UTC(2026, 10, 25, 3, 0, 0);

export function toNetwork(key: string, raw: Pick<WtmCoin, "block_time" | "block_reward" | "nethash" | "exchange_rate">, btcUsd: number): CoinNetwork {
  const meta = TRACKED[key];
  // WhatToMine quotes Bitcoin's rate in USD and every other coin in BTC.
  const priceUsd = key === "Bitcoin" ? raw.exchange_rate : raw.exchange_rate * btcUsd;
  return {
    tag: meta.tag,
    name: meta.name,
    algorithm: meta.algorithm,
    blockTimeSec: Number(raw.block_time),
    blockReward: Number(raw.block_reward),
    nethashHs: Number(raw.nethash),
    priceUsd,
  };
}

export function snapshotMarket(): MarketSnapshot {
  return {
    coins: Object.keys(TRACKED).map((key) => toNetwork(key, SNAPSHOT[key], SNAPSHOT_BTC_USD)),
    btcUsd: SNAPSHOT_BTC_USD,
    updatedAt: SNAPSHOT_TIME,
    source: "snapshot",
  };
}

export function isUsable(raw: Partial<WtmCoin> | undefined): raw is WtmCoin {
  return Boolean(
    raw && Number(raw.block_time) > 0 && Number(raw.block_reward) > 0 && Number(raw.nethash) > 0 && Number(raw.exchange_rate) > 0
  );
}

/** Normalise a WhatToMine asic.json payload; null if Bitcoin data is missing. Shared with the Convex snapshot job. */
export function normalizeWtm(json: { coins?: Record<string, Partial<WtmCoin>> }): { coins: CoinNetwork[]; btcUsd: number } | null {
  const live = json.coins ?? {};
  const btcRaw = live.Bitcoin;
  if (!isUsable(btcRaw)) return null;
  const btcUsd = Number(btcRaw.exchange_rate);
  const coins = Object.keys(TRACKED).flatMap((key) => {
    const raw = live[key];
    return isUsable(raw) ? [toNetwork(key, raw, btcUsd)] : [];
  });
  return { coins, btcUsd };
}


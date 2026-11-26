// Transparent miner ranking: published weights, measured inputs only, compared within each algorithm.

import { DEFAULT_SETTINGS, dailyProfit, type Algorithm, type MarketSnapshot } from "./economics";
import { bestPrice, offersForMiner, revenuesFor, type Directory } from "./directory";
import type { MinerModel } from "./catalog";

export const WEIGHTS = [
  { key: "profit", label: "Profitability", weight: 0.4, explain: "Live profit per day after electricity ($0.07/kWh) and a 1% pool fee." },
  { key: "efficiency", label: "Energy efficiency", weight: 0.3, explain: "Joules per unit of hashrate. Lower is better." },
  { key: "hashrate", label: "Hashrate", weight: 0.2, explain: "Raw hashing power." },
  { key: "availability", label: "Availability & price", weight: 0.1, explain: "In stock with at least one seller, and price per unit of hashrate." },
] as const;

export type RankedMiner = {
  miner: MinerModel;
  score: number;
  profit: number;
  coin: string;
  parts: Record<(typeof WEIGHTS)[number]["key"], number>;
  price: number | null;
  inStock: boolean;
};

function normalise(values: number[], value: number, lowerIsBetter = false) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return 1;
  const ratio = (value - min) / (max - min);
  return lowerIsBetter ? 1 - ratio : ratio;
}

export function rankMiners(dir: Directory, market: MarketSnapshot): RankedMiner[] {
  const base = dir.miners.map((miner) => {
    // Coins flagged as illiquid or too small for this miner don't count toward its ranking.
    const top = revenuesFor(miner, market).find((coin) => !coin.caution);
    const price = bestPrice(dir, miner.slug);
    const inStock = offersForMiner(dir, miner.slug).some((offer) => offer.availability === "In stock");
    return {
      miner,
      coin: top?.tag ?? "",
      profit: dailyProfit(top?.usdPerDay ?? 0, miner.powerW, DEFAULT_SETTINGS).profit,
      efficiency: miner.powerW / miner.hashrate,
      price,
      pricePerUnit: price ? price / miner.hashrate : null,
      inStock,
    };
  });

  const byAlgo = new Map<Algorithm, typeof base>();
  for (const row of base) byAlgo.set(row.miner.algorithm, [...(byAlgo.get(row.miner.algorithm) ?? []), row]);

  return base
    .map((row) => {
      const group = byAlgo.get(row.miner.algorithm) ?? [row];
      const priced = group.filter((item) => item.pricePerUnit !== null).map((item) => item.pricePerUnit as number);
      const parts = {
        profit: normalise(group.map((item) => item.profit), row.profit),
        efficiency: normalise(group.map((item) => item.efficiency), row.efficiency, true),
        hashrate: normalise(group.map((item) => item.miner.hashrate), row.miner.hashrate),
        availability: row.pricePerUnit === null ? 0 : (row.inStock ? 0.5 : 0) + 0.5 * normalise(priced, row.pricePerUnit, true),
      };
      const score = Math.round(WEIGHTS.reduce((sum, factor) => sum + factor.weight * parts[factor.key], 0) * 100);
      return { miner: row.miner, score, profit: row.profit, coin: row.coin, parts, price: row.price, inStock: row.inStock };
    })
    .sort((a, b) => b.score - a.score || b.profit - a.profit);
}

// Joins the static catalog with live market data. Used by server components.

import { bestPrice, getVendor, MINERS, offersForMiner, type MinerModel } from "./catalog";
import { DEFAULT_SETTINGS, dailyProfit, hashrateToHs, minerRevenues, type MarketSnapshot } from "./economics";
import type { MinerRow } from "@/components/directory/MinerExplorer";
import type { OfferRow } from "@/components/directory/OffersTable";

export function revenuesFor(miner: MinerModel, market: MarketSnapshot) {
  return minerRevenues(hashrateToHs(miner.hashrate, miner.unit), miner.algorithm, market);
}

export function toRow(miner: MinerModel, market: MarketSnapshot): MinerRow {
  const top = revenuesFor(miner, market)[0];
  return {
    slug: miner.slug,
    manufacturer: miner.manufacturer,
    model: miner.model,
    algorithm: miner.algorithm,
    hashrate: miner.hashrate,
    unit: miner.unit,
    powerW: miner.powerW,
    cooling: miner.cooling,
    category: miner.category,
    release: miner.release,
    topCoin: top ? { tag: top.tag, name: top.name, usdPerDay: top.usdPerDay } : null,
    bestPrice: bestPrice(miner.slug),
    offerCount: offersForMiner(miner.slug).length,
  };
}

export function allRows(market: MarketSnapshot) {
  return MINERS.map((miner) => toRow(miner, market));
}

/** Rows ranked by profit at the default settings (for server-rendered teasers). */
export function topByDefaultProfit(market: MarketSnapshot, count: number) {
  return allRows(market)
    .map((row) => ({ row, profit: dailyProfit(row.topCoin?.usdPerDay ?? 0, row.powerW, DEFAULT_SETTINGS).profit }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, count);
}

export function offerRows(slug: string): OfferRow[] {
  return offersForMiner(slug).flatMap((offer) => {
    const vendor = getVendor(offer.vendorSlug);
    if (!vendor) return [];
    const { slug: vSlug, name, tier, verified, partner, replyMinutes, rating, reviews, website, sample } = vendor;
    return [{ ...offer, vendor: { slug: vSlug, name, tier, verified, partner, replyMinutes, rating, reviews, website, sample } }];
  });
}

export function relatedMiners(miner: MinerModel, count = 4) {
  return MINERS.filter((other) => other.algorithm === miner.algorithm && other.slug !== miner.slug)
    .sort((a, b) => Math.abs(a.hashrate - miner.hashrate) - Math.abs(b.hashrate - miner.hashrate))
    .slice(0, count);
}

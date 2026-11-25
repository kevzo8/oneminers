// The directory's data: miners, vendors and offers from Convex, with the built-in starter catalog
// as a fallback if the database is unreachable. Every page, the sitemap and the assistant use this.

import { cache } from "react";
import { MINERS, OFFERS, VENDORS, type MinerModel, type Offer, type Vendor } from "./catalog";
import { DEFAULT_SETTINGS, dailyProfit, hashrateToHs, minerRevenues, type Algorithm, type MarketSnapshot } from "./economics";
import type { MinerRow } from "@/components/directory/MinerExplorer";
import type { OfferRow } from "@/components/directory/OffersTable";

export type Directory = {
  miners: MinerModel[];
  vendors: Vendor[];
  offers: Offer[];
  source: "database" | "built-in";
};

export function builtInDirectory(): Directory {
  return { miners: MINERS, vendors: VENDORS, offers: OFFERS, source: "built-in" };
}

/** Loaded once per request (React cache), from Convex when configured. */
export const loadDirectory = cache(async (): Promise<Directory> => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return builtInDirectory();
  try {
    const [{ ConvexHttpClient }, { api }] = await Promise.all([import("convex/browser"), import("@/convex/_generated/api")]);
    const data = await new ConvexHttpClient(url).query(api.directory.snapshot, {});
    if (!data.miners.length) return builtInDirectory();
    return {
      miners: data.miners,
      vendors: data.vendors.map(({ _id, ...vendor }) => vendor),
      offers: data.offers,
      source: "database",
    };
  } catch (err) {
    console.warn("[directory] database unavailable, using built-in catalog", err);
    return builtInDirectory();
  }
});

export function getMiner(dir: Directory, slug: string) {
  return dir.miners.find((miner) => miner.slug === slug);
}

export function getVendor(dir: Directory, slug: string) {
  return dir.vendors.find((vendor) => vendor.slug === slug);
}

export function offersForMiner(dir: Directory, slug: string) {
  return dir.offers.filter((offer) => offer.minerSlug === slug);
}

export function offersForVendor(dir: Directory, slug: string) {
  return dir.offers.filter((offer) => offer.vendorSlug === slug);
}

/** Cheapest available (in stock or pre-order) total price for a miner. */
export function bestPrice(dir: Directory, slug: string) {
  const prices = offersForMiner(dir, slug)
    .filter((offer) => offer.availability !== "Out of stock")
    .map((offer) => offer.price + offer.shipping);
  return prices.length ? Math.min(...prices) : null;
}

export function manufacturersOf(dir: Directory) {
  return Array.from(new Set(dir.miners.map((miner) => miner.manufacturer))).sort();
}

export function algorithmsOf(dir: Directory): Algorithm[] {
  const order: Algorithm[] = ["SHA-256", "Scrypt", "kHeavyHash", "Equihash", "Etchash", "X11", "Eaglesong"];
  const present = new Set(dir.miners.map((miner) => miner.algorithm));
  return order.filter((algo) => present.has(algo));
}

export function revenuesFor(miner: MinerModel, market: MarketSnapshot) {
  return minerRevenues(hashrateToHs(miner.hashrate, miner.unit), miner.algorithm, market);
}

export function toRow(dir: Directory, miner: MinerModel, market: MarketSnapshot): MinerRow {
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
    bestPrice: bestPrice(dir, miner.slug),
    offerCount: offersForMiner(dir, miner.slug).length,
  };
}

export function allRows(dir: Directory, market: MarketSnapshot) {
  return dir.miners.map((miner) => toRow(dir, miner, market));
}

/** Rows ranked by profit at the default settings (for server-rendered teasers). */
export function topByDefaultProfit(dir: Directory, market: MarketSnapshot, count: number) {
  return allRows(dir, market)
    .map((row) => ({ row, profit: dailyProfit(row.topCoin?.usdPerDay ?? 0, row.powerW, DEFAULT_SETTINGS).profit }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, count);
}

/** Industrial miners with live income, best first at the lowest hosting rate (for hosting comparisons). */
export function hostableMiners(dir: Directory, market: MarketSnapshot, rate: number) {
  return dir.miners
    .filter((miner) => miner.category === "Industrial")
    .map((miner) => {
      const top = revenuesFor(miner, market)[0];
      const income = top?.usdPerDay ?? 0;
      return {
        slug: miner.slug,
        label: `${miner.manufacturer} ${miner.model} (${miner.hashrate} ${miner.unit}) · ${top?.tag ?? ""}`,
        incomeUsd: income,
        powerW: miner.powerW,
        hostedProfit: dailyProfit(income, miner.powerW, { ...DEFAULT_SETTINGS, electricity: rate }).profit,
      };
    })
    .sort((a, b) => b.hostedProfit - a.hostedProfit)
    .map(({ hostedProfit, ...miner }) => miner);
}

export function offerRows(dir: Directory, slug: string): OfferRow[] {
  return offersForMiner(dir, slug).flatMap((offer) => {
    const vendor = getVendor(dir, offer.vendorSlug);
    if (!vendor) return [];
    const { slug: vSlug, name, tier, verified, partner, replyMinutes, rating, reviews, website, sample } = vendor;
    return [{ ...offer, vendor: { slug: vSlug, name, tier, verified, partner, replyMinutes, rating, reviews, website, sample } }];
  });
}

export function relatedMiners(dir: Directory, miner: MinerModel, count = 4) {
  return dir.miners
    .filter((other) => other.algorithm === miner.algorithm && other.slug !== miner.slug)
    .sort((a, b) => Math.abs(a.hashrate - miner.hashrate) - Math.abs(b.hashrate - miner.hashrate))
    .slice(0, count);
}

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

/** Sample vendors and their offers are a development aid; production shows real listings only. */
function allowSamples() {
  return process.env.NODE_ENV === "development";
}

export function builtInDirectory(): Directory {
  if (allowSamples()) return { miners: MINERS, vendors: VENDORS, offers: OFFERS, source: "built-in" };
  // Outside development the fallback carries real data only: every built-in offer is a generated
  // placeholder price (including OneMiners'), so none of them may be shown.
  return { miners: MINERS, vendors: VENDORS.filter((vendor) => !vendor.sample), offers: [], source: "built-in" };
}

/** Vendors created by QA or seeding runs must never reach the public directory. */
const TEST_VENDOR = /^(qa|test)(?:[-_ ]|$)/i;

function isTestVendor(vendor: { slug: string; name: string }) {
  return TEST_VENDOR.test(vendor.slug) || TEST_VENDOR.test(vendor.name);
}

/** Loaded once per request (React cache), from Convex when configured. */
export const loadDirectory = cache(async (): Promise<Directory> => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return builtInDirectory();
  try {
    const [{ ConvexHttpClient }, { api }] = await Promise.all([import("convex/browser"), import("@/convex/_generated/api")]);
    const data = await new ConvexHttpClient(url).query(api.directory.snapshot, {});
    if (!data.miners.length) return builtInDirectory();
    const vendors = data.vendors
      .filter((vendor) => !isTestVendor(vendor) && (allowSamples() || !vendor.sample))
      .map(({ _id, ...vendor }) => vendor);
    const visibleVendors = new Set(vendors.map((vendor) => vendor.slug));
    return {
      miners: data.miners,
      vendors,
      offers: data.offers.filter((offer) => visibleVendors.has(offer.vendorSlug)),
      source: "database",
    };
  } catch (err) {
    console.warn("[directory] database unavailable, using built-in catalog", err);
    return builtInDirectory();
  }
});

export type VendorPreview = {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  website: string;
  about: string;
  status: "pending" | "approved" | "rejected";
  tier: "Free" | "Bronze" | "Silver" | "Gold";
  verified: boolean;
  sample: boolean;
  partnerLinkStatus: "found" | "missing" | "error" | null;
  since: number;
};

export const loadVendorPreview = cache(async (slug: string): Promise<VendorPreview | null> => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  try {
    const [{ ConvexHttpClient }, { api }] = await Promise.all([import("convex/browser"), import("@/convex/_generated/api")]);
    return await new ConvexHttpClient(url).query(api.directory.vendorPreview, { slug });
  } catch {
    return null;
  }
});

export type NetworkPoint = { t: number; btcUsd: number; btcHashrateEh: number; hashpricePerPh: number };

/** Bitcoin network history from our own hourly snapshots: price, hashrate and hashprice ($/PH/day). */
export async function bitcoinNetworkHistory(days = 90): Promise<NetworkPoint[]> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return [];
  try {
    const [{ ConvexHttpClient }, { api }] = await Promise.all([import("convex/browser"), import("@/convex/_generated/api")]);
    const rows = await new ConvexHttpClient(url).query(api.directory.marketHistory, { days });
    return rows.flatMap((row) => {
      const btc = row.coins.find((coin) => coin.tag === "Bitcoin" || coin.tag === "BTC");
      if (!btc) return [];
      const perPhPerDay = (1e15 / btc.nethashHs) * (86_400 / btc.blockTimeSec) * btc.blockReward * btc.priceUsd;
      return [{ t: row.takenAt, btcUsd: btc.priceUsd, btcHashrateEh: btc.nethashHs / 1e18, hashpricePerPh: perPhPerDay }];
    });
  } catch {
    return [];
  }
}

export type HistoryPoint = { t: number; incomeUsd: number };

/**
 * A miner's income history from our own hourly market snapshots (real recorded data only).
 * Returns an empty list when the database is unavailable or history hasn't been recorded yet.
 */
export async function minerIncomeHistory(miner: MinerModel, current: MarketSnapshot, days = 90): Promise<HistoryPoint[]> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return [];
  try {
    const [{ ConvexHttpClient }, { api }] = await Promise.all([import("convex/browser"), import("@/convex/_generated/api")]);
    const rows = await new ConvexHttpClient(url).query(api.directory.marketHistory, { days });
    // Snapshots store BackPoW coin ids (older ones stored tickers); accept either.
    const meta = new Map(current.coins.flatMap((coin) => [[coin.id, coin] as const, [coin.tag, coin] as const]));
    return rows.map((row) => {
      const coins = row.coins.flatMap((coin) => {
        const known = meta.get(coin.tag);
        return known ? [{ ...known, nethashHs: coin.nethashHs, blockReward: coin.blockReward, blockTimeSec: coin.blockTimeSec, priceUsd: coin.priceUsd }] : [];
      });
      const snapshot: MarketSnapshot = { coins, btcUsd: row.btcUsd, updatedAt: row.takenAt, source: "live" };
      return { t: row.takenAt, incomeUsd: revenuesFor(miner, snapshot)[0]?.usdPerDay ?? 0 };
    });
  } catch {
    return [];
  }
}

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
  return minerRevenues(miner, market);
}

export function toRow(dir: Directory, miner: MinerModel, market: MarketSnapshot): MinerRow {
  const revenues = revenuesFor(miner, market);
  const top = revenues[0];
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
    topCoin: top ? { tag: top.tag, name: top.name, usdPerDay: top.usdPerDay, caution: top.caution } : null,
    coinTags: revenues.filter((revenue) => !revenue.caution).slice(0, 4).map((revenue) => revenue.tag),
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

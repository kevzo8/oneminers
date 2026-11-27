import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

export const PARTNER_GRACE_DAYS = 14;

/** Vendors created by QA or seeding runs must never reach the public directory. */
const TEST_VENDOR = /^(qa|test)(?:[-_ ]|$)/i;

/**
 * Listings go public as soon as a seller adds them. A seller is hidden only when an admin rejects
 * it, or when its partner link still isn't verified after the grace period.
 */
export function isPublicVendor(vendor: Doc<"vendors">, now: number) {
  if (TEST_VENDOR.test(vendor.slug) || TEST_VENDOR.test(vendor.name)) return false;
  if (vendor.sample && process.env.SAMPLE_DATA !== "allowed") return false;
  if (vendor.status === "rejected") return false;
  if (!vendor.ownerId) return vendor.status === "approved"; // added by the team
  if (vendor.partnerLinkStatus === "found") return true;
  return now - vendor.createdAt < PARTNER_GRACE_DAYS * 86_400_000;
}

function publicVendor(vendor: Doc<"vendors">) {
  return {
    _id: vendor._id,
    slug: vendor.slug,
    name: vendor.name,
    country: vendor.country,
    countryCode: vendor.countryCode,
    website: vendor.website,
    about: vendor.about,
    payments: vendor.payments,
    warrantyMonths: vendor.warrantyMonths,
    hosting: vendor.hosting,
    since: vendor.since,
    replyMinutes: vendor.replyMinutes,
    rating: vendor.rating,
    reviews: vendor.reviews,
    tier: vendor.tier,
    verified: vendor.verified,
    sample: vendor.sample,
    partner: !vendor.ownerId || vendor.partnerLinkStatus === "found",
  };
}

/** Everything the public directory needs, in one round trip: active miners, public vendors, their offers. */
export const snapshot = query({
  args: {},
  handler: async (ctx) => {
    const miners = await ctx.db
      .query("miners")
      .withIndex("by_active", (q) => q.eq("active", true))
      .take(2000);
    const now = Date.now();
    const all = await ctx.db.query("vendors").take(1000);
    const vendors = all.filter((vendor) => isPublicVendor(vendor, now));
    const visible = new Map(vendors.map((vendor) => [vendor._id, vendor.slug]));
    const activeSlugs = new Set(miners.map((miner) => miner.slug));

    const offers = [];
    for (const vendor of vendors) {
      const rows = await ctx.db
        .query("offers")
        .withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id))
        .take(2000);
      for (const offer of rows) {
        if (!activeSlugs.has(offer.minerSlug)) continue;
        offers.push({
          id: offer._id,
          minerSlug: offer.minerSlug,
          vendorSlug: visible.get(offer.vendorId) as string,
          price: offer.price,
          shipping: offer.shipping,
          condition: offer.condition,
          availability: offer.availability,
          shipsFrom: offer.shipsFrom,
          psuIncluded: offer.psuIncluded,
          warrantyMonths: offer.warrantyMonths,
          updatedAt: offer.updatedAt,
        });
      }
    }

    return {
      miners: miners.map(({ _id, _creationTime, active, ...miner }) => miner),
      vendors: vendors.map(publicVendor),
      offers,
    };
  },
});

/** Every coin's current network state (BackPoW), with its 30-day daily history. */
export const marketCoins = query({
  args: {},
  handler: async (ctx) => {
    const coins = await ctx.db.query("coins").take(500);
    return coins.map(({ _id, _creationTime, ...coin }) => coin);
  },
});

/** Hourly market snapshots for profit-history charts, oldest first, thinned to at most ~400 points. */
export const marketHistory = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, { days }) => {
    const span = Math.min(Math.max(days ?? 90, 1), 400);
    const since = Date.now() - span * 86_400_000;
    const rows = await ctx.db
      .query("marketSnapshots")
      .withIndex("by_takenAt", (q) => q.gte("takenAt", since))
      .take(span * 24 + 24);
    const step = Math.max(1, Math.ceil(rows.length / 400));
    return rows
      .filter((_, index) => index % step === 0 || index === rows.length - 1)
      .map((row) => ({ takenAt: row.takenAt, btcUsd: row.btcUsd, coins: row.coins }));
  },
});

/** Minimal public-facing preview for a vendor that is not yet in the directory. */
export const vendorPreview = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const vendor = await ctx.db.query("vendors").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!vendor) return null;
    return {
      slug: vendor.slug,
      name: vendor.name,
      country: vendor.country,
      countryCode: vendor.countryCode,
      website: vendor.website,
      about: vendor.about,
      status: vendor.status,
      tier: vendor.tier,
      verified: vendor.verified,
      sample: vendor.sample,
      partnerLinkStatus: vendor.partnerLinkStatus ?? null,
      since: vendor.since,
    };
  },
});

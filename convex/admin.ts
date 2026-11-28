import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query, type MutationCtx } from "./_generated/server";
import { requireAdmin } from "./users";
import { vAlgorithm, vCategory, vCooling, vTier, vUnit } from "./schema";
import type { Doc } from "./_generated/dataModel";
import { notifyVendorStatus } from "./email";
import { MINERS, OFFERS, VENDORS } from "../lib/catalog";

/** Everything the admin screen needs. */
export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const vendors = await ctx.db.query("vendors").order("desc").take(1000);
    const withCounts = [];
    for (const vendor of vendors) {
      const offers = await ctx.db.query("offers").withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id)).take(1000);
      withCounts.push({ ...vendor, offerCount: offers.length });
    }
    const miners = await ctx.db.query("miners").take(2000);
    const snapshots = await ctx.db.query("marketSnapshots").withIndex("by_takenAt").order("desc").take(1);
    return {
      vendors: withCounts,
      miners: miners.sort((a, b) => a.manufacturer.localeCompare(b.manufacturer) || a.model.localeCompare(b.model)),
      lastSnapshotAt: snapshots[0]?.takenAt ?? null,
    };
  },
});

export const setVendorReview = mutation({
  args: {
    vendorId: v.id("vendors"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    verified: v.boolean(),
    tier: vTier,
  },
  handler: async (ctx, { vendorId, ...patch }) => {
    await requireAdmin(ctx);
    const vendor = await ctx.db.get(vendorId);
    if (!vendor) throw new ConvexError("Vendor not found.");
    await ctx.db.patch(vendorId, patch);
    if (vendor.status !== patch.status) {
      await notifyVendorStatus(ctx, { name: vendor.name, contactEmail: vendor.contactEmail, status: patch.status });
    }
  },
});

const minerFields = {
  slug: v.string(),
  manufacturer: v.string(),
  model: v.string(),
  algorithm: vAlgorithm,
  hashrate: v.number(),
  unit: vUnit,
  powerW: v.number(),
  cooling: vCooling,
  category: vCategory,
  release: v.number(),
  refPrice: v.number(),
  active: v.boolean(),
};

type MinerInput = Omit<Doc<"miners">, "_id" | "_creationTime">;

async function writeMiner(ctx: MutationCtx, miner: MinerInput) {
  if (!/^[a-z0-9-]{3,90}$/.test(miner.slug)) throw new ConvexError("Slug: lowercase letters, numbers and dashes.");
  if (!(miner.hashrate > 0 && miner.powerW > 0)) throw new ConvexError("Hashrate and power must be positive.");
  const existing = await ctx.db.query("miners").withIndex("by_slug", (q) => q.eq("slug", miner.slug)).unique();
  if (existing) await ctx.db.patch(existing._id, miner);
  else await ctx.db.insert("miners", miner);
  return !existing;
}

/** Add or edit a miner model (matched by slug). */
export const upsertMiner = mutation({
  args: minerFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await writeMiner(ctx, args);
  },
});

/** Bulk add/update models from an admin CSV import. */
export const importMiners = mutation({
  args: { miners: v.array(v.object(minerFields)) },
  handler: async (ctx, { miners }) => {
    await requireAdmin(ctx);
    let created = 0;
    for (const miner of miners) {
      if (await writeMiner(ctx, miner)) created += 1;
    }
    return { total: miners.length, created, updated: miners.length - created };
  },
});

/** Remove the fictional sample vendors and their offers once real sellers are live. */
export const deleteSampleVendors = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const vendors = await ctx.db.query("vendors").take(1000);
    let removed = 0;
    for (const vendor of vendors.filter((row) => row.sample)) {
      const offers = await ctx.db.query("offers").withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id)).take(2000);
      for (const offer of offers) await ctx.db.delete(offer._id);
      await ctx.db.delete(vendor._id);
      removed += 1;
    }
    return removed;
  },
});

/** CLI only: `npx convex run admin:grantAdmin '{"userId":"..."}'`. The user id is shown in the seller portal. */
export const grantAdmin = internalMutation({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    if (!(await ctx.db.get(userId))) throw new ConvexError("User not found.");
    await ctx.db.patch(userId, { role: "admin" });
  },
});

export const attachVendorOwner = internalMutation({
  args: { slug: v.string(), userId: v.id("users") },
  handler: async (ctx, { slug, userId }) => {
    const vendor = await ctx.db.query("vendors").withIndex("by_slug", (q) => q.eq("slug", slug)).unique();
    if (!vendor) throw new ConvexError("Vendor not found.");
    if (!(await ctx.db.get(userId))) throw new ConvexError("User not found.");
    await ctx.db.patch(vendor._id, {
      ownerId: userId,
      status: "approved",
      partnerLinkStatus: "found",
      partnerLinkUrl: "https://oneminers.com",
    });
  },
});

function vendorRow(vendor: (typeof VENDORS)[number]) {
  return {
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
    status: "approved" as const,
    verified: vendor.verified,
    sample: vendor.sample,
  };
}

/**
 * CLI only: load REAL data (`npx convex run admin:seed`). Miner specs, and team vendors that are real
 * companies (OneMiners), without prices. Safe to re-run: upserts by slug.
 */
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    let miners = 0;
    for (const miner of MINERS) {
      const existing = await ctx.db.query("miners").withIndex("by_slug", (q) => q.eq("slug", miner.slug)).unique();
      const row = {
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
        refPrice: miner.refPrice,
        active: true,
      };
      if (existing) await ctx.db.patch(existing._id, row);
      else await ctx.db.insert("miners", row);
      miners += 1;
    }

    let vendors = 0;
    for (const vendor of VENDORS.filter((row) => !row.sample)) {
      const existing = await ctx.db.query("vendors").withIndex("by_slug", (q) => q.eq("slug", vendor.slug)).unique();
      if (existing) await ctx.db.patch(existing._id, vendorRow(vendor));
      else await ctx.db.insert("vendors", { ...vendorRow(vendor), createdAt: Date.now() });
      vendors += 1;
    }
    return { miners, vendors };
  },
});

/**
 * CLI only, DEVELOPMENT only: sample vendors and placeholder offers for testing
 * (`npx convex run admin:seedSamples`). Refuses to run unless the deployment has the environment
 * variable SAMPLE_DATA=allowed, which is set on the dev deployment and never on production.
 */
export const seedSamples = internalMutation({
  args: {},
  handler: async (ctx) => {
    if (process.env.SAMPLE_DATA !== "allowed") {
      throw new ConvexError("Sample data is disabled on this deployment (set SAMPLE_DATA=allowed on dev only).");
    }
    let vendors = 0;
    let offers = 0;
    for (const vendor of VENDORS) {
      const doc = await ctx.db.query("vendors").withIndex("by_slug", (q) => q.eq("slug", vendor.slug)).unique();
      const vendorId = doc ? doc._id : await ctx.db.insert("vendors", { ...vendorRow(vendor), createdAt: Date.now() });
      if (!doc) vendors += 1;
      const existing = await ctx.db.query("offers").withIndex("by_vendor", (q) => q.eq("vendorId", vendorId)).take(1);
      if (existing.length) continue;
      for (const offer of OFFERS.filter((row) => row.vendorSlug === vendor.slug)) {
        await ctx.db.insert("offers", {
          minerSlug: offer.minerSlug,
          vendorId,
          price: offer.price,
          shipping: offer.shipping,
          condition: offer.condition,
          availability: offer.availability,
          shipsFrom: offer.shipsFrom,
          psuIncluded: offer.psuIncluded,
          warrantyMonths: offer.warrantyMonths,
          updatedAt: offer.updatedAt,
        });
        offers += 1;
      }
    }
    return { vendors, offers };
  },
});

/**
 * CLI only: make a deployment clean. Deletes sample vendors and their offers, and every offer from a
 * team-added vendor (those prices were placeholders). Seller-owned data is never touched.
 */
export const purgeSampleData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const vendors = await ctx.db.query("vendors").take(1000);
    let vendorsRemoved = 0;
    let offersRemoved = 0;
    for (const vendor of vendors) {
      if (vendor.ownerId) continue;
      const offers = await ctx.db.query("offers").withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id)).take(4000);
      for (const offer of offers) {
        await ctx.db.delete(offer._id);
        offersRemoved += 1;
      }
      if (vendor.sample) {
        await ctx.db.delete(vendor._id);
        vendorsRemoved += 1;
      }
    }
    return { vendorsRemoved, offersRemoved };
  },
});

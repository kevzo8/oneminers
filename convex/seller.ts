import { ConvexError, v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, internalQuery, mutation, query, type MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireUser } from "./users";
import { vAvailability, vCondition } from "./schema";

const TRIAL_DAYS = 183; // ~6 months free
const MAX_OFFERS = 500;

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

function cleanUrl(raw: string) {
  const value = raw.trim();
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("bad protocol");
    return url.toString();
  } catch {
    throw new ConvexError("Enter a full website address, starting with https://");
  }
}

async function myVendorDoc(ctx: MutationCtx, userId: Id<"users">) {
  const vendor = await ctx.db
    .query("vendors")
    .withIndex("by_owner", (q) => q.eq("ownerId", userId))
    .unique();
  if (!vendor) throw new ConvexError("Create your company profile first.");
  return vendor;
}

/** The signed-in seller's company, its offers and plan. */
export const myVendor = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const vendor = await ctx.db
      .query("vendors")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .unique();
    if (!vendor) return { vendor: null, offers: [] };
    const offers = await ctx.db
      .query("offers")
      .withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id))
      .take(MAX_OFFERS);
    return { vendor, offers };
  },
});

const profileFields = {
  name: v.string(),
  website: v.string(),
  country: v.string(),
  countryCode: v.string(),
  about: v.string(),
  payments: v.array(v.string()),
  contactEmail: v.string(),
  warrantyMonths: v.number(),
  hosting: v.boolean(),
};

function checkProfile(args: { name: string; country: string; countryCode: string; about: string; contactEmail: string; payments: string[]; warrantyMonths: number }) {
  if (args.name.trim().length < 2 || args.name.length > 80) throw new ConvexError("Enter your company name.");
  if (!/^[A-Za-z]{2}$/.test(args.countryCode)) throw new ConvexError("Choose your country.");
  if (args.about.length > 600) throw new ConvexError("Keep the description under 600 characters.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(args.contactEmail)) throw new ConvexError("Enter a valid contact email.");
  if (args.payments.length > 8) throw new ConvexError("Too many payment methods.");
  if (!(args.warrantyMonths >= 0 && args.warrantyMonths <= 120)) throw new ConvexError("Warranty must be 0–120 months.");
}

/** Create the seller's company. Starts pending review, with a 6-month free listing period. */
export const createVendor = mutation({
  args: profileFields,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const existing = await ctx.db
      .query("vendors")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .unique();
    if (existing) throw new ConvexError("You already have a company profile.");
    checkProfile(args);

    let slug = slugify(args.name) || "vendor";
    for (let i = 2; await ctx.db.query("vendors").withIndex("by_slug", (q) => q.eq("slug", slug)).unique(); i += 1) {
      slug = `${slugify(args.name)}-${i}`;
    }

    const now = Date.now();
    return await ctx.db.insert("vendors", {
      slug,
      name: args.name.trim(),
      website: cleanUrl(args.website),
      country: args.country.trim().slice(0, 60),
      countryCode: args.countryCode.toUpperCase(),
      about: args.about.trim(),
      payments: args.payments.map((p) => p.trim().slice(0, 30)).filter(Boolean),
      contactEmail: args.contactEmail.trim(),
      warrantyMonths: Math.round(args.warrantyMonths),
      hosting: args.hosting,
      since: new Date(now).getFullYear(),
      replyMinutes: 60,
      rating: 0,
      reviews: 0,
      tier: "Free",
      status: "pending",
      verified: false,
      sample: false,
      ownerId: user._id,
      trialEndsAt: now + TRIAL_DAYS * 86_400_000,
      canceled: false,
      createdAt: now,
    });
  },
});

export const updateVendor = mutation({
  args: profileFields,
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const vendor = await myVendorDoc(ctx, user._id);
    checkProfile(args);
    await ctx.db.patch(vendor._id, {
      name: args.name.trim(),
      website: cleanUrl(args.website),
      country: args.country.trim().slice(0, 60),
      countryCode: args.countryCode.toUpperCase(),
      about: args.about.trim(),
      payments: args.payments.map((p) => p.trim().slice(0, 30)).filter(Boolean),
      contactEmail: args.contactEmail.trim(),
      warrantyMonths: Math.round(args.warrantyMonths),
      hosting: args.hosting,
    });
  },
});

/** Cancel anytime, or resume. */
export const setCanceled = mutation({
  args: { canceled: v.boolean() },
  handler: async (ctx, { canceled }) => {
    const user = await requireUser(ctx);
    const vendor = await myVendorDoc(ctx, user._id);
    await ctx.db.patch(vendor._id, { canceled });
  },
});

const offerFields = {
  minerSlug: v.string(),
  price: v.number(),
  shipping: v.number(),
  condition: vCondition,
  availability: vAvailability,
  shipsFrom: v.string(),
  psuIncluded: v.boolean(),
  warrantyMonths: v.number(),
};

async function validateOffer(ctx: MutationCtx, args: { minerSlug: string; price: number; shipping: number; shipsFrom: string; warrantyMonths: number }) {
  const miner = await ctx.db.query("miners").withIndex("by_slug", (q) => q.eq("slug", args.minerSlug)).unique();
  if (!miner || !miner.active) throw new ConvexError("Unknown miner model.");
  if (!(args.price > 0 && args.price < 1_000_000)) throw new ConvexError("Enter a price between $1 and $999,999.");
  if (!(args.shipping >= 0 && args.shipping < 100_000)) throw new ConvexError("Shipping must be between $0 and $99,999.");
  if (!/^[A-Za-z]{2}$/.test(args.shipsFrom)) throw new ConvexError("Ships-from must be a 2-letter country code.");
  if (!(args.warrantyMonths >= 0 && args.warrantyMonths <= 120)) throw new ConvexError("Warranty must be 0–120 months.");
}

/** Add a listing, or update one of your own. */
export const upsertOffer = mutation({
  args: { offerId: v.optional(v.id("offers")), ...offerFields },
  handler: async (ctx, { offerId, ...args }) => {
    const user = await requireUser(ctx);
    const vendor = await myVendorDoc(ctx, user._id);
    await validateOffer(ctx, args);
    const row = {
      ...args,
      price: Math.round(args.price),
      shipping: Math.round(args.shipping),
      shipsFrom: args.shipsFrom.toUpperCase(),
      warrantyMonths: Math.round(args.warrantyMonths),
      updatedAt: Date.now(),
    };
    if (offerId) {
      const existing = await ctx.db.get(offerId);
      if (!existing || existing.vendorId !== vendor._id) throw new ConvexError("Listing not found.");
      await ctx.db.patch(offerId, row);
      return offerId;
    }
    const count = (await ctx.db.query("offers").withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id)).take(MAX_OFFERS)).length;
    if (count >= MAX_OFFERS) throw new ConvexError(`You can list up to ${MAX_OFFERS} offers.`);
    return await ctx.db.insert("offers", { vendorId: vendor._id, ...row });
  },
});

export const deleteOffer = mutation({
  args: { offerId: v.id("offers") },
  handler: async (ctx, { offerId }) => {
    const user = await requireUser(ctx);
    const vendor = await myVendorDoc(ctx, user._id);
    const existing = await ctx.db.get(offerId);
    if (!existing || existing.vendorId !== vendor._id) throw new ConvexError("Listing not found.");
    await ctx.db.delete(offerId);
  },
});

/** Bulk import (CSV rows parsed in the browser). Updates existing offers for the same model. */
export const importOffers = mutation({
  args: { rows: v.array(v.object(offerFields)) },
  handler: async (ctx, { rows }) => {
    if (rows.length > 200) throw new ConvexError("Import up to 200 rows at a time.");
    const user = await requireUser(ctx);
    const vendor = await myVendorDoc(ctx, user._id);
    const existing = await ctx.db.query("offers").withIndex("by_vendor", (q) => q.eq("vendorId", vendor._id)).take(MAX_OFFERS);
    const bySlug = new Map(existing.map((offer) => [offer.minerSlug, offer]));
    let added = 0;
    let updated = 0;
    const errors: string[] = [];
    for (const [index, args] of rows.entries()) {
      try {
        await validateOffer(ctx, args);
        const row = { ...args, price: Math.round(args.price), shipping: Math.round(args.shipping), shipsFrom: args.shipsFrom.toUpperCase(), updatedAt: Date.now() };
        const current = bySlug.get(args.minerSlug);
        if (current) {
          await ctx.db.patch(current._id, row);
          updated += 1;
        } else if (existing.length + added < MAX_OFFERS) {
          await ctx.db.insert("offers", { vendorId: vendor._id, ...row });
          added += 1;
        } else {
          errors.push(`Row ${index + 1}: listing limit reached`);
        }
      } catch (err) {
        errors.push(`Row ${index + 1}: ${err instanceof Error ? err.message : "invalid"}`);
      }
    }
    return { added, updated, errors: errors.slice(0, 20) };
  },
});

// --- Partner link (the check itself runs in partnerLink.ts, server-side) ---------------

/** The caller's vendor (actions pass the caller's identity through to this query). */
export const vendorForPartnerCheck = internalQuery({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query("vendors")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .unique();
  },
});

export const savePartnerResult = internalMutation({
  args: {
    vendorId: v.id("vendors"),
    url: v.string(),
    status: v.union(v.literal("found"), v.literal("missing"), v.literal("error")),
    nofollow: v.boolean(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, { vendorId, url, status, nofollow, message }) => {
    await ctx.db.patch(vendorId, {
      partnerLinkUrl: url,
      partnerLinkStatus: status,
      partnerLinkNofollow: nofollow,
      partnerLinkMessage: message,
      partnerLinkCheckedAt: Date.now(),
    });
  },
});

export const vendorsWithPartnerLinks = internalQuery({
  args: {},
  handler: async (ctx) => {
    const vendors = await ctx.db.query("vendors").withIndex("by_status", (q) => q.eq("status", "approved")).take(1000);
    return vendors.filter((vendor) => vendor.ownerId && vendor.partnerLinkUrl).map((vendor) => ({ _id: vendor._id, url: vendor.partnerLinkUrl as string }));
  },
});

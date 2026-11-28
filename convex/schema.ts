import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Algorithms and units come from the data source (BackPoW), so they are open strings.
export const vAlgorithm = v.string();
export const vUnit = v.string();
export const vCooling = v.union(v.literal("Air"), v.literal("Hydro"), v.literal("Immersion"));
export const vCategory = v.union(v.literal("Industrial"), v.literal("Home"));
export const vTier = v.union(v.literal("Gold"), v.literal("Silver"), v.literal("Bronze"), v.literal("Free"));
export const vAvailability = v.union(v.literal("In stock"), v.literal("Pre-order"), v.literal("Out of stock"));
export const vCondition = v.union(v.literal("New"), v.literal("Refurbished"));

export default defineSchema({
  // App users. Credentials and sessions live in the Convex Auth components.
  users: defineTable({
    role: v.union(v.literal("seller"), v.literal("admin")),
    createdAt: v.number(),
  }),

  // ASIC miner catalog.
  miners: defineTable({
    slug: v.string(),
    manufacturer: v.string(),
    model: v.string(),
    algorithm: vAlgorithm,
    hashrate: v.number(),
    unit: vUnit,
    powerW: v.number(),
    cooling: vCooling,
    category: vCategory,
    release: v.optional(v.number()),
    refPrice: v.number(),
    active: v.boolean(),
    // BackPoW data: per-coin hashrate/power and the market price range.
    source: v.optional(v.union(v.literal("manual"), v.literal("backpow"))),
    backpowSlug: v.optional(v.string()),
    coins: v.optional(v.array(v.object({ coinId: v.string(), hashrateHs: v.number(), watts: v.number() }))),
    priceRange: v.optional(
      v.object({ min: v.number(), max: v.number(), median: v.number(), count: v.number(), condition: v.string(), estimated: v.boolean() })
    ),
    updatedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["active"])
    .index("by_backpow", ["backpowSlug"]),

  // Coin network state from BackPoW (refreshed hourly): what every miner's income is computed from.
  coins: defineTable({
    coinId: v.string(),
    tag: v.string(),
    name: v.string(),
    algorithm: v.string(),
    nethashHs: v.number(),
    blockTimeSec: v.number(),
    blockReward: v.number(),
    priceUsd: v.number(),
    priceConfidence: v.optional(v.string()),
    marketCapUsd: v.optional(v.number()),
    volume24hUsd: v.optional(v.number()),
    history: v.array(v.object({ date: v.string(), priceUsd: v.number(), nethashHs: v.number() })),
    updatedAt: v.number(),
  }).index("by_coinId", ["coinId"]),

  // Companies selling miners. Sellers create and edit their own; admins approve them.
  vendors: defineTable({
    slug: v.string(),
    name: v.string(),
    country: v.string(),
    countryCode: v.string(),
    website: v.string(),
    about: v.string(),
    payments: v.array(v.string()),
    warrantyMonths: v.number(),
    hosting: v.boolean(),
    since: v.number(),
    replyMinutes: v.number(),
    rating: v.number(),
    reviews: v.number(),
    tier: vTier,
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
    verified: v.boolean(),
    sample: v.boolean(),
    ownerId: v.optional(v.id("users")),
    contactEmail: v.optional(v.string()),
    // Listing plan: 6 months free, then $100/month, cancel anytime.
    trialEndsAt: v.optional(v.number()),
    canceled: v.optional(v.boolean()),
    // Partner link to oneminers.com, checked server-side.
    partnerLinkUrl: v.optional(v.string()),
    partnerLinkStatus: v.optional(v.union(v.literal("found"), v.literal("missing"), v.literal("error"))),
    partnerLinkNofollow: v.optional(v.boolean()),
    partnerLinkCheckedAt: v.optional(v.number()),
    partnerLinkMessage: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"])
    .index("by_status", ["status"]),

  // A vendor's price for one miner.
  offers: defineTable({
    minerSlug: v.string(),
    vendorId: v.id("vendors"),
    price: v.number(),
    shipping: v.number(),
    condition: vCondition,
    availability: vAvailability,
    shipsFrom: v.string(),
    psuIncluded: v.boolean(),
    warrantyMonths: v.number(),
    updatedAt: v.number(),
  })
    .index("by_miner", ["minerSlug"])
    .index("by_vendor", ["vendorId"]),

  // Hourly network snapshots (difficulty, reward, price per coin): our own profit history.
  marketSnapshots: defineTable({
    takenAt: v.number(),
    btcUsd: v.number(),
    coins: v.array(
      v.object({
        tag: v.string(),
        nethashHs: v.number(),
        blockReward: v.number(),
        blockTimeSec: v.number(),
        priceUsd: v.number(),
      })
    ),
  }).index("by_takenAt", ["takenAt"]),


  // Lead capture, stored for the desk. Quote requests carry the miner and vendor.
  leads: defineTable({
    name: v.string(),
    email: v.string(),
    interest: v.string(),
    message: v.optional(v.string()),
    source: v.union(v.literal("form"), v.literal("chat"), v.literal("optional")),
    minerSlug: v.optional(v.string()),
    vendorSlug: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  unsubscribes: defineTable({
    email: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Assistant conversations, one session per browser.
  chatMessages: defineTable({
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),
});

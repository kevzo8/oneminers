import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Marketplace inventory: energized sites for sale, lease, or hosting.
  listings: defineTable({
    id: v.string(),
    slug: v.string(),
    title: v.string(),
    country: v.string(),
    countryCode: v.string(),
    type: v.union(v.literal("sale"), v.literal("lease"), v.literal("hosting")),
    capacityMW: v.number(),
    powerCents: v.number(),
    status: v.string(),
    tags: v.array(v.string()),
    summary: v.string(),
    priceUsd: v.optional(v.number()),
  }).index("by_slug", ["slug"]),

  // Lead capture, stored for the desk.
  leads: defineTable({
    name: v.string(),
    email: v.string(),
    interest: v.string(),
    message: v.optional(v.string()),
    source: v.union(v.literal("form"), v.literal("chat"), v.literal("optional")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // Conversation history preserved for the assistant / audit trail.
  chatMessages: defineTable({
    sessionId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_session", ["sessionId"]),
});

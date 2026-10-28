import { mutation } from "./_generated/server";
import { listings as demoListings } from "../lib/data";

const mapType = (type: "For sale" | "For lease" | "Hosting"): "sale" | "lease" | "hosting" => {
  if (type === "For sale") return "sale";
  if (type === "For lease") return "lease";
  return "hosting";
};

export const seedListings = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("listings").take(1);
    if (existing.length > 0) {
      return { inserted: 0, message: "Listings already seeded" };
    }
    for (const l of demoListings) {
      await ctx.db.insert("listings", {
        id: l.id,
        slug: l.id.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        title: l.title,
        country: l.country,
        countryCode: l.countryCode,
        type: mapType(l.type),
        capacityMW: l.capacityMW,
        powerCents: l.powerCents,
        status: l.status,
        tags: l.tags,
        summary: l.summary,
        priceUsd: undefined,
      });
    }
    return { inserted: demoListings.length };
  },
});
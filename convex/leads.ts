import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leads").order("desc").collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    interest: v.string(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = typeof args.name === "string" ? args.name.trim().slice(0, 120) : "";
    const email = typeof args.email === "string" ? args.email.trim().slice(0, 200) : "";
    const interest =
      typeof args.interest === "string" ? args.interest.trim().slice(0, 80) : "General";
    const message = typeof args.message === "string" ? args.message.trim().slice(0, 2000) : "";

    if (name.length < 2) throw new Error("Name is required.");
    if (!emailPattern.test(email)) throw new Error("Please enter a valid email address.");

    const recent = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .first();
    if (recent && Date.now() - recent.createdAt < 60_000) {
      throw new Error("Please wait a moment before submitting again.");
    }

    return await ctx.db.insert("leads", {
      name,
      email,
      interest,
      message: message === "" ? undefined : message,
      source: "form",
      createdAt: Date.now(),
    });
  },
});

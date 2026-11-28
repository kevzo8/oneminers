import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { acknowledgeLead, notifyNewLead } from "./email";
import { requireAdmin } from "./users";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Internal on purpose: leads contain personal data. Public functions can be called by anyone
// who knows the deployment URL, so this is only reachable from the dashboard, the CLI
// (`npx convex run leads:list`) or other server-side Convex functions.
export const list = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("leads").order("desc").collect();
  },
});

/** Delete one lead (e.g. a test entry). Dashboard and CLI only. */
export const remove = internalMutation({
  args: { id: v.id("leads") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("leads").order("desc").take(500);
  },
});

export const removeForAdmin = mutation({
  args: { id: v.id("leads") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
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

    const optedOut = await ctx.db
      .query("unsubscribes")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (optedOut) throw new Error("This email address has opted out of messages.");

    const recent = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", email))
      .order("desc")
      .first();
    if (recent && Date.now() - recent.createdAt < 60_000) {
      throw new Error("Please wait a moment before submitting again.");
    }

    const leadId = await ctx.db.insert("leads", {
      name,
      email,
      interest,
      message: message === "" ? undefined : message,
      source: "form",
      createdAt: Date.now(),
    });
    await notifyNewLead(ctx, { name, email, interest, message });
    await acknowledgeLead(ctx, { name, email, interest });
    return leadId;
  },
});

export const unsubscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalized = email.trim().toLowerCase().slice(0, 200);
    if (!emailPattern.test(normalized)) throw new Error("Please enter a valid email address.");
    const existing = await ctx.db
      .query("unsubscribes")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .first();
    if (!existing) await ctx.db.insert("unsubscribes", { email: normalized, createdAt: Date.now() });
    const rows = await ctx.db
      .query("leads")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .collect();
    for (const row of rows) await ctx.db.delete(row._id);
    return { removed: rows.length };
  },
});

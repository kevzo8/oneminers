import { getAuthUserId } from "@convex-dev/auth/server";
import { ConvexError, v } from "convex/values";
import { internalMutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";

/** Called by Convex Auth when a new account signs up. Every new account starts as a seller. */
export const createUser = internalMutation({
  args: { method: v.object({ name: v.literal("usernamePassword"), profile: v.object({}) }) },
  returns: v.id("users"),
  handler: async (ctx) => {
    return await ctx.db.insert("users", { role: "seller", createdAt: Date.now() });
  },
});

export const createUserEmailMagicLink = internalMutation({
  args: { method: v.object({ name: v.literal("emailMagicLink"), profile: v.object({}) }) },
  returns: v.id("users"),
  handler: async (ctx) => {
    return await ctx.db.insert("users", { role: "seller", createdAt: Date.now() });
  },
});

/** The signed-in user, or null. */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    return user ? { _id: user._id, role: user.role, createdAt: user.createdAt } : null;
  },
});

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new ConvexError("Please sign in.");
  const user = await ctx.db.get(userId);
  if (!user) throw new ConvexError("Account not found.");
  return user;
}

export async function requireAdmin(ctx: QueryCtx | MutationCtx) {
  const user = await requireUser(ctx);
  if (user.role !== "admin") throw new ConvexError("Admins only.");
  return user;
}

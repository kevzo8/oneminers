import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

// Chat sessions are identified by a random UUID created in the visitor's browser.
// Knowing the id is what grants access to that one conversation; there is no public
// way to list sessions or read anyone else's messages.

const SESSION_PATTERN = /^[a-zA-Z0-9-]{16,64}$/;
const MAX_LENGTH = 2000;
const MAX_PER_SESSION = 300;
const MAX_PER_MINUTE = 20;

function checkSession(sessionId: string) {
  if (!SESSION_PATTERN.test(sessionId)) throw new ConvexError("Invalid session.");
}

/** The latest messages of one conversation, oldest first. */
export const history = query({
  args: { sessionId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, { sessionId, limit }) => {
    checkSession(sessionId);
    const take = Math.min(Math.max(Math.floor(limit ?? 20), 1), 50);
    const rows = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .take(take);
    return rows.reverse().map((row) => ({ role: row.role, content: row.content, createdAt: row.createdAt }));
  },
});

/** Saves one question and its answer. */
export const appendTurn = mutation({
  args: { sessionId: v.string(), user: v.string(), assistant: v.string() },
  handler: async (ctx, { sessionId, user, assistant }) => {
    checkSession(sessionId);
    const question = user.trim().slice(0, MAX_LENGTH);
    const answer = assistant.trim().slice(0, MAX_LENGTH);
    if (!question || !answer) throw new ConvexError("Empty message.");

    const now = Date.now();
    const recent = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .take(MAX_PER_SESSION);
    if (recent.length >= MAX_PER_SESSION) throw new ConvexError("This conversation is full. Start a new chat.");
    if (recent.filter((row) => now - row.createdAt < 60_000).length >= MAX_PER_MINUTE * 2) {
      throw new ConvexError("Too many messages. Try again in a minute.");
    }

    await ctx.db.insert("chatMessages", { sessionId, role: "user", content: question, createdAt: now });
    await ctx.db.insert("chatMessages", { sessionId, role: "assistant", content: answer, createdAt: now + 1 });
  },
});

/** Delete one conversation (e.g. a test, or on a visitor's request). Dashboard and CLI only. */
export const removeSession = internalMutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const rows = await ctx.db
      .query("chatMessages")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .take(MAX_PER_SESSION + 10);
    for (const row of rows) await ctx.db.delete(row._id);
    return rows.length;
  },
});

/** For the team: latest messages across all sessions. Dashboard and CLI only. */
export const recent = internalQuery({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db
      .query("chatMessages")
      .order("desc")
      .take(Math.min(Math.max(Math.floor(limit ?? 50), 1), 500));
  },
});

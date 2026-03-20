// @ts-ignore
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listTopAgents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_reputation")
      .order("desc")
      .take(10);
  },
});

export const submitAgent = mutation({
  args: {
    name: v.string(),
    behavior: v.string(),
    reputation: v.number(),
    wins: v.number(),
    losses: v.number(),
    creator: v.string(),
    history: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agents")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        reputation: (existing.reputation + args.reputation) / 2,
        wins: existing.wins + args.wins,
        losses: existing.losses + args.losses,
        lastActive: Date.now(),
        history: args.history.slice(-100),
      });
      return existing._id;
    }

    return await ctx.db.insert("agents", {
      ...args,
      lastActive: Date.now(),
    });
  },
});

export const getGlobalStats = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("globalStats").first();
  },
});

export const updateGlobalStats = mutation({
  args: {
    cooperations: v.number(),
    defections: v.number(),
  },
  handler: async (ctx, args) => {
    const stats = await ctx.db.query("globalStats").first();
    if (stats) {
      await ctx.db.patch(stats._id, {
        totalSimulations: stats.totalSimulations + 1,
        totalCooperations: stats.totalCooperations + args.cooperations,
        totalDefections: stats.totalDefections + args.defections,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("globalStats", {
        totalSimulations: 1,
        totalCooperations: args.cooperations,
        totalDefections: args.defections,
        lastUpdated: Date.now(),
      });
    }
  },
});

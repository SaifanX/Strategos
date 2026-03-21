import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Mock hashing function for demo purposes
// For production, use bcrypt or a fast crypto API. Then replace with OAuth provider
const hashPassword = async (password: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
};

export const signUp = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (existing) {
      throw new Error("Username already taken.");
    }

    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      username: args.username,
      passwordHash,
    });

    return userId;
  },
});

export const signIn = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (!user) {
      throw new Error("Invalid username or password.");
    }

    const passwordHash = await hashPassword(args.password);

    if (user.passwordHash !== passwordHash) {
      throw new Error("Invalid username or password.");
    }

    return user._id;
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    return {
      _id: user._id,
      username: user.username,
    };
  },
});

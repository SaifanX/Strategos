import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    behavior: v.string(), // BehaviorType
    reputation: v.number(),
    wins: v.number(),
    losses: v.number(),
    creator: v.string(), // User email or ID
    lastActive: v.number(),
    history: v.array(v.string()), // ['COOPERATE', 'DEFECT', ...]
  }).index("by_reputation", ["reputation"]),
  
  globalStats: defineTable({
    totalSimulations: v.number(),
    totalCooperations: v.number(),
    totalDefections: v.number(),
    lastUpdated: v.number(),
  }),
});

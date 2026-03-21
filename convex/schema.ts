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
  
  // Custom Multiplayer Auth Tables 
  // TODO: Future: switch to official Auth provider (e.g. GitHub OAuth via Clerk/Convex Auth)
  users: defineTable({
    username: v.string(),
    passwordHash: v.string(), // Or authProviderId
  }).index("by_username", ["username"]),
  
  rooms: defineTable({
    roomName: v.string(),
    hostId: v.id("users"),
    status: v.string(), // "waiting", "in_progress", "finished"
    players: v.array(v.id("users")),
    
    // NEW ADVANCED MULTIPLAYER FIELDS
    gameType: v.optional(v.string()), // "prisoners_dilemma", "stag_hunt", "commons", "custom"
    maxPlayers: v.optional(v.number()),
    totalRounds: v.optional(v.number()),
    currentRound: v.optional(v.number()),
    customRules: v.optional(v.any()), // flexible object for custom game matrices/names
  }),
  
  rounds: defineTable({
    roomId: v.id("rooms"),
    roundNumber: v.number(),
    status: v.string(), // "waiting_for_choices", "completed"
    choices: v.array(v.object({
      userId: v.id("users"),
      choice: v.string(), // e.g., "COOPERATE", "DEFECT", or custom option
    })),
  }),
});

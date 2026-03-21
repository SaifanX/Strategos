import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createRoom = mutation({
  args: { 
    roomName: v.string(), 
    hostId: v.id("users"),
    gameType: v.string(),
    maxPlayers: v.number(),
    totalRounds: v.number(),
    customRules: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.hostId);
    if (!user) throw new Error("User not found");

    const roomId = await ctx.db.insert("rooms", {
      roomName: args.roomName,
      hostId: args.hostId,
      status: "waiting",
      players: [args.hostId],
      gameType: args.gameType,
      maxPlayers: args.maxPlayers,
      totalRounds: args.totalRounds,
      currentRound: 1,
      customRules: args.customRules,
    });

    // Create the first round
    await ctx.db.insert("rounds", {
      roomId,
      roundNumber: 1,
      status: args.maxPlayers === 1 ? "waiting_for_choices" : "waiting_for_players",
      choices: [],
    });

    return roomId;
  },
});

export const getAvailableRooms = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("rooms")
      .filter((q) => q.eq(q.field("status"), "waiting"))
      .collect();
  },
});

export const getRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const playersInfo = await Promise.all(
      room.players.map(async (pid) => {
        const p = await ctx.db.get(pid);
        return { _id: p?._id, username: p?.username };
      })
    );

    return { ...room, playerDetails: playersInfo };
  },
});

export const joinRoom = mutation({
  args: { roomId: v.id("rooms"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    if (room.status !== "waiting") throw new Error("Room no longer waiting");
    if (room.players.includes(args.userId)) throw new Error("Already in room");

    const updatedPlayers = [...room.players, args.userId];
    const isFull = updatedPlayers.length >= room.maxPlayers;
    
    await ctx.db.patch(args.roomId, {
      players: updatedPlayers,
      status: isFull ? "in_progress" : "waiting",
    });

    if (isFull) {
      // Find current round and mark ready for choices
      const round = await ctx.db
        .query("rounds")
        .filter((q) => q.eq(q.field("roomId"), args.roomId))
        .filter((q) => q.eq(q.field("roundNumber"), room.currentRound))
        .first();

      if (round) {
        await ctx.db.patch(round._id, {
          status: "waiting_for_choices",
        });
      }
    }

    return args.roomId;
  },
});

export const getRoundByRoom = query({
  args: { roomId: v.id("rooms"), roundNumber: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rounds")
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .filter((q) => q.eq(q.field("roundNumber"), args.roundNumber))
      .first();
  },
});

export const getAllRounds = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("rounds")
      .filter((q) => q.eq(q.field("roomId"), args.roomId))
      .collect();
  }
});

export const makeChoice = mutation({
  args: { roundId: v.id("rounds"), userId: v.id("users"), choice: v.string() },
  handler: async (ctx, args) => {
    const round = await ctx.db.get(args.roundId);
    if (!round) throw new Error("Round not found");
    if (round.status !== "waiting_for_choices") throw new Error("Not waiting for choices");

    const room = await ctx.db.get(round.roomId);
    if (!room) throw new Error("Room not found");
    if (!room.players.includes(args.userId)) throw new Error("User not in room");

    // Check if duplicate choice
    if (round.choices.some(c => c.userId === args.userId)) {
      throw new Error("Choice already made");
    }

    const updatedChoices = [...round.choices, { userId: args.userId, choice: args.choice }];
    const allMadeChoices = updatedChoices.length === room.players.length;

    await ctx.db.patch(args.roundId, {
      choices: updatedChoices,
      status: allMadeChoices ? "completed" : "waiting_for_choices",
    });

    // Handle next round iteration
    if (allMadeChoices) {
      if (room.currentRound < room.totalRounds) {
        const nextRoundNum = room.currentRound + 1;
        await ctx.db.patch(room._id, { currentRound: nextRoundNum });
        await ctx.db.insert("rounds", {
          roomId: room._id,
          roundNumber: nextRoundNum,
          status: "waiting_for_choices", // We already have all players
          choices: [],
        });
      } else {
        await ctx.db.patch(room._id, { status: "finished" });
      }
    }

    return true;
  },
});

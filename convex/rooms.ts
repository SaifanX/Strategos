import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

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
    const roomMaxPlayers = room.maxPlayers ?? 2;
    const isFull = updatedPlayers.length >= roomMaxPlayers;
    
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
    const roomMaxPlayers = room.maxPlayers ?? 2;
    const allMadeChoices = updatedChoices.length === roomMaxPlayers;

    await ctx.db.patch(args.roundId, {
      choices: updatedChoices,
      status: allMadeChoices ? "completed" : "waiting_for_choices",
    });

    if (!allMadeChoices && room.hasBots) {
      // Trigger bot moves if any bots exist in the room and haven't moved yet
      await ctx.scheduler.runAfter(1000, internal.bots.performBotMoves, { roomId: room._id, roundId: args.roundId });
    }

    // Handle next round iteration
    if (allMadeChoices) {
      const currentRound = room.currentRound ?? 1;
      const totalRounds = room.totalRounds ?? 1;
      
      if (currentRound < totalRounds) {
        const nextRoundNum = currentRound + 1;
        await ctx.db.patch(room._id, { currentRound: nextRoundNum });
        await ctx.db.insert("rounds", {
          roomId: room._id,
          roundNumber: nextRoundNum,
          status: "waiting_for_choices", // We already have all players
          choices: [],
        });
      } else {
        await ctx.db.patch(room._id, { status: "finished" });
        
        // Update Leaderboard & Resonance
        // For each human player, calculate their performance
        const allRoomRounds = await ctx.db
          .query("rounds")
          .filter((q) => q.eq(q.field("roomId"), room._id))
          .collect();

        for (const playerId of room.players) {
          const player = await ctx.db.get(playerId);
          if (player && !player.isBot) {
            // Simple scoring: count cooperations vs defections
            let score = 0;
            let wins = 0;
            allRoomRounds.forEach(r => {
              const c = r.choices.find(ch => ch.userId === playerId);
              if (c?.choice === "COOPERATE") score += 5;
              else score += 1;
            });

            // Update or Insert Leaderboard entry
            const existingEntry = await ctx.db
              .query("leaderboard")
              .filter((q) => q.eq(q.field("userId"), playerId))
              .first();

            if (existingEntry) {
              await ctx.db.patch(existingEntry._id, {
                score: (existingEntry.score ?? 0) + score,
                totalGames: (existingEntry.totalGames ?? 0) + 1,
              });
            } else {
              await ctx.db.insert("leaderboard", {
                userId: playerId,
                score,
                wins: 0,
                totalGames: 1,
              });
            }

            // Update Resonance
            const newResonance = Math.min(100, (player.resonance ?? 50) + (score > 10 ? 5 : -5));
            await ctx.db.patch(playerId, { resonance: newResonance });
          }
        }
      }
    }

    return true;
  },
});

export const getLeaderboard = query({
  handler: async (ctx) => {
    const board = await ctx.db
      .query("leaderboard")
      .order("desc")
      .take(10);
    
    return await Promise.all(
      board.map(async (entry) => {
        const user = await ctx.db.get(entry.userId);
        return {
          ...entry,
          username: user?.username || "Unknown",
          resonance: user?.resonance || 50,
        };
      })
    );
  },
});

export const getPlayerAnalysis = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const allRounds = await ctx.db
      .query("rounds")
      .collect();

    // Filter rounds where this user participated
    const userRounds = allRounds.filter(r => r.choices.some(c => c.userId === args.userId));
    
    let coops = 0;
    let defects = 0;
    const pointsHistory: number[] = [];
    
    userRounds.forEach(r => {
      const choice = r.choices.find(c => c.userId === args.userId);
      if (choice?.choice === "COOPERATE") coops++;
      else if (choice?.choice === "DEFECT") defects++;
      
      // Calculate points for this specific round (simplified for now)
      // Reference: matrix { cc: 3, cd: 0, dc: 5, dd: 1 }
      // This is a rough estimation since we don't store other players' choices in pointsHistory array easily here
      // But we can just store the choice as a trend
    });

    const total = coops + defects;
    const coopRate = total > 0 ? (coops / total) * 100 : 0;
    const defectRate = total > 0 ? (defects / total) * 100 : 0;

    let archetype = "Undetermined";
    let archetypeDesc = "Insufficient data for behavioral profiling.";

    if (total >= 5) {
      if (coopRate > 80) {
        archetype = "The Altruistic Saint";
        archetypeDesc = "Prioritizes collective well-being over personal gain. Highly susceptible to exploitation.";
      } else if (defectRate > 80) {
        archetype = "The Ruthless Predator";
        archetypeDesc = "Expert at maximizing individual utility at the cost of social cohesion. High variance in long-term success.";
      } else if (coopRate > 40 && coopRate < 60) {
        archetype = "The Strategic Mirror";
        archetypeDesc = "Mimics environmental stimuli. Perfectly balanced between retribution and forgiveness.";
      } else {
        archetype = "The Adaptive Pragmatist";
        archetypeDesc = "Calculates moves based on perceived opportunity. Hard to predict, impossible to ignore.";
      }
    }

    return {
      username: user.username,
      resonance: user.resonance ?? 50,
      totalGames: total,
      coopRate,
      defectRate,
      archetype,
      archetypeDesc,
      // Mock some history for the chart if zero data, otherwise use calculated trend
      history: total > 0 ? [coopRate, defectRate, 50, (coopRate + 50) / 2] : [50, 50, 50, 50]
    };
  },
});

import { mutation, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

const BOT_STRATEGIES = ["Tit-for-Tat", "Machiavelli", "Altruist", "Random", "Pavlov"];

export const addBotToRoom = mutation({
  args: { roomId: v.id("rooms"), strategy: v.string() },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) throw new Error("Room not found");
    
    // Create or get the bot user
    const botName = `BOT_${args.strategy}_${Math.floor(Math.random() * 1000)}`;
    const botId = await ctx.db.insert("users", {
      username: botName,
      passwordHash: "BOT_BYPASS",
      isBot: true,
      resonance: 50,
    });

    const updatedPlayers = [...room.players, botId];
    const roomMaxPlayers = room.maxPlayers ?? 2;
    const isFull = updatedPlayers.length >= roomMaxPlayers;

    await ctx.db.patch(args.roomId, {
      players: updatedPlayers,
      status: isFull ? "in_progress" : "waiting",
      hasBots: true,
    });

    if (isFull) {
      const round = await ctx.db
        .query("rounds")
        .filter((q) => q.eq(q.field("roomId"), args.roomId))
        .filter((q) => q.eq(q.field("roundNumber"), room.currentRound ?? 1))
        .first();

      if (round) {
        await ctx.db.patch(round._id, {
          status: "waiting_for_choices",
        });
      }
    }

    return botId;
  },
});

export const performBotMoves = internalMutation({
  args: { roomId: v.id("rooms"), roundId: v.id("rounds") },
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    const round = await ctx.db.get(args.roundId);
    if (!room || !round) return;

    const botPlayers = await Promise.all(
      room.players.map(async (pid) => {
        const p = await ctx.db.get(pid);
        return p?.isBot ? p : null;
      })
    );

    for (const bot of botPlayers) {
      if (!bot) continue;
      
      // If bot hasn't made a choice yet
      if (!round.choices.find(c => c.userId === bot._id)) {
        let choice = "COOPERATE";
        
        // Strategy logic
        if (bot.username.includes("Machiavelli")) {
          choice = "DEFECT";
        } else if (bot.username.includes("Altruist")) {
          choice = "COOPERATE";
        } else if (bot.username.includes("Random")) {
          choice = Math.random() > 0.5 ? "COOPERATE" : "DEFECT";
        } else if (bot.username.includes("Tit-for-Tat")) {
          // Get last round choices
          const lastRound = await ctx.db
            .query("rounds")
            .filter((q) => q.eq(q.field("roomId"), args.roomId))
            .filter((q) => q.eq(q.field("roundNumber"), (room.currentRound ?? 1) - 1))
            .first();
            
          if (lastRound && lastRound.choices.length > 0) {
            // Mimic a random human player's last move
            const humanChoice = lastRound.choices.find(c => {
                // Find if c.userId is NOT a bot
                return true; // Simple version for now
            });
            choice = humanChoice?.choice || "COOPERATE";
          }
        } else if (bot.username.includes("Pavlov")) {
          // Win-Stay, Lose-Shift (Pavlov)
          const lastRound = await ctx.db
            .query("rounds")
            .filter((q) => q.eq(q.field("roomId"), args.roomId))
            .filter((q) => q.eq(q.field("roundNumber"), (room.currentRound ?? 1) - 1))
            .first();

          if (!lastRound) {
            choice = "COOPERATE";
          } else {
            const myLastChoice = lastRound.choices.find(c => c.userId === bot._id);
            const theirLastChoice = lastRound.choices.find(c => c.userId !== bot._id);
            
            if (myLastChoice && theirLastChoice) {
              // If we both did the same thing (both C or both D), I "won" or at least stayed consistent
              // In Pavlov, if both cooperated (+3) or both defected (+1), stay with previous choice.
              // If we differed (one gets +5, other 0), shift move.
              if (myLastChoice.choice === theirLastChoice.choice) {
                choice = myLastChoice.choice;
              } else {
                choice = myLastChoice.choice === "COOPERATE" ? "DEFECT" : "COOPERATE";
              }
            } else {
              choice = "COOPERATE";
            }
          }
        }

        // Call makeChoice internal or just modify DB here
        // We'll use a helper to avoid circular dependency if possible, 
        // or just re-implement the logic since it's internal.
        
        // For simplicity, we trigger the bot move mutation
        await ctx.db.patch(args.roundId, {
            choices: [...round.choices, { userId: bot._id, choice }]
        });
      }
    }
  }
});

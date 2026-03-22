import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// @ts-ignore
import { useQuery, useMutation } from 'convex/react';
// @ts-ignore
import { api } from '../../convex/_generated/api';
import { Activity, ShieldAlert, Cpu, BrainCircuit, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export function MultiplayerRoom() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = localStorage.getItem('strategos_user_id');
  const [choiceMade, setChoiceMade] = useState(false);
  const [showRoundOverlay, setShowRoundOverlay] = useState(false);
  const [showIntel, setShowIntel] = useState(false);

  const room = useQuery(api.rooms.getRoom, id ? { roomId: id as any } : "skip");
  const currentRoundState = useQuery(api.rooms.getRoundByRoom, (id && room) ? { roomId: id as any, roundNumber: room.currentRound } : "skip");
  const allRounds = useQuery(api.rooms.getAllRounds, id ? { roomId: id as any } : "skip");
  
  const makeChoice = useMutation(api.rooms.makeChoice);

  useEffect(() => {
    if (!userId) navigate('/auth');
  }, [userId, navigate]);

  // Reset local choice state when round ticks over
  useEffect(() => {
    if (currentRoundState && currentRoundState.choices) {
      const hasChosen = currentRoundState.choices.some((c: any) => c.userId === userId);
      setChoiceMade(hasChosen);
    }
  }, [currentRoundState, userId]);

  // Round transition effect
  useEffect(() => {
    if (room?.currentRound && room.status === 'in_progress') {
      setShowRoundOverlay(true);
      const timer = setTimeout(() => setShowRoundOverlay(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [room?.currentRound, room?.status]);

  if (!room || !currentRoundState) {
    return (
      <div className="h-full flex items-center justify-center font-mono text-white/40 text-sm uppercase animate-pulse">
        Establishing connection to sector...
      </div>
    );
  }

  const handleChoice = async (ch: string) => {
    if (choiceMade) return;
    try {
      await makeChoice({ roundId: currentRoundState._id, userId: userId as any, choice: ch });
      setChoiceMade(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Determine Game Mode Configurations
  let optionA = "COOPERATE";
  let optionB = "DEFECT";
  let descA = "Mutually beneficial, but vulnerable to exploitation.";
  let descB = "Self-preservation. Maximizes payoff if they cooperate.";
  
  if (room.gameType === 'stag_hunt') {
    optionA = "HUNT STAG"; optionB = "CATCH HARE";
    descA = "High reward if everyone hunts the stag, massive failure if alone.";
    descB = "Guaranteed small reward regardless of teammates.";
  } else if (room.gameType === 'commons') {
    optionA = "CONSERVE"; optionB = "CONSUME";
    descA = "Sacrifice personal gain to sustain the environment.";
    descB = "Greedy consumption. Fails completely if everyone consumes.";
  } else if (room.gameType === 'custom') {
    optionA = room.customRules?.optionA || "OPTION A";
    optionB = room.customRules?.optionB || "OPTION B";
    descA = "Custom tactical choice designated by host.";
    descB = "Custom strategic choice designated by host.";
  }

  // Calculate End Game Stats if finished
  const calculateEndGameStats = () => {
    if (room.status !== 'finished' || !allRounds) return null;

    const playerStats: Record<string, { aCount: number, bCount: number, type: string, score: number }> = {};
    room.playerDetails.forEach((p: any) => {
      playerStats[p._id] = { aCount: 0, bCount: 0, type: 'Unknown', score: 0 };
    });

    // Score calculations across rounds
    allRounds.forEach((rnd: any) => {
      let aPicks = 0; let bPicks = 0;
      rnd.choices.forEach((c: any) => {
        if (c.choice === optionA) aPicks++; else bPicks++;
      });

      rnd.choices.forEach((c: any) => {
        const stats = playerStats[c.userId];
        if (c.choice === optionA) stats.aCount++; else stats.bCount++;

        // Math Logic matching Game Theory
        if (room.gameType === 'prisoners_dilemma' || room.gameType === 'custom') {
          // Public Goods Game math
          if (c.choice === optionA) stats.score += (aPicks * 2) - 1;
          else stats.score += (aPicks * 2);
        } else if (room.gameType === 'stag_hunt') {
          if (c.choice === optionA) stats.score += (aPicks === room.maxPlayers ? 5 : 0);
          else stats.score += 2;
        } else if (room.gameType === 'commons') {
          if (c.choice === optionB) stats.score += (bPicks <= room.maxPlayers / 2 ? 3 : 0);
          else stats.score += 1;
        }
      });
    });

    // Define archetypes based on history
    let winnerId = room.playerDetails[0]._id;
    let maxS = -999;

    room.playerDetails.forEach((p: any) => {
      const stats = playerStats[p._id];
      const aPerc = stats.aCount / room.totalRounds;
      if (aPerc > 0.8) stats.type = 'Idealist / Altruist';
      else if (aPerc < 0.2) stats.type = 'Machiavellian / Defector';
      else if (aPerc >= 0.4 && aPerc <= 0.6) stats.type = 'Tit-for-Tat / Reactive';
      else stats.type = 'Calculated Pragmatist';

      if (stats.score > maxS) {
        maxS = stats.score;
        winnerId = p._id;
      }
    });

    return { playerStats, winnerId };
  };

  const endStats = calculateEndGameStats();

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-8 gap-4">
        <div>
          <div className="text-[10px] font-mono text-jet-orange uppercase tracking-widest mb-1 flex items-center gap-2">
            <Activity size={12} className={room.status !== 'finished' ? "animate-pulse" : ""} /> {room.status === 'finished' ? 'Sector Concluded' : 'Active_Sector'}
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tighter">{room.roomName}</h1>
        </div>
        <div className="flex gap-4">
          <div className="text-xs font-mono uppercase bg-white/5 border border-white/10 px-3 py-1 flex items-center gap-2">
             Game: <span className="text-white">{room.gameType.replace('_', ' ')}</span>
          </div>
          <div className="text-xs font-mono uppercase bg-white/5 border border-white/10 px-3 py-1">
             Round <span className={room.status === 'finished' ? 'text-blue-400' : 'text-jet-orange'}>{Math.min(room.currentRound, room.totalRounds)}</span> / {room.totalRounds}
          </div>
          <button 
            onClick={() => setShowIntel(!showIntel)}
            className="text-[10px] font-mono uppercase bg-white/5 border border-white/10 px-3 py-1 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <BrainCircuit size={12} className={showIntel ? "text-jet-orange" : ""} /> Sector_Intel
          </button>
        </div>
      </div>

      {/* Round Interstitial Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: showRoundOverlay ? 1 : 0 }}
        className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        style={{ display: showRoundOverlay ? 'flex' : 'none' }}
      >
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: showRoundOverlay ? 1 : 0, opacity: showRoundOverlay ? 1 : 0 }}
          className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white"
        >
          ROUND {room.currentRound}
        </motion.div>
      </motion.div>

      {/* Intel History Drawer */}
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: showIntel ? 0 : '100%' }}
        className="fixed right-0 top-0 h-full w-full md:w-80 bg-black/95 border-l border-white/10 z-40 p-6 backdrop-blur-xl"
      >
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xs font-mono uppercase text-jet-orange">Strategic_History</h3>
          <button onClick={() => setShowIntel(false)} className="text-white/40 hover:text-white">✕</button>
        </div>
        <div className="space-y-4 overflow-y-auto max-h-[calc(100vh-150px)] pr-2">
          {allRounds?.slice().reverse().map((rnd: any) => (
            <div key={rnd._id} className="border-b border-white/5 pb-4">
              <div className="text-[9px] font-mono text-white/40 uppercase mb-2">Round {rnd.roundNumber}</div>
              <div className="space-y-1">
                {rnd.choices.map((c: any) => {
                  const p = room.playerDetails.find((pd: any) => pd._id === c.userId);
                  return (
                    <div key={c.userId} className="flex justify-between text-[10px]">
                      <Link to={`/player/${c.userId}`} className="text-white/60 hover:text-jet-orange transition-colors truncate max-w-[100px]">
                        {p?.username || 'Unknown'}
                      </Link>
                      <span className={c.choice === optionA ? "text-blue-400" : "text-jet-orange"}>{c.choice}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {(!allRounds || allRounds.length === 0) && (
            <div className="text-[10px] font-mono text-white/20 text-center mt-20">Initializing data streams...</div>
          )}
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col items-center justify-center gap-12">
        {room.status === 'waiting' && (
          <div className="text-center space-y-4">
            <Cpu size={48} className="text-white/20 mx-auto animate-pulse" />
            <h2 className="text-lg font-mono uppercase">Awaiting Combatants...</h2>
            <div className="text-[10px] font-mono text-white/40">
              {room.players.length} / {room.maxPlayers} Players Present.
            </div>
            <div className="text-[10px] font-mono text-white/40">Share sector ID to invite combatants.</div>
          </div>
        )}

        {room.status === 'in_progress' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl text-center space-y-8"
          >
            <div>
              <h2 className="text-2xl font-bold uppercase tracking-tighter mb-2">Execute Move</h2>
              <div className="text-xs font-mono text-white/40 uppercase">Determine your strategy for this iteration.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-4 md:mt-8 px-4 w-full">
              <button 
                disabled={choiceMade}
                onClick={() => handleChoice(optionA)}
                className={`p-6 md:p-10 rounded-2xl border transition-all duration-500 ${choiceMade ? 'opacity-50 border-white/10 cursor-not-allowed' : 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(59,130,246,0.2)]'} flex flex-col items-center gap-4 md:gap-6 group w-full`}
              >
                <div className="text-2xl md:text-3xl font-bold uppercase tracking-tighter text-blue-400 group-hover:scale-105 transition-transform duration-500">{optionA}</div>
                <div className="text-[9px] md:text-[10px] font-mono text-blue-400/60 text-center leading-relaxed">{descA}</div>
              </button>
              
              <button 
                disabled={choiceMade}
                onClick={() => handleChoice(optionB)}
                className={`p-6 md:p-10 rounded-2xl border transition-all duration-500 ${choiceMade ? 'opacity-50 border-white/10 cursor-not-allowed' : 'border-jet-orange/30 bg-jet-orange/5 hover:bg-jet-orange/10 hover:border-jet-orange hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(255,69,0,0.2)]'} flex flex-col items-center gap-4 md:gap-6 group w-full`}
              >
                <div className="text-2xl md:text-3xl font-bold uppercase tracking-tighter text-jet-orange group-hover:scale-105 transition-transform duration-500">{optionB}</div>
                <div className="text-[9px] md:text-[10px] font-mono text-jet-orange/60 text-center leading-relaxed">{descB}</div>
              </button>
            </div>
            
            {choiceMade && (
              <div className="flex flex-col items-center gap-4 mt-8">
                <div className="text-sm font-mono text-white/40 animate-transmission uppercase border border-white/5 bg-white/5 p-4 inline-block">
                  Choices transmitted. Synchronizing with remaining {room.maxPlayers - currentRoundState.choices.length} agents...
                </div>
                <div className="w-64 h-1 px-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentRoundState.choices.length / room.maxPlayers) * 100}%` }}
                    className="h-full bg-jet-orange"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {room.status === 'finished' && endStats && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-full border border-white/10 bg-black/60 backdrop-blur-2xl rounded-3xl p-10 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-jet-orange via-purple-500 to-blue-500"></div>
            
            <div className="text-center mb-10">
              <ShieldAlert size={32} className="mx-auto text-jet-orange mb-6" />
              <h2 className="text-3xl font-bold uppercase tracking-tighter mb-2">Simulations Concluded</h2>
              <p className="text-white/40 font-mono text-xs uppercase">Behavioral Archetypes Calculated</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-sm mb-12">
              {room.playerDetails.map((p: any) => {
                const s = endStats.playerStats[p._id];
                const isWinner = p._id === endStats.winnerId;
                return (
                  <div key={p._id} className={`p-6 border rounded-xl ${isWinner ? 'border-jet-orange bg-jet-orange/10 shadow-[0_0_20px_rgba(255,69,0,0.15)]' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex justify-between items-center mb-4">
                      <Link to={`/player/${p._id}`} className="font-bold uppercase tracking-widest text-lg hover:text-jet-orange transition-colors">
                        {p.username}
                      </Link>
                      {isWinner && <div className="text-[10px] uppercase bg-jet-orange text-white px-2 py-0.5 rounded-sm">Victor</div>}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white/40 text-[9px] uppercase tracking-tighter">Archetype</span>
                          <span className="text-blue-400 font-bold text-[10px]">{s.type}</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${isWinner ? 'bg-jet-orange' : 'bg-blue-500'} opacity-30`} style={{ width: '100%' }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-[8px] uppercase text-white/40 mb-1">
                            <span>{optionA}</span>
                            <span>{Math.round((s.aCount / room.totalRounds)*100)}%</span>
                          </div>
                          <div className="progress-bar-segment">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(s.aCount / room.totalRounds)*100}%` }}
                              className="progress-bar-fill bg-blue-400"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[8px] uppercase text-white/40 mb-1">
                            <span>{optionB}</span>
                            <span>{Math.round((s.bCount / room.totalRounds)*100)}%</span>
                          </div>
                          <div className="progress-bar-segment">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(s.bCount / room.totalRounds)*100}%` }}
                              className="progress-bar-fill"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5">
                        <div className="flex justify-between items-end">
                          <span className="text-white/40 text-[9px] uppercase">Net Yield</span>
                          <span className={`text-2xl font-black italic tracking-tighter ${isWinner ? 'text-jet-orange' : 'text-white'}`}>
                            {s.score.toLocaleString()}
                          </span>
                        </div>
                        <div className="progress-bar-segment mt-1 h-[2px]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (s.score / (room.totalRounds * 5)) * 100)}%` }}
                            className="progress-bar-fill !bg-white/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="text-white/40" size={24} />
                  <div>
                    <div className="text-[10px] font-mono uppercase text-white/40 mb-1">Global Market Analysis</div>
                    <div className="text-xs font-mono text-white/70">
                      In '{room.gameType.replace('_', ' ')}' scenarios, <span className="text-jet-orange font-bold">Tit-for-Tat models</span> historically yield a <span className="text-white font-bold">78% win correlation</span> over vast iterations.
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => navigate('/lobby')}
                  className="px-8 py-3 rounded-md border border-white/20 text-xs font-bold uppercase hover:bg-white hover:text-black transition-all shrink-0"
                >
                  Return to Lobby
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </div>
    </div>
  );
}

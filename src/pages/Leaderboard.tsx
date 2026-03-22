import React from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import { useQuery } from 'convex/react';
// @ts-ignore
import { api } from '../../convex/_generated/api';
import { Trophy, Medal, Users, Target, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function Leaderboard() {
  const leaders = useQuery(api.rooms.getLeaderboard) || [];
  
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-12 h-full flex flex-col">
      <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3 text-jet-orange mb-2">
            <Trophy size={24} />
            <h1 className="text-4xl font-bold uppercase tracking-tighter">Global_Apex</h1>
          </div>
          <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Master Strategists & Behavioral Archetypes</p>
        </div>
      </div>

      <div className="space-y-4">
        {leaders.length === 0 && (
          <div className="text-center p-20 border border-white/5 bg-white/2 overflow-hidden relative">
             <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.5em]">Initializing_Rankings...</div>
          </div>
        )}

        {leaders.map((leader: any, i: number) => (
          <motion.div
            key={leader._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-6 border border-white/10 bg-black/40 backdrop-blur-md rounded-xl hover:border-jet-orange/30 transition-all group"
          >
            <div className="flex items-center gap-6">
              <div className="w-8 font-mono text-xl text-white/20 group-hover:text-jet-orange/50 transition-colors">
                {i + 1 < 10 ? `0${i + 1}` : i + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/player/${leader.userId}`} className="font-bold text-lg uppercase tracking-tight hover:text-jet-orange transition-colors">
                    {leader.username}
                  </Link>
                  {i === 0 && <Medal size={14} className="text-jet-orange" />}
                </div>
                <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
                  Resonance: <span className={leader.resonance > 70 ? "text-blue-400" : "text-white"}>{leader.resonance}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-12">
              <div className="text-right">
                <div className="text-[10px] font-mono text-white/20 uppercase mb-1">Score</div>
                <div className="font-bold text-xl tabular-nums">{leader.score}</div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-mono text-white/20 uppercase mb-1">Simulations</div>
                <div className="font-bold text-xl tabular-nums">{leader.totalGames}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

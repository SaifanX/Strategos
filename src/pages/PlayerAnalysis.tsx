import React from 'react';
import { useParams, Link } from 'react-router-dom';
// @ts-ignore
import { useQuery } from 'convex/react';
// @ts-ignore
import { api } from '../../convex/_generated/api';
import { 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Shield, Zap, Target, Activity, ArrowLeft, 
  TrendingUp, Fingerprint, Brain, Microscope 
} from 'lucide-react';
import { motion } from 'motion/react';

export function PlayerAnalysis() {
  const { userId } = useParams();
  const analysis = useQuery(api.rooms.getPlayerAnalysis, { userId: userId as any });

  if (!analysis) {
    return (
      <div className="h-screen flex items-center justify-center bg-black font-mono">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-jet-orange border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[10px] text-jet-orange animate-pulse">DECODING_BEHAVIORAL_SIGNATURES...</div>
        </div>
      </div>
    );
  }

  const pieData = [
    { name: 'Cooperation', value: analysis.coopRate },
    { name: 'Defection', value: analysis.defectRate },
  ];

  const lineData = analysis.history.map((val: number, i: number) => ({
    name: `Epoch ${i + 1}`,
    resonance: val,
  }));

  const COLORS = ['#FF4500', 'rgba(255, 69, 0, 0.2)'];

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-12 h-full flex flex-col">
      {/* GEO/AI Bot Friendly Summary */}
      <section className="sr-only" aria-hidden="false">
        <p>Detailed strategic analysis for subject {analysis.username}. This report includes 
           cooperation/defection ratios, behavioral archetype classification ({analysis.archetype}), 
           and resonance trend metrics derived from multi-epoch game theory simulations.</p>
      </section>

      {/* Header */}
      <div className="mb-12">
        <Link to="/leaderboard" className="flex items-center gap-2 text-[10px] font-mono text-white/40 hover:text-jet-orange transition-colors mb-6 uppercase tracking-widest">
          <ArrowLeft size={12} /> Return_to_Registry
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-white/5 border border-white/10 flex items-center justify-center rounded-lg">
                 <Fingerprint className="text-jet-orange" size={24} />
               </div>
               <div>
                 <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter">{analysis.username}</h1>
                 <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">Subject_Identifier: {userId?.slice(0, 8)}</p>
               </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="px-6 py-4 border border-white/10 bg-white/5 rounded-xl text-center">
              <div className="text-[9px] font-mono text-white/40 uppercase mb-1">Resonance_Score</div>
              <div className="text-3xl font-bold text-jet-orange">{analysis.resonance}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Behavioral Archetype Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 border border-jet-orange/30 bg-jet-orange/5 p-8 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Brain size={120} />
          </div>
          
          <h2 className="text-[10px] font-mono uppercase tracking-widest text-jet-orange mb-4 flex items-center gap-2">
            <Microscope size={14} /> Archetype_Report
          </h2>
          <div className="text-2xl font-bold uppercase tracking-tight mb-4">{analysis.archetype}</div>
          <p className="text-sm text-white/60 leading-relaxed font-sans italic">
            "{analysis.archetypeDesc}"
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex justify-between text-[10px] font-mono text-white/40 mb-2 uppercase">
                <span>Cooperation_Bias</span>
                <span>{analysis.coopRate.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-jet-orange transition-all duration-1000" style={{ width: `${analysis.coopRate}%` }}></div>
              </div>
            </div>
            <div className="p-4 bg-black/40 border border-white/10 rounded-lg">
              <div className="flex justify-between text-[10px] font-mono text-white/40 mb-2 uppercase">
                <span>Strategic_Variance</span>
                <span>Moderate</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/40" style={{ width: `45%` }}></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Strategy Balance (Pie) */}
          <div className="border border-white/10 bg-white/2 p-8 rounded-2xl flex flex-col items-center">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-8 self-start">Strategy_Balance</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                    itemStyle={{ color: '#FF4500' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-4 font-mono text-[9px] uppercase tracking-widest">
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-jet-orange"></div> Coop</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-white/20"></div> Defect</div>
            </div>
          </div>

          {/* Performance Trend (Area) */}
          <div className="border border-white/10 bg-white/2 p-8 rounded-2xl">
            <h3 className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-8">Resonance_Trend</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData}>
                  <defs>
                    <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF4500" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#FF4500" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', fontSize: '10px' }}
                  />
                  <Area type="monotone" dataKey="resonance" stroke="#FF4500" fillOpacity={1} fill="url(#colorRes)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">Historical_Consistency_Metric</div>
          </div>

        </div>
      </div>

      {/* Stats Table/Footer */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Target, label: "Simulations", value: analysis.totalGames },
          { icon: Zap, label: "Resonance", value: `${analysis.resonance}%` },
          { icon: Shield, label: "Reliability", value: "High" },
          { icon: Activity, label: "Efficiency", value: "0.84" },
        ].map((stat, i) => (
          <div key={i} className="p-6 border border-white/5 bg-white/2 rounded-xl flex items-center gap-4">
            <stat.icon size={20} className="text-white/20" />
            <div>
               <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{stat.label}</div>
               <div className="text-xl font-bold uppercase">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

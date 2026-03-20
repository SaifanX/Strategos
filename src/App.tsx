import { useEffect, useState } from 'react';
import { Layout } from './components/Layout';
import { Hero } from './components/Hero';
import { Arena } from './components/Arena';
import { Analytics } from './components/Analytics';
import { useSimulation } from './useSimulation';
import { Play, Pause, RotateCcw, Zap, Info, User, ChevronRight, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SCENARIOS } from './types';
import { Colosseum } from './components/Colosseum';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { About } from './pages/About';

function useDocumentTitle() {
  const location = useLocation();
  useEffect(() => {
    switch (location.pathname) {
      case '/':
        document.title = "Strategos | The Laboratory";
        break;
      case '/simulation':
        document.title = "Strategos | Colosseum Simulation";
        break;
      case '/about':
        document.title = "Strategos | The Architect";
        break;
      default:
        document.title = "Strategos";
    }
  }, [location]);
}

const SETUPS = [
  {
    id: 'balanced',
    name: 'Balanced Ecosystem',
    description: 'Equal distribution of all strategies.',
    distribution: {
      ALWAYS_COOPERATE: 20,
      ALWAYS_DEFECT: 20,
      TIT_FOR_TAT: 20,
      GRUDGER: 20,
      RANDOM: 20
    }
  },
  {
    id: 'aggressive',
    name: 'Aggressive Population',
    description: 'Dominated by defectors. Can cooperation survive?',
    distribution: {
      ALWAYS_COOPERATE: 10,
      ALWAYS_DEFECT: 60,
      TIT_FOR_TAT: 10,
      GRUDGER: 10,
      RANDOM: 10
    }
  },
  {
    id: 'cooperative',
    name: 'Cooperative Start',
    description: 'A peaceful world. Vulnerable to a single defector.',
    distribution: {
      ALWAYS_COOPERATE: 60,
      ALWAYS_DEFECT: 5,
      TIT_FOR_TAT: 15,
      GRUDGER: 10,
      RANDOM: 10
    }
  }
];

export default function App() {
  const { state, initAgents, toggleRunning, setSpeed, setScenario, setMutationRate, setMatrix } = useSimulation();
  const [activeSetup, setActiveSetup] = useState('balanced');
  const navigate = useNavigate();
  const location = useLocation();

  useDocumentTitle();

  // @ts-ignore
  const hasConvex = Boolean(import.meta.env.VITE_CONVEX_URL);

  useEffect(() => {
    initAgents(1000);
  }, [initAgents]);

  const handleEnter = () => {
    navigate('/simulation');
  };

  const handleSetupChange = (setup: typeof SETUPS[0]) => {
    setActiveSetup(setup.id);
    // Multiply distribution by 10 to get 1000 agents total
    const scaledDistribution = Object.fromEntries(
      Object.entries(setup.distribution).map(([k, v]) => [k, v * 10])
    );
    initAgents(1000, scaledDistribution as any);
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.div
              key="hero"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8 }}
            >
              <Hero onEnter={handleEnter} />
            </motion.div>
          } />
          <Route path="/simulation" element={
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col md:flex-row"
            >
            {/* Left Sidebar: Controls */}
            <aside className="w-full md:w-80 border-r border-white/10 flex flex-col bg-black/80 backdrop-blur-xl z-10">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1 h-4 bg-jet-orange" />
                  <h2 className="text-xs font-mono uppercase tracking-widest">Simulation_Parameters</h2>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-white/40">
                      <span>Engine_Speed</span>
                      <span className="text-jet-orange">{state.speed}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      step="1"
                      value={state.speed}
                      onChange={(e) => setSpeed(Number(e.target.value))}
                      className="w-full accent-jet-orange bg-white/10 h-1 rounded-none appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={toggleRunning}
                      className={`flex items-center justify-center gap-2 py-3 px-4 text-[10px] font-bold uppercase tracking-tighter transition-all ${
                        state.isRunning 
                        ? 'bg-jet-orange text-white' 
                        : 'bg-white text-black hover:bg-jet-orange hover:text-white'
                      }`}
                    >
                      {state.isRunning ? <Pause size={14} /> : <Play size={14} />}
                      {state.isRunning ? 'Halt' : 'Execute'}
                    </button>
                    <button 
                      onClick={() => initAgents(1000)}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-tighter hover:bg-white/10 transition-all"
                    >
                      <RotateCcw size={14} />
                      Reset
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-mono uppercase text-white/40">
                      <span>Mutation_Rate</span>
                      <span className="text-jet-orange">{(state.mutationRate * 100).toFixed(1)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="0.2" 
                      step="0.01"
                      value={state.mutationRate}
                      onChange={(e) => setMutationRate(Number(e.target.value))}
                      className="w-full accent-jet-orange bg-white/10 h-1 rounded-none appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-8">
                {/* Simulation Setups */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-white/40">
                    <Target size={12} className="text-jet-orange" />
                    <span>Simulation_Setups</span>
                  </div>
                  <div className="space-y-2">
                    {SETUPS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => handleSetupChange(s)}
                        className={`w-full text-left p-3 border transition-all flex flex-col gap-1 ${
                          activeSetup === s.id 
                          ? 'border-jet-orange bg-jet-orange/5' 
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div className={`text-[10px] font-bold uppercase tracking-tight ${activeSetup === s.id ? 'text-jet-orange' : 'text-white'}`}>
                          {s.name}
                        </div>
                        <div className="text-[8px] text-white/40 leading-tight uppercase">
                          {s.description}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-white/40">
                    <Zap size={12} className="text-jet-orange" />
                    <span>Game_Scenario</span>
                  </div>
                  <div className="space-y-2">
                    {SCENARIOS.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setScenario(s.id)}
                        className={`w-full text-left p-3 border transition-all flex justify-between items-center group ${
                          state.scenario.id === s.id 
                          ? 'border-jet-orange bg-jet-orange/5' 
                          : 'border-white/5 bg-white/5 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <div className={`text-[10px] font-bold uppercase tracking-tight ${state.scenario.id === s.id ? 'text-jet-orange' : 'text-white'}`}>
                            {s.name}
                          </div>
                        </div>
                        <ChevronRight size={12} className={state.scenario.id === s.id ? 'text-jet-orange' : 'text-white/20'} />
                      </button>
                    ))}
                  </div>
                  <div className="p-4 bg-white/5 border border-white/10">
                    <p className="text-[10px] text-white/40 leading-relaxed italic">
                      {state.scenario.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-white/40">
                    <Info size={12} />
                    <span>Payoff_Matrix</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 font-mono text-[9px] text-center">
                    <div className="p-2 border border-white/5 bg-white/5 flex flex-col items-center">
                      <span className="text-white/40 mb-1">C/C (Reward)</span>
                      <input type="number" value={state.scenario.matrix.cc} onChange={e => setMatrix({ ...state.scenario.matrix, cc: Number(e.target.value) })} className="w-full bg-transparent text-center text-jet-orange border-b border-white/20 focus:outline-none focus:border-jet-orange" />
                    </div>
                    <div className="p-2 border border-white/5 bg-white/5 flex flex-col items-center">
                      <span className="text-white/40 mb-1">C/D (Sucker)</span>
                      <input type="number" value={state.scenario.matrix.cd} onChange={e => setMatrix({ ...state.scenario.matrix, cd: Number(e.target.value) })} className="w-full bg-transparent text-center text-jet-orange border-b border-white/20 focus:outline-none focus:border-jet-orange" />
                    </div>
                    <div className="p-2 border border-white/5 bg-white/5 flex flex-col items-center">
                      <span className="text-white/40 mb-1">D/C (Tempt)</span>
                      <input type="number" value={state.scenario.matrix.dc} onChange={e => setMatrix({ ...state.scenario.matrix, dc: Number(e.target.value) })} className="w-full bg-transparent text-center text-jet-orange border-b border-white/20 focus:outline-none focus:border-jet-orange" />
                    </div>
                    <div className="p-2 border border-white/5 bg-white/5 flex flex-col items-center">
                      <span className="text-white/40 mb-1">D/D (Punish)</span>
                      <input type="number" value={state.scenario.matrix.dd} onChange={e => setMatrix({ ...state.scenario.matrix, dd: Number(e.target.value) })} className="w-full bg-transparent text-center text-jet-orange border-b border-white/20 focus:outline-none focus:border-jet-orange" />
                    </div>
                  </div>
                </div>

                {/* Convex: The Colosseum (Only if URL is provided) */}
                {hasConvex && <Colosseum state={state} />}
              </div>

              <div className="p-6 border-t border-white/10 bg-jet-orange/5">
                <button 
                  onClick={() => navigate('/about')}
                  className="flex items-center gap-3 w-full text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full border border-jet-orange/30 flex items-center justify-center overflow-hidden bg-black group-hover:border-jet-orange transition-colors">
                    <User size={20} className="text-jet-orange" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-jet-orange uppercase tracking-widest">About The Author</div>
                    <div className="text-xs font-bold uppercase tracking-tighter hover:underline">Saifan Mohammad</div>
                  </div>
                </button>
              </div>
            </aside>

            {/* Main Content: Arena & Analytics */}
            <div className="flex-1 flex flex-col relative">
              <div className="flex-1">
                <Arena agents={state.agents} />
              </div>

              {/* Bottom Analytics Overlay */}
              <div className="absolute bottom-6 left-6 right-6 h-64 pointer-events-none">
                <div className="w-full h-full pointer-events-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                    <div className="md:col-span-2">
                      <Analytics data={state.populationHistory} />
                    </div>
                    <div className="bg-black/40 backdrop-blur-sm border border-white/5 p-4 font-mono overflow-y-auto">
                      <h3 className="text-[10px] uppercase tracking-widest text-white/40 mb-4">System_Logs</h3>
                      <div className="space-y-2 text-[9px] uppercase tracking-tighter">
                        <div className="text-white/20">[GEN_{state.generation}]: Simulation_Step_Complete</div>
                        <div className="text-white/20">[GEN_{state.generation}]: Calculating_Equilibrium...</div>
                        {state.generation % 5 === 0 && state.generation > 0 && (
                          <div className="text-jet-orange animate-pulse">[GEN_{state.generation}]: EVOLUTION_PROTOCOL_INITIATED</div>
                        )}
                        <div className="text-white/40">--- End of Buffer ---</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generation Counter HUD */}
              <div className="absolute top-6 right-6 p-4 bg-black/80 border border-white/10 backdrop-blur-md font-mono">
                <div className="text-[8px] uppercase text-white/40 tracking-[0.3em] mb-1">Generation</div>
                <div className="text-3xl font-bold tracking-tighter">{state.generation.toString().padStart(4, '0')}</div>
              </div>
            </div>
          </motion.div>
          } />
          <Route path="/about" element={
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <About />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

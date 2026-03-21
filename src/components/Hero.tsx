import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'motion/react';
import { ArrowDown, Shield, Zap, Target, Cpu, ChevronRight, Info } from 'lucide-react';
import { Hero3DScene } from './Hero3DScene';

interface HeroProps {
  onEnter: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onEnter }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Mouse follow logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Background transformations
  const gridOpacity = useTransform(smoothScroll, [0, 0.5, 1], [0.1, 0.05, 0.1]);
  const gridScale = useTransform(smoothScroll, [0, 1], [1, 1.2]);

  const strategies = [
    {
      id: 'T4T',
      name: 'Tit-for-Tat',
      desc: 'Starts with cooperation, then replicates the opponent\'s previous move. The most successful balanced strategy.',
      color: 'text-[#00FFCC]',
      bg: 'bg-[#00FFCC]/10'
    },
    {
      id: 'AD',
      name: 'Always Defect',
      desc: 'Never cooperates. Exploits trust but eventually creates a wasteland where no one wins.',
      color: 'text-[#FF4500]',
      bg: 'bg-[#FF4500]/10'
    },
    {
      id: 'AC',
      name: 'Always Cooperate',
      desc: 'The saint. Essential for growth, but vulnerable to exploitation by defectors.',
      color: 'text-white',
      bg: 'bg-white/10'
    },
    {
      id: 'GR',
      name: 'Grudger',
      desc: 'Cooperates until the opponent defects once. After that, it never cooperates again.',
      color: 'text-[#FFCC00]',
      bg: 'bg-[#FFCC00]/10'
    }
  ];

  const payoffExplanations: Record<string, string> = {
    'CC': 'Mutual Cooperation: Both gain a stable reward (+3). The foundation of civilization.',
    'CD': 'Exploitation: You cooperate, they defect. You lose everything (0), they take the prize (+5).',
    'DC': 'Temptation: You defect, they cooperate. You take the maximum prize (+5), they get nothing.',
    'DD': 'Mutual Defection: Both lose. A minimal survival reward (+1) in a state of constant war.'
  };

  return (
    <div ref={containerRef} className="relative bg-black text-white selection:bg-jet-orange selection:text-white overflow-x-hidden">
      {/* Mouse Follow Glow */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-50 opacity-30"
        style={{
          background: useTransform(
            [mouseX, mouseY],
            ([x, y]) => `radial-gradient(600px circle at ${x}px ${y}px, rgba(255, 99, 33, 0.15), transparent 80%)`
          )
        }}
      />

      <Hero3DScene />

      {/* Progress Indicator - Sticky Left */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-4">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="w-1 h-8 bg-white/10 relative overflow-hidden"
            initial={false}
          >
            <motion.div
              className="absolute inset-0 bg-jet-orange origin-top"
              style={{
                scaleY: useTransform(smoothScroll, [i * 0.2, (i + 1) * 0.2], [0, 1])
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Background Grid - Fixed */}
      <motion.div
        style={{
          opacity: gridOpacity,
          scale: gridScale,
          rotate: useTransform(smoothScroll, [0, 1], [0, 5])
        }}
        className="fixed inset-0 pointer-events-none z-0"
      >
        <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,black_100%)" />
      </motion.div>

      {/* Section 1: The Hook */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 z-10 overflow-hidden">
        <motion.div
          style={{
            y: useTransform(smoothScroll, [0, 0.2], [0, -100]),
            opacity: useTransform(smoothScroll, [0, 0.15], [1, 0])
          }}
          className="text-center max-w-4xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-black/40 backdrop-blur-md p-8 md:p-16 rounded-3xl border border-white/10 shadow-2xl"
          >
            <span className="font-mono text-[10px] text-jet-orange uppercase tracking-[0.5em] mb-6 block drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              [Transmission_Start]
            </span>
            <h1 className="text-7xl md:text-9xl font-bold tracking-tighter uppercase leading-[0.8] mb-8 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
              Conflict is <br />
              <span className="text-white/50">Calculated.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
              Welcome to the laboratory of human behavior. Where every choice is a variable,
              and every outcome is a data point in the evolution of trust.
            </p>
          </motion.div>
        </motion.div>

        {/* Live Feed Ticker */}
        <div className="absolute bottom-24 w-full overflow-hidden border-y border-white/5 py-2 bg-black/50 backdrop-blur-sm">
          <motion.div
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="flex gap-12 whitespace-nowrap font-mono text-[8px] text-white/20 uppercase tracking-widest"
          >
            {[...Array(10)].map((_, i) => (
              <span key={i}>
                [SYSTEM_LOG]: AGENT_ID_{Math.floor(Math.random() * 9999)} DEFECTED //
                [SYSTEM_LOG]: MADE BY SAIFAN - STUDENT //
                [SYSTEM_LOG]: CALCULATING IVY ENTRANCE CHANCES //
                [SYSTEM_LOG]: TRUST_INDEX_CALCULATING...
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          style={{ opacity: useTransform(smoothScroll, [0, 0.05], [1, 0]) }}
          className="absolute bottom-10 flex flex-col items-center gap-2 text-white/20 animate-bounce"
        >
          <span className="font-mono text-[8px] uppercase tracking-widest">Scroll_To_Analyze</span>
          <ArrowDown size={14} />
        </motion.div>
      </section>

      {/* Section 2: The Dilemma (Interactive Matrix) */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8 bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 drop-shadow-xl"
            style={{
              opacity: useTransform(smoothScroll, [0.1, 0.2, 0.35, 0.45], [0, 1, 1, 0])
            }}
          >
            <div className="w-12 h-12 bg-jet-orange/10 border border-jet-orange flex items-center justify-center">
              <Shield className="text-jet-orange" size={24} />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">The Dilemma</h2>
            <p className="text-white/60 text-lg leading-relaxed">
              In 1950, Merrill Flood and Melvin Dresher framed a problem that would define modern strategy.
              If we both cooperate, we both win. But if I betray you, I win more.
            </p>

            <div className="p-6 bg-white/5 border border-white/10 rounded-sm">
              <div className="flex items-start gap-4">
                <Info className="text-jet-orange shrink-0 mt-1" size={20} />
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Outcome_Analysis</h4>
                  <p className="text-sm text-white/80 leading-relaxed min-h-[3em]">
                    {hoveredCell ? payoffExplanations[hoveredCell] : "Hover over the matrix cells to analyze the mathematical consequences of each interaction."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ margin: "-100px" }}
            className="aspect-square bg-black/40 backdrop-blur-md border border-white/10 drop-shadow-xl flex flex-col relative overflow-hidden group p-1 rounded-3xl"
          >
            <div className="grid grid-cols-2 grid-rows-2 gap-1 w-full h-full font-mono text-[10px]">
              {[
                { id: 'CC', label: 'C / C', val: '+3', color: 'text-white' },
                { id: 'CD', label: 'C / D', val: '0', color: 'text-jet-orange' },
                { id: 'DC', label: 'D / C', val: '+5', color: 'text-white' },
                { id: 'DD', label: 'D / D', val: '+1', color: 'text-white/40' }
              ].map((cell) => (
                <div
                  key={cell.id}
                  onMouseEnter={() => setHoveredCell(cell.id)}
                  onMouseLeave={() => setHoveredCell(null)}
                  className={`relative border border-white/5 p-4 flex flex-col justify-center items-center gap-4 cursor-crosshair transition-all duration-300 ${hoveredCell === cell.id ? 'bg-white/10 border-white/20' : 'bg-transparent'}`}
                >
                  <span className="text-white/20 uppercase tracking-widest text-[8px]">{cell.label}</span>
                  <span className={`text-4xl font-bold ${cell.color}`}>{cell.val}</span>
                  {hoveredCell === cell.id && (
                    <motion.div
                      layoutId="cell-highlight"
                      className="absolute inset-0 border-2 border-jet-orange/50 pointer-events-none"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Matrix Labels */}
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-mono text-white/20 uppercase tracking-[0.5em]">Opponent_Action</div>
            <div className="absolute top-[-1rem] left-1/2 -translate-x-1/2 text-[8px] font-mono text-white/20 uppercase tracking-[0.5em]">Your_Action</div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: The Strategies (Horizontal Showcase) */}
      <section className="relative h-[200vh] z-10" id="strategies-section">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <div className="px-6 mb-12 max-w-6xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="space-y-4 bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 inline-block drop-shadow-xl"
            >
              <span className="font-mono text-[10px] text-jet-orange uppercase tracking-[0.5em]">[Behavioral_Profiles]</span>
              <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">The Players</h2>
            </motion.div>
          </div>

          <motion.div
            className="flex gap-8 px-6 md:px-[10vw]"
            style={{
              x: useTransform(smoothScroll, [0.4, 0.6], [0, -1200])
            }}
          >
            {strategies.map((strat, i) => (
              <div
                key={strat.id}
                className="min-w-[300px] md:min-w-[450px] aspect-[4/5] bg-black/60 backdrop-blur-xl border border-white/10 p-8 flex flex-col justify-between group hover:border-jet-orange/50 transition-colors drop-shadow-xl rounded-2xl"
              >
                <div className="space-y-6">
                  <div className={`w-12 h-12 ${strat.bg} flex items-center justify-center border border-white/10`}>
                    <span className={`font-mono text-xs font-bold ${strat.color}`}>{strat.id}</span>
                  </div>
                  <h3 className="text-3xl font-bold tracking-tighter uppercase">{strat.name}</h3>
                  <p className="text-white/40 text-sm leading-relaxed uppercase tracking-tight">{strat.desc}</p>
                </div>

                <div className="flex items-center gap-2 text-[8px] font-mono text-white/20 uppercase tracking-widest group-hover:text-jet-orange transition-colors">
                  <span>Analyze_Pattern</span>
                  <ChevronRight size={10} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section 4: The Evolution */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24 z-10">
        <motion.div
          className="max-w-4xl text-center space-y-12"
          style={{
            opacity: useTransform(smoothScroll, [0.55, 0.65, 0.75, 0.85], [0, 1, 1, 0]),
            y: useTransform(smoothScroll, [0.55, 0.85], [50, -50])
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            className="space-y-6 bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/10 drop-shadow-xl"
          >
            <div className="flex justify-center gap-4">
              <Zap className="text-jet-orange" size={32} />
              <Target className="text-white" size={32} />
              <Cpu className="text-white/40" size={32} />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter uppercase">Evolutionary Stability</h2>
            <p className="text-white/60 text-lg leading-relaxed">
              Strategies aren't static. They evolve. They compete. They die.
              In our arena, the most successful behaviors replicate, while the weak are purged.
              Watch as "Tit-for-Tat" builds empires of trust, or "Always Defect" creates a wasteland of betrayal.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Adaptation", desc: "Strategies change based on success." },
              { title: "Selection", desc: "The top 15% replicate every cycle." },
              { title: "Equilibrium", desc: "Finding the balance in chaos." }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-6 border border-white/10 bg-black/50 backdrop-blur-md text-left group hover:bg-black/60 transition-colors rounded-xl"
              >
                <h4 className="font-bold uppercase text-xs mb-2 text-jet-orange tracking-widest">{item.title}</h4>
                <p className="text-[10px] text-white/40 leading-relaxed uppercase">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Section 5: The Entry */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ margin: "-100px" }}
          className="text-center space-y-12 bg-black/40 backdrop-blur-md p-12 rounded-3xl border border-white/10 drop-shadow-xl"
          style={{
            opacity: useTransform(smoothScroll, [0.85, 0.95], [0, 1]),
            y: useTransform(smoothScroll, [0.85, 1], [50, 0])
          }}
        >
          <div className="space-y-4">
            <span className="font-mono text-[10px] text-white/50 uppercase tracking-[0.8em] drop-shadow-md">Final_Stage</span>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] mb-8">Ready to <br />Begin?</h2>
          </div>

        <div className="flex flex-col md:flex-row gap-6 mt-8">
          <button
            onClick={onEnter}
            className="group relative px-12 py-5 border border-white/20 hover:border-jet-orange transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-jet-orange translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 font-bold uppercase tracking-[0.2em] text-sm group-hover:text-white flex items-center gap-2">
              <Cpu size={18} /> Run_Local_Simulation
            </span>
          </button>

          <a
            href="/auth"
            className="group relative px-12 py-5 border border-white/20 bg-white/5 hover:border-blue-500 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 font-bold uppercase tracking-[0.2em] text-sm text-white flex items-center gap-2">
              <Shield size={18} /> Join_Multiplayer
            </span>
          </a>

          <a
            href="https://github.com/saifanx/strategos"
            target="_blank"
            rel="noreferrer"
            className="group relative px-12 py-5 border border-white/20 hover:border-white transition-all overflow-hidden"
          >
            <span className="relative z-10 font-bold uppercase tracking-[0.2em] text-sm text-white/60 group-hover:text-white transition-colors flex items-center gap-2">
              Star_Repo
            </span>
          </a>
        </div>
        </motion.div>

        {/* Decorative Elements */}
        <div className="absolute bottom-10 left-10 font-mono text-[9px] text-white/10 uppercase space-y-1">
          <div>[System_Status]: Ready</div>
          <div>[Protocol]: Nash_Equilibrium_v4</div>
          <div>[Architect]: Saifan</div>
        </div>

        <div className="absolute top-10 right-10 font-mono text-[9px] text-white/10 uppercase text-right space-y-1">
          <div>[Uplink]: github.com/saifanx</div>
          <div>[Location]: Strategos_Lab_Mainframe</div>
        </div>
      </section>
    </div>
  );
};


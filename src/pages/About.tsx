import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, Terminal, Code, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import avatarImg from '../assets/avatar.png';

export const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-jet-orange selection:text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
        <div className="w-full h-full bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-radial-gradient(circle_at_center,transparent_0%,black_100%)" />
      </div>

      <button 
        onClick={() => navigate('/')}
        className="fixed top-8 left-8 z-50 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-jet-orange transition-colors"
      >
        <ArrowLeft size={14} />
        Return_To_Base
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
      >
        {/* Avatar Section */}
        <div className="relative group perspective mx-auto w-full max-w-sm aspect-square">
          <motion.div 
            animate={{ rotateY: [0, 5, -5, 0], rotateX: [0, -5, 5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="w-full h-full relative"
          >
            <div className="absolute inset-0 bg-jet-orange/20 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <img 
              src={avatarImg} 
              alt="Saifan Mohammad - Architect" 
              className="w-full h-full object-cover border border-white/10 rounded-sm shadow-2xl relative z-10 filter grayscale contrast-125 sepia-[0.3] hue-rotate-[320deg] mix-blend-screen"
            />
            
            {/* HUD Elements around Avatar */}
            <div className="absolute -top-4 -left-4 w-8 h-8 border-t-2 border-l-2 border-jet-orange/50 z-20" />
            <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-2 border-r-2 border-jet-orange/50 z-20" />
            
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 font-mono text-[8px] text-white/20 uppercase tracking-[0.5em] rotate-90">
              Identity_Verified
            </div>
          </motion.div>
        </div>

        {/* Bio Section */}
        <div className="space-y-8 bg-black/40 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-white/10 drop-shadow-xl relative">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-2 bg-jet-orange animate-pulse" />
              <span className="font-mono text-[10px] text-jet-orange uppercase tracking-[0.5em]">The_Architect [Saifan Mohammad]</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tighter uppercase drop-shadow-md">
              Saifan <br />
              <span className="text-white/40">Mohammad</span>
            </h1>
          </div>

          <div className="text-white/60 leading-relaxed font-light text-lg drop-shadow-sm space-y-4">
            <p>
              A 9th-grade developer and strategist from India, aspiring to push the boundaries of computer science and full-stack engineering at an Ivy League institution. 
              Strategos was built to explore the deep intersection between Game Theory, Evolutionary Biology, and High-Performance Web Architecture.
            </p>
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <h2 className="text-[10px] font-mono text-jet-orange uppercase tracking-widest mb-2">Project_Philosophy</h2>
              <p className="text-xs text-white/40 leading-relaxed uppercase tracking-tight">
                Strategos aims to democratize the understanding of cooperative systems through rigorous mathematical simulation and high-fidelity visualization.
              </p>
            </div>
          </div>

          {/* FAQ Section for SEO/GEO */}
          <div className="space-y-6 pt-6 border-t border-white/10">
            <h2 className="text-sm font-mono text-white/40 uppercase tracking-widest">Frequently_Asked_Questions</h2>
            <div className="space-y-4">
              <details className="group border border-white/5 bg-white/5 p-4 cursor-pointer">
                <summary className="text-[10px] font-bold uppercase tracking-widest flex justify-between items-center group-hover:text-jet-orange transition-colors">
                  What is Game Theory?
                </summary>
                <p className="text-[10px] text-white/40 mt-3 uppercase leading-relaxed">
                  Game theory is the study of mathematical models of strategic interaction among rational agents. It has applications in social science, logic, systems science and computer science.
                </p>
              </details>
              <details className="group border border-white/5 bg-white/5 p-4 cursor-pointer">
                <summary className="text-[10px] font-bold uppercase tracking-widest flex justify-between items-center group-hover:text-jet-orange transition-colors">
                  How can I use Strategos for research?
                </summary>
                <p className="text-[10px] text-white/40 mt-3 uppercase leading-relaxed">
                  Strategos provides a real-time arena where you can adjust payoff matrices, mutation rates, and population distributions to observe evolutionary stable strategies (ESS).
                </p>
              </details>
            </div>
          </div>

          <p className="text-white/40 leading-relaxed font-light text-sm italic py-4">
            "Driven by curiosity, fueled by logic. Seeking a full-ride scholarship to turn architectural visions into global realities."
          </p>

          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
            {[
              { icon: <Code size={16} />, label: "Algorithms", value: "Optimized" },
              { icon: <Terminal size={16} />, label: "Full-Stack", value: "Mastered" },
              { icon: <Shield size={16} />, label: "Architecture", value: "Scalable" },
              { icon: <User size={16} />, label: "Ambition", value: "Limitless" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 p-3 rounded-sm group hover:border-jet-orange/30 transition-colors">
                <div className="text-jet-orange/50 group-hover:text-jet-orange transition-colors">{stat.icon}</div>
                <div>
                  <div className="text-[8px] font-mono text-white/40 uppercase tracking-widest">{stat.label}</div>
                  <div className="text-xs font-bold uppercase tracking-tighter">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Funnel CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-white/10">
            <Link 
              to="/auth"
              className="flex-1 px-6 py-4 border border-jet-orange/30 bg-jet-orange/10 hover:bg-jet-orange hover:text-white transition-all text-center group"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-jet-orange group-hover:text-white">Join Multiplayer Arena</span>
            </Link>
            <a 
              href="https://github.com/saifanx/strategos"
              target="_blank"
              rel="noreferrer"
              className="flex-1 px-6 py-4 border border-white/20 hover:border-white transition-all text-center group"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-white/60 group-hover:text-white">Star The Project</span>
            </a>
          </div>
        </div>

      </motion.div>
    </div>
  );
};

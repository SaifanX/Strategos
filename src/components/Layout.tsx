import React from 'react';
import { Github, Linkedin, Terminal, Activity, Shield, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-jet-orange overflow-hidden flex flex-col">
      {/* Top Navigation HUD */}
      <header className="border-b border-white/10 p-4 flex justify-between items-center bg-black/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-jet-orange flex items-center justify-center">
            <Terminal size={18} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tighter uppercase leading-none">Strategos</h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
              Strategic Game Theory Laboratory v1.0.4
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest text-white/60">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-jet-orange" />
            <span>System: Operational</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield size={12} className="text-white/40" />
            <span>Encryption: AES-256</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={12} className="text-white/40" />
            <span>Engine: Convex_Sim_v2</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-tighter hover:bg-jet-orange hover:text-white transition-all">
            Initiate_Uplink
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto">
        {children}
      </main>



      {/* Architect Signature Footer */}
      <footer className="border-t border-white/10 p-2 bg-black z-50">
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-4 font-mono text-[9px] text-white/40 uppercase tracking-[0.2em]">
            <span>© 2026 Strategos Lab</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>Architect: Saifan Mohammad</span>
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span className="text-jet-orange animate-pulse">Uplink_Stable</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-4">
              <a href="#" className="text-white/40 hover:text-white transition-colors"><Linkedin size={14} /></a>
              <a href="https://github.com/saifanx" className="text-white/40 hover:text-white transition-colors"><Github size={14} /></a>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="font-mono text-[9px] text-white/20 uppercase">
              Lat: 28.6139° N | Lng: 77.2090° E
            </div>
          </div>
        </div>
      </footer>

      {/* Scanning Line Effect */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] overflow-hidden">
        <div className="w-full h-[2px] bg-white absolute top-0 animate-[scan_8s_linear_infinite]" />
      </div>
    </div>
  );
};

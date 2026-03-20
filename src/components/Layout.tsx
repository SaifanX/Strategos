import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Terminal, Activity, Database, Cpu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-jet-orange selection:text-black flex flex-col">
      {/* GLOBAL NAVIGATION & FUNNEL HEADER */}
      <header className="border-b border-white/10 p-4 flex justify-between items-center bg-black/80 backdrop-blur-md z-50 sticky top-0">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-8 h-8 bg-jet-orange flex items-center justify-center transition-transform group-hover:scale-105">
            <Terminal size={18} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tighter uppercase leading-none group-hover:text-jet-orange transition-colors">
              Strategos
            </h1>
            <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
              Strategic Game Theory Lab - By Saifan
            </p>
          </div>
        </Link>

        {/* HUD STATS (Static visual representation of engine state) */}
        <div className="hidden md:flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest text-white/40">
          <div className="flex items-center gap-2">
            <Activity size={12} className="text-jet-orange animate-pulse" />
            <span>Engine_Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Database size={12} />
            <span>Convex_Sync</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu size={12} />
            <span>Made by Saifan</span>
          </div>
        </div>

        {/* FUNNEL ROUTING */}
        <div className="flex items-center gap-4">
          {location.pathname !== '/about' && (
            <Link
              to="/about"
              className="text-[10px] font-mono uppercase tracking-widest text-white/40 hover:text-white transition-colors"
            >
              The_Architect
            </Link>
          )}
          {location.pathname !== '/simulation' && (
            <Link
              to="/simulation"
              className="px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-tighter hover:bg-jet-orange hover:text-white transition-all shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_20px_rgba(255,100,0,0.4)]"
            >
              Initiate_Uplink
            </Link>
          )}
        </div>
      </header>

      {/* DYNAMIC VIEWPORT */}
      <main className="flex-grow relative">
        {children}
      </main>

      {/* SYSTEM FOOTER */}
      <footer className="border-t border-white/10 p-4 flex justify-between items-center bg-black font-mono text-[10px] uppercase tracking-widest text-white/40">
        <div>
          <p>© {new Date().getFullYear()} SAIFAN STUDENT DEV. ALL RIGHTS RESERVED.</p>
        </div>
        <div className="flex gap-4">
          <span className="hover:text-white transition-colors cursor-crosshair">STATUS: OPTIMAL</span>
        </div>
      </footer>
    </div>
  );
};
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { useMutation } from 'convex/react';
// @ts-ignore
import { api } from '../../convex/_generated/api';
import { Shield, User, Key, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const signIn = useMutation(api.auth.signIn);
  const signUp = useMutation(api.auth.signUp);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      let userId;
      if (isLogin) {
        userId = await signIn({ username, password });
      } else {
        userId = await signUp({ username, password });
      }
      
      // Store simple auth token locally
      localStorage.setItem('strategos_user_id', userId);
      localStorage.setItem('strategos_username', username);
      navigate('/lobby');
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 flex-col">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-white/10 bg-black/50 backdrop-blur-md p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-jet-orange to-transparent opacity-50"></div>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 flex items-center justify-center border border-white/10 bg-white/5 text-jet-orange">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold uppercase tracking-tighter">
              {isLogin ? 'Access_Terminal' : 'Agent_Registration'}
            </h2>
            <div className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
              Security Protocol Active
            </div>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-xs font-mono rounded-md shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-start gap-3"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-bold uppercase tracking-widest mb-1">Access Denied</div>
              <div className="text-white/70">{error}</div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
              <User size={12} /> Username
            </label>
            <input 
              type="text" 
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-4 text-sm font-mono focus:outline-none focus:border-transparent focus:ring-2 focus:ring-jet-orange/50 transition-all duration-300 rounded-sm"
              placeholder="Enter agent alias"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest flex items-center gap-2">
              <Key size={12} /> Passcode
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/10 p-4 text-sm font-mono focus:outline-none focus:border-transparent focus:ring-2 focus:ring-jet-orange/50 transition-all duration-300 rounded-sm"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-between p-4 bg-white text-black font-bold uppercase tracking-tight hover:bg-jet-orange hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,69,0,0.4)] rounded-sm group"
          >
            <span>{isLogin ? 'Initialize_Uplink' : 'Create_Identity'}</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-mono text-white/40 hover:text-jet-orange transition-colors uppercase tracking-widest"
          >
            {isLogin ? 'New Agent? Register Here' : 'Existing Agent? Access Terminal'}
          </button>
        </div>
        
        {/* GitHub Star Prompt */}
        <div className="mt-6 p-4 border border-jet-orange/20 bg-jet-orange/5 text-center flex flex-col items-center gap-2">
          <div className="text-[10px] font-mono text-jet-orange uppercase tracking-widest">Optional Side Quest</div>
          <div className="text-xs text-white/60">Star our GitHub repo to support the project before diving into the Colosseum!</div>
          <a href="https://github.com/saifanx/strategos" target="_blank" rel="noreferrer" className="text-xs font-bold underline mt-1 text-white hover:text-jet-orange">Star on GitHub</a>
        </div>
      </motion.div>
    </div>
  );
}

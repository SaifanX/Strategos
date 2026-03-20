import { Trophy, Globe } from 'lucide-react';
// @ts-ignore
import { useQuery, useMutation } from "convex/react";
// @ts-ignore
import { api } from "../../convex/_generated/api";
import { SimulationState } from '../types';

interface ColosseumProps {
  state: SimulationState;
}

export function Colosseum({ state }: ColosseumProps) {
  const topAgents = useQuery(api.agents.listTopAgents);
  const globalStats = useQuery(api.agents.getGlobalStats);
  const submitAgent = useMutation(api.agents.submitAgent);
  const updateGlobalStats = useMutation(api.agents.updateGlobalStats);

  const handleSubmitTopAgent = async () => {
    if (state.agents.length === 0) return;
    
    const topLocalAgent = [...state.agents].sort((a, b) => b.reputation - a.reputation)[0];
    
    try {
      await submitAgent({
        name: `Agent_${topLocalAgent.id.slice(0, 4)}`,
        behavior: topLocalAgent.behavior,
        reputation: topLocalAgent.reputation,
        wins: topLocalAgent.history.filter(m => m === 'COOPERATE').length,
        losses: topLocalAgent.history.filter(m => m === 'DEFECT').length,
        creator: "Saifan Mohammad",
        history: topLocalAgent.history,
      });
      
      const cooperations = state.agents.reduce((acc, a) => acc + a.history.filter(m => m === 'COOPERATE').length, 0);
      const defections = state.agents.reduce((acc, a) => acc + a.history.filter(m => m === 'DEFECT').length, 0);
      await updateGlobalStats({ cooperations, defections });
    } catch (error) {
      console.error("Failed to submit agent:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Convex: The Colosseum */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-white/40">
            <Trophy size={12} className="text-jet-orange" />
            <span>The_Colosseum</span>
          </div>
          <button 
            onClick={handleSubmitTopAgent}
            className="text-[8px] font-mono uppercase text-jet-orange hover:underline"
          >
            Submit_Agent
          </button>
        </div>
        
        <div className="space-y-2">
          {topAgents?.map((agent: any, i: number) => (
            <div key={agent._id} className="p-2 bg-white/5 border border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-mono text-white/20">0{i+1}</span>
                <div className="text-[9px] font-bold uppercase truncate max-w-[80px]">{agent.name}</div>
              </div>
              <div className="text-[9px] font-mono text-jet-orange">
                {Math.round(agent.reputation)} REP
              </div>
            </div>
          ))}
          {!topAgents && (
            <div className="text-[8px] font-mono text-white/20 text-center py-4">
              Connecting to Colosseum...
            </div>
          )}
        </div>
      </div>

      {/* Global Stats */}
      {globalStats && (
        <div className="space-y-2 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-white/40">
            <Globe size={12} className="text-jet-orange" />
            <span>Global_Consensus</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 bg-white/5 border border-white/5">
              <div className="text-[7px] text-white/20 uppercase">Total_Sims</div>
              <div className="text-[10px] font-mono">{globalStats.totalSimulations}</div>
            </div>
            <div className="p-2 bg-white/5 border border-white/5">
              <div className="text-[7px] text-white/20 uppercase">Cooperation_Rate</div>
              <div className="text-[10px] font-mono">
                {Math.round((globalStats.totalCooperations / (globalStats.totalCooperations + globalStats.totalDefections)) * 100)}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

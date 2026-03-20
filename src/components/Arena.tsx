import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Stars, Html, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Agent } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, Activity, TrendingUp, Shield, Zap, Target, Cpu } from 'lucide-react';
import { ReputationShader } from './ReputationShader';

// Create a custom shader material
const AgentMaterial = shaderMaterial(
  ReputationShader.uniforms,
  ReputationShader.vertexShader,
  ReputationShader.fragmentShader
);

extend({ AgentMaterial });

const SimulationArena: React.FC<{ 
  agents: Agent[]; 
  onSelect: (agent: Agent | null) => void;
  selectedAgentId: string | null;
}> = ({ agents, onSelect, selectedAgentId }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const materialRef = useRef<any>(null);
  
  // Create a dummy object to help with matrix updates
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  // Trust attribute for the shader
  const trustArray = useMemo(() => new Float32Array(agents.length), [agents.length]);
  const trustAttrRef = useRef<THREE.InstancedBufferAttribute>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    agents.forEach((agent, i) => {
      // Update position and rotation
      dummy.position.set(agent.position[0], agent.position[1], agent.position[2]);
      
      // Scale up if selected
      const isSelected = agent.id === selectedAgentId;
      const s = isSelected ? 1.5 + Math.sin(state.clock.elapsedTime * 10) * 0.2 : 1.0;
      dummy.scale.set(s, s, s);
      
      dummy.rotation.y += 0.01;
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Update trust value for shader
      // Trust = 1.0 (all cooperate) to 0.0 (all defect)
      const defectionRatio = agent.history.length > 0 
        ? agent.history.filter(m => m === 'DEFECT').length / agent.history.length 
        : 0.5;
      trustArray[i] = 1.0 - defectionRatio;
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (trustAttrRef.current) {
      trustAttrRef.current.needsUpdate = true;
    }
    
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
    }
  });

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, agents.length]}
      onClick={(e) => {
        e.stopPropagation();
        if (e.instanceId !== undefined) {
          onSelect(agents[e.instanceId]);
        } else {
          onSelect(null);
        }
      }}
    >
      <boxGeometry args={[0.4, 0.4, 0.4]}>
        <instancedBufferAttribute
          ref={trustAttrRef}
          attach="attributes-aTrust"
          args={[trustArray, 1]}
        />
      </boxGeometry>
      <agentMaterial ref={materialRef} transparent opacity={0.8} />
    </instancedMesh>
  );
};

interface ArenaProps {
  agents: Agent[];
}

export const Arena: React.FC<ArenaProps> = ({ agents }) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="w-full h-full bg-black relative">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[20, 20, 20]} />
        <OrbitControls enableDamping dampingFactor={0.05} />
        
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#FFFFFF" />
        
        <Grid 
          infiniteGrid 
          fadeDistance={50} 
          sectionSize={5} 
          sectionColor="#333333" 
          cellColor="#111111" 
        />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        <SimulationArena 
          agents={agents} 
          selectedAgentId={selectedAgentId}
          onSelect={(a) => setSelectedAgentId(a ? a.id : null)} 
        />

        <fog attach="fog" args={['#000000', 10, 50]} />
      </Canvas>

      {/* Arena HUD Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none font-mono text-[10px] text-white/40 uppercase space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-white" />
          <span>Cooperator: Cube_Primitive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-jet-orange" />
          <span>Defector: Cone_Primitive</span>
        </div>
        <div className="mt-4 border-t border-white/10 pt-2">
          <span>Active_Agents: {agents.length}</span>
        </div>
      </div>

      {/* Selected Agent Panel */}
      <AnimatePresence>
        {selectedAgent && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-4 right-4 w-72 bg-black/90 border border-white/10 backdrop-blur-xl p-6 font-mono z-20 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-[8px] text-white/40 uppercase tracking-[0.3em] mb-1">Subject_ID</div>
                <div className="text-sm font-bold text-white truncate w-48">{selectedAgent.id}</div>
              </div>
              <button 
                onClick={() => setSelectedAgentId(null)}
                className="p-1 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-jet-orange uppercase tracking-widest">
                  <Activity size={12} />
                  <span>Behavioral_Profile</span>
                </div>
                <div className="p-3 bg-jet-orange/5 border border-jet-orange/20 text-xs font-bold text-white uppercase tracking-tighter">
                  {selectedAgent.behavior.replace(/_/g, ' ')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[8px] text-white/40 uppercase tracking-widest">Current_Score</div>
                  <div className="text-xl font-bold text-white">{selectedAgent.score}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[8px] text-white/40 uppercase tracking-widest">Last_Action</div>
                  <div className={`text-xl font-bold ${selectedAgent.lastMove === 'DEFECT' ? 'text-jet-orange' : 'text-white'}`}>
                    {selectedAgent.lastMove}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest">
                  <TrendingUp size={12} />
                  <span>Action_History</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedAgent.history.slice(-20).map((move, i) => (
                    <div 
                      key={i} 
                      className={`w-2 h-2 ${move === 'DEFECT' ? 'bg-jet-orange' : 'bg-white/20'}`}
                      title={move}
                    />
                  ))}
                  {selectedAgent.history.length > 20 && <span className="text-[8px] text-white/20">...</span>}
                </div>
                <div className="flex justify-between text-[8px] text-white/20 uppercase">
                  <span>Oldest</span>
                  <span>Latest</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-white/40 uppercase">Cooperation_Rate</span>
                  <span className="text-white">
                    {Math.round((selectedAgent.history.filter(m => m === 'COOPERATE').length / (selectedAgent.history.length || 1)) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9px]">
                  <span className="text-white/40 uppercase">Defection_Rate</span>
                  <span className="text-white">
                    {Math.round((selectedAgent.history.filter(m => m === 'DEFECT').length / (selectedAgent.history.length || 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

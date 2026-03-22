import { useState, useCallback, useEffect, useRef } from 'react';
import { Agent, SimulationState, SCENARIOS, StrategyType, BehaviorType, ScenarioId } from './types';
import { getStrategy, getRegisteredBehaviors } from './engine/Registry';

export const useSimulation = () => {
  const [state, setState] = useState<SimulationState>({
    generation: 0,
    agents: [],
    scenario: SCENARIOS[0],
    isRunning: false,
    speed: 1,
    mutationRate: 0.05,
    populationHistory: [],
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getMove = (agent: Agent): StrategyType => {
    return getStrategy(agent.behavior).execute(agent);
  };

  const initAgents = useCallback((count: number = 1000, distribution?: Record<BehaviorType, number>) => {
    const behaviors = getRegisteredBehaviors();
    
    let newAgents: Agent[] = [];
    const areaSize = 30; // Larger area for more agents
    
    if (distribution) {
      let idCounter = 0;
      Object.entries(distribution).forEach(([behavior, behaviorCount]) => {
        for (let i = 0; i < behaviorCount; i++) {
          newAgents.push({
            id: (idCounter++).toString(),
            behavior: behavior as BehaviorType,
            score: 0,
            reputation: 50,
            history: [],
            position: [
              (Math.random() - 0.5) * areaSize,
              0,
              (Math.random() - 0.5) * areaSize,
            ],
            isAlive: true,
            hasBeenBetrayed: false,
            opponentConsecutiveDefects: 0,
          });
        }
      });
    } else {
      newAgents = Array.from({ length: count }).map((_, i) => ({
        id: i.toString(),
        behavior: behaviors[Math.floor(Math.random() * behaviors.length)],
        score: 0,
        reputation: 50,
        history: [],
        position: [
          (Math.random() - 0.5) * areaSize,
          0,
          (Math.random() - 0.5) * areaSize,
        ],
        isAlive: true,
        hasBeenBetrayed: false,
        opponentConsecutiveDefects: 0,
      }));
    }

    const initialHistory = {
      generation: 0,
      ...behaviors.reduce((acc, b) => ({ ...acc, [b]: newAgents.filter(a => a.behavior === b).length }), {})
    };

    setState(prev => ({
      ...prev,
      generation: 0,
      agents: newAgents,
      populationHistory: [initialHistory],
    }));
  }, []);

  const step = useCallback(() => {
    setState(prev => {
      const areaSize = 30;
      const gridSize = 2; // Size of spatial grid cell
      const behaviors = getRegisteredBehaviors();

      // Move agents slightly
      const newAgents = prev.agents.map(a => {
        let nx = a.position[0] + (Math.random() - 0.5) * 0.8; // Increased movement speed
        let nz = a.position[2] + (Math.random() - 0.5) * 0.8;
        
        if (Math.abs(nx) > areaSize / 2) nx = a.position[0];
        if (Math.abs(nz) > areaSize / 2) nz = a.position[2];

        return { 
          ...a,
          position: [nx, a.position[1], nz] as [number, number, number]
        };
      });

      const matrix = prev.scenario.matrix;
      
      // 1. True Spatial Matchmaking (Grid-based hashing)
      const grid = new Map<string, Agent[]>();
      newAgents.forEach(a => {
        const gx = Math.floor(a.position[0] / gridSize);
        const gz = Math.floor(a.position[2] / gridSize);
        const key = `${gx},${gz}`;
        if (!grid.has(key)) grid.set(key, []);
        grid.get(key)!.push(a);
      });

      // Match agents within the same cell
      Array.from(grid.values()).forEach(cellAgents => {
        // Shuffle agents in cell for random pairings
        cellAgents.sort(() => Math.random() - 0.5);
        for (let i = 0; i < cellAgents.length - 1; i += 2) {
          const agentA = cellAgents[i];
          const agentB = cellAgents[i + 1];

          const moveA = getMove(agentA);
          const moveB = getMove(agentB);

          agentA.lastMove = moveA;
          agentB.lastMove = moveB;
          agentA.opponentLastMove = moveB;
          agentB.opponentLastMove = moveA;

          agentA.history = [...agentA.history, moveA].slice(-50);
          agentB.history = [...agentB.history, moveB].slice(-50);

          agentA.opponentConsecutiveDefects = moveB === 'DEFECT' ? agentA.opponentConsecutiveDefects + 1 : 0;
          agentB.opponentConsecutiveDefects = moveA === 'DEFECT' ? agentB.opponentConsecutiveDefects + 1 : 0;

          // Update reputation based on history
          agentA.reputation = agentA.history.length > 0 ? (agentA.history.filter(m => m === 'COOPERATE').length / agentA.history.length) * 100 : 50;
          agentB.reputation = agentB.history.length > 0 ? (agentB.history.filter(m => m === 'COOPERATE').length / agentB.history.length) * 100 : 50;

          if (moveB === 'DEFECT') agentA.hasBeenBetrayed = true;
          if (moveA === 'DEFECT') agentB.hasBeenBetrayed = true;

          if (moveA === 'COOPERATE' && moveB === 'COOPERATE') {
            agentA.score += matrix.cc;
            agentB.score += matrix.cc;
          } else if (moveA === 'COOPERATE' && moveB === 'DEFECT') {
            agentA.score += matrix.cd;
            agentB.score += matrix.dc;
          } else if (moveA === 'DEFECT' && moveB === 'COOPERATE') {
            agentA.score += matrix.dc;
            agentB.score += matrix.cd;
          } else {
            agentA.score += matrix.dd;
            agentB.score += matrix.dd;
          }
        }
      });

      // 2. Evolution (Every 10 steps)
      if (prev.generation % 10 === 0 && prev.generation > 0) {
        const sorted = [...newAgents].sort((a, b) => b.score - a.score);
        const topCount = Math.floor(newAgents.length * 0.1);
        const bottomCount = Math.floor(newAgents.length * 0.1);

        const winners = sorted.slice(0, topCount);
        const losers = sorted.slice(-bottomCount);

        losers.forEach((loser, idx) => {
          const winner = winners[idx % winners.length];
          // Genetic mutation
          if (Math.random() < prev.mutationRate) {
            loser.behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
          } else {
            loser.behavior = winner.behavior;
          }
          loser.score = 0;
          loser.hasBeenBetrayed = false;
          loser.opponentLastMove = undefined;
          loser.opponentConsecutiveDefects = 0;
        });
      }

      const currentStats = behaviors.reduce((acc, b) => ({ 
        ...acc, 
        [b]: newAgents.filter(a => a.behavior === b).length 
      }), {});

      return {
        ...prev,
        generation: prev.generation + 1,
        agents: [...newAgents],
        populationHistory: [
          ...prev.populationHistory,
          { generation: prev.generation + 1, ...currentStats }
        ].slice(-100),
      };
    });
  }, []);

  useEffect(() => {
    if (state.isRunning) {
      timerRef.current = setInterval(step, 1000 / state.speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.isRunning, state.speed, step]);

  return {
    state,
    initAgents,
    step,
    toggleRunning: () => setState(prev => ({ ...prev, isRunning: !prev.isRunning })),
    setSpeed: (speed: number) => setState(prev => ({ ...prev, speed })),
    setMutationRate: (mutationRate: number) => setState(prev => ({ ...prev, mutationRate })),
    setScenario: (id: ScenarioId) => {
      const scenario = SCENARIOS.find(s => s.id === id) || SCENARIOS[0];
      setState(prev => ({ ...prev, scenario, generation: 0, populationHistory: [] }));
      initAgents(1000); // Only re-init inside setScenario internally if desired, we can pass it here. Wait we don't have distribution here.
    },
    setMatrix: (matrix: typeof SCENARIOS[0]['matrix']) => {
      setState(prev => ({ ...prev, scenario: { ...prev.scenario, matrix } }));
    }
  };
};

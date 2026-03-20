export type StrategyType = 'COOPERATE' | 'DEFECT';
export type BehaviorType = 'ALWAYS_COOPERATE' | 'ALWAYS_DEFECT' | 'TIT_FOR_TAT' | 'GRUDGER' | 'RANDOM' | 'PAVLOV' | 'TIT_FOR_TWO_TATS' | 'SNEAKY_COOPERATOR';

export interface Agent {
  id: string;
  behavior: BehaviorType;
  score: number;
  reputation: number;
  lastMove?: StrategyType;
  opponentLastMove?: StrategyType;
  history: StrategyType[];
  position: [number, number, number];
  isAlive: boolean;
  hasBeenBetrayed: boolean; // For Grudger logic
  opponentConsecutiveDefects: number; // For Tit-for-Two-Tats
}

export interface PayoffMatrix {
  cc: number; // Both cooperate
  cd: number; // C cooperates, D defects (Sucker's payoff)
  dc: number; // D defects, C cooperates (Temptation)
  dd: number; // Both defect (Punishment)
}

export type ScenarioId = 'PRISONERS_DILEMMA' | 'STAG_HUNT' | 'TRAGEDY_OF_COMMONS';

export interface Scenario {
  id: ScenarioId;
  name: string;
  description: string;
  matrix: PayoffMatrix;
}

export interface SimulationState {
  generation: number;
  agents: Agent[];
  scenario: Scenario;
  isRunning: boolean;
  speed: number;
  mutationRate: number;
  populationHistory: {
    generation: number;
    [key: string]: number; // Dynamic keys for behaviors
  }[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'PRISONERS_DILEMMA',
    name: "Prisoner's Dilemma",
    description: "Two agents must choose between cooperation and betrayal. Betrayal offers higher immediate reward, but mutual cooperation ensures long-term stability.",
    matrix: { cc: 3, cd: 0, dc: 5, dd: 1 }
  },
  {
    id: 'STAG_HUNT',
    name: "Stag Hunt",
    description: "Coordination game. Hunting a Stag (high reward) requires both to cooperate. Hunting a Rabbit (low reward) is safe but selfish.",
    matrix: { cc: 5, cd: 0, dc: 3, dd: 3 }
  },
  {
    id: 'TRAGEDY_OF_COMMONS',
    name: "Tragedy of the Commons",
    description: "Shared resource dilemma. If everyone acts in self-interest, the resource is depleted and everyone loses.",
    matrix: { cc: 2, cd: -1, dc: 4, dd: 0 }
  }
];

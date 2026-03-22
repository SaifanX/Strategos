import { IStrategy } from '../engine/Strategy';
import { Agent, StrategyType } from '../types';

export class Pavlov implements IStrategy {
  readonly id = 'PAVLOV';
  readonly name = 'Pavlov';
  execute(agent: Agent): StrategyType {
    if (!agent.lastMove || !agent.opponentLastMove) return 'COOPERATE';
    return agent.opponentLastMove === 'COOPERATE' ? agent.lastMove : (agent.lastMove === 'COOPERATE' ? 'DEFECT' : 'COOPERATE');
  }
}

import { IStrategy } from '../engine/Strategy';
import { Agent, StrategyType } from '../types';

export class TitForTat implements IStrategy {
  readonly id = 'TIT_FOR_TAT';
  readonly name = 'Tit-for-Tat';
  execute(agent: Agent): StrategyType {
    return agent.opponentLastMove || 'COOPERATE';
  }
}

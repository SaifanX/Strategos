import { IStrategy } from '../engine/Strategy';
import { Agent, StrategyType } from '../types';

export class TitForTwoTats implements IStrategy {
  readonly id = 'TIT_FOR_TWO_TATS';
  readonly name = 'Tit-for-Two-Tats';
  execute(agent: Agent): StrategyType {
    return agent.opponentConsecutiveDefects >= 2 ? 'DEFECT' : 'COOPERATE';
  }
}

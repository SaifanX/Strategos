import { IStrategy } from '../engine/Strategy';
import { Agent, StrategyType } from '../types';

export class RandomStrategy implements IStrategy {
  readonly id = 'RANDOM';
  readonly name = 'Random';
  execute(_agent: Agent): StrategyType {
    return Math.random() > 0.5 ? 'COOPERATE' : 'DEFECT';
  }
}

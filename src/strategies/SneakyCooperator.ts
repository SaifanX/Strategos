import { IStrategy } from '../engine/Strategy';
import { Agent, StrategyType } from '../types';

export class SneakyCooperator implements IStrategy {
  readonly id = 'SNEAKY_COOPERATOR';
  readonly name = 'Sneaky Cooperator';
  execute(_agent: Agent): StrategyType {
    return Math.random() > 0.1 ? 'COOPERATE' : 'DEFECT';
  }
}

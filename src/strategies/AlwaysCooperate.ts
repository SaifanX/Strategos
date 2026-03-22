import { IStrategy } from '../engine/Strategy';
import { Agent, StrategyType } from '../types';

export class AlwaysCooperate implements IStrategy {
  readonly id = 'ALWAYS_COOPERATE';
  readonly name = 'Always Cooperate';
  execute(_agent: Agent): StrategyType {
    return 'COOPERATE';
  }
}

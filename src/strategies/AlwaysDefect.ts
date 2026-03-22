import { IStrategy } from '../engine/Strategy';
import { Agent, StrategyType } from '../types';

export class AlwaysDefect implements IStrategy {
  readonly id = 'ALWAYS_DEFECT';
  readonly name = 'Always Defect';
  execute(_agent: Agent): StrategyType {
    return 'DEFECT';
  }
}

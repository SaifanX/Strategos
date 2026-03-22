import { IStrategy } from '../engine/Strategy';
import { Agent, StrategyType } from '../types';

export class Grudger implements IStrategy {
  readonly id = 'GRUDGER';
  readonly name = 'Grudger';
  execute(agent: Agent): StrategyType {
    return agent.hasBeenBetrayed ? 'DEFECT' : 'COOPERATE';
  }
}

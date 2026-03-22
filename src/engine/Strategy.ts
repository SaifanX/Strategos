import { Agent, StrategyType } from '../types';

/**
 * Interface for all Game Theory strategies.
 */
export interface IStrategy {
  /** Unique identifier for the strategy (e.g., 'TIT_FOR_TAT') */
  readonly id: string;
  /** Human-readable name of the strategy */
  readonly name: string;
  /** 
   * The core logic: decide whether to COOPERATE or DEFECT 
   * based on the agent's current state and history.
   */
  execute(agent: Agent): StrategyType;
}

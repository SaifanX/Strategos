import { BehaviorType } from '../types';
import { IStrategy } from './Strategy';
import { AlwaysCooperate } from '../strategies/AlwaysCooperate';
import { AlwaysDefect } from '../strategies/AlwaysDefect';
import { RandomStrategy } from '../strategies/Random';
import { TitForTat } from '../strategies/TitForTat';
import { Grudger } from '../strategies/Grudger';
import { Pavlov } from '../strategies/Pavlov';
import { TitForTwoTats } from '../strategies/TitForTwoTats';
import { SneakyCooperator } from '../strategies/SneakyCooperator';

/**
 * Registry mapping behavior identifiers to their strategy implementations.
 */
export const StrategyRegistry: Record<BehaviorType, IStrategy> = {
  ALWAYS_COOPERATE: new AlwaysCooperate(),
  ALWAYS_DEFECT: new AlwaysDefect(),
  RANDOM: new RandomStrategy(),
  TIT_FOR_TAT: new TitForTat(),
  GRUDGER: new Grudger(),
  PAVLOV: new Pavlov(),
  TIT_FOR_TWO_TATS: new TitForTwoTats(),
  SNEAKY_COOPERATOR: new SneakyCooperator(),
};

/**
 * Helper to get a strategy by its ID.
 */
export const getStrategy = (behavior: BehaviorType): IStrategy => {
  const strategy = StrategyRegistry[behavior];
  if (!strategy) {
    console.warn(`Strategy ${behavior} not found in registry. Defaulting to AlwaysCooperate.`);
    return StrategyRegistry.ALWAYS_COOPERATE;
  }
  return strategy;
};

/**
 * Returns all registered behavior keys.
 */
export const getRegisteredBehaviors = (): BehaviorType[] => {
  return Object.keys(StrategyRegistry) as BehaviorType[];
};

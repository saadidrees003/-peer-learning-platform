/**
 * Enum for pairing strategies used in the student pairing system
 */
export const PAIRING_STRATEGIES = {
  OPTIMAL: 'optimal',
  BALANCED: 'balanced',
  RANDOM: 'random'
};

/**
 * Enum for pairing strategy labels
 */
export const PAIRING_STRATEGY_LABELS = {
  [PAIRING_STRATEGIES.OPTIMAL]: 'Optimal (High-Low)',
  [PAIRING_STRATEGIES.BALANCED]: 'Balanced Mix',
  [PAIRING_STRATEGIES.RANDOM]: 'Random'
};

/**
 * Array of available pairing strategies for UI components
 */
export const AVAILABLE_STRATEGIES = [
  { value: PAIRING_STRATEGIES.OPTIMAL, label: PAIRING_STRATEGY_LABELS[PAIRING_STRATEGIES.OPTIMAL] },
  { value: PAIRING_STRATEGIES.BALANCED, label: PAIRING_STRATEGY_LABELS[PAIRING_STRATEGIES.BALANCED] },
  { value: PAIRING_STRATEGIES.RANDOM, label: PAIRING_STRATEGY_LABELS[PAIRING_STRATEGIES.RANDOM] }
];
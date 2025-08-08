/**
 * Enum for pair types used in the student pairing system
 */
export const PAIR_TYPES = {
  HIGH_LOW: 'high-low',
  MEDIUM_MEDIUM: 'medium-medium',
  MIXED: 'mixed',
  BALANCED: 'balanced',
  RANDOM: 'random',
  GROUP_OF_3: 'group-of-3',
  EXTENDED_PAIR: 'extended-pair',
  FALLBACK_TUTORING: 'fallback-tutoring',
  FALLBACK_GROUP: 'fallback-group'
};

/**
 * Enum for pair type colors
 */
export const PAIR_TYPE_COLORS = {
  [PAIR_TYPES.HIGH_LOW]: 'bg-blue-50 border-blue-200',
  [PAIR_TYPES.MEDIUM_MEDIUM]: 'bg-green-50 border-green-200',
  [PAIR_TYPES.MIXED]: 'bg-purple-50 border-purple-200',
  [PAIR_TYPES.BALANCED]: 'bg-orange-50 border-orange-200',
  [PAIR_TYPES.RANDOM]: 'bg-gray-50 border-gray-200',
  [PAIR_TYPES.GROUP_OF_3]: 'bg-yellow-50 border-yellow-200',
  [PAIR_TYPES.EXTENDED_PAIR]: 'bg-indigo-50 border-indigo-200',
  [PAIR_TYPES.FALLBACK_TUTORING]: 'bg-red-50 border-red-200',
  [PAIR_TYPES.FALLBACK_GROUP]: 'bg-pink-50 border-pink-200'
};

/**
 * Enum for pair type labels
 */
export const PAIR_TYPE_LABELS = {
  [PAIR_TYPES.HIGH_LOW]: 'High-Low Pairing',
  [PAIR_TYPES.MEDIUM_MEDIUM]: 'Similar Level',
  [PAIR_TYPES.MIXED]: 'Mixed Ability',
  [PAIR_TYPES.BALANCED]: 'Balanced',
  [PAIR_TYPES.RANDOM]: 'Random',
  [PAIR_TYPES.GROUP_OF_3]: 'Group of 3',
  [PAIR_TYPES.EXTENDED_PAIR]: 'Extended Pair',
  [PAIR_TYPES.FALLBACK_TUTORING]: 'Fallback Tutoring',
  [PAIR_TYPES.FALLBACK_GROUP]: 'Fallback Group'
};

/**
 * Default values for unknown pair types
 */
export const PAIR_TYPE_DEFAULTS = {
  color: 'bg-gray-50 border-gray-200',
  label: 'Standard Pair'
};
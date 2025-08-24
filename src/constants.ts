/**
 * Constants used throughout the GAQL Builder
 */

export const VALID_OPERATORS = ['=', '!=', '>', '>=', '<', '<='] as const;
export type ValidOperator = (typeof VALID_OPERATORS)[number];

export const VALID_DATE_RANGES = [
  'TODAY',
  'YESTERDAY',
  'LAST_7_DAYS',
  'LAST_14_DAYS',
  'LAST_30_DAYS',
  'LAST_BUSINESS_WEEK',
  'LAST_WEEK_SUN_SAT',
  'LAST_WEEK_MON_SUN',
  'THIS_MONTH',
  'LAST_MONTH',
  'ALL_TIME',
] as const;
export type ValidDateRange = (typeof VALID_DATE_RANGES)[number];

export const AGGREGATE_FUNCTIONS = ['SUM', 'COUNT', 'AVG', 'MIN', 'MAX', 'COUNT_DISTINCT'] as const;
export type AggregateFunction = (typeof AGGREGATE_FUNCTIONS)[number];

export const SORT_DIRECTIONS = ['ASC', 'DESC'] as const;
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

// Query size limits to prevent memory exhaustion and DoS attacks
export const QUERY_LIMITS = {
  MAX_SELECT_FIELDS: 500,
  MAX_WHERE_CONDITIONS: 100,
  MAX_ORDER_BY_FIELDS: 10,
  MAX_GROUP_BY_FIELDS: 10,
  MAX_PARAMETERS: 50,
  MAX_ARRAY_VALUES: 1000, // For IN, CONTAINS operators
  MAX_QUERY_LENGTH: 100000, // 100KB max query size
  MAX_REGEX_LENGTH: 1000, // Maximum regex pattern length
  MAX_REGEX_COMPLEXITY: 50, // Maximum nesting depth for regex
} as const;

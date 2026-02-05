/**
 * Validation utilities for GAQL query building
 */

import { AGGREGATE_FUNCTIONS, VALID_DATE_RANGES, VALID_OPERATORS, QUERY_LIMITS } from './constants';
import { ValidationError, SecurityError } from './errors';

/**
 * Validates that a field name follows safe patterns to prevent injection.
 * Allows alphanumeric characters, dots, and underscores only.
 * Also allows aggregate functions like SUM(), COUNT(), etc.
 * @param field - The field name to validate
 * @returns true if valid, false otherwise
 */
export function isValidFieldName(field: string): boolean {
  // Allow aggregate functions
  const aggregatePattern = new RegExp(
    `^(${AGGREGATE_FUNCTIONS.join('|')})\\([a-zA-Z_][a-zA-Z0-9_]*(\\.[a-zA-Z_][a-zA-Z0-9_]*)*\\)$`
  );
  if (aggregatePattern.test(field)) {
    return true;
  }

  // Allow alphanumeric, dots, underscores, and common metric prefixes
  const fieldPattern = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/;
  return fieldPattern.test(field);
}

/**
 * Validates a resource name to prevent injection.
 * @param resource - The resource name to validate
 * @returns true if valid, false otherwise
 */
export function isValidResourceName(resource: string): boolean {
  // Allow alphanumeric and underscores only for resource names
  const resourcePattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return resourcePattern.test(resource);
}

/**
 * Validates a parameter name to prevent injection.
 * @param paramName - The parameter name to validate
 * @returns true if valid, false otherwise
 */
export function isValidParameterName(paramName: string): boolean {
  // Allow alphanumeric and underscores only for parameter names
  const paramPattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  return paramPattern.test(paramName);
}

/**
 * Validates a date range value for DURING clauses.
 * Accepts either predefined ranges (TODAY, YESTERDAY, etc.) or custom date in YYYY-MM-DD format.
 * @param dateRange - The date range to validate
 * @returns true if valid, false otherwise
 */
export function isValidDateRange(dateRange: string): boolean {
  // Check predefined ranges
  if (VALID_DATE_RANGES.includes(dateRange as (typeof VALID_DATE_RANGES)[number])) {
    return true;
  }

  // Check custom date format (YYYY-MM-DD)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(dateRange)) {
    return false;
  }

  /*
   * Validate it's a real date
   * Since we validated the regex pattern above, we know we have 3 numeric parts
   */
  const parts = dateRange.split('-').map(Number);
  const year = parts[0] as number;
  const month = parts[1] as number;
  const day = parts[2] as number;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

/**
 * Validates a comparison operator.
 * @param operator - The operator to validate
 * @returns true if valid, false otherwise
 */
export function isValidOperator(operator: string): boolean {
  return VALID_OPERATORS.includes(operator as (typeof VALID_OPERATORS)[number]);
}

/**
 * Validates a field name and throws an error if invalid.
 * @param field - The field name to validate
 * @throws {Error} If the field name is invalid
 */
export function validateFieldName(field: string): void {
  if (!isValidFieldName(field)) {
    throw new ValidationError(
      `Invalid field name. Expected: alphanumeric with dots/underscores or aggregate function, Received: "${field}"`
    );
  }
}

/**
 * Validates a resource name and throws an error if invalid.
 * @param resource - The resource name to validate
 * @throws {Error} If the resource name is invalid
 */
export function validateResourceName(resource: string): void {
  if (!isValidResourceName(resource)) {
    throw new ValidationError(
      `Invalid resource name. Expected: alphanumeric with underscores only, Received: "${resource}"`
    );
  }
}

/**
 * Validates a parameter name and throws an error if invalid.
 * @param paramName - The parameter name to validate
 * @throws {Error} If the parameter name is invalid
 */
export function validateParameterName(paramName: string): void {
  if (!isValidParameterName(paramName)) {
    throw new ValidationError(
      `Invalid parameter name. Expected: alphanumeric with underscores only, Received: "${paramName}"`
    );
  }
}

/**
 * Validates a date range and throws an error if invalid.
 * @param dateRange - The date range to validate
 * @throws {Error} If the date range is invalid
 */
export function validateDateRange(dateRange: string): void {
  if (!isValidDateRange(dateRange)) {
    throw new ValidationError(
      `Invalid date range. Expected one of: ${VALID_DATE_RANGES.join(', ')}, or date in YYYY-MM-DD format, Received: "${dateRange}"`
    );
  }
}

/**
 * Validates an operator and throws an error if invalid.
 * @param operator - The operator to validate
 * @throws {Error} If the operator is invalid
 */
export function validateOperator(operator: string): void {
  if (!isValidOperator(operator)) {
    throw new ValidationError(
      `Invalid operator. Expected one of: ${VALID_OPERATORS.join(', ')}, Received: "${operator}"`
    );
  }
}

/**
 * Checks if a regex pattern is safe from ReDoS attacks.
 * @param pattern - The regex pattern to validate
 * @returns true if safe, false if potentially dangerous
 */
export function isSafeRegexPattern(pattern: string): boolean {
  // Check length
  if (pattern.length > QUERY_LIMITS.MAX_REGEX_LENGTH) {
    return false;
  }

  // Check for dangerous patterns that can cause exponential backtracking
  const dangerousPatterns = [
    /(\.\*){2,}/, // Multiple .* in sequence
    /(\.\+){2,}/, // Multiple .+ in sequence
    /(\\w\*){3,}/, // Multiple \w* in sequence (escaped backslash)
    /(\\w\+){3,}/, // Multiple \w+ in sequence (escaped backslash)
    /(\[\\w\]\*){3,}/, // Multiple [\w]* in sequence (escaped backslash)
    /\(.*\)\{(\d{3,}|\d+,)\}/, // Large repetition counts
    /\(\.\*\|\.\*\)/, // Alternation with overlapping patterns
    /\(\.\+\|\.\+\)/, // Alternation with overlapping patterns
  ];

  for (const dangerous of dangerousPatterns) {
    if (dangerous.test(pattern)) {
      return false;
    }
  }

  // Check nesting depth
  let depth = 0;
  let maxDepth = 0;
  for (const char of pattern) {
    if (char === '(') {
      depth++;
      maxDepth = Math.max(maxDepth, depth);
    } else if (char === ')') {
      depth = Math.max(0, depth - 1);
    }
  }

  if (maxDepth > QUERY_LIMITS.MAX_REGEX_COMPLEXITY) {
    return false;
  }

  return true;
}

/**
 * Validates a regex pattern for safety and throws an error if dangerous.
 * @param pattern - The regex pattern to validate
 * @throws {SecurityError} If the pattern could cause ReDoS
 */
export function validateRegexPattern(pattern: string): void {
  if (!isSafeRegexPattern(pattern)) {
    throw new SecurityError(
      'Regex pattern is potentially dangerous (ReDoS risk). Pattern exceeds complexity limits or contains dangerous constructs.'
    );
  }
}

/**
 * Custom error types for GAQL Builder
 */

/**
 * Base error class for all GAQL Builder errors
 */
export class GaqlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GaqlError';
    /* Maintains proper stack trace for where our error was thrown (only available on V8) */
    if ('captureStackTrace' in Error && typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when input validation fails
 */
export class ValidationError extends GaqlError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Error thrown when query building fails
 */
export class QueryBuildError extends GaqlError {
  constructor(message: string) {
    super(message);
    this.name = 'QueryBuildError';
  }
}

/**
 * Error thrown when a security violation is detected
 */
export class SecurityError extends GaqlError {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

/**
 * Error thrown when query size limits are exceeded
 */
export class QueryLimitError extends GaqlError {
  constructor(message: string) {
    super(message);
    this.name = 'QueryLimitError';
  }
}

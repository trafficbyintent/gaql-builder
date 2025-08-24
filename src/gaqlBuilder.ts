// Type definitions for GAQL query values
export type GaqlValue = string | number | boolean | null;
export type GaqlArrayValue = GaqlValue[];

import { SORT_DIRECTIONS, QUERY_LIMITS } from './constants';
import {
  validateFieldName,
  validateResourceName,
  validateParameterName,
  validateDateRange,
  validateOperator,
  validateRegexPattern,
} from './validators';
import { QueryBuildError, QueryLimitError, SecurityError, ValidationError } from './errors';

/**
 * Builder class for constructing Google Ads Query Language (GAQL) queries.
 * Provides a fluent API for building type-safe GAQL queries programmatically.
 *
 * @example
 * const query = new GaqlBuilder()
 *   .select(['campaign.id', 'campaign.name'])
 *   .from('campaign')
 *   .where('campaign.status', '=', 'ENABLED')
 *   .orderBy('campaign.name', 'ASC')
 *   .limit(10)
 *   .build();
 */
export class GaqlBuilder {
  #selectFields: string[] = [];
  #fromResource = '';
  readonly #whereConditions: string[] = [];
  readonly #groupByFields: string[] = [];
  readonly #orderByFields: Array<{ field: string; direction: 'ASC' | 'DESC' }> = [];
  #limitCount: number | null = null;
  #queryParameters: Record<string, GaqlValue> = {};

  /**
   * Sets the fields to select in the query.
   * @param fields - Array of field names to select (e.g., ['campaign.id', 'metrics.clicks'])
   * @returns The builder instance for method chaining
   * @throws {Error} If fields array is empty
   * @throws {Error} If any field name is invalid
   * @example
   * builder.select(['campaign.id', 'campaign.name', 'metrics.clicks'])
   */
  public select(fields: string[]): this {
    if (fields.length === 0) {
      throw new ValidationError(
        'SELECT clause requires at least one field. Expected: non-empty array, Received: empty array',
      );
    }

    if (fields.length > QUERY_LIMITS.MAX_SELECT_FIELDS) {
      throw new QueryLimitError(
        `SELECT clause exceeds maximum field limit. Expected: <= ${QUERY_LIMITS.MAX_SELECT_FIELDS} fields, Received: ${fields.length} fields`,
      );
    }

    // Validate and process fields
    this.#selectFields = fields.map((field) => {
      const trimmedField = field.trim();
      validateFieldName(trimmedField);
      return trimmedField;
    });

    return this;
  }

  /**
   * Sets the resource to query from.
   * @param resource - The Google Ads resource name (e.g., 'campaign', 'ad_group')
   * @returns The builder instance for method chaining
   * @throws {Error} If resource is empty or only whitespace
   * @throws {Error} If resource name is invalid
   * @example
   * builder.from('campaign')
   */
  public from(resource: string): this {
    const trimmedResource = resource.trim();

    if (trimmedResource === '') {
      throw new ValidationError(
        `FROM clause requires a resource. Expected: non-empty string, Received: "${resource}"`,
      );
    }

    // Validate resource name
    validateResourceName(trimmedResource);

    this.#fromResource = trimmedResource;
    return this;
  }

  /**
   * Adds a WHERE condition to the query.
   * @param field - The field to filter on
   * @param operator - Comparison operator (=, !=, >, >=, <, <=)
   * @param value - The value to compare against
   * @returns The builder instance for method chaining
   * @throws {Error} If operator is not valid
   * @throws {Error} If field name is invalid
   * @example
   * builder.where('campaign.status', '=', 'ENABLED')
   */
  public where(field: string, operator: string, value: GaqlValue): this {
    if (this.#whereConditions.length >= QUERY_LIMITS.MAX_WHERE_CONDITIONS) {
      throw new QueryLimitError(
        `WHERE clause exceeds maximum condition limit. Expected: < ${QUERY_LIMITS.MAX_WHERE_CONDITIONS} conditions, Received: ${this.#whereConditions.length} conditions`,
      );
    }

    validateOperator(operator);
    validateFieldName(field);

    this.#whereConditions.push(this.formatCondition(field, operator, value));
    return this;
  }

  /**
   * Adds an additional WHERE condition with AND logic.
   * Alias for the where() method for better readability.
   * @param field - The field to filter on
   * @param operator - Comparison operator (=, !=, >, >=, <, <=)
   * @param value - The value to compare against
   * @returns The builder instance for method chaining
   * @throws {Error} If operator is not valid
   * @throws {Error} If field name is invalid
   * @example
   * builder.where('campaign.status', '=', 'ENABLED')
   *        .andWhere('metrics.clicks', '>', 100)
   */
  public andWhere(field: string, operator: string, value: GaqlValue): this {
    return this.where(field, operator, value);
  }

  /**
   * Adds an IN condition to filter by multiple values.
   * @param field - The field to filter on
   * @param values - Array of values to match
   * @returns The builder instance for method chaining
   * @throws {Error} If values array is empty
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereIn('campaign.status', ['ENABLED', 'PAUSED'])
   */
  public whereIn(field: string, values: GaqlArrayValue): this {
    if (values.length === 0) {
      throw new ValidationError(
        `IN clause requires at least one value. Expected: non-empty array, Received: empty array for field "${field}"`,
      );
    }

    validateFieldName(field);

    const formattedValues = values.map((v) => this.formatValue(v)).join(', ');
    this.#whereConditions.push(`${field} IN (${formattedValues})`);
    return this;
  }

  /**
   * Adds a NOT IN condition to exclude multiple values.
   * @param field - The field to filter on
   * @param values - Array of values to exclude
   * @returns The builder instance for method chaining
   * @throws {Error} If values array is empty
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereNotIn('campaign.status', ['REMOVED', 'UNKNOWN'])
   */
  public whereNotIn(field: string, values: GaqlArrayValue): this {
    if (values.length === 0) {
      throw new ValidationError(
        `NOT IN clause requires at least one value. Expected: non-empty array, Received: empty array for field "${field}"`,
      );
    }

    validateFieldName(field);

    const formattedValues = values.map((v) => this.formatValue(v)).join(', ');
    this.#whereConditions.push(`${field} NOT IN (${formattedValues})`);
    return this;
  }

  /**
   * Adds a LIKE condition for pattern matching.
   * @param field - The field to match against
   * @param pattern - The pattern to match (use % as wildcard)
   * @returns The builder instance for method chaining
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereLike('campaign.name', '%Brand%')
   */
  public whereLike(field: string, pattern: string): this {
    validateFieldName(field);

    this.#whereConditions.push(`${field} LIKE '${this.formatPattern(pattern)}'`);
    return this;
  }

  /**
   * Adds a NOT LIKE condition to exclude pattern matches.
   * @param field - The field to match against
   * @param pattern - The pattern to exclude (use % as wildcard)
   * @returns The builder instance for method chaining
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereNotLike('campaign.name', 'Test%')
   */
  public whereNotLike(field: string, pattern: string): this {
    validateFieldName(field);

    this.#whereConditions.push(`${field} NOT LIKE '${this.formatPattern(pattern)}'`);
    return this;
  }

  /**
   * Adds an IS NULL condition.
   * @param field - The field to check for NULL
   * @returns The builder instance for method chaining
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereNull('campaign.end_date')
   */
  public whereNull(field: string): this {
    validateFieldName(field);

    this.#whereConditions.push(`${field} IS NULL`);
    return this;
  }

  /**
   * Adds an IS NOT NULL condition.
   * @param field - The field to check for non-NULL
   * @returns The builder instance for method chaining
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereNotNull('campaign.start_date')
   */
  public whereNotNull(field: string): this {
    validateFieldName(field);

    this.#whereConditions.push(`${field} IS NOT NULL`);
    return this;
  }

  /**
   * Adds a BETWEEN condition for range filtering.
   * @param field - The field to filter on
   * @param start - The start value (inclusive)
   * @param end - The end value (inclusive)
   * @returns The builder instance for method chaining
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereBetween('metrics.clicks', 100, 1000)
   */
  public whereBetween(field: string, start: GaqlValue, end: GaqlValue): this {
    validateFieldName(field);

    const startValue = this.formatValue(start);
    const endValue = this.formatValue(end);
    this.#whereConditions.push(`${field} BETWEEN ${startValue} AND ${endValue}`);
    return this;
  }

  /**
   * Adds a CONTAINS ALL condition for array fields.
   * @param field - The field to check (must be an array field)
   * @param values - Array of values that must all be contained
   * @returns The builder instance for method chaining
   * @throws {Error} If values array is empty
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereContainsAll('ad_group_ad.ad.final_urls', ['example.com', 'shop'])
   */
  public whereContainsAll(field: string, values: GaqlArrayValue): this {
    if (values.length === 0) {
      throw new ValidationError(
        `CONTAINS ALL clause requires at least one value. Expected: non-empty array, Received: empty array for field "${field}"`,
      );
    }

    validateFieldName(field);

    const formattedValues = values.map((v) => this.formatValue(v)).join(', ');
    this.#whereConditions.push(`${field} CONTAINS ALL (${formattedValues})`);
    return this;
  }

  /**
   * Adds a CONTAINS ANY condition for array fields.
   * @param field - The field to check (must be an array field)
   * @param values - Array of values where at least one must be contained
   * @returns The builder instance for method chaining
   * @throws {Error} If values array is empty
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereContainsAny('ad_group_ad.ad.final_urls', ['sale', 'discount'])
   */
  public whereContainsAny(field: string, values: GaqlArrayValue): this {
    if (values.length === 0) {
      throw new ValidationError(
        `CONTAINS ANY clause requires at least one value. Expected: non-empty array, Received: empty array for field "${field}"`,
      );
    }

    validateFieldName(field);

    const formattedValues = values.map((v) => this.formatValue(v)).join(', ');
    this.#whereConditions.push(`${field} CONTAINS ANY (${formattedValues})`);
    return this;
  }

  /**
   * Adds a CONTAINS NONE condition for array fields.
   * @param field - The field to check (must be an array field)
   * @param values - Array of values that must not be contained
   * @returns The builder instance for method chaining
   * @throws {Error} If values array is empty
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereContainsNone('ad_group_ad.ad.final_urls', ['blocked.com', 'spam.com'])
   */
  public whereContainsNone(field: string, values: GaqlArrayValue): this {
    if (values.length === 0) {
      throw new ValidationError(
        `CONTAINS NONE clause requires at least one value. Expected: non-empty array, Received: empty array for field "${field}"`,
      );
    }

    validateFieldName(field);

    const formattedValues = values.map((v) => this.formatValue(v)).join(', ');
    this.#whereConditions.push(`${field} CONTAINS NONE (${formattedValues})`);
    return this;
  }

  /**
   * Adds a DURING condition for date range filtering.
   * @param field - The date field to filter on
   * @param dateRange - Either a predefined range (e.g., 'LAST_30_DAYS', 'TODAY') or custom date (YYYY-MM-DD)
   * @returns The builder instance for method chaining
   * @throws {Error} If field name is invalid
   * @throws {Error} If dateRange is not a valid GAQL date range or date format
   * @example
   * builder.whereDuring('segments.date', 'LAST_30_DAYS')
   * builder.whereDuring('segments.date', '2024-01-15')
   */
  public whereDuring(field: string, dateRange: string): this {
    validateFieldName(field);
    validateDateRange(dateRange);

    // Custom dates need to be quoted, predefined ranges don't
    const isCustomDate = /^\d{4}-\d{2}-\d{2}$/.test(dateRange);
    const formattedRange = isCustomDate ? `'${dateRange}'` : dateRange;

    this.#whereConditions.push(`${field} DURING ${formattedRange}`);
    return this;
  }

  /**
   * Adds a REGEXP_MATCH condition for regular expression matching.
   * @param field - The field to match against
   * @param pattern - The regular expression pattern
   * @returns The builder instance for method chaining
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereRegexpMatch('campaign.name', '(?i).*sale.*')
   */
  public whereRegexpMatch(field: string, pattern: string): this {
    validateFieldName(field);
    validateRegexPattern(pattern);

    this.#whereConditions.push(`${field} REGEXP_MATCH '${this.formatPattern(pattern)}'`);
    return this;
  }

  /**
   * Adds a NOT REGEXP_MATCH condition to exclude regex matches.
   * @param field - The field to match against
   * @param pattern - The regular expression pattern to exclude
   * @returns The builder instance for method chaining
   * @throws {Error} If field name is invalid
   * @example
   * builder.whereNotRegexpMatch('campaign.name', '^Test')
   */
  public whereNotRegexpMatch(field: string, pattern: string): this {
    validateFieldName(field);
    validateRegexPattern(pattern);

    this.#whereConditions.push(`${field} NOT REGEXP_MATCH '${this.formatPattern(pattern)}'`);
    return this;
  }

  /**
   * Adds a GROUP BY clause for aggregation queries.
   * @param fields - The fields to group by
   * @returns The builder instance for method chaining
   * @throws {Error} If fields array is empty
   * @throws {Error} If any field name is invalid
   * @example
   * builder.groupBy(['campaign.id', 'campaign.name'])
   */
  public groupBy(fields: string[]): this {
    if (fields.length === 0) {
      throw new ValidationError(
        'GROUP BY clause requires at least one field. Expected: non-empty array, Received: empty array',
      );
    }

    // Validate and add fields
    for (const field of fields) {
      const trimmedField = field.trim();
      validateFieldName(trimmedField);
      this.#groupByFields.push(trimmedField);
    }

    return this;
  }

  /**
   * Adds an ORDER BY clause to sort results.
   * @param field - The field to sort by
   * @param direction - Sort direction ('ASC' or 'DESC'), defaults to 'ASC'
   * @returns The builder instance for method chaining
   * @throws {Error} If field name is invalid
   * @throws {Error} If direction is not 'ASC' or 'DESC'
   * @example
   * builder.orderBy('metrics.clicks', 'DESC')
   */
  public orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    // Runtime validation for invalid values passed with type assertion
    if (!SORT_DIRECTIONS.includes(direction)) {
      throw new ValidationError(
        `ORDER BY direction invalid. Expected: ASC or DESC, Received: ${direction}`,
      );
    }

    validateFieldName(field);

    this.#orderByFields.push({ field, direction });
    return this;
  }

  /**
   * Sets the maximum number of results to return.
   * @param count - The maximum number of results (must be positive integer)
   * @returns The builder instance for method chaining
   * @throws {Error} If count is not a positive integer
   * @example
   * builder.limit(100)
   */
  public limit(count: number): this {
    if (!Number.isInteger(count) || count <= 0) {
      throw new ValidationError(
        `LIMIT must be a positive integer. Expected: positive integer, Received: ${count}`,
      );
    }
    this.#limitCount = count;
    return this;
  }

  /**
   * Adds query parameters for the PARAMETERS clause.
   *
   * SECURITY: Only boolean and number values are allowed to prevent injection attacks.
   * String values are not supported for security reasons.
   *
   * @param params - Object containing parameter key-value pairs (boolean or number only)
   * @returns The builder instance for method chaining
   * @throws {Error} If params object is empty
   * @throws {Error} If any parameter name is invalid
   * @throws {Error} If any parameter value is not boolean or number
   * @example
   * builder.parameters({ include_drafts: true, omit_unselected_resource_names: false })
   */
  public parameters(params: Record<string, boolean | number>): this {
    const paramKeys = Object.keys(params);

    if (paramKeys.length === 0) {
      throw new ValidationError(
        'PARAMETERS clause requires at least one parameter. Expected: non-empty object, Received: empty object',
      );
    }

    if (paramKeys.length > QUERY_LIMITS.MAX_PARAMETERS) {
      throw new QueryLimitError(
        `PARAMETERS clause exceeds maximum parameter limit. Expected: <= ${QUERY_LIMITS.MAX_PARAMETERS} parameters, Received: ${paramKeys.length} parameters`,
      );
    }

    // Validate all parameter names and values
    for (const [paramName, paramValue] of Object.entries(params)) {
      validateParameterName(paramName);

      // Validate parameter value type for security
      if (typeof paramValue !== 'boolean' && typeof paramValue !== 'number') {
        throw new SecurityError(
          `Invalid parameter value type for '${paramName}'. Expected: boolean or number, Received: ${typeof paramValue}`,
        );
      }

      if (typeof paramValue === 'number' && !Number.isFinite(paramValue)) {
        throw new SecurityError(
          `Invalid parameter value for '${paramName}'. Expected: finite number, Received: ${paramValue}`,
        );
      }
    }

    this.#queryParameters = params as Record<string, GaqlValue>;
    return this;
  }

  private formatCondition(field: string, operator: string, value: GaqlValue): string {
    return `${field} ${operator} ${this.formatValue(value)}`;
  }

  private formatValue(value: GaqlValue): string {
    if (typeof value === 'string') {
      // Escape single quotes by doubling them to prevent SQL injection
      return `'${value.replace(/'/g, "''")}'`;
    } else if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    } else if (value === null) {
      return 'NULL';
    } else {
      return String(value);
    }
  }

  /**
   * Formats a pattern string for use in LIKE or REGEXP_MATCH clauses.
   * Escapes single quotes to prevent SQL injection.
   * @param pattern - The pattern string to format
   * @returns The formatted pattern string with escaped quotes
   */
  private formatPattern(pattern: string): string {
    // Escape single quotes by doubling them
    return pattern.replace(/'/g, "''");
  }

  /**
   * Builds and returns the complete GAQL query string.
   * @returns The constructed GAQL query
   * @throws {Error} If SELECT clause is missing
   * @throws {Error} If FROM clause is missing
   * @example
   * const query = builder.build();
   * // Returns: "SELECT campaign.id FROM campaign WHERE ..."
   */
  public build(): string {
    this.validateRequiredClauses();

    const parts: string[] = [];

    parts.push(this.buildSelectClause());
    parts.push(this.buildFromClause());

    const whereClause = this.buildWhereClause();
    if (whereClause !== '') {
      parts.push(whereClause);
    }

    const groupByClause = this.buildGroupByClause();
    if (groupByClause !== '') {
      parts.push(groupByClause);
    }

    const orderByClause = this.buildOrderByClause();
    if (orderByClause !== '') {
      parts.push(orderByClause);
    }

    const limitClause = this.buildLimitClause();
    if (limitClause !== '') {
      parts.push(limitClause);
    }

    const parametersClause = this.buildParametersClause();
    if (parametersClause !== '') {
      parts.push(parametersClause);
    }

    const query = parts.join(' ');
    this.validateQuerySize(query);

    return query;
  }

  /**
   * Validates that required clauses are present.
   * @throws {QueryBuildError} If required clauses are missing
   */
  private validateRequiredClauses(): void {
    if (this.#selectFields.length === 0) {
      throw new QueryBuildError(
        'SELECT clause is required. Expected: at least one field selected, Received: no fields selected',
      );
    }
    if (this.#fromResource === '') {
      throw new QueryBuildError(
        'FROM clause is required. Expected: resource name, Received: empty resource',
      );
    }
  }

  /**
   * Builds the SELECT clause.
   * @returns The SELECT clause string
   */
  private buildSelectClause(): string {
    return `SELECT ${this.#selectFields.join(', ')}`;
  }

  /**
   * Builds the FROM clause.
   * @returns The FROM clause string
   */
  private buildFromClause(): string {
    return `FROM ${this.#fromResource}`;
  }

  /**
   * Builds the WHERE clause if conditions exist.
   * @returns The WHERE clause string or empty string
   */
  private buildWhereClause(): string {
    if (this.#whereConditions.length === 0) {
      return '';
    }
    return `WHERE ${this.#whereConditions.join(' AND ')}`;
  }

  /**
   * Builds the GROUP BY clause if fields exist.
   * @returns The GROUP BY clause string or empty string
   */
  private buildGroupByClause(): string {
    if (this.#groupByFields.length === 0) {
      return '';
    }
    return `GROUP BY ${this.#groupByFields.join(', ')}`;
  }

  /**
   * Builds the ORDER BY clause if fields exist.
   * @returns The ORDER BY clause string or empty string
   */
  private buildOrderByClause(): string {
    if (this.#orderByFields.length === 0) {
      return '';
    }
    const orderByParts = this.#orderByFields.map(({ field, direction }) => `${field} ${direction}`);
    return `ORDER BY ${orderByParts.join(', ')}`;
  }

  /**
   * Builds the LIMIT clause if set.
   * @returns The LIMIT clause string or empty string
   */
  private buildLimitClause(): string {
    if (this.#limitCount === null) {
      return '';
    }
    return `LIMIT ${this.#limitCount}`;
  }

  /**
   * Builds the PARAMETERS clause if parameters exist.
   * @returns The PARAMETERS clause string or empty string
   */
  private buildParametersClause(): string {
    const paramEntries = Object.entries(this.#queryParameters);
    if (paramEntries.length === 0) {
      return '';
    }
    const paramParts = paramEntries.map(
      ([key, value]) => `${key} = ${this.formatParameterValue(value)}`,
    );
    return `PARAMETERS ${paramParts.join(', ')}`;
  }

  /**
   * Validates the final query size.
   * @param query - The complete query string
   * @throws {QueryLimitError} If query exceeds size limit
   */
  private validateQuerySize(query: string): void {
    if (query.length > QUERY_LIMITS.MAX_QUERY_LENGTH) {
      throw new QueryLimitError(
        `Query exceeds maximum length limit. Expected: <= ${QUERY_LIMITS.MAX_QUERY_LENGTH} characters, Received: ${query.length} characters`,
      );
    }
  }

  /**
   * Formats a parameter value for use in the PARAMETERS clause.
   * Note: GAQL parameter values are not quoted like regular string values.
   * Boolean values are converted to lowercase 'true'/'false'.
   * All other values are converted to strings without quotes.
   *
   * SECURITY NOTE: String parameter values are not escaped or quoted.
   * This is by design as GAQL parameters are typically used for boolean flags
   * and not user-provided strings. Avoid using user input in parameters.
   *
   * @param value - The parameter value to format
   * @returns The formatted parameter value
   */
  private formatParameterValue(value: GaqlValue): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    // At this point, value must be a number due to validation in parameters()
    return String(value);
  }
}

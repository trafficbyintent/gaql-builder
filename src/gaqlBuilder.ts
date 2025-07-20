export class GaqlBuilder {
  private selectFields: string[] = [];
  private fromResource: string = '';
  private whereConditions: string[] = [];
  private orderByFields: Array<{ field: string; direction: 'ASC' | 'DESC' }> = [];
  private limitCount: number | null = null;
  private queryParameters: Record<string, any> = {};

  constructor() {
    // Initialize with empty state
  }

  select(fields: string[]): GaqlBuilder {
    if (fields.length === 0) {
      throw new Error('SELECT clause must include at least one field');
    }
    this.selectFields = fields.map(field => field.trim());
    return this;
  }

  from(resource: string): GaqlBuilder {
    if (!resource || resource.trim() === '') {
      throw new Error('FROM clause must specify a resource');
    }
    this.fromResource = resource.trim();
    return this;
  }

  where(field: string, operator: string, value: any): GaqlBuilder {
    const validOperators = ['=', '!=', '>', '>=', '<', '<='];
    if (!validOperators.includes(operator)) {
      throw new Error(`Invalid operator: ${operator}`);
    }
    this.whereConditions.push(this.formatCondition(field, operator, value));
    return this;
  }

  andWhere(field: string, operator: string, value: any): GaqlBuilder {
    return this.where(field, operator, value);
  }

  whereIn(field: string, values: any[]): GaqlBuilder {
    if (values.length === 0) {
      throw new Error('IN clause requires at least one value');
    }
    const formattedValues = values.map(v => this.formatValue(v)).join(', ');
    this.whereConditions.push(`${field} IN (${formattedValues})`);
    return this;
  }

  whereNotIn(field: string, values: any[]): GaqlBuilder {
    if (values.length === 0) {
      throw new Error('NOT IN clause requires at least one value');
    }
    const formattedValues = values.map(v => this.formatValue(v)).join(', ');
    this.whereConditions.push(`${field} NOT IN (${formattedValues})`);
    return this;
  }

  whereLike(field: string, pattern: string): GaqlBuilder {
    this.whereConditions.push(`${field} LIKE '${pattern}'`);
    return this;
  }

  whereNotLike(field: string, pattern: string): GaqlBuilder {
    this.whereConditions.push(`${field} NOT LIKE '${pattern}'`);
    return this;
  }

  whereNull(field: string): GaqlBuilder {
    this.whereConditions.push(`${field} IS NULL`);
    return this;
  }

  whereNotNull(field: string): GaqlBuilder {
    this.whereConditions.push(`${field} IS NOT NULL`);
    return this;
  }

  whereBetween(field: string, start: any, end: any): GaqlBuilder {
    const startValue = this.formatValue(start);
    const endValue = this.formatValue(end);
    this.whereConditions.push(`${field} BETWEEN ${startValue} AND ${endValue}`);
    return this;
  }

  whereContainsAll(field: string, values: any[]): GaqlBuilder {
    if (values.length === 0) {
      throw new Error('CONTAINS ALL clause requires at least one value');
    }
    const formattedValues = values.map(v => this.formatValue(v)).join(', ');
    this.whereConditions.push(`${field} CONTAINS ALL (${formattedValues})`);
    return this;
  }

  whereContainsAny(field: string, values: any[]): GaqlBuilder {
    if (values.length === 0) {
      throw new Error('CONTAINS ANY clause requires at least one value');
    }
    const formattedValues = values.map(v => this.formatValue(v)).join(', ');
    this.whereConditions.push(`${field} CONTAINS ANY (${formattedValues})`);
    return this;
  }

  whereContainsNone(field: string, values: any[]): GaqlBuilder {
    if (values.length === 0) {
      throw new Error('CONTAINS NONE clause requires at least one value');
    }
    const formattedValues = values.map(v => this.formatValue(v)).join(', ');
    this.whereConditions.push(`${field} CONTAINS NONE (${formattedValues})`);
    return this;
  }

  whereDuring(field: string, dateRange: string): GaqlBuilder {
    this.whereConditions.push(`${field} DURING ${dateRange}`);
    return this;
  }

  whereRegexpMatch(field: string, pattern: string): GaqlBuilder {
    this.whereConditions.push(`${field} REGEXP_MATCH '${pattern}'`);
    return this;
  }

  whereNotRegexpMatch(field: string, pattern: string): GaqlBuilder {
    this.whereConditions.push(`${field} NOT REGEXP_MATCH '${pattern}'`);
    return this;
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): GaqlBuilder {
    if (direction !== 'ASC' && direction !== 'DESC') {
      throw new Error('ORDER BY direction must be ASC or DESC');
    }
    this.orderByFields.push({ field, direction });
    return this;
  }

  limit(count: number): GaqlBuilder {
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error('LIMIT must be a positive integer');
    }
    this.limitCount = count;
    return this;
  }

  parameters(params: Record<string, any>): GaqlBuilder {
    if (Object.keys(params).length === 0) {
      throw new Error('PARAMETERS clause requires at least one parameter');
    }
    this.queryParameters = params;
    return this;
  }

  private formatCondition(field: string, operator: string, value: any): string {
    return `${field} ${operator} ${this.formatValue(value)}`;
  }

  private formatValue(value: any): string {
    if (typeof value === 'string') {
      return `'${value}'`;
    } else if (typeof value === 'boolean') {
      return value ? 'TRUE' : 'FALSE';
    } else if (value === null) {
      return 'NULL';
    } else {
      return String(value);
    }
  }

  build(): string {
    // Validate required clauses
    if (this.selectFields.length === 0) {
      throw new Error('SELECT clause is required');
    }
    if (!this.fromResource) {
      throw new Error('FROM clause is required');
    }

    // Build the query parts
    const parts: string[] = [];
    
    // SELECT clause
    parts.push(`SELECT ${this.selectFields.join(', ')}`);
    
    // FROM clause
    parts.push(`FROM ${this.fromResource}`);
    
    // WHERE clause
    if (this.whereConditions.length > 0) {
      parts.push(`WHERE ${this.whereConditions.join(' AND ')}`);
    }
    
    // ORDER BY clause
    if (this.orderByFields.length > 0) {
      const orderByParts = this.orderByFields.map(({ field, direction }) => `${field} ${direction}`);
      parts.push(`ORDER BY ${orderByParts.join(', ')}`);
    }
    
    // LIMIT clause
    if (this.limitCount !== null) {
      parts.push(`LIMIT ${this.limitCount}`);
    }
    
    // PARAMETERS clause
    if (Object.keys(this.queryParameters).length > 0) {
      const paramParts = Object.entries(this.queryParameters)
        .map(([key, value]) => `${key} = ${this.formatParameterValue(value)}`);
      parts.push(`PARAMETERS ${paramParts.join(', ')}`);
    }
    
    return parts.join(' ');
  }

  private formatParameterValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return String(value);
  }
}
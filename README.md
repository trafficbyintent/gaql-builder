# gaql-builder

[![npm version](https://badge.fury.io/js/@trafficbyintent%2Fgaql-builder.svg)](https://www.npmjs.com/package/@trafficbyintent/gaql-builder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript library for building Google Ads Query Language (GAQL) queries programmatically with
type safety and intuitive method chaining.

## Installation

```bash
npm install @trafficbyintent/gaql-builder
```

## Quick Start

```typescript
import { GaqlBuilder } from '@trafficbyintent/gaql-builder';

const query = new GaqlBuilder()
    .select(['campaign.id', 'campaign.name', 'metrics.clicks'])
    .from('campaign')
    .where('metrics.impressions', '>', 100)
    .orderBy('metrics.clicks', 'DESC')
    .limit(10)
    .build();

console.log(query);
// SELECT campaign.id, campaign.name, metrics.clicks
// FROM campaign
// WHERE metrics.impressions > 100
// ORDER BY metrics.clicks DESC
// LIMIT 10
```

## Features

- **Type-safe query building**: Full TypeScript support with autocompletion
- **Fluent API**: Intuitive method chaining for query construction
- **Validation**: Built-in query validation to catch errors early
- **All GAQL features**: Support for all GAQL clauses and functions
- **Zero dependencies**: Lightweight with no external runtime dependencies

## API Reference

### Creating a Query Builder

```typescript
import { GaqlBuilder } from '@trafficbyintent/gaql-builder';

const builder = new GaqlBuilder();
```

### SELECT Clause

```typescript
// Select specific fields
builder.select(['campaign.id', 'campaign.name']);

// Select multiple fields including metrics
builder.select(['campaign.id', 'campaign.name', 'metrics.clicks', 'metrics.impressions']);
```

### FROM Clause

```typescript
builder.from('campaign');
```

### WHERE Clause

```typescript
// Single condition
builder.where('campaign.status', '=', 'ENABLED');

// Multiple conditions with AND
builder.where('campaign.status', '=', 'ENABLED').andWhere('metrics.clicks', '>', 100);

// Complex conditions
builder.whereLike('campaign.name', '%Brand%');
```

### ORDER BY Clause

```typescript
// Single field
builder.orderBy('metrics.clicks', 'DESC');

// Multiple fields
builder.orderBy('metrics.clicks', 'DESC').orderBy('metrics.impressions', 'ASC');
```

### LIMIT Clause

```typescript
builder.limit(100);
```

### Building the Query

```typescript
const queryString = builder.build();
```

### Parameters Clause

```typescript
// Parameters only accept boolean and number values for security
builder.parameters({
    include_drafts: true,
    omit_unselected_resource_names: false,
    metric_threshold: 100, // Numbers are also supported
});

// String values are NOT supported (throws error)
// builder.parameters({ some_param: "string" }); // ❌ Throws error
```

## Security Features

### Protection Against Injection Attacks

1. **SQL Injection Prevention**: All string values are automatically escaped with single quotes
   doubled
2. **Parameter Type Restrictions**: Parameters only accept `boolean` and `number` types (no strings)
3. **Field Name Validation**: Strict validation of field names to prevent malicious input
4. **Query Size Limits**: Built-in limits to prevent memory exhaustion attacks
    - Maximum 500 SELECT fields
    - Maximum 100 WHERE conditions
    - Maximum 50 parameters
    - Maximum 1000 values in IN/CONTAINS clauses
    - Maximum 100KB total query size

### Input Validation

All inputs are validated to ensure they conform to GAQL syntax requirements:

```typescript
// ✅ Safe - all inputs are validated and escaped
builder
    .select(['campaign.name'])
    .where('campaign.name', '=', "O'Reilly's Campaign") // Automatically escaped
    .whereIn('status', ['ENABLED', 'PAUSED']) // Each value escaped
    .build();

// ❌ These will throw errors (prevented attacks)
builder.select(['field; DROP TABLE']); // Invalid field name
builder.from('resource; DELETE'); // Invalid resource name
builder.parameters({ key: "'; DROP" }); // String parameters not allowed
```

## Advanced Usage

### GROUP BY and Aggregations

```typescript
const aggregateQuery = new GaqlBuilder()
    .select(['campaign.id', 'SUM(metrics.clicks)', 'AVG(metrics.ctr)'])
    .from('campaign')
    .where('campaign.status', '=', 'ENABLED')
    .groupBy(['campaign.id'])
    .orderBy('SUM(metrics.clicks)', 'DESC')
    .limit(10)
    .build();

// Supports: SUM, COUNT, AVG, MIN, MAX, COUNT_DISTINCT
```

### Complex Queries

```typescript
const complexQuery = new GaqlBuilder()
    .select([
        'ad_group.id',
        'ad_group.name',
        'ad_group_criterion.keyword.text',
        'metrics.clicks',
        'metrics.impressions',
        'metrics.cost_micros',
    ])
    .from('keyword_view')
    .where('campaign.id', '=', 123456789)
    .where('ad_group.status', '=', 'ENABLED')
    .where('metrics.impressions', '>', 0)
    .whereDuring('segments.date', 'LAST_30_DAYS')
    .orderBy('metrics.clicks', 'DESC')
    .orderBy('metrics.cost_micros', 'DESC')
    .limit(50)
    .build();
```

### Query Validation

The builder validates queries before building:

```typescript
try {
    const query = new GaqlBuilder()
        .from('campaign') // Missing SELECT clause
        .build();
} catch (error) {
    console.error(error.message); // "SELECT clause is required. Expected: at least one field selected, Received: no fields selected"
}
```

## Troubleshooting

### Common Issues

**Query validation errors**

- Ensure all required clauses are present (SELECT and FROM are mandatory)
- Check that field names follow the correct format (e.g., `campaign.id`, not just `id`)
- Verify resource names match Google Ads API resources exactly

**TypeScript type errors**

- Import types explicitly:
  `import { GaqlBuilder, type GaqlValue } from '@trafficbyintent/gaql-builder'`
- Ensure TypeScript is configured with `strict: true` for best type safety

**Invalid field names**

- Field names must contain only letters, numbers, dots, and underscores
- Use the exact field names from the Google Ads API documentation

**Date range errors**

- Predefined date ranges like `LAST_30_DAYS`, `TODAY`, `YESTERDAY` are supported
- Custom dates in `YYYY-MM-DD` format are also supported:
  `builder.whereDuring('segments.date', '2024-01-15')`
- Invalid dates (e.g., `2024-02-30`) will be rejected with a validation error

## Contributing

Contributions are welcome! Please ensure:

- All tests pass with 100% coverage
- Linting passes with zero violations
- Changes are documented in CHANGELOG.md

## License

MIT

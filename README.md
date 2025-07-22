# gaql-builder

A TypeScript library for building Google Ads Query Language (GAQL) queries programmatically with type safety and intuitive method chaining.

## Installation

```bash
npm install @traffic.by.intent/gaql-builder
```

## Quick Start

```typescript
import { GaqlQueryBuilder } from 'gaql-builder';

const query = new GaqlQueryBuilder()
  .select(['campaign.id', 'campaign.name', 'metrics.clicks'])
  .from('campaign')
  .where('metrics.impressions > 100')
  .orderBy('metrics.clicks DESC')
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
import { GaqlQueryBuilder } from 'gaql-builder';

const builder = new GaqlQueryBuilder();
```

### SELECT Clause

```typescript
// Select specific fields
builder.select(['campaign.id', 'campaign.name']);

// Select all fields from a resource
builder.select('*');
```

### FROM Clause

```typescript
builder.from('campaign');
```

### WHERE Clause

```typescript
// Single condition
builder.where('campaign.status = ENABLED');

// Multiple conditions with AND
builder.where('campaign.status = ENABLED')
       .where('metrics.clicks > 100');

// Complex conditions
builder.where('campaign.name LIKE "%Brand%"');
```

### ORDER BY Clause

```typescript
// Single field
builder.orderBy('metrics.clicks DESC');

// Multiple fields
builder.orderBy(['metrics.clicks DESC', 'metrics.impressions ASC']);
```

### LIMIT Clause

```typescript
builder.limit(100);
```

### Building the Query

```typescript
const queryString = builder.build();
```

## Advanced Usage

### Complex Queries

```typescript
const complexQuery = new GaqlQueryBuilder()
  .select([
    'ad_group.id',
    'ad_group.name',
    'ad_group_criterion.keyword.text',
    'metrics.clicks',
    'metrics.impressions',
    'metrics.cost_micros'
  ])
  .from('keyword_view')
  .where('campaign.id = 123456789')
  .where('ad_group.status = ENABLED')
  .where('metrics.impressions > 0')
  .where('segments.date DURING LAST_30_DAYS')
  .orderBy(['metrics.clicks DESC', 'metrics.cost_micros DESC'])
  .limit(50)
  .build();
```

### Query Validation

The builder validates queries before building:

```typescript
try {
  const query = new GaqlQueryBuilder()
    .from('campaign')  // Missing SELECT clause
    .build();
} catch (error) {
  console.error(error.message); // "SELECT clause is required"
}
```

## License

MIT

# GAQL Ordering and Limiting

This document covers how to order and limit results in Google Ads Query Language (GAQL) queries.

**Source**:
[Google Ads API Documentation - Ordering and Limiting](https://developers.google.com/google-ads/api/docs/query/ordering-limiting)

## Ordering Results

The `ORDER BY` clause allows you to specify the order of results in your query.

### Syntax

```
ORDER BY FieldName [ASC | DESC]
```

- `FieldName`: The field to order by
- `ASC`: Ascending order (default if not specified)
- `DESC`: Descending order

### Examples

```sql
/* Single field ordering - descending */
ORDER BY metrics.impressions DESC

/* Multiple field ordering */
ORDER BY metrics.impressions DESC, campaign.name ASC

/* Default ascending order */
ORDER BY campaign.name
```

### Ordering Rules and Restrictions

You **CANNOT** order by:

1. **Non-selected resource attributes** - Any resource attribute must be in the SELECT clause to use
   in ORDER BY
2. **Non-selected metrics or segments** - Metrics and segments must be selected to order by them
3. **Fields of type MESSAGE** - Complex message type fields cannot be used for ordering
4. **Repeated fields** - Fields that can have multiple values cannot be used for ordering
5. **Attributes of repeated fields** - Even primitive attributes within repeated fields cannot be
   used for ordering

### Valid Ordering Examples

```sql
/* Valid - ordering by selected fields */
SELECT
  campaign.id,
  campaign.name,
  metrics.impressions
FROM campaign
ORDER BY metrics.impressions DESC

/* Valid - multiple order criteria */
SELECT
  campaign.name,
  metrics.clicks,
  metrics.impressions
FROM campaign
ORDER BY metrics.clicks DESC, metrics.impressions DESC
```

## Limiting Results

The `LIMIT` clause restricts the total number of results returned by a query.

### Syntax

```
LIMIT n
```

Where `n` is the maximum number of rows to return.

### Example: Top 5 Campaigns Report

```sql
SELECT
  campaign.id,
  campaign.name,
  metrics.impressions
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.impressions DESC
LIMIT 5
```

This query returns the top 5 campaigns by impressions over the last 30 days.

## Filtering Limitations

While not strictly related to ordering and limiting, it's important to understand filtering
restrictions that may affect your queries:

### Filtering is NOT permitted on:

1. **Segments without selecting them** - Exception: core date segments (segments.date,
   segments.week, segments.month, segments.quarter, segments.year) can be used in WHERE without
   selecting
2. **Message type fields** - Except for primitive fields within messages
3. **Repeated field attributes** - Except for primitive types within repeated fields

### Example: Proper Segment Filtering

```sql
/* Valid - filtering on core date segment without selecting it */
SELECT
  campaign.name,
  metrics.impressions
FROM campaign
WHERE segments.date DURING LAST_7_DAYS

/* Invalid - filtering on non-core segment without selecting it */
SELECT
  campaign.name,
  metrics.impressions
FROM campaign
WHERE segments.device = 'MOBILE'  /* Error: segments.device not selected */

/* Valid - selecting the segment being filtered */
SELECT
  campaign.name,
  segments.device,
  metrics.impressions
FROM campaign
WHERE segments.device = 'MOBILE'
```

## Best Practices

1. **Always select fields you want to order by** - This ensures the query is valid and the results
   make sense
2. **Use LIMIT with ORDER BY** - When using LIMIT, combine it with ORDER BY to get predictable
   results
3. **Consider performance** - Ordering large result sets can impact query performance
4. **Be explicit with sort direction** - While ASC is default, being explicit improves query
   readability

## Common Use Cases

### Top N Reports

```sql
/* Top 10 keywords by cost */
SELECT
  ad_group_criterion.keyword.text,
  metrics.cost_micros
FROM keyword_view
WHERE segments.date DURING LAST_7_DAYS
ORDER BY metrics.cost_micros DESC
LIMIT 10
```

### Alphabetical Listings

```sql
/* All active campaigns alphabetically */
SELECT
  campaign.id,
  campaign.name,
  campaign.status
FROM campaign
WHERE campaign.status = 'ENABLED'
ORDER BY campaign.name ASC
```

### Multi-level Sorting

```sql
/* Campaigns by performance, then alphabetically */
SELECT
  campaign.name,
  metrics.clicks,
  metrics.impressions,
  metrics.ctr
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.clicks DESC, campaign.name ASC
```

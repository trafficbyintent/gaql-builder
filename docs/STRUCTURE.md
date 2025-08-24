# GAQL Query Structure

This document details the structure of Google Ads Query Language (GAQL) queries, including clause types, ordering requirements, and usage guidelines.

## Query Clause Order

GAQL queries must follow a specific clause order. Clauses must appear in this sequence:

1. **SELECT** (Required)
2. **FROM** (Required)
3. **WHERE** (Optional)
4. **ORDER BY** (Optional)
5. **LIMIT** (Optional)
6. **PARAMETERS** (Optional)

## Clause Details

### SELECT Clause (Required)

The SELECT clause specifies which fields to retrieve from the resource.

**Syntax:**
```sql
SELECT field1, field2, field3
```

**Key Points:**
- Must specify at least one field
- Can include resource fields, segment fields, and metrics
- Fields are comma-separated
- Cannot use wildcards (must specify exact fields)
- Not all fields can be selected together due to compatibility restrictions

**Field Types:**
- **Resource fields**: `resource.field_name` (e.g., `campaign.name`)
- **Segment fields**: `segments.field_name` (e.g., `segments.date`)
- **Metric fields**: `metrics.field_name` (e.g., `metrics.clicks`)

**Examples:**
```sql
SELECT campaign.id, campaign.name
SELECT ad_group.id, ad_group.name, metrics.clicks, metrics.impressions
SELECT campaign.name, segments.date, metrics.cost_micros
```

### FROM Clause (Required)

The FROM clause specifies the primary resource to query.

**Syntax:**
```sql
FROM resource_name
```

**Key Points:**
- Only one resource can be specified per query
- The resource name is always implicitly included in results
- Resource determines available fields and relationships

**Common Resources:**
- `campaign`
- `ad_group`
- `ad_group_ad`
- `keyword_view`
- `customer`
- `campaign_budget`

**Examples:**
```sql
FROM campaign
FROM ad_group
FROM campaign_criterion
```

### WHERE Clause (Optional)

The WHERE clause filters the results based on conditions.

**Syntax:**
```sql
WHERE condition1 AND condition2 AND condition3
```

**Key Points:**
- Multiple conditions must be joined with `AND` (no `OR` support)
- Each condition follows the pattern: `field operator value`
- Supports various operators and functions

**Supported Operators:**
- Comparison: `=`, `!=`, `>`, `>=`, `<`, `<=`
- Set membership: `IN`, `NOT IN`
- String matching: `LIKE`, `NOT LIKE`, `CONTAINS ANY/ALL/NONE`
- Null checking: `IS NULL`, `IS NOT NULL`
- Date ranges: `DURING`, `BETWEEN`
- Pattern matching: `REGEXP_MATCH`, `NOT REGEXP_MATCH`

**Examples:**
```sql
WHERE campaign.status = 'ENABLED'
WHERE metrics.clicks > 100 AND metrics.cost_micros < 1000000
WHERE campaign.name LIKE '%Brand%'
WHERE segments.date DURING LAST_30_DAYS
WHERE campaign.id IN (123, 456, 789)
```

### ORDER BY Clause (Optional)

The ORDER BY clause sorts the results by one or more fields.

**Syntax:**
```sql
ORDER BY field1 [ASC|DESC], field2 [ASC|DESC]
```

**Key Points:**
- Default sort order is ascending (ASC)
- Can sort by multiple fields
- Sorting is applied after filtering

**Examples:**
```sql
ORDER BY metrics.clicks DESC
ORDER BY campaign.name ASC, metrics.impressions DESC
ORDER BY segments.date
```

### LIMIT Clause (Optional)

The LIMIT clause restricts the number of results returned.

**Syntax:**
```sql
LIMIT number
```

**Key Points:**
- Must be a positive integer
- Applied after sorting (if ORDER BY is present)
- Useful for pagination and performance

**Examples:**
```sql
LIMIT 100
LIMIT 10
LIMIT 1000
```

### PARAMETERS Clause (Optional)

The PARAMETERS clause provides meta-parameters that affect query behavior.

**Syntax:**
```sql
PARAMETERS parameter1 = value1, parameter2 = value2
```

**Available Parameters:**
- `include_drafts`: Include draft entities in results (boolean)
- `omit_unselected_resource_names`: Omit resource names for unselected fields (boolean)

**Examples:**
```sql
PARAMETERS include_drafts = true
PARAMETERS omit_unselected_resource_names = true
PARAMETERS include_drafts = true, omit_unselected_resource_names = false
```

## Complete Query Examples

### Basic Campaign Query
```sql
SELECT 
  campaign.id,
  campaign.name,
  campaign.status,
  metrics.clicks,
  metrics.impressions
FROM campaign
WHERE campaign.status = 'ENABLED'
ORDER BY metrics.clicks DESC
LIMIT 10
```

### Segmented Performance Query
```sql
SELECT
  campaign.name,
  segments.date,
  segments.device,
  metrics.clicks,
  metrics.conversions,
  metrics.cost_micros
FROM campaign
WHERE segments.date DURING LAST_7_DAYS
  AND metrics.impressions > 0
ORDER BY segments.date DESC, metrics.clicks DESC
```

### Ad Group Query with Parameters
```sql
SELECT
  ad_group.id,
  ad_group.name,
  ad_group.status,
  campaign.name
FROM ad_group
WHERE ad_group.status IN ('ENABLED', 'PAUSED')
  AND campaign.status = 'ENABLED'
ORDER BY ad_group.name
LIMIT 50
PARAMETERS include_drafts = false
```

## Important Considerations

### Field Compatibility
Not all fields can be selected together. Common incompatibilities:
- Some metrics require specific segmentation
- Certain resource fields conflict with others
- Some fields are only available with specific WHERE conditions

### Resource Relationships
- Implicit joins occur through resource references
- Example: When querying `ad_group`, you can access `campaign.name`
- The relationship is determined by the resource hierarchy

### Performance Best Practices
1. Select only necessary fields
2. Use WHERE clauses to filter at the API level
3. Apply reasonable LIMIT values
4. Be mindful of segmentation impact on data volume

### Date Segmentation
When using `segments.date`:
- Requires a date filter in WHERE clause
- Common filters: `DURING LAST_X_DAYS`, `BETWEEN date AND date`
- Without date filter, query may fail or return excessive data

### Zero Metrics
By default, rows with zero metrics are excluded. To include them:
- Must explicitly request in certain contexts
- Behavior varies by resource and metric type

## Query Validation

Before executing a query, ensure:
1. Clauses are in the correct order
2. Required clauses (SELECT, FROM) are present
3. Field names are correctly formatted
4. WHERE conditions use valid operators
5. Date ranges are properly specified
6. Resource relationships are valid
# GAQL Case Sensitivity

> **Source**:
> [Google Ads API Documentation - Query Case Sensitivity](https://developers.google.com/google-ads/api/docs/query/case-sensitivity)
>
> **API Version**: This documentation is current as of Google Ads API v20

## Overview

Google Ads Query Language (GAQL) has specific case sensitivity rules for different operators.
Understanding these rules is crucial for writing accurate queries that return the expected results.

## Operator Case Sensitivity Rules

| Operator         | Case Sensitivity | Description                          |
| ---------------- | ---------------- | ------------------------------------ |
| `=`              | Case sensitive   | Exact match comparison               |
| `!=`             | Case sensitive   | Not equal comparison                 |
| `IN`             | Case sensitive   | Value in list comparison             |
| `NOT IN`         | Case sensitive   | Value not in list comparison         |
| `LIKE`           | Case insensitive | Pattern matching with wildcards      |
| `NOT LIKE`       | Case insensitive | Negated pattern matching             |
| `CONTAINS (...)` | Case sensitive   | Contains any/all specified values    |
| `REGEXP_MATCH`   | Configurable     | Can be case sensitive or insensitive |

## Examples

### Case Sensitive Operators

```sql
-- These queries are case sensitive
SELECT campaign.id
FROM campaign
WHERE campaign.name = 'Test Campaign'  -- Won't match 'test campaign'

SELECT campaign.id
FROM campaign
WHERE campaign.name IN ('Campaign A', 'Campaign B')  -- Won't match 'campaign a'
```

### Case Insensitive Operators

```sql
-- LIKE is case insensitive
SELECT campaign.id
FROM campaign
WHERE campaign.name LIKE '%test%'  -- Matches 'Test', 'TEST', 'test'
```

### Regular Expression Matching

The `REGEXP_MATCH` operator is case sensitive by default, but can be made case insensitive using the
`(?i)` flag:

```sql
-- Case sensitive (default)
SELECT campaign.id
FROM campaign
WHERE campaign.name REGEXP_MATCH ".*test.*"  -- Won't match 'Test' or 'TEST'

-- Case insensitive with (?i) flag
SELECT campaign.id
FROM campaign
WHERE campaign.name REGEXP_MATCH "(?i).*test.*"  -- Matches 'test', 'Test', 'TEST'
```

## Best Practices

1. **Be explicit about case**: When using case-sensitive operators, ensure your query values match
   the exact case of the data.

2. **Use LIKE for flexible matching**: When case doesn't matter, prefer `LIKE` over exact matches.

3. **Document regex patterns**: When using `REGEXP_MATCH`, clearly indicate whether the pattern is
   case sensitive.

4. **Test thoroughly**: Always test queries with different case variations to ensure expected
   behavior.

## Common Pitfalls

- Assuming all operators are case insensitive (they're not)
- Forgetting that `IN` and `CONTAINS` are case sensitive
- Not using the `(?i)` flag when case-insensitive regex matching is needed

# GAQL Grammar Reference

This document provides a comprehensive reference for the Google Ads Query Language (GAQL) grammar, based on the official Google Ads API documentation.

## Query Structure

A GAQL query consists of the following clauses in order:

```
Query         = SelectClause FromClause [WhereClause] [OrderByClause] [LimitClause] [ParametersClause]
SelectClause  = SELECT FieldName {"," FieldName}
FromClause    = FROM ResourceName
WhereClause   = WHERE Condition {"AND" Condition}
OrderByClause = ORDER BY Ordering {"," Ordering}
LimitClause   = LIMIT PositiveInteger
ParametersClause = PARAMETERS Literal "=" Value {"," Literal "=" Value}
```

## Basic Syntax Elements

### Field Names
```
FieldName = [SegmentFieldName ","] AttributeFieldName {"," FieldName} [MetricFieldName {"," MetricFieldName}]
SegmentFieldName = Segments "." FieldName
AttributeFieldName = [ResourceName "."] FieldName {"." FieldName}
MetricFieldName = Metrics "." FieldName
```

### Resources and Segments
- `ResourceName`: The name of the resource being queried (e.g., `campaign`, `ad_group`)
- `Segments`: Special prefix for segmentation fields
- `Metrics`: Special prefix for metric fields

## WHERE Clause Grammar

### Conditions
```
Condition = FieldName Operator Value
          | FieldName BETWEEN Value AND Value
          | FieldName IN "(" Value {"," Value} ")"
          | FieldName NOT IN "(" Value {"," Value} ")"
          | FieldName LIKE Value
          | FieldName NOT LIKE Value
          | FieldName CONTAINS ALL "(" Value {"," Value} ")"
          | FieldName CONTAINS ANY "(" Value {"," Value} ")"
          | FieldName CONTAINS NONE "(" Value {"," Value} ")"
          | FieldName IS NULL
          | FieldName IS NOT NULL
          | FieldName DURING DateRange
          | FieldName REGEXP_MATCH Value
          | FieldName NOT REGEXP_MATCH Value
```

### Operators
```
Operator = "=" | "!=" | ">" | ">=" | "<" | "<="
```

### Values
```
Value = Literal | Number | StringList | NumberList | BoolList
Literal = "'" {ANY_CHAR} "'"
Number = ["-"] Digit {Digit} ["." Digit {Digit}]
StringList = "(" Literal {"," Literal} ")"
NumberList = "(" Number {"," Number} ")"
BoolList = "(" Bool {"," Bool} ")"
Bool = TRUE | FALSE
```

## Date Ranges

GAQL supports both predefined and custom date ranges:

### Predefined Date Ranges
```
DateRange = TODAY
          | YESTERDAY
          | LAST_7_DAYS
          | LAST_14_DAYS
          | LAST_30_DAYS
          | LAST_BUSINESS_WEEK
          | LAST_MONTH
          | LAST_CALENDAR_MONTH
          | LAST_WEEK_MON_SUN
          | LAST_WEEK_SUN_SAT
          | THIS_WEEK_MON_TODAY
          | THIS_WEEK_SUN_TODAY
          | THIS_MONTH
          | ALL_TIME
```

### Custom Date Ranges
```
CustomDateRange = Date TO Date
Date = YYYY-MM-DD
```

## ORDER BY Clause

```
Ordering = FieldName [Direction]
Direction = ASC | DESC
```

## Special Characters and Escaping

### String Literals
- Enclosed in single quotes: `'value'`
- To include a single quote in a string, escape it with backslash: `\'`
- To include a backslash, double it: `\\`

### Regular Expressions
- Uses RE2 syntax
- Pattern must be enclosed in quotes
- Special regex characters must be escaped

## Function Reference

### String Functions
- `REGEXP_MATCH(field, pattern)`: Matches field against RE2 regular expression
- `NOT REGEXP_MATCH(field, pattern)`: Negative regex match

### List Functions
- `CONTAINS ALL`: Field must contain all specified values
- `CONTAINS ANY`: Field must contain at least one specified value
- `CONTAINS NONE`: Field must not contain any specified values

## Examples

### Basic Query
```sql
SELECT campaign.id, campaign.name, metrics.clicks
FROM campaign
WHERE metrics.impressions > 100
```

### Query with Multiple Conditions
```sql
SELECT ad_group.id, ad_group.name, metrics.cost_per_click
FROM ad_group
WHERE campaign.id = 123456789
  AND ad_group.status = 'ENABLED'
  AND metrics.clicks > 10
```

### Query with Date Range
```sql
SELECT campaign.name, metrics.clicks, metrics.impressions
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.clicks DESC
LIMIT 10
```

### Query with REGEXP_MATCH
```sql
SELECT campaign.name
FROM campaign
WHERE campaign.name REGEXP_MATCH '(?i).*promotion.*'
```

### Query with IN Operator
```sql
SELECT campaign.id, campaign.name
FROM campaign
WHERE campaign.status IN ('ENABLED', 'PAUSED')
```

### Query with CONTAINS
```sql
SELECT ad_group_ad.ad.id
FROM ad_group_ad
WHERE ad_group_ad.ad.final_urls CONTAINS ANY ('example.com', 'test.com')
```

## Grammar Limitations

1. **Case Sensitivity**: Keywords are case-insensitive, but field names and enum values are case-sensitive
2. **Comment Support**: GAQL does not support comments
3. **Subqueries**: Not supported
4. **Joins**: Not supported (use resource references instead)
5. **Aggregations**: Limited to predefined metrics
6. **Wildcards**: Not supported in SELECT clause (must specify exact fields)

## Resource-Specific Considerations

- Each resource has its own set of available fields
- Not all fields can be selected together (check compatibility)
- Some fields are only available with specific segmentation
- Metrics often require date segmentation

## Performance Tips

1. Always specify only the fields you need
2. Use WHERE clauses to filter data at the API level
3. Use LIMIT to restrict result set size
4. Be aware of rate limits and quota usage
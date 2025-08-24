# GAQL Query Cookbook

> **Source**:
> [Google Ads API Documentation - Query Cookbook](https://developers.google.com/google-ads/api/docs/query/cookbook)
>
> **API Version**: This documentation is current as of Google Ads API v20

## Overview

This cookbook provides practical GAQL (Google Ads Query Language) query examples that replicate
common data views from the Google Ads UI. These queries demonstrate how to retrieve various types of
advertising data and serve as templates for building your own queries.

## Table of Contents

- [Campaign Queries](#campaign-queries)
- [Ad Group Queries](#ad-group-queries)
- [Ad Queries](#ad-queries)
- [Keyword Queries](#keyword-queries)
- [Search Terms Queries](#search-terms-queries)
- [Audience Queries](#audience-queries)
- [Demographic Queries](#demographic-queries)
- [Location Queries](#location-queries)
- [Geographic Constants](#geographic-constants)

## Campaign Queries

### Basic Campaign Performance

Retrieves campaign performance metrics for the last 7 days:

```sql
SELECT
  campaign.name,
  campaign_budget.amount_micros,
  campaign.status,
  campaign.advertising_channel_type,
  metrics.clicks,
  metrics.impressions,
  metrics.ctr,
  metrics.average_cpc,
  metrics.cost_micros
FROM campaign
WHERE segments.date DURING LAST_7_DAYS
  AND campaign.status != 'REMOVED'
ORDER BY metrics.impressions DESC
```

### Campaign with Conversion Metrics

```sql
SELECT
  campaign.name,
  metrics.conversions,
  metrics.conversion_rate,
  metrics.cost_per_conversion,
  metrics.conversion_value
FROM campaign
WHERE segments.date DURING LAST_7_DAYS
  AND metrics.conversions > 0
```

## Ad Group Queries

### Ad Group Performance

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group.status,
  metrics.clicks,
  metrics.impressions,
  metrics.ctr,
  metrics.average_cpc
FROM ad_group
WHERE segments.date DURING LAST_7_DAYS
  AND ad_group.status = 'ENABLED'
ORDER BY metrics.clicks DESC
```

### Ad Groups with Quality Score

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_criterion.quality_info.quality_score,
  metrics.impressions,
  metrics.clicks
FROM keyword_view
WHERE segments.date DURING LAST_7_DAYS
  AND ad_group_criterion.quality_info.quality_score IS NOT NULL
```

## Ad Queries

### Expanded Text Ads Performance

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_ad.ad.expanded_text_ad.headline_part1,
  ad_group_ad.ad.expanded_text_ad.headline_part2,
  ad_group_ad.ad.expanded_text_ad.description,
  ad_group_ad.status,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr
FROM ad_group_ad
WHERE segments.date DURING LAST_7_DAYS
  AND ad_group_ad.ad.type = 'EXPANDED_TEXT_AD'
  AND ad_group_ad.status = 'ENABLED'
```

### Responsive Search Ads

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_ad.ad.responsive_search_ad.headlines,
  ad_group_ad.ad.responsive_search_ad.descriptions,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions
FROM ad_group_ad
WHERE segments.date DURING LAST_7_DAYS
  AND ad_group_ad.ad.type = 'RESPONSIVE_SEARCH_AD'
```

## Keyword Queries

### Search Keywords Performance

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_criterion.keyword.text,
  ad_group_criterion.keyword.match_type,
  ad_group_criterion.status,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.average_cpc
FROM keyword_view
WHERE segments.date DURING LAST_7_DAYS
  AND ad_group_criterion.type = 'KEYWORD'
ORDER BY metrics.impressions DESC
```

### Keywords with Quality Score

```sql
SELECT
  ad_group_criterion.keyword.text,
  ad_group_criterion.quality_info.quality_score,
  ad_group_criterion.quality_info.creative_quality_score,
  ad_group_criterion.quality_info.landing_page_quality_score,
  ad_group_criterion.quality_info.expected_clickthrough_rate,
  metrics.impressions
FROM keyword_view
WHERE segments.date DURING LAST_7_DAYS
  AND ad_group_criterion.quality_info.quality_score IS NOT NULL
```

## Search Terms Queries

### Search Terms Report

```sql
SELECT
  campaign.name,
  ad_group.name,
  search_term_view.search_term,
  metrics.impressions,
  metrics.clicks,
  metrics.ctr,
  metrics.average_cpc,
  metrics.conversions
FROM search_term_view
WHERE segments.date DURING LAST_7_DAYS
ORDER BY metrics.impressions DESC
```

### Search Terms by Match Type

```sql
SELECT
  search_term_view.search_term,
  ad_group_criterion.keyword.text,
  ad_group_criterion.keyword.match_type,
  metrics.impressions,
  metrics.clicks
FROM search_term_view
WHERE segments.date DURING LAST_7_DAYS
  AND metrics.clicks > 0
```

## Audience Queries

### Audience Performance

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_criterion.user_list.name,
  ad_group_criterion.status,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.cost_micros
FROM audience
WHERE segments.date DURING LAST_7_DAYS
ORDER BY metrics.conversions DESC
```

### In-Market Audiences

```sql
SELECT
  campaign.name,
  ad_group_criterion.user_interest.name,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions
FROM audience
WHERE segments.date DURING LAST_7_DAYS
  AND ad_group_criterion.type = 'USER_INTEREST'
```

## Demographic Queries

### Age Range Performance

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_criterion.age_range.type,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.cost_micros
FROM age_range_view
WHERE segments.date DURING LAST_7_DAYS
ORDER BY metrics.conversions DESC
```

### Gender Performance

```sql
SELECT
  campaign.name,
  ad_group.name,
  ad_group_criterion.gender.type,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions,
  metrics.conversion_rate
FROM gender_view
WHERE segments.date DURING LAST_7_DAYS
```

### Combined Demographics

```sql
SELECT
  ad_group_criterion.age_range.type,
  ad_group_criterion.gender.type,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions
FROM demographic_combination_view
WHERE segments.date DURING LAST_7_DAYS
  AND metrics.impressions > 100
```

## Location Queries

### Geographic Performance

```sql
SELECT
  campaign.name,
  campaign_criterion.location.geo_target_constant,
  location_view.location_type,
  metrics.impressions,
  metrics.clicks,
  metrics.conversions
FROM location_view
WHERE segments.date DURING LAST_7_DAYS
ORDER BY metrics.impressions DESC
```

### Location with Distance

```sql
SELECT
  campaign.name,
  campaign_criterion.proximity.geo_point.longitude_in_micro_degrees,
  campaign_criterion.proximity.geo_point.latitude_in_micro_degrees,
  campaign_criterion.proximity.radius,
  campaign_criterion.proximity.radius_units,
  metrics.impressions
FROM proximity
WHERE segments.date DURING LAST_7_DAYS
```

## Geographic Constants

### Look Up Geo Constants by Resource Name

```sql
SELECT
  geo_target_constant.canonical_name,
  geo_target_constant.country_code,
  geo_target_constant.name,
  geo_target_constant.target_type
FROM geo_target_constant
WHERE geo_target_constant.resource_name = 'geoTargetConstants/1014221'
```

### Search Geo Constants by Name

```sql
SELECT
  geo_target_constant.canonical_name,
  geo_target_constant.country_code,
  geo_target_constant.id,
  geo_target_constant.name,
  geo_target_constant.status,
  geo_target_constant.target_type
FROM geo_target_constant
WHERE geo_target_constant.name LIKE '%New York%'
  AND geo_target_constant.status = 'ENABLED'
```

## Query Best Practices

### 1. Date Ranges

- Use `DURING LAST_7_DAYS` for recent data
- Use `DURING LAST_30_DAYS` for monthly views
- Use specific date ranges: `BETWEEN '2024-01-01' AND '2024-01-31'`

### 2. Status Filtering

- Always filter out removed entities: `AND campaign.status != 'REMOVED'`
- Focus on enabled entities for active performance: `AND ad_group.status = 'ENABLED'`

### 3. Performance Optimization

- Use `LIMIT` to restrict result size
- Order by relevant metrics: `ORDER BY metrics.impressions DESC`
- Filter early to reduce data processing

### 4. Metric Aggregation

- Metrics are automatically aggregated based on selected dimensions
- Include `segments.date` for daily breakdowns
- Remove date segments for total period aggregation

### 5. NULL Handling

- Check for NULL values: `WHERE ad_group_criterion.quality_info.quality_score IS NOT NULL`
- Use COALESCE for default values when needed

## Common Patterns

### Filtering by Performance Thresholds

```sql
WHERE metrics.impressions > 1000
  AND metrics.clicks > 0
  AND metrics.ctr > 0.02
```

### Calculating Derived Metrics

```sql
SELECT
  campaign.name,
  metrics.cost_micros / 1000000.0 as cost,
  metrics.conversions,
  (metrics.cost_micros / 1000000.0) / NULLIF(metrics.conversions, 0) as cost_per_conversion
FROM campaign
```

### Multi-Level Grouping

```sql
SELECT
  campaign.name,
  ad_group.name,
  segments.device,
  SUM(metrics.impressions) as total_impressions
FROM ad_group
WHERE segments.date DURING LAST_7_DAYS
GROUP BY campaign.name, ad_group.name, segments.device
```

## Tips for Query Builder Implementation

1. **Resource Selection**: Start with the appropriate resource (campaign, ad_group, keyword_view,
   etc.)
2. **Field Selection**: Only select fields that exist on the chosen resource
3. **Proper Joins**: GAQL handles joins implicitly through field selection
4. **Metric Availability**: Not all metrics are available for all resources
5. **Segmentation**: Add segments for more granular data breakdowns

import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';

describe('GaqlBuilder - WHERE Clause', () => {
  describe('Basic comparison operators', () => {
    it('should build query with equals operator', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .where('campaign.status', '=', 'ENABLED')
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE campaign.status = 'ENABLED'");
    });

    it('should build query with not equals operator', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .where('campaign.status', '!=', 'REMOVED')
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE campaign.status != 'REMOVED'");
    });

    it('should build query with greater than operator', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .where('metrics.clicks', '>', 100)
        .build();
      
      expect(query).toBe('SELECT campaign.name FROM campaign WHERE metrics.clicks > 100');
    });

    it('should build query with greater than or equal operator', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .where('metrics.impressions', '>=', 1000)
        .build();
      
      expect(query).toBe('SELECT campaign.name FROM campaign WHERE metrics.impressions >= 1000');
    });

    it('should build query with less than operator', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .where('metrics.cost_micros', '<', 5000000)
        .build();
      
      expect(query).toBe('SELECT campaign.name FROM campaign WHERE metrics.cost_micros < 5000000');
    });

    it('should build query with less than or equal operator', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .where('metrics.ctr', '<=', 0.02)
        .build();
      
      expect(query).toBe('SELECT campaign.name FROM campaign WHERE metrics.ctr <= 0.02');
    });
  });

  describe('Multiple conditions with AND', () => {
    it('should build query with multiple AND conditions using andWhere', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .where('campaign.status', '=', 'ENABLED')
        .andWhere('metrics.clicks', '>', 10)
        .andWhere('metrics.impressions', '>=', 100)
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE campaign.status = 'ENABLED' AND metrics.clicks > 10 AND metrics.impressions >= 100");
    });
  });

  describe('IN and NOT IN operators', () => {
    it('should build query with IN operator', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereIn('campaign.status', ['ENABLED', 'PAUSED'])
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE campaign.status IN ('ENABLED', 'PAUSED')");
    });

    it('should build query with NOT IN operator', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereNotIn('campaign.advertising_channel_type', ['DISPLAY', 'VIDEO'])
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE campaign.advertising_channel_type NOT IN ('DISPLAY', 'VIDEO')");
    });

    it('should handle numeric values in IN clause', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereIn('campaign.id', [123, 456, 789])
        .build();
      
      expect(query).toBe('SELECT campaign.name FROM campaign WHERE campaign.id IN (123, 456, 789)');
    });
  });

  describe('LIKE and NOT LIKE operators', () => {
    it('should build query with LIKE operator', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereLike('campaign.name', '%Brand%')
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE campaign.name LIKE '%Brand%'");
    });

    it('should build query with NOT LIKE operator', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereNotLike('campaign.name', 'Test%')
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE campaign.name NOT LIKE 'Test%'");
    });
  });

  describe('NULL checks', () => {
    it('should build query with IS NULL', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereNull('campaign.end_date')
        .build();
      
      expect(query).toBe('SELECT campaign.name FROM campaign WHERE campaign.end_date IS NULL');
    });

    it('should build query with IS NOT NULL', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereNotNull('campaign.start_date')
        .build();
      
      expect(query).toBe('SELECT campaign.name FROM campaign WHERE campaign.start_date IS NOT NULL');
    });
  });

  describe('BETWEEN operator', () => {
    it('should build query with BETWEEN for numbers', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereBetween('metrics.clicks', 100, 1000)
        .build();
      
      expect(query).toBe('SELECT campaign.name FROM campaign WHERE metrics.clicks BETWEEN 100 AND 1000');
    });

    it('should build query with BETWEEN for dates', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereBetween('segments.date', '2024-01-01', '2024-01-31')
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE segments.date BETWEEN '2024-01-01' AND '2024-01-31'");
    });
  });

  describe('CONTAINS operators', () => {
    it('should build query with CONTAINS ALL', () => {
      const query = new GaqlBuilder()
        .select(['ad_group_ad.id'])
        .from('ad_group_ad')
        .whereContainsAll('ad_group_ad.ad.final_urls', ['example.com', 'test'])
        .build();
      
      expect(query).toBe("SELECT ad_group_ad.id FROM ad_group_ad WHERE ad_group_ad.ad.final_urls CONTAINS ALL ('example.com', 'test')");
    });

    it('should build query with CONTAINS ANY', () => {
      const query = new GaqlBuilder()
        .select(['ad_group_ad.id'])
        .from('ad_group_ad')
        .whereContainsAny('ad_group_ad.ad.final_urls', ['example.com', 'sample.com'])
        .build();
      
      expect(query).toBe("SELECT ad_group_ad.id FROM ad_group_ad WHERE ad_group_ad.ad.final_urls CONTAINS ANY ('example.com', 'sample.com')");
    });

    it('should build query with CONTAINS NONE', () => {
      const query = new GaqlBuilder()
        .select(['ad_group_ad.id'])
        .from('ad_group_ad')
        .whereContainsNone('ad_group_ad.ad.final_urls', ['blocked.com', 'spam.com'])
        .build();
      
      expect(query).toBe("SELECT ad_group_ad.id FROM ad_group_ad WHERE ad_group_ad.ad.final_urls CONTAINS NONE ('blocked.com', 'spam.com')");
    });
  });

  describe('Date range with DURING', () => {
    it('should build query with predefined date range', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.clicks'])
        .from('campaign')
        .whereDuring('segments.date', 'LAST_30_DAYS')
        .build();
      
      expect(query).toBe('SELECT campaign.name, metrics.clicks FROM campaign WHERE segments.date DURING LAST_30_DAYS');
    });

    it('should handle various predefined date ranges', () => {
      const dateRanges = [
        'TODAY',
        'YESTERDAY', 
        'LAST_7_DAYS',
        'LAST_14_DAYS',
        'LAST_30_DAYS',
        'LAST_BUSINESS_WEEK',
        'LAST_MONTH',
        'THIS_MONTH',
        'ALL_TIME'
      ];

      dateRanges.forEach(range => {
        const query = new GaqlBuilder()
          .select(['metrics.clicks'])
          .from('campaign')
          .whereDuring('segments.date', range)
          .build();
        
        expect(query).toBe(`SELECT metrics.clicks FROM campaign WHERE segments.date DURING ${range}`);
      });
    });
  });

  describe('Regular expression matching', () => {
    it('should build query with REGEXP_MATCH', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereRegexpMatch('campaign.name', '(?i).*promotion.*')
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE campaign.name REGEXP_MATCH '(?i).*promotion.*'");
    });

    it('should build query with NOT REGEXP_MATCH', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereNotRegexpMatch('campaign.name', '^Test')
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE campaign.name NOT REGEXP_MATCH '^Test'");
    });
  });

  describe('Complex WHERE conditions', () => {
    it('should build query with mixed condition types', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.clicks'])
        .from('campaign')
        .where('campaign.status', '=', 'ENABLED')
        .andWhere('metrics.impressions', '>', 1000)
        .whereIn('campaign.advertising_channel_type', ['SEARCH', 'SHOPPING'])
        .whereLike('campaign.name', '%Brand%')
        .whereNotNull('campaign.start_date')
        .whereDuring('segments.date', 'LAST_7_DAYS')
        .build();
      
      expect(query).toBe(
        "SELECT campaign.name, metrics.clicks FROM campaign " +
        "WHERE campaign.status = 'ENABLED' " +
        "AND metrics.impressions > 1000 " +
        "AND campaign.advertising_channel_type IN ('SEARCH', 'SHOPPING') " +
        "AND campaign.name LIKE '%Brand%' " +
        "AND campaign.start_date IS NOT NULL " +
        "AND segments.date DURING LAST_7_DAYS"
      );
    });
  });

  describe('Boolean value handling', () => {
    it('should handle boolean true value', () => {
      const query = new GaqlBuilder()
        .select(['ad_group_criterion.keyword.text'])
        .from('ad_group_criterion')
        .where('ad_group_criterion.negative', '=', true)
        .build();
      
      expect(query).toBe('SELECT ad_group_criterion.keyword.text FROM ad_group_criterion WHERE ad_group_criterion.negative = TRUE');
    });

    it('should handle boolean false value', () => {
      const query = new GaqlBuilder()
        .select(['ad_group_criterion.keyword.text'])
        .from('ad_group_criterion')
        .where('ad_group_criterion.negative', '=', false)
        .build();
      
      expect(query).toBe('SELECT ad_group_criterion.keyword.text FROM ad_group_criterion WHERE ad_group_criterion.negative = FALSE');
    });
  });

  describe('Error handling', () => {
    it('should throw error for invalid operator', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .where('campaign.status', 'INVALID', 'ENABLED')
          .build();
      }).toThrow('Invalid operator: INVALID');
    });

    it('should throw error for empty IN list', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .whereIn('campaign.status', [])
          .build();
      }).toThrow('IN clause requires at least one value');
    });
  });
});
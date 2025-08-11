import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';

describe('GaqlBuilder - Security', () => {
  describe('SQL injection prevention', () => {
    it('should properly escape single quotes in string values', () => {
      const query = new GaqlBuilder()
        .select(['name'])
        .from('campaign')
        .where('name', '=', "O'Reilly's Campaign")
        .build();
      expect(query).toContain("'O''Reilly''s Campaign'");
    });

    it('should reject field names with special characters to prevent injection', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['field"; DROP TABLE campaign; --'])
          .from('campaign')
          .build();
      }).toThrow('Invalid field name. Expected: alphanumeric with dots/underscores or aggregate function, Received: "field"; DROP TABLE campaign; --"');
    });

    it('should safely handle extremely long strings', () => {
      const longString = 'a'.repeat(10000);
      const query = new GaqlBuilder()
        .select(['name'])
        .from('campaign')
        .where('name', '=', longString)
        .build();
      expect(query).toContain(`'${longString}'`);
    });
  });

  describe('Parameter injection prevention', () => {
    it('should reject malicious parameter names', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['name'])
          .from('campaign')
          .where('name', '=', ':param')
          .parameters({ 'param"; DROP TABLE': 'value' })
          .build();
      }).toThrow('Invalid parameter name. Expected: alphanumeric with underscores only, Received: "param"; DROP TABLE"');
    });
  });

  describe('Pattern injection prevention', () => {
    it('should escape single quotes in LIKE patterns', () => {
      const query = new GaqlBuilder()
        .select(['name'])
        .from('campaign')
        .whereLike('name', "Brand's %")
        .build();
      expect(query).toContain("LIKE 'Brand''s %'");
    });

    it('should escape single quotes in NOT LIKE patterns', () => {
      const query = new GaqlBuilder()
        .select(['name'])
        .from('campaign')
        .whereNotLike('name', "Test' OR '1'='1")
        .build();
      expect(query).toContain("NOT LIKE 'Test'' OR ''1''=''1'");
    });

    it('should escape single quotes in REGEXP_MATCH patterns', () => {
      const query = new GaqlBuilder()
        .select(['name'])
        .from('campaign')
        .whereRegexpMatch('name', "(?i).*'; DROP TABLE--")
        .build();
      expect(query).toContain("REGEXP_MATCH '(?i).*''; DROP TABLE--'");
    });
  });

  describe('Resource name validation', () => {
    it('should reject malicious resource names', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('campaign; DROP TABLE users')
          .build();
      }).toThrow('Invalid resource name. Expected: alphanumeric with underscores only, Received: "campaign; DROP TABLE users"');
    });

    it('should reject resource names with special characters', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('campaign.subcampaign')
          .build();
      }).toThrow('Invalid resource name. Expected: alphanumeric with underscores only, Received: "campaign.subcampaign"');
    });
  });

  describe('Field name validation in WHERE methods', () => {
    it('should reject malicious field names in whereIn', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('campaign')
          .whereIn('id; DROP TABLE', [1, 2, 3])
          .build();
      }).toThrow('Invalid field name. Expected: alphanumeric with dots/underscores or aggregate function, Received: "id; DROP TABLE"');
    });

    it('should reject malicious field names in whereLike', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('campaign')
          .whereLike('name"; DELETE FROM', '%test%')
          .build();
      }).toThrow('Invalid field name. Expected: alphanumeric with dots/underscores or aggregate function, Received: "name"; DELETE FROM"');
    });

    it('should reject malicious field names in whereNull', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('campaign')
          .whereNull('end_date; --')
          .build();
      }).toThrow('Invalid field name. Expected: alphanumeric with dots/underscores or aggregate function, Received:');
    });

    it('should reject malicious field names in whereBetween', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('campaign')
          .whereBetween('metrics.clicks"; DROP TABLE', 1, 100)
          .build();
      }).toThrow('Invalid field name. Expected: alphanumeric with dots/underscores or aggregate function, Received: "metrics.clicks"; DROP TABLE"');
    });

    it('should reject malicious field names in whereContainsAny', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('ad_group_ad')
          .whereContainsAny('urls; DROP TABLE', ['example.com'])
          .build();
      }).toThrow('Invalid field name. Expected: alphanumeric with dots/underscores or aggregate function, Received:');
    });

    it('should reject malicious field names in whereDuring', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('campaign')
          .whereDuring('date; DROP TABLE', 'LAST_7_DAYS')
          .build();
      }).toThrow('Invalid field name. Expected: alphanumeric with dots/underscores or aggregate function, Received:');
    });

    it('should reject malicious field names in whereRegexpMatch', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('campaign')
          .whereRegexpMatch('name; DROP TABLE', '.*test.*')
          .build();
      }).toThrow('Invalid field name. Expected: alphanumeric with dots/underscores or aggregate function, Received:');
    });
  });

  describe('Date range validation', () => {
    it('should reject malicious date range values', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('campaign')
          .whereDuring('segments.date', 'LAST_7_DAYS; DROP TABLE')
          .build();
      }).toThrow('Invalid date range. Expected one of: TODAY, YESTERDAY, LAST_7_DAYS, LAST_14_DAYS, LAST_30_DAYS, LAST_BUSINESS_WEEK, LAST_WEEK_SUN_SAT, LAST_WEEK_MON_SUN, THIS_MONTH, LAST_MONTH, ALL_TIME, or date in YYYY-MM-DD format, Received: "LAST_7_DAYS; DROP TABLE"');
    });

    it('should reject invalid date range values', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['id'])
          .from('campaign')
          .whereDuring('segments.date', 'INVALID_RANGE')
          .build();
      }).toThrow('Invalid date range. Expected one of: TODAY, YESTERDAY, LAST_7_DAYS, LAST_14_DAYS, LAST_30_DAYS, LAST_BUSINESS_WEEK, LAST_WEEK_SUN_SAT, LAST_WEEK_MON_SUN, THIS_MONTH, LAST_MONTH, ALL_TIME, or date in YYYY-MM-DD format, Received: "INVALID_RANGE"');
    });

    it('should accept valid date range values', () => {
      const query = new GaqlBuilder()
        .select(['id'])
        .from('campaign')
        .whereDuring('segments.date', 'LAST_30_DAYS')
        .build();
      expect(query).toBe('SELECT id FROM campaign WHERE segments.date DURING LAST_30_DAYS');
    });
  });
});
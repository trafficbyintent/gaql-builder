import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';

describe('GaqlBuilder - Additional Clauses', () => {
  describe('GROUP BY clause', () => {
    it('should build query with GROUP BY single field', () => {
      const query = new GaqlBuilder()
        .select(['campaign.id', 'SUM(metrics.clicks)'])
        .from('campaign')
        .groupBy(['campaign.id'])
        .build();

      expect(query).toBe(
        'SELECT campaign.id, SUM(metrics.clicks) FROM campaign GROUP BY campaign.id',
      );
    });

    it('should build query with GROUP BY multiple fields', () => {
      const query = new GaqlBuilder()
        .select(['campaign.id', 'ad_group.id', 'SUM(metrics.impressions)'])
        .from('campaign')
        .groupBy(['campaign.id', 'ad_group.id'])
        .build();

      expect(query).toBe(
        'SELECT campaign.id, ad_group.id, SUM(metrics.impressions) FROM campaign GROUP BY campaign.id, ad_group.id',
      );
    });

    it('should throw error for empty GROUP BY', () => {
      expect(() => {
        new GaqlBuilder().select(['campaign.id']).from('campaign').groupBy([]).build();
      }).toThrow(
        'GROUP BY clause requires at least one field. Expected: non-empty array, Received: empty array',
      );
    });
  });

  describe('ORDER BY clause', () => {
    it('should build query with ORDER BY single field ascending', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.clicks'])
        .from('campaign')
        .orderBy('metrics.clicks', 'ASC')
        .build();

      expect(query).toBe(
        'SELECT campaign.name, metrics.clicks FROM campaign ORDER BY metrics.clicks ASC',
      );
    });

    it('should build query with ORDER BY single field descending', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.impressions'])
        .from('campaign')
        .orderBy('metrics.impressions', 'DESC')
        .build();

      expect(query).toBe(
        'SELECT campaign.name, metrics.impressions FROM campaign ORDER BY metrics.impressions DESC',
      );
    });

    it('should default to ASC when direction not specified', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .orderBy('campaign.name')
        .build();

      expect(query).toBe('SELECT campaign.name FROM campaign ORDER BY campaign.name ASC');
    });

    it('should support multiple ORDER BY fields', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.clicks', 'metrics.impressions'])
        .from('campaign')
        .orderBy('metrics.clicks', 'DESC')
        .orderBy('metrics.impressions', 'DESC')
        .orderBy('campaign.name', 'ASC')
        .build();

      expect(query).toBe(
        'SELECT campaign.name, metrics.clicks, metrics.impressions FROM campaign ORDER BY metrics.clicks DESC, metrics.impressions DESC, campaign.name ASC',
      );
    });

    it('should handle ORDER BY with WHERE clause', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.clicks'])
        .from('campaign')
        .where('campaign.status', '=', 'ENABLED')
        .orderBy('metrics.clicks', 'DESC')
        .build();

      expect(query).toBe(
        "SELECT campaign.name, metrics.clicks FROM campaign WHERE campaign.status = 'ENABLED' ORDER BY metrics.clicks DESC",
      );
    });
  });

  describe('LIMIT clause', () => {
    it('should build query with LIMIT', () => {
      const query = new GaqlBuilder().select(['campaign.name']).from('campaign').limit(10).build();

      expect(query).toBe('SELECT campaign.name FROM campaign LIMIT 10');
    });

    it('should handle LIMIT with WHERE and ORDER BY', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.clicks'])
        .from('campaign')
        .where('campaign.status', '=', 'ENABLED')
        .orderBy('metrics.clicks', 'DESC')
        .limit(5)
        .build();

      expect(query).toBe(
        "SELECT campaign.name, metrics.clicks FROM campaign WHERE campaign.status = 'ENABLED' ORDER BY metrics.clicks DESC LIMIT 5",
      );
    });

    it('should throw error for zero limit', () => {
      expect(() => {
        new GaqlBuilder().select(['campaign.name']).from('campaign').limit(0).build();
      }).toThrow('LIMIT must be a positive integer. Expected: positive integer, Received: ');
    });

    it('should throw error for negative limit', () => {
      expect(() => {
        new GaqlBuilder().select(['campaign.name']).from('campaign').limit(-5).build();
      }).toThrow('LIMIT must be a positive integer. Expected: positive integer, Received: ');
    });

    it('should throw error for non-integer limit', () => {
      expect(() => {
        new GaqlBuilder().select(['campaign.name']).from('campaign').limit(3.14).build();
      }).toThrow('LIMIT must be a positive integer. Expected: positive integer, Received: ');
    });

    it('should handle large limit values', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .limit(10000)
        .build();

      expect(query).toBe('SELECT campaign.name FROM campaign LIMIT 10000');
    });
  });

  describe('PARAMETERS clause', () => {
    it('should build query with single parameter', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .parameters({ include_drafts: true })
        .build();

      expect(query).toBe('SELECT campaign.name FROM campaign PARAMETERS include_drafts = true');
    });

    it('should build query with multiple parameters', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .parameters({
          include_drafts: true,
          omit_unselected_resource_names: false,
        })
        .build();

      expect(query).toBe(
        'SELECT campaign.name FROM campaign PARAMETERS include_drafts = true, omit_unselected_resource_names = false',
      );
    });

    it('should handle PARAMETERS with all other clauses', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.clicks'])
        .from('campaign')
        .where('campaign.status', '=', 'ENABLED')
        .orderBy('metrics.clicks', 'DESC')
        .limit(10)
        .parameters({ include_drafts: true })
        .build();

      expect(query).toBe(
        "SELECT campaign.name, metrics.clicks FROM campaign WHERE campaign.status = 'ENABLED' ORDER BY metrics.clicks DESC LIMIT 10 PARAMETERS include_drafts = true",
      );
    });

    it('should handle boolean parameter values', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .parameters({
          include_drafts: false,
          omit_unselected_resource_names: true,
        })
        .build();

      expect(query).toBe(
        'SELECT campaign.name FROM campaign PARAMETERS include_drafts = false, omit_unselected_resource_names = true',
      );
    });

    it('should throw error for empty parameters', () => {
      expect(() => {
        new GaqlBuilder().select(['campaign.name']).from('campaign').parameters({}).build();
      }).toThrow('PARAMETERS clause requires at least one parameter');
    });
  });

  describe('Complete query with all clauses', () => {
    it('should build complex query with all supported clauses in correct order', () => {
      const query = new GaqlBuilder()
        .select([
          'campaign.name',
          'campaign.status',
          'metrics.clicks',
          'metrics.impressions',
          'metrics.ctr',
        ])
        .from('campaign')
        .where('campaign.status', '=', 'ENABLED')
        .andWhere('metrics.impressions', '>', 1000)
        .whereIn('campaign.advertising_channel_type', ['SEARCH', 'DISPLAY'])
        .whereDuring('segments.date', 'LAST_30_DAYS')
        .orderBy('metrics.clicks', 'DESC')
        .orderBy('campaign.name', 'ASC')
        .limit(50)
        .parameters({
          include_drafts: false,
          omit_unselected_resource_names: true,
        })
        .build();

      expect(query).toBe(
        'SELECT campaign.name, campaign.status, metrics.clicks, metrics.impressions, metrics.ctr ' +
          'FROM campaign ' +
          "WHERE campaign.status = 'ENABLED' " +
          'AND metrics.impressions > 1000 ' +
          "AND campaign.advertising_channel_type IN ('SEARCH', 'DISPLAY') " +
          'AND segments.date DURING LAST_30_DAYS ' +
          'ORDER BY metrics.clicks DESC, campaign.name ASC ' +
          'LIMIT 50 ' +
          'PARAMETERS include_drafts = false, omit_unselected_resource_names = true',
      );
    });

    it('should maintain clause order regardless of method call order', () => {
      const query = new GaqlBuilder()
        .limit(25)
        .parameters({ include_drafts: true })
        .from('ad_group')
        .orderBy('metrics.cost_micros', 'DESC')
        .where('ad_group.status', '=', 'ENABLED')
        .select(['ad_group.name', 'metrics.cost_micros'])
        .build();

      expect(query).toBe(
        'SELECT ad_group.name, metrics.cost_micros ' +
          'FROM ad_group ' +
          "WHERE ad_group.status = 'ENABLED' " +
          'ORDER BY metrics.cost_micros DESC ' +
          'LIMIT 25 ' +
          'PARAMETERS include_drafts = true',
      );
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle ORDER BY without sortable fields gracefully', () => {
      const query = new GaqlBuilder()
        .select(['campaign.resource_name'])
        .from('campaign')
        .orderBy('campaign.resource_name', 'ASC')
        .build();

      expect(query).toBe(
        'SELECT campaign.resource_name FROM campaign ORDER BY campaign.resource_name ASC',
      );
    });

    it('should allow multiple calls to limit (last one wins)', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .limit(100)
        .limit(50)
        .limit(25)
        .build();

      expect(query).toBe('SELECT campaign.name FROM campaign LIMIT 25');
    });

    it('should allow multiple calls to parameters (last one wins)', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .parameters({ include_drafts: true })
        .parameters({ include_drafts: false, omit_unselected_resource_names: true })
        .build();

      expect(query).toBe(
        'SELECT campaign.name FROM campaign PARAMETERS include_drafts = false, omit_unselected_resource_names = true',
      );
    });

    it('should throw error for invalid ORDER BY direction', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .orderBy('campaign.name', 'INVALID' as any)
          .build();
      }).toThrow('ORDER BY direction invalid. Expected: ASC or DESC');
    });
  });
});

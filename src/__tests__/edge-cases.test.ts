import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';

describe('GaqlBuilder - Edge Cases', () => {
  describe('Empty array error handling', () => {
    it('should throw error for empty CONTAINS ALL list', () => {
      expect(() => {
        new GaqlBuilder().select(['field']).from('resource').whereContainsAll('field', []).build();
      }).toThrow(
        'CONTAINS ALL clause requires at least one value. Expected: non-empty array, Received: empty array for field',
      );
    });

    it('should throw error for empty CONTAINS ANY list', () => {
      expect(() => {
        new GaqlBuilder().select(['field']).from('resource').whereContainsAny('field', []).build();
      }).toThrow(
        'CONTAINS ANY clause requires at least one value. Expected: non-empty array, Received: empty array for field',
      );
    });

    it('should throw error for empty CONTAINS NONE list', () => {
      expect(() => {
        new GaqlBuilder().select(['field']).from('resource').whereContainsNone('field', []).build();
      }).toThrow(
        'CONTAINS NONE clause requires at least one value. Expected: non-empty array, Received: empty array for field',
      );
    });

    it('should throw error for empty IN list', () => {
      expect(() => {
        new GaqlBuilder().select(['field']).from('resource').whereIn('field', []).build();
      }).toThrow(
        'IN clause requires at least one value. Expected: non-empty array, Received: empty array for field',
      );
    });

    it('should throw error for empty NOT IN list', () => {
      expect(() => {
        new GaqlBuilder().select(['field']).from('resource').whereNotIn('field', []).build();
      }).toThrow(
        'NOT IN clause requires at least one value. Expected: non-empty array, Received: empty array for field',
      );
    });
  });

  describe('NULL value handling', () => {
    it('should handle null values in WHERE conditions', () => {
      const query = new GaqlBuilder()
        .select(['campaign.end_date'])
        .from('campaign')
        .where('campaign.end_date', '=', null)
        .build();

      expect(query).toBe('SELECT campaign.end_date FROM campaign WHERE campaign.end_date = NULL');
    });

    it('should handle null values in whereIn clause', () => {
      /* Testing a realistic scenario where we check for resources with no value */
      const query = new GaqlBuilder()
        .select(['campaign.budget_id'])
        .from('campaign')
        .whereIn('campaign.budget_id', [null])
        .build();

      expect(query).toBe(
        'SELECT campaign.budget_id FROM campaign WHERE campaign.budget_id IN (NULL)',
      );
    });
  });

  describe('Parameter value formatting', () => {
    it('should handle string parameter values without quotes', () => {
      /* GAQL parameters don't use quotes for string values in PARAMETERS clause */
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .parameters({
          omit_unselected_resource_names: true,
        })
        .build();

      expect(query).toBe(
        'SELECT campaign.name FROM campaign PARAMETERS omit_unselected_resource_names = true',
      );
    });

    it('should handle numeric parameter values', () => {
      /* While GAQL typically uses boolean parameters, numbers are supported */
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .parameters({
          include_drafts: false,
          metric_threshold: 100,
        })
        .build();

      expect(query).toBe(
        'SELECT campaign.name FROM campaign PARAMETERS include_drafts = false, metric_threshold = 100',
      );
    });

    it('should reject string parameter values for security', () => {
      // String values in parameters are blocked to prevent injection attacks
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .parameters({
            test_param: "string with 'quotes' and special chars" as any,
          })
          .build();
      }).toThrow(
        "Invalid parameter value type for 'test_param'. Expected: boolean or number, Received: string",
      );
    });

    it('should reject non-finite number parameter values', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .parameters({
            test_param: Infinity,
          })
          .build();
      }).toThrow(
        "Invalid parameter value for 'test_param'. Expected: finite number, Received: Infinity",
      );
    });
  });
});

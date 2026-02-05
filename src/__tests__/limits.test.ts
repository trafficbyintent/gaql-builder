import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';
import { QUERY_LIMITS } from '../constants';

describe('GaqlBuilder - Query Size Limits', () => {
  describe('SELECT field limits', () => {
    it('should reject queries exceeding maximum SELECT fields', () => {
      const fields = Array.from(
        { length: QUERY_LIMITS.MAX_SELECT_FIELDS + 1 },
        (_, i) => `field${i}`
      );

      expect(() => {
        new GaqlBuilder().select(fields).from('campaign').build();
      }).toThrow(
        `SELECT clause exceeds maximum field limit. Expected: <= ${QUERY_LIMITS.MAX_SELECT_FIELDS} fields, Received: ${fields.length} fields`
      );
    });

    it('should accept queries at maximum SELECT field limit', () => {
      const fields = Array.from({ length: QUERY_LIMITS.MAX_SELECT_FIELDS }, (_, i) => `field${i}`);

      const query = new GaqlBuilder().select(fields).from('campaign').build();

      expect(query).toBeDefined();
      expect(query).toContain('field0');
      expect(query).toContain(`field${QUERY_LIMITS.MAX_SELECT_FIELDS - 1}`);
    });
  });

  describe('WHERE condition limits', () => {
    it('should reject queries exceeding maximum WHERE conditions', () => {
      const builder = new GaqlBuilder().select(['id']).from('campaign');

      // Add conditions up to the limit
      for (let i = 0; i < QUERY_LIMITS.MAX_WHERE_CONDITIONS; i++) {
        builder.where(`field${i}`, '=', `value${i}`);
      }

      // This should throw
      expect(() => {
        builder.where('extraField', '=', 'extraValue');
      }).toThrow(
        `WHERE clause exceeds maximum condition limit. Expected: < ${QUERY_LIMITS.MAX_WHERE_CONDITIONS} conditions, Received: ${QUERY_LIMITS.MAX_WHERE_CONDITIONS} conditions`
      );
    });

    it('should accept queries at maximum WHERE condition limit', () => {
      const builder = new GaqlBuilder().select(['id']).from('campaign');

      // Add exactly the maximum number of conditions
      for (let i = 0; i < QUERY_LIMITS.MAX_WHERE_CONDITIONS; i++) {
        builder.where(`field${i}`, '=', `value${i}`);
      }

      const query = builder.build();
      expect(query).toBeDefined();
      expect(query).toContain('field0');
      expect(query).toContain(`field${QUERY_LIMITS.MAX_WHERE_CONDITIONS - 1}`);
    });
  });

  describe('Query length limits', () => {
    it('should reject queries exceeding maximum length', () => {
      // Create a query that will exceed the length limit
      // Each field name will be very long
      const longFieldName = 'a'.repeat(1000);
      const fields = Array.from({ length: 150 }, () => longFieldName);

      expect(() => {
        new GaqlBuilder().select(fields).from('campaign').build();
      }).toThrow(/Query exceeds maximum length limit/);
    });
  });

  describe('Parameter limits', () => {
    it('should reject queries exceeding maximum parameters', () => {
      const params: Record<string, boolean> = {};
      for (let i = 0; i <= QUERY_LIMITS.MAX_PARAMETERS; i++) {
        params[`param${i}`] = true;
      }

      expect(() => {
        new GaqlBuilder().select(['id']).from('campaign').parameters(params).build();
      }).toThrow(
        `PARAMETERS clause exceeds maximum parameter limit. Expected: <= ${QUERY_LIMITS.MAX_PARAMETERS} parameters, Received: ${QUERY_LIMITS.MAX_PARAMETERS + 1} parameters`
      );
    });
  });
});

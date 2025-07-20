import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';

describe('GaqlBuilder - Coverage Edge Cases', () => {
  describe('CONTAINS operators error handling', () => {
    it('should throw error for empty CONTAINS ALL list', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['field'])
          .from('resource')
          .whereContainsAll('field', [])
          .build();
      }).toThrow('CONTAINS ALL clause requires at least one value');
    });

    it('should throw error for empty CONTAINS ANY list', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['field'])
          .from('resource')
          .whereContainsAny('field', [])
          .build();
      }).toThrow('CONTAINS ANY clause requires at least one value');
    });

    it('should throw error for empty CONTAINS NONE list', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['field'])
          .from('resource')
          .whereContainsNone('field', [])
          .build();
      }).toThrow('CONTAINS NONE clause requires at least one value');
    });
  });

  describe('NULL value handling', () => {
    it('should handle null values in WHERE conditions', () => {
      const query = new GaqlBuilder()
        .select(['field'])
        .from('resource')
        .where('field', '=', null)
        .build();
      
      expect(query).toBe('SELECT field FROM resource WHERE field = NULL');
    });

    it('should handle null values in BETWEEN clause', () => {
      const query = new GaqlBuilder()
        .select(['field'])
        .from('resource')
        .whereBetween('field', null, null)
        .build();
      
      expect(query).toBe('SELECT field FROM resource WHERE field BETWEEN NULL AND NULL');
    });

    it('should handle null values in whereIn clause', () => {
      const query = new GaqlBuilder()
        .select(['field'])
        .from('resource')
        .whereIn('field', [null, 'value', null])
        .build();
      
      expect(query).toBe("SELECT field FROM resource WHERE field IN (NULL, 'value', NULL)");
    });
  });

  describe('NOT IN operator error handling', () => {
    it('should throw error for empty NOT IN list', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['field'])
          .from('resource')
          .whereNotIn('field', [])
          .build();
      }).toThrow('NOT IN clause requires at least one value');
    });
  });

  describe('Parameter value formatting', () => {
    it('should handle non-boolean parameter values', () => {
      const query = new GaqlBuilder()
        .select(['field'])
        .from('resource')
        .parameters({ 
          string_param: 'value',
          number_param: 123
        })
        .build();
      
      expect(query).toBe('SELECT field FROM resource PARAMETERS string_param = value, number_param = 123');
    });
  });
});
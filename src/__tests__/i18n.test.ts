import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';

describe('GaqlBuilder - Internationalization', () => {
  describe('Unicode character support', () => {
    it('should handle Japanese characters in values', () => {
      const query = new GaqlBuilder()
        .select(['name'])
        .from('campaign')
        .where('name', '=', 'キャンペーン')
        .build();
      expect(query).toContain("'キャンペーン'");
    });

    it('should handle Arabic characters in values', () => {
      const query = new GaqlBuilder()
        .select(['name'])
        .from('campaign')
        .where('name', '=', 'حملة إعلانية')
        .build();
      expect(query).toContain("'حملة إعلانية'");
    });

    it('should handle emoji in values', () => {
      const query = new GaqlBuilder()
        .select(['name'])
        .from('campaign')
        .where('name', '=', '🚀 Launch Campaign')
        .build();
      expect(query).toContain("'🚀 Launch Campaign'");
    });

    it('should handle mixed scripts in complex queries', () => {
      const query = new GaqlBuilder()
        .select(['name', 'status'])
        .from('campaign')
        .whereContainsAny('name', ['中文', 'العربية', 'עברית'])
        .build();
      expect(query).toContain("'中文'");
      expect(query).toContain("'العربية'");
      expect(query).toContain("'עברית'");
    });
  });
});

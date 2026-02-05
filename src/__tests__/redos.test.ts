import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';
import { isSafeRegexPattern, validateRegexPattern } from '../validators';

describe('GaqlBuilder - ReDoS Protection', () => {
  describe('Safe regex pattern validation', () => {
    it('should accept safe regex patterns', () => {
      expect(isSafeRegexPattern('test')).toBe(true);
      expect(isSafeRegexPattern('^campaign_\\d+$')).toBe(true);
      expect(isSafeRegexPattern('(?i)brand')).toBe(true);
      expect(isSafeRegexPattern('[a-zA-Z0-9]+')).toBe(true);
      expect(isSafeRegexPattern('sale|discount|offer')).toBe(true);
    });

    it('should reject patterns with excessive length', () => {
      const longPattern = 'a'.repeat(1001); // Over MAX_REGEX_LENGTH
      expect(isSafeRegexPattern(longPattern)).toBe(false);
    });

    it('should reject patterns with dangerous repetitions', () => {
      expect(isSafeRegexPattern('.*.*')).toBe(false);
      expect(isSafeRegexPattern('.+.+')).toBe(false);
      expect(isSafeRegexPattern('\\w*\\w*\\w*')).toBe(false);
      expect(isSafeRegexPattern('(.*){1000}')).toBe(false);
      expect(isSafeRegexPattern('(a+){100,}')).toBe(false);
    });

    it('should reject patterns with dangerous alternations', () => {
      expect(isSafeRegexPattern('(.*|.*)')).toBe(false);
      expect(isSafeRegexPattern('(.+|.+)')).toBe(false);
    });

    it('should reject patterns with excessive nesting', () => {
      let deepPattern = 'a';
      for (let i = 0; i < 60; i++) {
        deepPattern = `(${deepPattern})`;
      }
      expect(isSafeRegexPattern(deepPattern)).toBe(false);
    });

    it('should accept patterns with reasonable nesting', () => {
      expect(isSafeRegexPattern('(([a-z]+)_([0-9]+))')).toBe(true);
      expect(isSafeRegexPattern('((test|prod)_(v1|v2))')).toBe(true);
    });
  });

  describe('whereRegexpMatch with ReDoS protection', () => {
    it('should accept safe regex patterns', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereRegexpMatch('campaign.name', '(?i).*brand.*')
        .build();

      expect(query).toBe(
        "SELECT campaign.name FROM campaign WHERE campaign.name REGEXP_MATCH '(?i).*brand.*'"
      );
    });

    it('should reject dangerous regex patterns', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .whereRegexpMatch('campaign.name', '.*.*.*')
          .build();
      }).toThrow(/Regex pattern is potentially dangerous/);
    });

    it('should reject excessively long patterns', () => {
      const longPattern = 'a'.repeat(1001);
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .whereRegexpMatch('campaign.name', longPattern)
          .build();
      }).toThrow(/Regex pattern is potentially dangerous/);
    });

    it('should reject patterns with dangerous repetitions', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .whereRegexpMatch('campaign.name', '(a+){1000,}')
          .build();
      }).toThrow(/Regex pattern is potentially dangerous/);
    });
  });

  describe('whereNotRegexpMatch with ReDoS protection', () => {
    it('should accept safe regex patterns', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereNotRegexpMatch('campaign.name', '^test_')
        .build();

      expect(query).toBe(
        "SELECT campaign.name FROM campaign WHERE campaign.name NOT REGEXP_MATCH '^test_'"
      );
    });

    it('should reject dangerous regex patterns', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .whereNotRegexpMatch('campaign.name', '(.+|.+)')
          .build();
      }).toThrow(/Regex pattern is potentially dangerous/);
    });
  });

  describe('Complex patterns edge cases', () => {
    it('should handle escaped special characters safely', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereRegexpMatch('campaign.name', 'test\\.\\*campaign')
        .build();

      expect(query).toBe(
        "SELECT campaign.name FROM campaign WHERE campaign.name REGEXP_MATCH 'test\\.\\*campaign'"
      );
    });

    it('should handle character classes safely', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereRegexpMatch('campaign.name', '[a-zA-Z0-9_-]+')
        .build();

      expect(query).toBe(
        "SELECT campaign.name FROM campaign WHERE campaign.name REGEXP_MATCH '[a-zA-Z0-9_-]+'"
      );
    });
  });
});

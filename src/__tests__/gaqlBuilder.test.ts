import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';

describe('GaqlBuilder - Phase 1: Foundation', () => {
  describe('SELECT clause', () => {
    it('should build query with single field in SELECT clause', () => {
      const builder = new GaqlBuilder();
      const query = builder
        .select(['campaign.id'])
        .from('campaign')
        .build();
      
      expect(query).toBe('SELECT campaign.id FROM campaign');
    });

    it('should build query with multiple fields in SELECT clause', () => {
      const builder = new GaqlBuilder();
      const query = builder
        .select(['campaign.id', 'campaign.name', 'campaign.status'])
        .from('campaign')
        .build();
      
      expect(query).toBe('SELECT campaign.id, campaign.name, campaign.status FROM campaign');
    });

    it('should handle SELECT with no fields as an error', () => {
      const builder = new GaqlBuilder();
      
      expect(() => {
        builder.select([]).from('campaign').build();
      }).toThrow('SELECT clause requires at least one field. Expected: non-empty array, Received: empty array');
    });
  });

  describe('FROM clause', () => {
    it('should build query with FROM clause specifying resource', () => {
      const builder = new GaqlBuilder();
      const query = builder
        .select(['ad_group.id'])
        .from('ad_group')
        .build();
      
      expect(query).toBe('SELECT ad_group.id FROM ad_group');
    });

    it('should handle missing FROM clause as an error', () => {
      const builder = new GaqlBuilder();
      
      expect(() => {
        builder.select(['campaign.id']).build();
      }).toThrow('FROM clause is required. Expected: resource name, Received: empty resource');
    });

    it('should handle empty FROM clause as an error', () => {
      const builder = new GaqlBuilder();
      
      expect(() => {
        builder.select(['campaign.id']).from('').build();
      }).toThrow('FROM clause requires a resource. Expected: non-empty string, Received: ""');
    });
  });

  describe('Complete minimal query', () => {
    it('should build complete minimal query with SELECT and FROM', () => {
      const builder = new GaqlBuilder();
      const query = builder
        .select(['campaign.id', 'campaign.name'])
        .from('campaign')
        .build();
      
      expect(query).toBe('SELECT campaign.id, campaign.name FROM campaign');
    });

    it('should handle missing SELECT clause as an error', () => {
      const builder = new GaqlBuilder();
      
      expect(() => {
        builder.from('campaign').build();
      }).toThrow('SELECT clause is required. Expected: at least one field selected, Received: no fields selected');
    });
  });

  describe('Query builder chaining', () => {
    it('should support method chaining for fluent API', () => {
      const query = new GaqlBuilder()
        .select(['campaign.id', 'campaign.name'])
        .from('campaign')
        .build();
      
      expect(query).toBe('SELECT campaign.id, campaign.name FROM campaign');
    });

    it('should allow calling methods in different order', () => {
      const query = new GaqlBuilder()
        .from('campaign')
        .select(['campaign.id', 'campaign.name'])
        .build();
      
      expect(query).toBe('SELECT campaign.id, campaign.name FROM campaign');
    });

    it('should handle multiple select calls by using the last one', () => {
      const query = new GaqlBuilder()
        .select(['campaign.id'])
        .select(['campaign.name', 'campaign.status'])
        .from('campaign')
        .build();
      
      expect(query).toBe('SELECT campaign.name, campaign.status FROM campaign');
    });

    it('should handle multiple from calls by using the last one', () => {
      const query = new GaqlBuilder()
        .from('ad_group')
        .from('campaign')
        .select(['campaign.id'])
        .build();
      
      expect(query).toBe('SELECT campaign.id FROM campaign');
    });
  });

  describe('Field validation', () => {
    it('should trim whitespace from field names', () => {
      const query = new GaqlBuilder()
        .select(['  campaign.id  ', ' campaign.name '])
        .from('campaign')
        .build();
      
      expect(query).toBe('SELECT campaign.id, campaign.name FROM campaign');
    });

    it('should handle fields with metrics prefix', () => {
      const query = new GaqlBuilder()
        .select(['metrics.clicks', 'metrics.impressions'])
        .from('campaign')
        .build();
      
      expect(query).toBe('SELECT metrics.clicks, metrics.impressions FROM campaign');
    });

    it('should handle fields with segments prefix', () => {
      const query = new GaqlBuilder()
        .select(['segments.date', 'segments.device'])
        .from('campaign')
        .build();
      
      expect(query).toBe('SELECT segments.date, segments.device FROM campaign');
    });
  });
});
import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';
import { isValidDateRange, validateDateRange } from '../validators';

describe('GaqlBuilder - Custom Date Range Support', () => {
  describe('Date validation', () => {
    it('should accept valid custom dates in YYYY-MM-DD format', () => {
      expect(isValidDateRange('2024-01-15')).toBe(true);
      expect(isValidDateRange('2023-12-31')).toBe(true);
      expect(isValidDateRange('2025-06-01')).toBe(true);
    });
    
    it('should reject invalid date formats', () => {
      expect(isValidDateRange('2024/01/15')).toBe(false);
      expect(isValidDateRange('01-15-2024')).toBe(false);
      expect(isValidDateRange('2024-1-15')).toBe(false);
      expect(isValidDateRange('24-01-15')).toBe(false);
      expect(isValidDateRange('2024-XX-15')).toBe(false); // Non-numeric values
    });
    
    it('should reject invalid dates', () => {
      expect(isValidDateRange('2024-13-01')).toBe(false); // Invalid month
      expect(isValidDateRange('2024-02-30')).toBe(false); // Invalid day for February
      expect(isValidDateRange('2024-04-31')).toBe(false); // April has 30 days
    });
    
    it('should handle leap year dates correctly', () => {
      expect(isValidDateRange('2024-02-29')).toBe(true);  // 2024 is a leap year
      expect(isValidDateRange('2023-02-29')).toBe(false); // 2023 is not a leap year
    });
    
    it('should still accept predefined date ranges', () => {
      expect(isValidDateRange('TODAY')).toBe(true);
      expect(isValidDateRange('YESTERDAY')).toBe(true);
      expect(isValidDateRange('LAST_30_DAYS')).toBe(true);
      expect(isValidDateRange('ALL_TIME')).toBe(true);
    });
  });
  
  describe('whereDuring with custom dates', () => {
    it('should build query with custom date', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.clicks'])
        .from('campaign')
        .whereDuring('segments.date', '2024-01-15')
        .build();
      
      expect(query).toBe("SELECT campaign.name, metrics.clicks FROM campaign WHERE segments.date DURING '2024-01-15'");
    });
    
    it('should build query with predefined date range', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.clicks'])
        .from('campaign')
        .whereDuring('segments.date', 'LAST_7_DAYS')
        .build();
      
      expect(query).toBe('SELECT campaign.name, metrics.clicks FROM campaign WHERE segments.date DURING LAST_7_DAYS');
    });
    
    it('should combine custom dates with other conditions', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name', 'metrics.clicks'])
        .from('campaign')
        .where('campaign.status', '=', 'ENABLED')
        .whereDuring('segments.date', '2024-03-15')
        .whereIn('campaign.advertising_channel_type', ['SEARCH', 'SHOPPING'])
        .build();
      
      expect(query).toBe(
        "SELECT campaign.name, metrics.clicks FROM campaign " +
        "WHERE campaign.status = 'ENABLED' " +
        "AND segments.date DURING '2024-03-15' " +
        "AND campaign.advertising_channel_type IN ('SEARCH', 'SHOPPING')"
      );
    });
    
    it('should throw error for invalid custom date', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .whereDuring('segments.date', '2024-13-45')
          .build();
      }).toThrow(/Invalid date range/);
    });
    
    it('should throw error for invalid date format', () => {
      expect(() => {
        new GaqlBuilder()
          .select(['campaign.name'])
          .from('campaign')
          .whereDuring('segments.date', 'January 15, 2024')
          .build();
      }).toThrow(/Invalid date range/);
    });
  });
  
  describe('whereBetween with dates', () => {
    it('should handle date strings in BETWEEN clause', () => {
      const query = new GaqlBuilder()
        .select(['campaign.name'])
        .from('campaign')
        .whereBetween('segments.date', '2024-01-01', '2024-01-31')
        .build();
      
      expect(query).toBe("SELECT campaign.name FROM campaign WHERE segments.date BETWEEN '2024-01-01' AND '2024-01-31'");
    });
  });
});
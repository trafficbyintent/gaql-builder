import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';

describe('GaqlBuilder - Performance', () => {
  it('should handle queries with many fields efficiently', () => {
    // Use maximum allowed fields
    const fields = Array.from({ length: 500 }, (_, i) => `field${i}`);

    const query = new GaqlBuilder()
      .select(fields)
      .from('campaign')
      .where('status', '=', 'ENABLED')
      .build();

    /* Verify the query was built successfully with all fields */
    expect(query).toContain('field0');
    expect(query).toContain('field499');
    expect(query.length).toBeGreaterThan(2500); // Rough check for all fields present
  });

  it('should handle maximum parameter sets efficiently', () => {
    const params: Record<string, boolean | number> = {};
    // Use maximum allowed parameters
    for (let i = 0; i < 50; i++) {
      // Use alternating boolean and number values for variety
      params[`param${i}`] = i % 2 === 0 ? i : i % 3 === 0;
    }

    const query = new GaqlBuilder()
      .select(['name'])
      .from('campaign')
      .where('name', '=', 'test')
      .parameters(params)
      .build();

    /* Verify all parameters were included */
    expect(query).toContain('PARAMETERS');
    expect(query).toContain('param0 = 0');
    expect(query).toContain('param49 = false');
  });
});

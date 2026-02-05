import { describe, it, expect } from 'vitest';
import { GaqlBuilder } from '../gaqlBuilder';

describe('GaqlBuilder - Concurrent Usage', () => {
  it('should handle multiple independent builder instances', () => {
    const builder1 = new GaqlBuilder().select(['field1']).from('resource1');
    const builder2 = new GaqlBuilder().select(['field2']).from('resource2');

    builder1.where('status', '=', 'ENABLED');
    builder2.where('status', '=', 'PAUSED');

    const query1 = builder1.build();
    const query2 = builder2.build();

    expect(query1).toBe("SELECT field1 FROM resource1 WHERE status = 'ENABLED'");
    expect(query2).toBe("SELECT field2 FROM resource2 WHERE status = 'PAUSED'");
  });

  it('should maintain independent state when builders are created in loops', () => {
    const builders = [];
    for (let i = 0; i < 5; i++) {
      builders.push(
        new GaqlBuilder()
          .select([`field${i}`])
          .from('campaign')
          .where('id', '=', i)
      );
    }

    const queries = builders.map((b) => b.build());
    queries.forEach((query, i) => {
      expect(query).toContain(`field${i}`);
      expect(query).toContain(`id = ${i}`);
    });
  });
});

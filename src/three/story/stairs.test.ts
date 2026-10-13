import { describe, expect, it } from 'vitest';

import { CLIMB, PAUSES } from './stairs';

describe('the climb', () => {
  it('has six stops in order, each with a positive length', () => {
    expect(CLIMB.pauses).toHaveLength(6);
    expect(PAUSES).toHaveLength(6);
    for (let i = 0; i < CLIMB.pauses.length; i++) {
      const pause = CLIMB.pauses[i]!;
      expect(pause.t1).toBeGreaterThan(pause.t0);
      if (i > 0) expect(pause.t0).toBeGreaterThan(CLIMB.pauses[i - 1]!.t1);
    }
  });

  it('plays through in well under two minutes, so the page does not drag', () => {
    const total = CLIMB.pauses[CLIMB.pauses.length - 1]!.t1;
    expect(total).toBeLessThan(100);
    expect(total).toBeGreaterThan(60);
  });
});

import { describe, expect, it } from 'vitest';

import { clamp01, linearRamp } from './math';

describe('clamp01', () => {
  it('keeps values inside 0..1', () => {
    expect(clamp01(-0.5)).toBe(0);
    expect(clamp01(0.25)).toBe(0.25);
    expect(clamp01(7)).toBe(1);
  });
});

describe('linearRamp', () => {
  it('is 0 before the start, 1 after the end and linear between', () => {
    expect(linearRamp(0, 1, 3)).toBe(0);
    expect(linearRamp(2, 1, 3)).toBe(0.5);
    expect(linearRamp(5, 1, 3)).toBe(1);
  });

  it('steps at the start when the ramp has no length', () => {
    expect(linearRamp(0.9, 1, 1)).toBe(0);
    expect(linearRamp(1, 1, 1)).toBe(1);
  });
});

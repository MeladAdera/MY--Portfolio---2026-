import { describe, expect, it } from 'vitest';

import { hexToRgb, luminance, mix, rgbToHex } from './color';

describe('color', () => {
  it('round-trips hex colours through channels', () => {
    expect(rgbToHex(hexToRgb('#EEEAE3'))).toBe('#eeeae3');
    expect(hexToRgb('#000000')).toEqual([0, 0, 0]);
    expect(hexToRgb('#ffffff')).toEqual([1, 1, 1]);
  });

  it('clamps out-of-range channels when formatting', () => {
    expect(rgbToHex([1.2, -0.5, 0.5])).toBe('#ff0080');
  });

  it('mixes two colours linearly', () => {
    expect(mix([0, 0, 0], [1, 1, 1], 0.5)).toEqual([0.5, 0.5, 0.5]);
    expect(mix([0.2, 0.4, 0.6], [1, 1, 1], 0)).toEqual([0.2, 0.4, 0.6]);
  });

  it('computes relative luminance with black and white as the limits', () => {
    expect(luminance([0, 0, 0])).toBe(0);
    expect(luminance([1, 1, 1])).toBeCloseTo(1, 5);
    expect(luminance(hexToRgb('#EEEAE3'))).toBeGreaterThan(luminance(hexToRgb('#10151B')));
  });
});

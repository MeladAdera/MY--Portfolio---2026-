import { describe, expect, it } from 'vitest';

import {
  fillHeight,
  hintOpacity,
  introOpacity,
  paragraphOpacity,
  scrollProgress,
  stepStyle,
} from './frame-math';

describe('stepStyle', () => {
  it('lifts a faded step by up to 10px and hides it when fully faded', () => {
    expect(stepStyle(1)).toEqual({ opacity: 1, translateY: 0, visible: true });
    expect(stepStyle(0.5)).toEqual({ opacity: 0.5, translateY: 5, visible: true });
    expect(stepStyle(0)).toEqual({ opacity: 0, translateY: 10, visible: false });
  });
});

describe('paragraphOpacity', () => {
  it('reveals paragraphs one after another through the stop', () => {
    expect(paragraphOpacity(0, 0)).toBe(0);
    expect(paragraphOpacity(0.1, 0)).toBe(1);
    expect(paragraphOpacity(0.1, 1)).toBeCloseTo(0.15);
    expect(paragraphOpacity(0.185, 1)).toBeCloseTo(1);
    expect(paragraphOpacity(-1, 2)).toBe(0);
  });
});

describe('intro, hint and fill', () => {
  it('fade the intro and the hint over the first percent of the scroll', () => {
    expect(introOpacity(0)).toBe(1);
    expect(introOpacity(0.0375)).toBeCloseTo(0.5);
    expect(introOpacity(0.1)).toBe(0);
    expect(hintOpacity(0)).toBe(1);
    expect(hintOpacity(0.03)).toBe(0);
  });

  it('fill the rail in percent', () => {
    expect(fillHeight(0.25)).toBe(25);
  });
});

describe('scrollProgress', () => {
  it('is 0 at the top of the section and 1 when its end reaches the viewport bottom', () => {
    expect(scrollProgress(0, 3000, 1000)).toBe(0);
    expect(scrollProgress(-1000, 3000, 1000)).toBe(0.5);
    expect(scrollProgress(-2000, 3000, 1000)).toBe(1);
    expect(scrollProgress(-5000, 3000, 1000)).toBe(1);
  });

  it('is 0 when the section is not taller than the viewport', () => {
    expect(scrollProgress(-100, 800, 1000)).toBe(0);
  });
});

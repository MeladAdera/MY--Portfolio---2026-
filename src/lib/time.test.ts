import { describe, expect, it } from 'vitest';

import { formatZonedTime, msUntilNextMinute } from './time';

describe('formatZonedTime', () => {
  it('formats a UTC instant in Damascus time with its offset', () => {
    expect(formatZonedTime(new Date('2026-07-01T11:05:00Z'), 'Asia/Damascus')).toEqual({
      hour: '14',
      minute: '05',
      zone: 'GMT+3',
    });
  });

  it('pads single-digit hours', () => {
    expect(formatZonedTime(new Date('2026-01-10T05:07:00Z'), 'Asia/Damascus').hour).toBe('08');
  });
});

describe('msUntilNextMinute', () => {
  it('counts to the next boundary plus the margin', () => {
    expect(msUntilNextMinute(10 * 60_000 + 15_000)).toBe(45_050);
    expect(msUntilNextMinute(0)).toBe(60_050);
  });
});

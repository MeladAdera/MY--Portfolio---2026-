import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocalClock } from './use-local-clock';

describe('useLocalClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-01T11:05:30Z'));
  });
  afterEach(() => vi.useRealTimers());

  it('returns the time in the zone and moves on at the minute boundary', () => {
    const { result } = renderHook(() => useLocalClock('Asia/Damascus'));

    expect(result.current).toEqual({ hour: '14', minute: '05', zone: 'GMT+3' });

    act(() => {
      vi.advanceTimersByTime(30_100);
    });
    expect(result.current?.minute).toBe('06');
  });
});

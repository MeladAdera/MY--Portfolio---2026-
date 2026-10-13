import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useTypewriter } from './use-typewriter';

const lines = ['Who am I?', 'What can I build?'] as const;
const timing = { startMs: 100, charMs: 10, lineMs: 50 };

describe('useTypewriter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('starts empty, then types the lines one after another and reports when done', () => {
    const { result } = renderHook(() => useTypewriter(lines, timing));
    expect(result.current.typed).toEqual(['', '']);
    expect(result.current.done).toBe(false);

    act(() => vi.advanceTimersByTime(100 + 10 * 3));
    expect(result.current.typed).toEqual(['Who ', '']);

    act(() => vi.advanceTimersByTime(10 * 6));
    expect(result.current.typed).toEqual(['Who am I?', '']);

    /* the last character landed at 180 ms; the pause holds the second line until 230 ms */
    act(() => vi.advanceTimersByTime(30));
    expect(result.current.typed).toEqual(['Who am I?', '']);
    act(() => vi.advanceTimersByTime(10 + 10 * 4));
    expect(result.current.typed).toEqual(['Who am I?', 'What ']);

    act(() => vi.advanceTimersByTime(10 * 20));
    expect(result.current.typed).toEqual([...lines]);
    expect(result.current.done).toBe(true);
  });

  it('stops typing when the component goes away', () => {
    const { result, unmount } = renderHook(() => useTypewriter(lines, timing));
    act(() => vi.advanceTimersByTime(120));
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.typed[0]?.length).toBeLessThan(lines[0].length);
  });

  it('shows everything at once under reduced motion', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) => ({ matches: true, media: query }) as MediaQueryList,
    );
    const { result } = renderHook(() => useTypewriter(lines, timing));
    act(() => vi.advanceTimersByTime(0));
    expect(result.current.typed).toEqual([...lines]);
    expect(result.current.done).toBe(true);
  });
});

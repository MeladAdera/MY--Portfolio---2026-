import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAutoScroll } from './use-auto-scroll';

import type { StorySceneHandle } from '@/three/story';

/* A section 11 viewports tall, scrolled to its top; a story of 10 seconds mapped linearly. */
function setup(reduced = false) {
  window.innerHeight = 1000;
  const section = document.createElement('section');
  section.getBoundingClientRect = () => ({ top: 0 }) as DOMRect;
  Object.defineProperty(section, 'offsetHeight', { value: 11000 });
  Object.defineProperty(section, 'offsetTop', { value: 500 });
  const handle = {
    total: 10,
    timeAtProgress: (p: number) => p * 10,
    progressAtTime: (t: number) => t / 10,
    reduced: () => reduced,
  } as unknown as StorySceneHandle;
  return renderHook(() => useAutoScroll({ current: section }, { current: handle }));
}

describe('useAutoScroll', () => {
  let frames: FrameRequestCallback[];
  beforeEach(() => {
    frames = [];
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('scrollTo', vi.fn());
    vi.spyOn(performance, 'now').mockReturnValue(1000);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('scrolls the page along the story and stops at the end', () => {
    const { result } = setup();
    act(() => result.current.toggle());
    expect(result.current.playing).toBe(true);
    expect(frames).toHaveLength(1);

    /* one frame 40 ms later: 0.04 s of story, 0.4 % of the 10 000 px span, from the section top */
    act(() => frames.shift()!(1040));
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 500 + 0.004 * 10000);

    /* a long stall advances the clock by at most 50 ms */
    act(() => frames.shift()!(5000));
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 500 + 0.009 * 10000);

    /* run to the end */
    act(() => {
      let now = 5000;
      while (frames.length) frames.shift()!((now += 50));
    });
    expect(result.current.playing).toBe(false);
    expect(window.scrollTo).toHaveBeenLastCalledWith(0, 500 + 10000);
  });

  it('stops on the reader’s own scroll input and toggles off on a second press', () => {
    const { result } = setup();
    act(() => result.current.toggle());
    act(() => window.dispatchEvent(new Event('wheel')));
    expect(result.current.playing).toBe(false);

    act(() => result.current.toggle());
    expect(result.current.playing).toBe(true);
    act(() => result.current.toggle());
    expect(result.current.playing).toBe(false);
  });

  it('does nothing under reduced motion', () => {
    const { result } = setup(true);
    act(() => result.current.toggle());
    expect(result.current.playing).toBe(false);
    expect(frames).toHaveLength(0);
  });
});

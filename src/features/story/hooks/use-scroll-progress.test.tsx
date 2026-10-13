import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { sectionProgress, useScrollProgress } from './use-scroll-progress';

import type { StorySceneHandle } from '@/three/story';

function tallSection(top: number, height: number) {
  const section = document.createElement('section');
  section.getBoundingClientRect = () => ({ top }) as DOMRect;
  Object.defineProperty(section, 'offsetHeight', { value: height });
  return section;
}

describe('sectionProgress', () => {
  it('reads the section position and the viewport height', () => {
    window.innerHeight = 1000;
    expect(sectionProgress(tallSection(-1500, 4000))).toBe(0.5);
  });
});

describe('useScrollProgress', () => {
  it('sends the progress to the scene on mount, on scroll and on resize', () => {
    window.innerHeight = 1000;
    const section = tallSection(-600, 3000);
    const setProgress = vi.fn();
    const handle = { setProgress } as unknown as StorySceneHandle;
    const { unmount } = renderHook(() =>
      useScrollProgress({ current: section }, { current: handle }),
    );
    expect(setProgress).toHaveBeenLastCalledWith(0.3);

    section.getBoundingClientRect = () => ({ top: -1000 }) as DOMRect;
    window.dispatchEvent(new Event('scroll'));
    expect(setProgress).toHaveBeenLastCalledWith(0.5);

    window.dispatchEvent(new Event('resize'));
    expect(setProgress).toHaveBeenCalledTimes(3);

    unmount();
    window.dispatchEvent(new Event('scroll'));
    expect(setProgress).toHaveBeenCalledTimes(3);
  });
});

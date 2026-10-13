import { useEffect, type RefObject } from 'react';

import { scrollProgress } from '../lib/frame-math';

import type { StorySceneHandle } from '@/three/story';

/** Where the viewport is within the tall climb section, 0..1. */
export function sectionProgress(section: HTMLElement) {
  return scrollProgress(
    section.getBoundingClientRect().top,
    section.offsetHeight,
    window.innerHeight,
  );
}

/**
 * Feeds the page's scroll position to the scene as story progress. Listens passively; the
 * scene decides for itself whether a frame needs drawing.
 */
export function useScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
  handleRef: RefObject<StorySceneHandle | null>,
) {
  useEffect(() => {
    const sync = () => {
      const section = sectionRef.current;
      const handle = handleRef.current;
      if (section && handle) handle.setProgress(sectionProgress(section));
    };
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
    return () => {
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sectionRef, handleRef]);
}

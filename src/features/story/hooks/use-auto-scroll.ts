import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

import { sectionProgress } from './use-scroll-progress';

import type { StorySceneHandle } from '@/three/story';

const STOP_EVENTS = ['wheel', 'touchstart', 'keydown'] as const;

/**
 * "Play the climb": scrolls the page at the story's own pace. Any scroll input from the
 * reader stops it; at the end it stops by itself, and pressing play at the end starts over.
 * Does nothing under reduced motion, where the scene never walks.
 */
export function useAutoScroll(
  sectionRef: RefObject<HTMLElement | null>,
  handleRef: RefObject<StorySceneHandle | null>,
) {
  const [playing, setPlaying] = useState(false);
  const startTime = useRef(0);

  const toggle = useCallback(() => {
    if (playing) {
      setPlaying(false);
      return;
    }
    const section = sectionRef.current;
    const handle = handleRef.current;
    if (!section || !handle || handle.reduced()) return;
    const progress = sectionProgress(section);
    const restart = progress >= 0.999;
    startTime.current = restart ? 0 : handle.timeAtProgress(progress);
    if (restart) window.scrollTo(0, section.offsetTop);
    setPlaying(true);
  }, [playing, sectionRef, handleRef]);

  useEffect(() => {
    if (!playing) return;
    const section = sectionRef.current;
    const handle = handleRef.current;
    if (!section || !handle) return;
    let time = startTime.current;
    let last = performance.now();
    let raf = 0;
    const step = (now: number) => {
      /* the clock advances at most 50 ms per frame, so a stall never jumps the page */
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      time = Math.min(handle.total, time + dt);
      const span = section.offsetHeight - window.innerHeight;
      window.scrollTo(0, section.offsetTop + handle.progressAtTime(time) * span);
      if (time >= handle.total) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    const stop = () => setPlaying(false);
    for (const type of STOP_EVENTS) window.addEventListener(type, stop, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      for (const type of STOP_EVENTS) window.removeEventListener(type, stop);
    };
  }, [playing, sectionRef, handleRef]);

  return { playing, toggle };
}

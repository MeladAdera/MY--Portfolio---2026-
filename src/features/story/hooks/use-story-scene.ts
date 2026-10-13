import { useSceneMount } from '@/hooks/use-scene-mount';

import type { StoryFrameState, StorySceneHandle, StorySceneOptions } from '@/three/story';
import type { RefObject } from 'react';

/* A module-level loader keeps the import stable and three.js in its own chunk. */
const loadStoryScene = () => import('@/three/story').then((m) => m.mountStoryScene);

type StorySceneCallbacks = {
  /** Called by the scene on every drawn frame. */
  onFrame: (state: StoryFrameState) => void;
  /** Called once with the handle, right after the scene is mounted. */
  onReady: (handle: StorySceneHandle) => void;
};

/**
 * Mounts the climb scene. It draws only when the story moves, so its cost follows the
 * reader's scrolling; the pixel ratio is capped at 1 as on the Home page.
 */
export function useStoryScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { onFrame, onReady }: StorySceneCallbacks,
) {
  return useSceneMount<StorySceneOptions, StorySceneHandle>(
    canvasRef,
    loadStoryScene,
    { onFrame, maxPixelRatio: 1 },
    onReady,
  );
}

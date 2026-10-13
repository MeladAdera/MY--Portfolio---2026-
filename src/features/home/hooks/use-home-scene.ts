import { useCallback, useEffect, type RefObject } from 'react';

import { useSceneMount } from '@/hooks/use-scene-mount';
import { applyCssVars, clearCssVars } from '@/lib/css-vars';

import { blendPalette, PALETTE_VARS } from '../lib/palette-blend';

import type { HomeSceneHandle, HomeSceneOptions } from '@/three/home';

/* A module-level loader keeps the import stable and three.js in its own chunk. */
const loadHomeScene = () => import('@/three/home').then((m) => m.mountHomeScene);

/* The scene reports its darkness as it plays; the page colours follow it directly. */
const paintPage = (k: number) => applyCssVars(document.documentElement, blendPalette(k));

/** Mounts the builder scene and lets the page follow its light. */
export function useHomeScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const { handleRef, state } = useSceneMount<HomeSceneOptions, HomeSceneHandle>(
    canvasRef,
    loadHomeScene,
    { onTheme: paintPage },
  );

  useEffect(() => () => clearCssVars(document.documentElement, PALETTE_VARS), []);

  const setPaused = useCallback(
    (paused: boolean) => handleRef.current?.setPaused(paused),
    [handleRef],
  );

  return { state, setPaused };
}

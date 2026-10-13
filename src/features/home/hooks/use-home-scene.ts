import { useCallback, useEffect, useState, type RefObject } from 'react';

import { useSceneMount } from '@/hooks/use-scene-mount';
import { applyCssVars, clearCssVars } from '@/lib/css-vars';

import { blendPalette, PALETTE_VARS } from '../lib/palette-blend';

import type { HomeSceneHandle, HomeSceneOptions } from '@/three/home';

export type SceneStatus = 'playing' | 'paused' | 'complete';

/* A module-level loader keeps the import stable and three.js in its own chunk. */
const loadHomeScene = () => import('@/three/home').then((m) => m.mountHomeScene);

/* The engineer: a humanoid glTF with a Ready Player Me / Mixamo skeleton, driven by the
   scene's own animation. Swap the file in public/models to change who stands at the table;
   the hat of this avatar is left out. */
const FIGURE = { url: '/models/engineer.glb', hide: ['Wolf3D_Headwear'] };

/* The hero copy reads this to appear as the page darkens (styles/utilities.css). */
export const REVEAL_VAR = '--hero-reveal';
const PAGE_VARS = [...PALETTE_VARS, REVEAL_VAR];

/* The scene reports its darkness as it plays; the page colours and the copy follow it. */
const paintPage = (k: number) =>
  applyCssVars(document.documentElement, { ...blendPalette(k), [REVEAL_VAR]: String(k) });

/**
 * Mounts the builder scene and lets the page follow its light. The scene plays once to
 * its end and then stops rendering; the page keeps the dark palette it reached. The one
 * control toggles pause/play while the effect runs and replays it once it is complete.
 */
export function useHomeScene(canvasRef: RefObject<HTMLCanvasElement | null>) {
  const [status, setStatus] = useState<SceneStatus>('playing');

  const { handleRef, state } = useSceneMount<HomeSceneOptions, HomeSceneHandle>(
    canvasRef,
    loadHomeScene,
    {
      figureUrl: FIGURE.url,
      figureHide: FIGURE.hide,
      onTheme: paintPage,
      onComplete: () => setStatus('complete'),
    },
  );

  /* without a scene there is nothing to wait for: show the copy */
  useEffect(() => {
    if (state === 'failed') applyCssVars(document.documentElement, { [REVEAL_VAR]: '1' });
  }, [state]);

  useEffect(() => () => clearCssVars(document.documentElement, PAGE_VARS), []);

  const toggle = useCallback(() => {
    const scene = handleRef.current;
    if (!scene) return;
    if (scene.isComplete()) {
      scene.replay();
      setStatus('playing');
    } else if (scene.isRunning()) {
      scene.pause();
      setStatus('paused');
    } else {
      scene.play();
      setStatus('playing');
    }
  }, [handleRef]);

  return { state, status, toggle };
}

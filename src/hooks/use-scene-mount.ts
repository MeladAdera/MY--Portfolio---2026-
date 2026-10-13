import { useEffect, useRef, useState, type RefObject } from 'react';

export type SceneState = 'loading' | 'ready' | 'failed';

export type SceneMounter<Options, Handle> = (
  canvas: HTMLCanvasElement,
  options?: Options,
) => Handle;

/**
 * Mounts an imperative scene on a canvas for the life of the component.
 *
 * `load` must be a stable function (declare it at module level); it returns the mount
 * function through a dynamic import so the scene's code is its own chunk and never runs
 * on the server. `options` are read once, when the scene mounts. The handle lives in a
 * ref rather than state because nothing should re-render on a per-frame basis.
 */
export function useSceneMount<Options, Handle extends { dispose(): void }>(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  load: () => Promise<SceneMounter<Options, Handle>>,
  options: Options,
): { handleRef: RefObject<Handle | null>; state: SceneState } {
  const [state, setState] = useState<SceneState>('loading');
  const [initialOptions] = useState(options);
  const handleRef = useRef<Handle | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;

    load()
      .then((mount) => {
        if (cancelled) return;
        handleRef.current = mount(canvas, initialOptions);
        setState('ready');
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState('failed');
        if (process.env.NODE_ENV !== 'production') console.error('scene failed to mount', error);
      });

    return () => {
      cancelled = true;
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [canvasRef, load, initialOptions]);

  return { handleRef, state };
}

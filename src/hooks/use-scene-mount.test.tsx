import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useSceneMount } from './use-scene-mount';

type Handle = { dispose: () => void; setPaused: (v: boolean) => void };

function canvasRef() {
  return { current: document.createElement('canvas') };
}

describe('useSceneMount', () => {
  it('loads the module, mounts on the canvas with the options, and disposes on unmount', async () => {
    const handle: Handle = { dispose: vi.fn(), setPaused: vi.fn() };
    const mount = vi.fn(() => handle);
    const load = () => Promise.resolve(mount);
    const ref = canvasRef();
    const options = { onTheme: vi.fn() };

    const { result, unmount } = renderHook(() => useSceneMount(ref, load, options));
    expect(result.current.state).toBe('loading');

    await waitFor(() => expect(result.current.state).toBe('ready'));
    expect(mount).toHaveBeenCalledWith(ref.current, options);
    expect(result.current.handleRef.current).toBe(handle);

    unmount();
    expect(handle.dispose).toHaveBeenCalledTimes(1);
  });

  it('reports failed when the module cannot load', async () => {
    const load = () => Promise.reject(new Error('no webgl'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useSceneMount(canvasRef(), load, {}));

    await waitFor(() => expect(result.current.state).toBe('failed'));
    expect(result.current.handleRef.current).toBeNull();
  });

  it('does not mount when the component unmounts before the module arrives', async () => {
    const mount = vi.fn(() => ({ dispose: vi.fn() }));
    let resolve: (m: typeof mount) => void = () => {};
    const load = () => new Promise<typeof mount>((r) => (resolve = r));

    const { unmount } = renderHook(() => useSceneMount(canvasRef(), load, {}));
    unmount();
    resolve(mount);
    await Promise.resolve();

    expect(mount).not.toHaveBeenCalled();
  });
});

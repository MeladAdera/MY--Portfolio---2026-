import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { HeroStage } from './hero-stage';

import type { HomeSceneOptions } from '@/three/home';

/* jsdom has no WebGL, so the scene module is replaced at its boundary. */
const handle = { setPaused: vi.fn(), dispose: vi.fn(), theme: () => 0 };
const mountHomeScene = vi.fn((_canvas: HTMLCanvasElement, _options?: HomeSceneOptions) => handle);
vi.mock('@/three/home', () => ({
  mountHomeScene: (canvas: HTMLCanvasElement, options?: HomeSceneOptions) =>
    mountHomeScene(canvas, options),
}));

const pauseLabels = { pause: 'Pause scene', play: 'Play scene' };

describe('HeroStage', () => {
  it('mounts the scene on the canvas, exposes its state, and wires the pause toggle', async () => {
    const { container, unmount } = render(
      <HeroStage caption="A drawn engineer at a worktable." pauseLabels={pauseLabels} />,
    );
    const figure = container.querySelector('figure');
    expect(figure).toHaveAttribute('data-scene-state', 'loading');

    await waitFor(() => expect(figure).toHaveAttribute('data-scene-state', 'ready'));
    expect(mountHomeScene).toHaveBeenCalledWith(
      container.querySelector('canvas'),
      expect.objectContaining({ onTheme: expect.any(Function) }),
    );
    expect(screen.getByText('A drawn engineer at a worktable.')).toHaveClass('sr-only');

    await userEvent.click(screen.getByRole('button', { name: 'Pause scene' }));
    expect(handle.setPaused).toHaveBeenCalledWith(true);
    expect(screen.getByRole('button', { name: 'Play scene' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    unmount();
    expect(handle.dispose).toHaveBeenCalled();
  });

  it('paints the page when the scene reports its darkness, and clears it on unmount', async () => {
    const { unmount } = render(<HeroStage caption="caption" pauseLabels={pauseLabels} />);
    await waitFor(() => expect(mountHomeScene).toHaveBeenCalled());
    const options = mountHomeScene.mock.calls.at(-1)?.[1];

    options?.onTheme?.(1);
    expect(document.documentElement.style.getPropertyValue('--c-bg')).toBe('#10151b');

    unmount();
    expect(document.documentElement.style.getPropertyValue('--c-bg')).toBe('');
  });
});

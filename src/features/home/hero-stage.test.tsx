import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HeroStage } from './hero-stage';

import type { HomeSceneHandle, HomeSceneOptions } from '@/three/home';

/* jsdom has no WebGL, so the scene module is replaced at its boundary with a fake lifecycle. */
let running = true;
let complete = false;
let captured: HomeSceneOptions | undefined;
const handle = {
  play: vi.fn(() => {
    running = true;
  }),
  pause: vi.fn(() => {
    running = false;
  }),
  replay: vi.fn(() => {
    running = true;
    complete = false;
  }),
  isRunning: () => running,
  isComplete: () => complete,
  reduced: () => false,
  dispose: vi.fn(),
  theme: () => 0,
} as unknown as HomeSceneHandle;
const mountHomeScene = vi.fn((_canvas: HTMLCanvasElement, options?: HomeSceneOptions) => {
  captured = options;
  return handle;
});
vi.mock('@/three/home', () => ({
  mountHomeScene: (canvas: HTMLCanvasElement, options?: HomeSceneOptions) =>
    mountHomeScene(canvas, options),
}));

const controlLabels = { pause: 'Pause scene', play: 'Play scene', replay: 'Replay scene' };
const caption = 'A drawn engineer at a worktable.';

describe('HeroStage', () => {
  beforeEach(() => {
    running = true;
    complete = false;
    captured = undefined;
    vi.clearAllMocks();
  });

  it('mounts the scene on the canvas and exposes its state and status', async () => {
    const { container, unmount } = render(
      <HeroStage caption={caption} controlLabels={controlLabels} />,
    );
    const figure = container.querySelector('figure');
    expect(figure).toHaveAttribute('data-scene-state', 'loading');
    expect(figure).toHaveAttribute('data-scene-status', 'playing');

    await waitFor(() => expect(figure).toHaveAttribute('data-scene-state', 'ready'));
    expect(mountHomeScene).toHaveBeenCalledWith(
      container.querySelector('canvas'),
      expect.objectContaining({
        figureUrl: '/models/engineer.glb',
        onTheme: expect.any(Function),
        onComplete: expect.any(Function),
      }),
    );
    expect(screen.getByText(caption)).toHaveClass('sr-only');

    unmount();
    expect(handle.dispose).toHaveBeenCalled();
  });

  it('pauses and resumes the effect from the one control', async () => {
    render(<HeroStage caption={caption} controlLabels={controlLabels} />);
    await waitFor(() => expect(mountHomeScene).toHaveBeenCalled());

    await userEvent.click(screen.getByRole('button', { name: 'Pause scene' }));
    expect(handle.pause).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Play scene' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Play scene' }));
    expect(handle.play).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Pause scene' })).toBeInTheDocument();
  });

  it('switches to replay when the scene reports completion, and replays on click', async () => {
    const { container } = render(<HeroStage caption={caption} controlLabels={controlLabels} />);
    await waitFor(() => expect(mountHomeScene).toHaveBeenCalled());

    act(() => {
      complete = true;
      running = false;
      captured?.onComplete?.();
    });
    expect(container.querySelector('figure')).toHaveAttribute('data-scene-status', 'complete');

    await userEvent.click(screen.getByRole('button', { name: 'Replay scene' }));
    expect(handle.replay).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Pause scene' })).toBeInTheDocument();
  });

  it('paints the page when the scene reports its darkness, and clears it on unmount', async () => {
    const { unmount } = render(<HeroStage caption={caption} controlLabels={controlLabels} />);
    await waitFor(() => expect(mountHomeScene).toHaveBeenCalled());

    captured?.onTheme?.(0.5);
    expect(document.documentElement.style.getPropertyValue('--hero-reveal')).toBe('0.5');
    captured?.onTheme?.(1);
    expect(document.documentElement.style.getPropertyValue('--c-bg')).toBe('#10151b');
    expect(document.documentElement.style.getPropertyValue('--hero-reveal')).toBe('1');

    unmount();
    expect(document.documentElement.style.getPropertyValue('--c-bg')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--hero-reveal')).toBe('');
  });
});

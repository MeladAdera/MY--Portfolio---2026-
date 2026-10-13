import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { story } from '@/content';

import { StoryClimb } from './story-climb';

import type { StoryFrameState, StorySceneHandle, StorySceneOptions } from '@/three/story';

/* jsdom has no WebGL, so the scene module is replaced at its boundary with a fake handle. */
let captured: StorySceneOptions | undefined;
const handle = {
  setProgress: vi.fn(),
  timeAtProgress: (p: number) => p * 10,
  progressAtTime: (t: number) => t / 10,
  total: 10,
  pauses: [
    { t0: 0, t1: 2, frag: 0, look: 'up' },
    { t0: 4, t1: 6, frag: 1, look: 'aside' },
  ],
  reduced: () => false,
  dispose: vi.fn(),
} as unknown as StorySceneHandle;
vi.mock('@/three/story', () => ({
  mountStoryScene: (_canvas: HTMLCanvasElement, options?: StorySceneOptions) => {
    captured = options;
    return handle;
  },
}));

const frame = (progress: number, frags: number[], local: number[]): StoryFrameState => ({
  t: progress * 10,
  progress,
  frags,
  local,
  light: 0,
  body: [0, 0, 0],
});

describe('StoryClimb', () => {
  beforeEach(() => {
    captured = undefined;
    vi.clearAllMocks();
    vi.stubGlobal('requestAnimationFrame', vi.fn());
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.stubGlobal('scrollTo', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('renders the title, the six steps and the caption, and mounts the scene', async () => {
    const { container } = render(<StoryClimb story={story} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('The climb.');
    expect(container.querySelectorAll('[data-step]')).toHaveLength(6);
    expect(screen.getByText(story.sceneCaption)).toHaveClass('sr-only');

    const figure = container.querySelector('figure');
    await waitFor(() => expect(figure).toHaveAttribute('data-scene-state', 'ready'));
    expect(handle.setProgress).toHaveBeenCalledWith(0);
    /* one tick per stop, placed by the scene's own scroll mapping */
    expect(container.querySelectorAll('[data-tick]')).toHaveLength(2);
    expect(container.querySelectorAll('[data-tick]')[1]).toHaveStyle({ top: '40.00%' });
  });

  it('writes each frame into the steps, the intro and the rail', async () => {
    const { container } = render(<StoryClimb story={story} />);
    await waitFor(() => expect(captured?.onFrame).toBeDefined());

    act(() => captured?.onFrame?.(frame(0.5, [0, 1, 0, 0, 0, 0], [2, 0.1, -1, -1, -1, -1])));
    const steps = container.querySelectorAll<HTMLElement>('[data-step]');
    expect(steps[0]?.style.visibility).toBe('hidden');
    expect(Number(steps[1]?.style.opacity)).toBe(1);
    expect(Number(container.querySelector<HTMLElement>('[data-intro]')?.style.opacity)).toBe(0);
    expect(
      parseFloat(container.querySelector<HTMLElement>('[data-fill]')?.style.height ?? ''),
    ).toBe(50);
  });

  it('plays the climb from the button and reports it as pressed', async () => {
    render(<StoryClimb story={story} />);
    await waitFor(() => expect(captured).toBeDefined());

    await userEvent.click(screen.getByRole('button', { name: 'Play the climb' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toHaveAttribute('aria-pressed', 'true');
    expect(requestAnimationFrame).toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(screen.getByRole('button', { name: 'Play the climb' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

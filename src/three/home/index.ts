import { mount } from './mount';

/* The typed surface of the home scene. The implementation is the ported legacy module. */

export type HomeSceneOptions = {
  /** Called when the scene's light-to-dark blend (0..1) changes by more than 0.002. */
  onTheme?: (k: number) => void;
  /** Start paused. */
  paused?: boolean;
  /** Loop time to start from, in seconds. */
  start?: number;
  /** Render one frame at `time` and never start the loop. */
  manual?: boolean;
  time?: number;
  /** Loop time shown as a still frame when the user prefers reduced motion. Default 13.1. */
  stillTime?: number;
  maxPixelRatio?: number;
  /** Disable ambient occlusion. */
  ao?: boolean;
  /** Horizontal view offset as a fraction of the width; defaults depend on the aspect ratio. */
  shift?: number;
  /** Debug camera: [targetX, targetY, targetZ, distance, fov, azimuth?, elevation?]. */
  cam?: number[];
  preserveDrawingBuffer?: boolean;
};

export type HomeSceneStats = {
  maxArmShort: number;
  maxLegShort: number;
  worst: { t: number } | null;
};

export type HomeSceneHandle = {
  renderAt(time: number): void;
  stats: HomeSceneStats;
  loopLength: number;
  /** The current light-to-dark blend, 0..1. */
  theme(): number;
  setPaused(paused: boolean): void;
  isPaused(): boolean;
  dispose(): void;
};

export const mountHomeScene = mount as unknown as (
  canvas: HTMLCanvasElement,
  options?: HomeSceneOptions,
) => HomeSceneHandle;

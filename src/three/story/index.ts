import { mount } from './mount';

/* The typed surface of the story scene. The implementation is the ported legacy module. */

export type StoryLook = 'up' | 'aside' | 'down' | 'heavy' | 'out';

export type StoryPause = {
  /** Start and end of the stop, in story seconds. */
  t0: number;
  t1: number;
  /** Index of the text fragment shown during the stop. */
  frag: number;
  look: StoryLook;
};

export type StoryFrameState = {
  /** Story time in seconds. */
  t: number;
  /** Scroll progress 0..1 that corresponds to `t`. */
  progress: number;
  /** Opacity of each story step, 0..1. */
  frags: number[];
  /** How far through each stop the story is: -1 before, 0..1 during, 2 after. */
  local: number[];
  /** Daylight strength 0..1 as the figure climbs. */
  light: number;
  /** Pelvis position [x, y, z]. */
  body: number[];
};

export type StorySceneOptions = {
  onFrame?: (state: StoryFrameState) => void;
  /** Force the reduced-motion behaviour (still poses at each stop). */
  reduced?: boolean;
  /** Initial scroll progress 0..1. */
  progress?: number;
  /** Render one frame at `time` and never start the loop. */
  manual?: boolean;
  time?: number;
  maxPixelRatio?: number;
  ao?: boolean;
  /** Debug camera: [x, y, z, lookX, lookY, lookZ]. */
  cam?: number[];
  collectStats?: boolean;
  preserveDrawingBuffer?: boolean;
};

export type StorySceneStats = {
  maxLegShort: number;
  maxArmShort: number;
  minClear: number;
  minClearT: number;
  clips?: [number, 'toe' | 'heel', number, number][];
};

export type StorySceneHandle = {
  setProgress(progress: number): void;
  timeAtProgress(progress: number): number;
  progressAtTime(time: number): number;
  /** Total story length in seconds. */
  total: number;
  pauses: readonly StoryPause[];
  state(): StoryFrameState;
  reduced(): boolean;
  renderAt(time: number): void;
  stats: StorySceneStats;
  dispose(): void;
};

export const mountStoryScene = mount as unknown as (
  canvas: HTMLCanvasElement,
  options?: StorySceneOptions,
) => StorySceneHandle;

import { mount } from './mount';

/* The typed surface of the home scene. The implementation is the ported legacy module. */

export type HomeSceneOptions = {
  /** Called when the scene's light-to-dark blend (0..1) changes by more than 0.002. */
  onTheme?: (k: number) => void;
  /** Called once when the effect reaches its end and the render loop has stopped. */
  onComplete?: () => void;
  /** Mount without starting; the first frame is drawn once. */
  paused?: boolean;
  /** Loop time to start from, in seconds. */
  start?: number;
  /** Loop time at which the effect is complete. Defaults to the scene's own end mark. */
  endTime?: number;
  /** Frames rendered per second while the effect runs. Default 30. */
  fps?: number;
  /** Render one frame at `time` and never start the loop. */
  manual?: boolean;
  time?: number;
  /** A humanoid glTF (Mixamo or Ready Player Me skeleton) to use as the figure instead of the drawn rig. */
  figureUrl?: string;
  /** Extra scale on that model; 1 fits its legs to the rig's. */
  figureScale?: number;
  /** Flip the detected palm direction of the model's hands. */
  flipPalms?: boolean;
  /** How much the model's colours are lightened for the pencil shading. Default 3.2. */
  figureToneLift?: number;
  /** Names of the model's meshes to leave out, such as headwear. */
  figureHide?: readonly string[];
  /** Called after every drawn frame with the loop time. */
  onFrame?: (time: number) => void;
  /** Cap on the device pixel ratio used for rendering. Default 1. */
  maxPixelRatio?: number;
  /** Disable ambient occlusion. */
  ao?: boolean;
  /** Ambient occlusion and denoise sample counts. Default 8. */
  aoSamples?: number;
  /** Multisampling of the pencil tone pass. Default 0. */
  toneSamples?: number;
  /** Shadow map resolution. Default 2048. */
  shadowMapSize?: number;
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
  /** Loop time at which the effect completes and rendering stops. */
  endTime: number;
  /** The current light-to-dark blend, 0..1. */
  theme(): number;
  /** Start or resume the effect. No-op while running, after completion, or under reduced motion. */
  play(): void;
  /** Stop the render loop, keeping the current frame on the canvas. */
  pause(): void;
  /** Start the effect again from the beginning. */
  replay(): void;
  isRunning(): boolean;
  isComplete(): boolean;
  /** True when the user prefers reduced motion: only the finished frame is drawn. */
  reduced(): boolean;
  dispose(): void;
};

export const mountHomeScene = mount as unknown as (
  canvas: HTMLCanvasElement,
  options?: HomeSceneOptions,
) => HomeSceneHandle;

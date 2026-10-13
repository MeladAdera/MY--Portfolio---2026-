'use client';

import { useRef, useState } from 'react';

import { useHomeScene } from './hooks/use-home-scene';
import { PauseSceneButton } from './pause-scene-button';

type HeroStageProps = {
  /** Screen-reader description of what the scene shows. */
  caption: string;
  pauseLabels: { pause: string; play: string };
};

/**
 * The canvas the builder scene draws on, its text alternative, the veil that keeps the
 * copy readable over it, and the pause control. Fills the hero on tablets and up; on
 * phones it is a 480px panel above the copy.
 */
export function HeroStage({ caption, pauseLabels }: HeroStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, setPaused } = useHomeScene(canvasRef);
  const [paused, setPausedState] = useState(false);

  const toggle = () => {
    const next = !paused;
    setPausedState(next);
    setPaused(next);
  };

  return (
    <figure
      data-scene-state={state}
      className="relative h-[480px] tablet:absolute tablet:inset-0 tablet:h-auto"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
      <figcaption className="sr-only">{caption}</figcaption>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden veil-hero tablet:block"
      />
      <PauseSceneButton paused={paused} onToggle={toggle} labels={pauseLabels} />
    </figure>
  );
}

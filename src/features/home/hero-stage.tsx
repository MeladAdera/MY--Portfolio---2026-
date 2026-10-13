'use client';

import { useRef } from 'react';

import { useHomeScene } from './hooks/use-home-scene';
import { SceneControlButton } from './scene-control-button';

type HeroStageProps = {
  /** Screen-reader description of what the scene shows. */
  caption: string;
  controlLabels: { pause: string; play: string; replay: string };
};

/**
 * The canvas the builder scene draws on, its text alternative, the veil that keeps the
 * copy readable over it, and the scene control. Fills the hero on tablets and up; on
 * phones it is a 480px panel above the copy.
 */
export function HeroStage({ caption, controlLabels }: HeroStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { state, status, toggle } = useHomeScene(canvasRef);

  return (
    <figure
      data-scene-state={state}
      data-scene-status={status}
      className="relative h-120 tablet:absolute tablet:inset-0 tablet:h-auto"
    >
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 block h-full w-full" />
      <figcaption className="sr-only">{caption}</figcaption>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden veil-hero tablet:block"
      />
      <SceneControlButton status={status} onToggle={toggle} labels={controlLabels} />
    </figure>
  );
}

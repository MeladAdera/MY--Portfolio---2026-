'use client';

import { useCallback, useRef, useState } from 'react';

import { useAutoScroll } from './hooks/use-auto-scroll';
import { sectionProgress, useScrollProgress } from './hooks/use-scroll-progress';
import { useStoryScene } from './hooks/use-story-scene';
import { applyFrame, collectTargets, type FrameTargets } from './lib/apply-frame';
import { PlayClimbButton } from './play-climb-button';
import { ProgressRail } from './progress-rail';
import { ScrollHint } from './scroll-hint';
import { StoryIntro } from './story-intro';
import { StoryStep } from './story-step';

import type { Story } from '@/content';
import type { StoryFrameState, StorySceneHandle } from '@/three/story';

type StoryClimbProps = { story: Story };

/**
 * The climb: a section twelve and a half screens tall with a stage stuck to the top of the
 * viewport. Scrolling through the section moves the story; the scene reports every drawn
 * frame and this component writes it into the text, the rail and the hint.
 */
export function StoryClimb({ story }: StoryClimbProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetsRef = useRef<FrameTargets | null>(null);
  const stillRef = useRef(false);
  const [ticks, setTicks] = useState<readonly number[]>([]);

  const onFrame = useCallback((state: StoryFrameState) => {
    targetsRef.current ??= collectTargets(stageRef.current);
    if (targetsRef.current) applyFrame(targetsRef.current, state, stillRef.current);
  }, []);

  const onReady = useCallback((handle: StorySceneHandle) => {
    stillRef.current = handle.reduced();
    setTicks(handle.pauses.map((pause) => handle.progressAtTime(pause.t0) * 100));
    if (sectionRef.current) handle.setProgress(sectionProgress(sectionRef.current));
  }, []);

  const { handleRef, state } = useStoryScene(canvasRef, { onFrame, onReady });
  useScrollProgress(sectionRef, handleRef);
  const { playing, toggle } = useAutoScroll(sectionRef, handleRef);

  return (
    <section ref={sectionRef} aria-label={story.sectionLabel} className="relative h-[1250vh]">
      <figure
        ref={stageRef}
        data-scene-state={state}
        className="sticky top-0 m-0 h-screen overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-x-0 top-0 block h-[48vh] w-full tablet:inset-0 tablet:h-full"
        />
        <figcaption className="sr-only">{story.sceneCaption}</figcaption>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 shade-story-mobile tablet:shade-story"
        />
        <StoryIntro kicker={story.kicker} title={story.title} />
        <ol className="absolute top-[calc(48vh+4px)] right-5 left-5 m-0 h-0 list-none p-0 tablet:top-[52%] tablet:right-auto tablet:inset-gutter-left tablet:w-[min(470px,36%)]">
          {story.steps.map((step, i) => (
            <StoryStep key={step.heading} index={i + 1} label={story.stepLabel} step={step} />
          ))}
        </ol>
        <ProgressRail ticks={ticks} />
        <ScrollHint>{story.ui.hint}</ScrollHint>
        <PlayClimbButton playing={playing} onToggle={toggle} labels={story.ui} />
      </figure>
    </section>
  );
}

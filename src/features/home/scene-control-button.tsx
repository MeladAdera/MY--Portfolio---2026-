'use client';

import type { SceneStatus } from './hooks/use-home-scene';

type SceneControlButtonProps = {
  status: SceneStatus;
  onToggle: () => void;
  labels: { pause: string; play: string; replay: string };
};

/**
 * The one control in the corner of the stage. While the effect runs it is a pause toggle
 * (`aria-pressed` reflects the paused state); once the effect is complete it replays it.
 * Hidden when the visitor prefers reduced motion, since the scene then never animates.
 */
export function SceneControlButton({ status, onToggle, labels }: SceneControlButtonProps) {
  const label =
    status === 'playing' ? labels.pause : status === 'paused' ? labels.play : labels.replay;

  return (
    <button
      type="button"
      aria-pressed={status === 'complete' ? undefined : status === 'paused'}
      onClick={onToggle}
      className="absolute right-5 bottom-5 h-11 cursor-pointer border border-line bg-bg/82 px-4 font-sans text-label tracking-[0.01em] text-fg motion-reduce:hidden"
    >
      {label}
    </button>
  );
}

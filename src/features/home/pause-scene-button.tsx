'use client';

type PauseSceneButtonProps = {
  paused: boolean;
  onToggle: () => void;
  labels: { pause: string; play: string };
};

/** The small control in the corner of the stage. `aria-pressed` reflects the paused state. */
export function PauseSceneButton({ paused, onToggle, labels }: PauseSceneButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={paused}
      onClick={onToggle}
      className="absolute right-5 bottom-5 h-11 cursor-pointer border border-line bg-bg/82 px-4 font-sans text-label tracking-[0.01em] text-fg"
    >
      {paused ? labels.play : labels.pause}
    </button>
  );
}

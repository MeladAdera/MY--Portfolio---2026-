'use client';

type PlayClimbButtonProps = {
  playing: boolean;
  onToggle: () => void;
  labels: { play: string; pause: string };
};

/**
 * Plays the climb by scrolling the page for the reader; `aria-pressed` reflects the playing
 * state. Hidden under reduced motion, where the scene never walks.
 */
export function PlayClimbButton({ playing, onToggle, labels }: PlayClimbButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={playing}
      onClick={onToggle}
      className="absolute top-[calc(48vh-56px)] right-3 h-11 cursor-pointer border border-line bg-bg/70 px-4 font-sans text-[13px] tracking-[0.01em] text-fg motion-reduce:hidden tablet:top-auto tablet:right-5 tablet:bottom-5"
    >
      {playing ? labels.pause : labels.play}
    </button>
  );
}

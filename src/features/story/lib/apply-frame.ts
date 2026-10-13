import { fillHeight, hintOpacity, introOpacity, paragraphOpacity, stepStyle } from './frame-math';

import type { StoryFrameState } from '@/three/story';

/*
 * The one place that writes per-frame values into the DOM. The scene calls back on every
 * drawn frame; going through React state for that would re-render the page sixty times a
 * second for nothing, so the elements are found once and written directly.
 */

export type FrameTargets = {
  intro: HTMLElement | null;
  hint: HTMLElement | null;
  fill: HTMLElement | null;
  steps: { el: HTMLElement; paragraphs: HTMLElement[] }[];
};

/** Finds the elements marked with data attributes inside the stage. */
export function collectTargets(root: ParentNode | null): FrameTargets | null {
  if (!root) return null;
  return {
    intro: root.querySelector<HTMLElement>('[data-intro]'),
    hint: root.querySelector<HTMLElement>('[data-hint]'),
    fill: root.querySelector<HTMLElement>('[data-fill]'),
    steps: Array.from(root.querySelectorAll<HTMLElement>('[data-step]')).map((el) => ({
      el,
      paragraphs: Array.from(el.querySelectorAll<HTMLElement>('[data-paragraph]')),
    })),
  };
}

/** Writes one frame. With `still` (reduced motion) every paragraph stays fully visible. */
export function applyFrame(targets: FrameTargets, state: StoryFrameState, still: boolean) {
  targets.steps.forEach((step, i) => {
    const style = stepStyle(state.frags[i] ?? 0);
    step.el.style.opacity = style.opacity.toFixed(3);
    step.el.style.transform = `translateY(${style.translateY.toFixed(1)}px)`;
    step.el.style.visibility = style.visible ? 'visible' : 'hidden';
    const u = state.local[i] ?? -1;
    step.paragraphs.forEach((p, j) => {
      p.style.opacity = still ? '1' : paragraphOpacity(u, j).toFixed(3);
    });
  });
  if (targets.intro) targets.intro.style.opacity = introOpacity(state.progress).toFixed(3);
  if (targets.hint) targets.hint.style.opacity = hintOpacity(state.progress).toFixed(3);
  if (targets.fill) targets.fill.style.height = `${fillHeight(state.progress).toFixed(2)}%`;
}

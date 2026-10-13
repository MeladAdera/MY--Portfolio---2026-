import { clamp01, linearRamp } from '@/lib/math';

/*
 * The numbers behind the story page, as pure functions of the scene's frame state and the
 * scroll position. apply-frame.ts writes them to the DOM.
 */

/** A step fades in and settles up by 10px as its opacity rises; below 0.001 it is hidden. */
export const stepStyle = (opacity: number) => ({
  opacity,
  translateY: (1 - opacity) * 10,
  visible: opacity > 0.001,
});

/** Paragraph `j` of a step appears as the reader moves through the stop (`u` is 0..1 inside it). */
export const paragraphOpacity = (u: number, j: number) => linearRamp(u, j * 0.085, j * 0.085 + 0.1);

/** The title block fades out over the first few percent of the scroll. */
export const introOpacity = (progress: number) => 1 - linearRamp(progress, 0.015, 0.06);

/** The scroll hint goes even sooner. */
export const hintOpacity = (progress: number) => 1 - linearRamp(progress, 0.005, 0.03);

/** The rail fill, in percent. */
export const fillHeight = (progress: number) => progress * 100;

/** How far the viewport has travelled through a tall section: 0 at its top, 1 when its bottom meets the viewport's bottom. */
export function scrollProgress(top: number, height: number, viewportHeight: number) {
  const span = height - viewportHeight;
  return span > 0 ? clamp01(-top / span) : 0;
}

/** Clamp to the unit interval. */
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** 0 before `a`, 1 after `b`, linear in between. A zero-length ramp is a step at `a`. */
export function linearRamp(x: number, a: number, b: number) {
  if (b <= a) return x >= a ? 1 : 0;
  return clamp01((x - a) / (b - a));
}

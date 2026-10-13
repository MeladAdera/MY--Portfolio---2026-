import { hexToRgb, luminance, mix, rgbToHex, type Rgb } from '@/lib/color';

/*
 * The Home page colours follow the scene: as the room darkens (k from 0 to 1) the page
 * blends from the light palette to the dark one. Background and lines interpolate
 * directly; text colours are chosen for contrast against the blended background, so the
 * foreground flips from dark to light exactly once, where the two would be equally
 * readable, and the soft tones ease toward the strong one near that flip.
 */

/** Light and dark ends of each blended colour. */
const PAIRS = {
  bg: ['#EEEAE3', '#10151B'],
  surface: ['#F5F2EC', '#141A21'],
  line: ['#DCD6CC', '#27303A'],
  fg: ['#16171A', '#E9EDF1'],
  muted: ['#3F4146', '#B3BDC7'],
  faint: ['#5E5A53', '#8F9AA5'],
} as const;

const BUTTON_FG = { onLight: '#F2EFEA', onDark: '#10151B' } as const;

export const PALETTE_VARS = [
  '--c-bg',
  '--c-surface',
  '--c-line',
  '--c-fg',
  '--c-muted',
  '--c-faint',
  '--c-btn-bg',
  '--c-btn-fg',
] as const;

export type PaletteVar = (typeof PALETTE_VARS)[number];

type Pair = readonly [string, string];

const rgb = (pair: Pair, index: 0 | 1): Rgb => hexToRgb(pair[index]);

/* Luminance at which the dark and light foregrounds contrast equally with the background. */
const FLIP_LUMINANCE =
  Math.sqrt((luminance(rgb(PAIRS.fg, 0)) + 0.05) * (luminance(rgb(PAIRS.fg, 1)) + 0.05)) - 0.05;

/** 1 when the background is dark enough to need the light foreground. */
const needsLightText = (background: Rgb): 0 | 1 =>
  luminance(background) >= FLIP_LUMINANCE ? 0 : 1;

const strongText = (background: Rgb): Rgb => rgb(PAIRS.fg, needsLightText(background));

/* A soft tone leans toward the strong text colour as the background nears the flip point. */
function softText(pair: Pair, background: Rgb): Rgb {
  const distance = Math.abs(Math.log((luminance(background) + 0.05) / (FLIP_LUMINANCE + 0.05)));
  const weight = 1 - Math.min(1, distance / 1.1);
  return mix(rgb(pair, needsLightText(background)), strongText(background), Math.max(0, weight));
}

/** The page's CSS variables for a scene darkness `k` in 0..1. */
export function blendPalette(k: number): Record<PaletteVar, string> {
  const bg = mix(rgb(PAIRS.bg, 0), rgb(PAIRS.bg, 1), k);
  const surface = mix(rgb(PAIRS.surface, 0), rgb(PAIRS.surface, 1), k);
  const fg = strongText(bg);

  return {
    '--c-bg': rgbToHex(bg),
    '--c-surface': rgbToHex(surface),
    '--c-line': rgbToHex(mix(rgb(PAIRS.line, 0), rgb(PAIRS.line, 1), k)),
    '--c-fg': rgbToHex(fg),
    '--c-muted': rgbToHex(softText(PAIRS.muted, bg)),
    '--c-faint': rgbToHex(softText(PAIRS.faint, surface)),
    '--c-btn-bg': rgbToHex(fg),
    '--c-btn-fg': needsLightText(bg) ? BUTTON_FG.onDark : BUTTON_FG.onLight,
  };
}

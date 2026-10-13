/** A colour as three channels in 0..1. */
export type Rgb = readonly [number, number, number];

/** Parses `#rrggbb` into 0..1 channels. */
export function hexToRgb(hex: string): Rgb {
  const channel = (offset: number) => parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return [channel(1), channel(3), channel(5)];
}

/** Formats 0..1 channels as lowercase `#rrggbb`, clamping out-of-range values. */
export function rgbToHex([r, g, b]: Rgb): string {
  const part = (v: number) =>
    Math.round(Math.max(0, Math.min(1, v)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** Linear interpolation between two colours, channel by channel. */
export function mix(a: Rgb, b: Rgb, weight: number): Rgb {
  return [
    a[0] + (b[0] - a[0]) * weight,
    a[1] + (b[1] - a[1]) * weight,
    a[2] + (b[2] - a[2]) * weight,
  ];
}

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));

/** Relative luminance (WCAG) of an sRGB colour, 0 for black and 1 for white. */
export function luminance([r, g, b]: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

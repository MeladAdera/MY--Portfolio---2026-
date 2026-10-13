import localFont from 'next/font/local';

/*
 * Self-hosted copies of the exact files Google Fonts served to the legacy site
 * (Literata v40 as a 400..600 upright instance plus the 400 italic, and the
 * Instrument Sans v4 variable file). next/font/google can only request single
 * weights or the full variable range, and the full-range Literata build renders
 * about 3.7% wider, which changes line breaks. Latin subsets only: the site is English.
 */
export const instrumentSans = localFont({
  src: [
    { path: '../styles/fonts/instrument-sans-latin.woff2', weight: '400 600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-instrument-sans',
  adjustFontFallback: 'Arial',
});

export const literata = localFont({
  src: [
    { path: '../styles/fonts/literata-latin.woff2', weight: '400 600', style: 'normal' },
    { path: '../styles/fonts/literata-italic-latin.woff2', weight: '400', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-literata',
  adjustFontFallback: 'Times New Roman',
});

export const fontVariables = `${instrumentSans.variable} ${literata.variable}`;

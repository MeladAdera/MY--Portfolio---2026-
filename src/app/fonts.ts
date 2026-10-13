import { Instrument_Sans, Literata } from 'next/font/google';

/* Both are variable fonts, self-hosted by next/font at build time. */
export const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
});

export const literata = Literata({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--font-literata',
});

export const fontVariables = `${instrumentSans.variable} ${literata.variable}`;

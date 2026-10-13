import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/*
 * Custom font-size tokens declared in styles/theme.css. tailwind-merge does not know
 * them, and would otherwise read `text-hero` as a colour and drop it when it is
 * combined with `text-faint`.
 */
const fontSizeTokens = [
  'hero',
  'story-title',
  'work-title',
  'project',
  'about',
  'wip',
  'step',
  'pitch',
  'mail',
  'label',
  'kicker',
];

const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: fontSizeTokens }] } },
});

/** Joins class names and resolves conflicting Tailwind utilities, last one wins. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

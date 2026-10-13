import { site } from '@/content';

import type { Metadata, Viewport } from 'next';

/* Shared by both root layouts. Pages add their own title and description. */
export const baseMetadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s — ${site.name}` },
  description: site.description,
};

/* The browser chrome colour per palette; the values mirror --c-bg in styles/theme.css. */
export const lightViewport: Viewport = { themeColor: '#eeeae3' };
export const darkViewport: Viewport = { themeColor: '#0d1217' };

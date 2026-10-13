import { site } from '@/content';
import '@/styles/globals.css';

import { fontVariables } from './fonts';

import type { ReactNode } from 'react';

export type Palette = 'light' | 'dark';

type RootDocumentProps = { palette: Palette; children: ReactNode };

/*
 * The <html> and <body> shared by both root layouts. The palette attribute selects the
 * colour variables in styles/theme.css on the server, so there is no flash on load.
 */
export function RootDocument({ palette, children }: RootDocumentProps) {
  return (
    <html lang={site.locale} data-palette={palette} className={fontVariables}>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  );
}

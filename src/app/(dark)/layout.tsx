import { baseMetadata, darkViewport } from '../metadata';
import { RootDocument } from '../root-document';

import type { ReactNode } from 'react';

export const metadata = baseMetadata;
export const viewport = darkViewport;

/* Root layout for the dark palette: the Work and Story pages. */
export default function DarkLayout({ children }: { children: ReactNode }) {
  return <RootDocument palette="dark">{children}</RootDocument>;
}

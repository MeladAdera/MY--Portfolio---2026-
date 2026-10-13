import { baseMetadata, lightViewport } from '../metadata';
import { RootDocument } from '../root-document';

import type { ReactNode } from 'react';

export const metadata = baseMetadata;
export const viewport = lightViewport;

/* Root layout for the light palette: the Home page. */
export default function LightLayout({ children }: { children: ReactNode }) {
  return <RootDocument palette="light">{children}</RootDocument>;
}

import { site } from '@/content';
import '@/styles/globals.css';

import { fontVariables } from './fonts';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang={site.locale} data-palette="light" className={fontVariables}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}

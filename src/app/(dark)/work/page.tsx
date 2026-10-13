import { workPage } from '@/content';
import { WorkPage } from '@/features/work/work-page';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: workPage.pageTitle,
  description: workPage.description,
};

export default function Page() {
  return <WorkPage />;
}

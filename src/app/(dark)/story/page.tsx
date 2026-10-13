import { story } from '@/content';
import { StoryPage } from '@/features/story/story-page';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: story.pageTitle,
  description: story.description,
};

export default function Page() {
  return <StoryPage />;
}

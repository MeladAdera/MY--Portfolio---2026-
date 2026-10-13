import { Container } from '@/components/container';
import { Kicker } from '@/components/kicker';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { footerLinks, mainNav, navLabels, site, story } from '@/content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: story.pageTitle,
  description: story.description,
};

/* Placeholder until the story feature lands: the shell around the title. */
export default function StoryPage() {
  return (
    <>
      <SiteHeader name={site.name} links={mainNav} navLabel={navLabels.main} currentPath="/story" />
      <Container as="main" className="pt-22 pb-32">
        <Kicker>{story.kicker}</Kicker>
        <h1 className="mt-[14px] font-serif text-story-title font-medium">{story.title}</h1>
      </Container>
      <SiteFooter
        id="contact"
        name={site.name}
        year={site.year}
        links={footerLinks}
        navLabel={navLabels.contact}
      />
    </>
  );
}

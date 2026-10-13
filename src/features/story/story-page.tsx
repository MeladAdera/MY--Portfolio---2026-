import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { footerLinks, mainNav, navLabels, site, story } from '@/content';

import { StoryClimb } from './story-climb';

/** The Story page: the header pinned over the climb, then the contact footer. */
export function StoryPage() {
  return (
    <>
      <SiteHeader
        name={site.name}
        links={mainNav}
        navLabel={navLabels.main}
        currentPath="/story"
        placement="fixed"
      />
      <main>
        <StoryClimb story={story} />
      </main>
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

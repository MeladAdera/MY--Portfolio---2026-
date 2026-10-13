import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { footer, footerLinks, mainNav, navLabels, site, story } from '@/content';

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
        place={`${site.location.city}, ${site.location.country}`}
        timeZone={site.location.timeZone}
        clock={footer.clock}
        next={{ kicker: footer.nextLabel, ...footer.next['/story'] }}
        links={footerLinks}
        navLabel={navLabels.contact}
      />
    </>
  );
}

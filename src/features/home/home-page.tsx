import { SiteFooter } from '@/components/site-footer';
import {
  about,
  experience,
  footer,
  footerLinks,
  hero,
  mainNav,
  navLabels,
  site,
  skills,
} from '@/content';

import { AboutSection } from './about-section';
import { HeroSection } from './hero-section';

/** The Home page: the scene, who I am, then on to the work. */
export function HomePage() {
  return (
    <>
      <HeroSection hero={hero} siteName={site.name} links={mainNav} navLabel={navLabels.main} />
      <main>
        <AboutSection about={about} experience={experience} skills={skills} />
      </main>
      <SiteFooter
        id="contact"
        name={site.name}
        year={site.year}
        place={`${site.location.city}, ${site.location.country}`}
        timeZone={site.location.timeZone}
        clock={footer.clock}
        next={{ kicker: footer.nextLabel, ...footer.next['/'] }}
        links={footerLinks}
        navLabel={navLabels.contact}
      />
    </>
  );
}

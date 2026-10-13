import { SiteFooter } from '@/components/site-footer';
import { about, experience, footerLinks, hero, mainNav, navLabels, site, skills } from '@/content';

import { AboutSection } from './about-section';
import { HeroSection } from './hero-section';

/** The Home page: the scene, who I am, how to reach me. */
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
        links={footerLinks}
        navLabel={navLabels.contact}
      />
    </>
  );
}

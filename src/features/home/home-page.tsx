import { SiteFooter } from '@/components/site-footer';
import {
  about,
  experience,
  footerLinks,
  hero,
  mainNav,
  navLabels,
  projects,
  site,
  skills,
  STATUS_LABEL,
  workInProgress,
} from '@/content';

import { AboutSection } from './about-section';
import { HeroSection } from './hero-section';
import { WorkInProgressSection } from './work-in-progress-section';

/** The Home page: the scene, who I am, what I'm building, how to reach me. */
export function HomePage() {
  return (
    <>
      <HeroSection hero={hero} siteName={site.name} links={mainNav} navLabel={navLabels.main} />
      <main>
        <AboutSection about={about} experience={experience} skills={skills} />
        <WorkInProgressSection
          copy={workInProgress}
          projects={projects}
          statusLabel={STATUS_LABEL}
        />
      </main>
      <SiteFooter
        id="contact"
        name={site.name}
        year={site.year}
        links={footerLinks}
        navLabel={navLabels.contact}
        className="bg-surface"
      />
    </>
  );
}

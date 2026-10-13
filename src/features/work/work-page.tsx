import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import {
  contact,
  email,
  footer,
  footerLinks,
  mainNav,
  navLabels,
  profileLinks,
  projects,
  site,
  workPage,
} from '@/content';

import { ContactSection } from './contact-section';
import { ProjectArticle } from './project-article';
import { ProjectCards } from './project-cards';
import { WorkIntro } from './work-intro';

/** The Work page: intro, the project cards, one article per project, then contact. */
export function WorkPage() {
  return (
    <>
      <SiteHeader name={site.name} links={mainNav} navLabel={navLabels.main} currentPath="/work" />
      <main>
        <WorkIntro kicker={workPage.kicker} title={workPage.title} lede={workPage.lede} />
        <ProjectCards projects={projects} label={workPage.indexLabel} />
        {projects.map((project) => (
          <ProjectArticle
            key={project.id}
            project={project}
            decisionsLabel={workPage.decisionsLabel}
          />
        ))}
        <ContactSection contact={contact} email={email} links={profileLinks} />
      </main>
      <SiteFooter
        name={site.name}
        year={site.year}
        place={`${site.location.city}, ${site.location.country}`}
        timeZone={site.location.timeZone}
        clock={footer.clock}
        next={{ kicker: footer.nextLabel, ...footer.next['/work'] }}
        links={footerLinks}
        navLabel={navLabels.contact}
      />
    </>
  );
}

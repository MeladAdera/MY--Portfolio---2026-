import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import {
  contact,
  email,
  mainNav,
  navLabels,
  profileLinks,
  projects,
  site,
  workPage,
} from '@/content';

import { ContactSection } from './contact-section';
import { ProjectArticle } from './project-article';
import { WorkIntro } from './work-intro';

/** The Work page: intro, one article per project, then contact. */
export function WorkPage() {
  const index = [
    ...projects.map((project) => ({ label: project.name, href: `#${project.id}` })),
    { label: contact.label, href: '#contact' },
  ];

  return (
    <>
      <SiteHeader name={site.name} links={mainNav} navLabel={navLabels.main} currentPath="/work" />
      <main>
        <WorkIntro
          kicker={workPage.kicker}
          title={workPage.title}
          lede={workPage.lede}
          index={index}
          indexLabel={workPage.indexLabel}
        />
        {projects.map((project) => (
          <ProjectArticle
            key={project.id}
            project={project}
            decisionsLabel={workPage.decisionsLabel}
          />
        ))}
        <ContactSection
          contact={contact}
          email={email}
          links={profileLinks}
          place={`${site.location.city}, ${site.location.country}`}
          timeZone={site.location.timeZone}
        />
      </main>
      <SiteFooter name={site.name} year={site.year} />
    </>
  );
}

import { Container } from '@/components/container';
import { Kicker } from '@/components/kicker';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { footerLinks, mainNav, navLabels, site } from '@/content';

/* Placeholder until the home feature lands: the shell around a short introduction. */
export default function HomePage() {
  return (
    <>
      <SiteHeader name={site.name} links={mainNav} navLabel={navLabels.main} currentPath="/" />
      <Container as="main" className="py-24">
        <Kicker>{site.role}</Kicker>
        <h1 className="mt-3 font-serif text-hero font-medium">{site.name}</h1>
        <p className="mt-6 max-w-[34em] font-serif text-[19px] leading-[1.65] text-muted">
          {site.description}
        </p>
      </Container>
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

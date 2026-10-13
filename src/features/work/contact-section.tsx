import { Container } from '@/components/container';

import { CopyEmailButton } from './copy-email-button';
import { LocalTime } from './local-time';

import type { SiteLink } from '@/components/site-header';
import type { Contact } from '@/content';

type ContactSectionProps = {
  contact: Contact;
  email: string;
  links: readonly SiteLink[];
  place: string;
  timeZone: string;
};

/** The closing entry of the page: the same two columns as a project, so contact reads as part of the work. */
export function ContactSection({ contact, email, links, place, timeZone }: ContactSectionProps) {
  return (
    <Container
      as="section"
      id="contact"
      aria-labelledby="contact-title"
      className="grid grid-cols-1 gap-y-6 pt-30 pb-22 tablet:pt-44 tablet:pb-32 desktop:grid-cols-[minmax(0,250px)_minmax(0,1fr)] desktop:gap-x-[clamp(40px,7vw,104px)] desktop:gap-y-0"
    >
      <h2 id="contact-title" className="text-label font-normal text-faint desktop:pt-3">
        {contact.label}
      </h2>
      <div className="max-w-[680px]">
        <p className="max-w-[22em] font-serif text-pitch text-fg">{contact.pitch}</p>
        <p className="mt-9 flex flex-wrap items-baseline gap-x-6 gap-y-3">
          <a
            href={`mailto:${email}`}
            className="font-serif text-mail font-medium [overflow-wrap:anywhere] text-fg underline decoration-accent decoration-2 underline-offset-[0.22em] transition-colors duration-200 hover:text-white motion-reduce:transition-none"
          >
            {email}
          </a>
          <CopyEmailButton text={email} labels={contact.copy} messages={contact.status} />
        </p>
        <p className="mt-[22px] flex gap-7 text-[16px]">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="py-[10px] underline decoration-line underline-offset-[0.3em] hover:decoration-accent"
            >
              {link.label}
            </a>
          ))}
        </p>
        <p className="mt-[22px] text-[15px] text-faint">
          {place}
          <LocalTime timeZone={timeZone} template={contact.clock} />
        </p>
      </div>
    </Container>
  );
}

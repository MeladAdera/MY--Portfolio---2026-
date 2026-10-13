import { Container } from '@/components/container';

import { CopyEmailButton } from './copy-email-button';

import type { SiteLink } from '@/components/site-header';
import type { Contact } from '@/content';

type ContactSectionProps = {
  contact: Contact;
  email: string;
  links: readonly SiteLink[];
};

/**
 * The closing entry of the page: what I'm looking for, said plainly, then the email large
 * with an accent rule under it, and the profiles.
 */
export function ContactSection({ contact, email, links }: ContactSectionProps) {
  return (
    <Container
      as="section"
      id="contact"
      aria-labelledby="contact-title"
      className="pt-30 pb-22 tablet:pt-44 tablet:pb-32"
    >
      <h2 id="contact-title" className="text-label font-normal text-accent">
        {contact.label}
      </h2>
      <p className="mt-5 max-w-[26em] text-[clamp(22px,2.4vw,30px)] leading-[1.4] font-medium text-fg">
        {contact.pitch}
      </p>
      <div className="mt-10 flex flex-wrap items-end gap-x-6 gap-y-4">
        <div className="max-w-[520px] grow border-b border-line">
          <a
            href={`mailto:${email}`}
            className="-mb-px inline-block border-b-2 border-accent pb-2 text-[clamp(24px,3vw,36px)] leading-[1.2] font-medium tracking-[-0.015em] [overflow-wrap:anywhere] text-fg transition-colors duration-200 hover:text-white motion-reduce:transition-none"
          >
            {email}
          </a>
        </div>
        <CopyEmailButton text={email} labels={contact.copy} messages={contact.status} />
      </div>
      <p className="mt-8 flex gap-7 text-[15px] text-muted">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="py-[10px] transition-colors duration-200 hover:text-fg motion-reduce:transition-none"
          >
            {link.label}
          </a>
        ))}
      </p>
    </Container>
  );
}

import { Container } from '@/components/container';
import { cn } from '@/lib/cn';

import { ContactEnvelope } from './contact-envelope';
import { CopyEmailButton } from './copy-email-button';

import type { SiteLink } from '@/components/site-header';
import type { Contact } from '@/content';

type ContactSectionProps = {
  contact: Contact;
  email: string;
  /** The profile that gets its own button. */
  linkedIn: SiteLink;
  /** All profiles, in the line under the buttons. */
  links: readonly SiteLink[];
};

const button =
  'inline-flex h-12 items-center px-[22px] text-[15px] font-medium transition-colors duration-200 motion-reduce:transition-none';
const filled = cn(button, 'bg-btn text-btn-fg hover:bg-fg');
const outlined = cn(button, 'border border-line text-fg hover:border-accent');

/**
 * The invitation that closes the page: the sealed letter on the left, and on the right the
 * title, a friendly line, the buttons (mail, LinkedIn, the resume once it exists), the email
 * itself with Copy for whoever prefers that, and the profiles.
 */
export function ContactSection({ contact, email, linkedIn, links }: ContactSectionProps) {
  return (
    <Container
      as="section"
      id="contact"
      aria-labelledby="contact-title"
      className="grid grid-cols-1 gap-9 pt-30 pb-22 tablet:pt-44 tablet:pb-32 desktop:grid-cols-[minmax(0,420px)_minmax(0,1fr)] desktop:items-center desktop:gap-x-[72px]"
    >
      <ContactEnvelope
        caption={contact.envelope}
        address={email}
        className="mx-auto desktop:mx-0"
      />
      <div>
        <p className="text-label text-faint">{contact.label}</p>
        <h2 id="contact-title" className="mt-[14px] font-serif text-project font-medium">
          {contact.title}
        </h2>
        <p className="mt-[18px] max-w-[30em] font-serif text-[18px] leading-[1.65] text-muted tablet:text-[19px]">
          {contact.pitch}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={`mailto:${email}`} className={filled}>
            {contact.hello}
          </a>
          <a href={linkedIn.href} className={outlined}>
            {linkedIn.label}
          </a>
          {contact.resume && (
            <a href={contact.resume.href} className={outlined} download>
              {contact.resume.label}
            </a>
          )}
        </div>
        <p className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-[15px] text-muted">
          <a
            href={`mailto:${email}`}
            className="[overflow-wrap:anywhere] underline decoration-line underline-offset-[0.3em] hover:decoration-accent"
          >
            {email}
          </a>
          <CopyEmailButton text={email} labels={contact.copy} messages={contact.status} />
        </p>
        <p className="mt-3 flex flex-wrap gap-x-6 text-[15px] text-muted">
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
      </div>
    </Container>
  );
}

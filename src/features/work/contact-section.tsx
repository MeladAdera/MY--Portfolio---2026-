import { Container } from '@/components/container';
import { SocialIcon } from '@/components/social-icon';
import { cn } from '@/lib/cn';

import { ContactEnvelope } from './contact-envelope';

import type { SiteLink } from '@/components/site-header';
import type { Contact } from '@/content';

type ContactSectionProps = {
  contact: Contact;
  email: string;
  linkedIn: SiteLink;
};

const button =
  'inline-flex h-12 items-center gap-2.5 rounded-md px-5 text-[15px] font-medium transition-[background-color,border-color,color,transform] duration-200 active:translate-y-px motion-reduce:transition-none';
const primary = cn(button, 'bg-accent text-[#0d1217] hover:bg-[#6cb0f2]');
const secondary = cn(button, 'border border-line text-fg hover:border-accent hover:bg-surface');

/** A download arrow, drawn to sit beside the service marks. */
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M4.5 17.5V20h15v-2.5" />
    </svg>
  );
}

/**
 * The invitation that closes the page: the sealed letter on the left, and on the right the
 * title, a friendly line and three buttons: mail, LinkedIn and the resume.
 */
export function ContactSection({ contact, email, linkedIn }: ContactSectionProps) {
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
        <div className="mt-9 flex flex-wrap gap-3">
          <a href={`mailto:${email}`} className={primary}>
            <SocialIcon kind="email" className="h-[18px] w-[18px]" />
            {contact.hello}
          </a>
          <a href={linkedIn.href} className={secondary}>
            <SocialIcon kind="linkedin" className="h-4 w-4" />
            {linkedIn.label}
          </a>
          <a href={contact.resume.href} download className={secondary}>
            <DownloadIcon className="h-[18px] w-[18px]" />
            {contact.resume.label}
          </a>
        </div>
      </div>
    </Container>
  );
}

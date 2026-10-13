import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { contact, email, linkedIn, profileLinks } from '@/content';

import { ContactSection } from './contact-section';

describe('ContactSection', () => {
  it('invites with the title, the mail and LinkedIn buttons, the email with Copy, and the profiles', () => {
    render(
      <ContactSection contact={contact} email={email} linkedIn={linkedIn} links={profileLinks} />,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Get in touch with me.');
    expect(screen.getByRole('link', { name: 'Say hello' })).toHaveAttribute(
      'href',
      `mailto:${email}`,
    );
    expect(screen.getAllByRole('link', { name: 'LinkedIn' })[0]).toHaveAttribute(
      'href',
      linkedIn.href,
    );
    expect(screen.getByRole('link', { name: email })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });

  it('leaves the resume button out until a resume is in the content', () => {
    render(
      <ContactSection contact={contact} email={email} linkedIn={linkedIn} links={profileLinks} />,
    );
    expect(screen.queryByRole('link', { name: /resume/i })).toBeNull();
  });

  it('shows the sealed letter as an image with its description, addressed to the email', () => {
    render(
      <ContactSection contact={contact} email={email} linkedIn={linkedIn} links={profileLinks} />,
    );
    const picture = screen.getByRole('img', { name: contact.envelope });
    expect(picture).toHaveTextContent(email);
  });
});

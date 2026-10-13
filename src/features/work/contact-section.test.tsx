import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { contact, email, linkedIn } from '@/content';

import { ContactSection } from './contact-section';

describe('ContactSection', () => {
  it('invites with the title and three buttons: mail, LinkedIn and the resume', () => {
    render(<ContactSection contact={contact} email={email} linkedIn={linkedIn} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Get in touch with me.');
    expect(screen.getByRole('link', { name: 'Say hello' })).toHaveAttribute(
      'href',
      `mailto:${email}`,
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', linkedIn.href);
    const resume = screen.getByRole('link', { name: 'Download resume' });
    expect(resume).toHaveAttribute('href', '/resume/Melad_Adera.pdf');
    expect(resume).toHaveAttribute('download');
  });

  it('shows the sealed letter as an image with its description, addressed to the email', () => {
    render(<ContactSection contact={contact} email={email} linkedIn={linkedIn} />);
    const picture = screen.getByRole('img', { name: contact.envelope });
    expect(picture).toHaveTextContent(email);
  });
});

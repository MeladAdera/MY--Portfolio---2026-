import { contactSchema } from './schemas';

export const contact = contactSchema.parse({
  label: 'Contact',
  title: 'Get in touch with me.',
  pitch:
    'If you have any questions, want to work together, or just want to say hi, reach me by email or LinkedIn.',
  hello: 'Say hello',
  envelope:
    'A letter slides into an envelope addressed to me, the flap closes and a blue seal is pressed on it.',
  copy: { idle: 'Copy', copied: 'Copied', failed: 'Copy failed' },
  status: { copied: 'Email address copied.', failed: 'Could not copy the email address.' },
});

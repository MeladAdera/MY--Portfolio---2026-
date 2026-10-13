import { contactSchema } from './schemas';

export const contact = contactSchema.parse({
  label: 'Contact',
  pitch: 'I’m looking for a team where I can keep building and learning. Email reaches me fastest.',
  copy: { idle: 'Copy', copied: 'Copied', failed: 'Copy failed' },
  status: { copied: 'Email address copied.', failed: 'Could not copy the email address.' },
  clock: '. It’s {time} there now ({zone}).',
});

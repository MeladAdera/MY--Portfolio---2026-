export type SocialKind = 'email' | 'linkedin' | 'github';

/** Which service a contact link points to, from its href; null for anything else. */
export function socialKind(href: string): SocialKind | null {
  if (href.startsWith('mailto:')) return 'email';
  let host: string;
  try {
    host = new URL(href).hostname;
  } catch {
    return null;
  }
  if (host === 'linkedin.com' || host.endsWith('.linkedin.com')) return 'linkedin';
  if (host === 'github.com' || host.endsWith('.github.com')) return 'github';
  return null;
}

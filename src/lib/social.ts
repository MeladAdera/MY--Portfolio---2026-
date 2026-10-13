export type SocialKind = 'email' | 'instagram' | 'facebook' | 'linkedin' | 'github';

const hosts: Record<Exclude<SocialKind, 'email'>, string> = {
  instagram: 'instagram.com',
  facebook: 'facebook.com',
  linkedin: 'linkedin.com',
  github: 'github.com',
};

/** Which service a contact link points to, from its href; null for anything else. */
export function socialKind(href: string): SocialKind | null {
  if (href.startsWith('mailto:')) return 'email';
  let host: string;
  try {
    host = new URL(href).hostname;
  } catch {
    return null;
  }
  for (const [kind, domain] of Object.entries(hosts) as [SocialKind, string][]) {
    if (host === domain || host.endsWith(`.${domain}`)) return kind;
  }
  return null;
}

import { site } from '@/content';

/* Placeholder until the home feature lands: proves the tokens, fonts and content wiring. */
export default function HomePage() {
  return (
    <main className="mx-auto max-w-site px-5 py-24 tablet:px-gutter">
      <p className="text-kicker text-faint">{site.role}</p>
      <h1 className="mt-3 font-serif text-hero font-medium">{site.name}</h1>
      <p className="mt-6 max-w-[34em] font-serif text-[19px] leading-[1.65] text-muted">
        {site.description}
      </p>
    </main>
  );
}

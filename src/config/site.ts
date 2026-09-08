/**
 * Resolves the canonical site URL used for SEO (canonical tags, OpenGraph,
 * sitemap, robots). Order: explicit public URL -> Netlify deploy URL ->
 * localhost. Any non-localhost host is forced to https and stripped of a
 * trailing slash, so a misconfigured env var can't emit http:// URLs in prod.
 */
function resolveSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    'http://localhost:3000';
  try {
    const u = new URL(raw);
    const isLocal =
      u.hostname === 'localhost' || u.hostname === '127.0.0.1';
    if (!isLocal && u.protocol === 'http:') u.protocol = 'https:';
    return u.toString().replace(/\/$/, '');
  } catch {
    return raw.replace(/\/$/, '');
  }
}

/** Static site-wide constants. Safe to import from server or client. */
export const siteConfig = {
  name: 'Better Days',
  shortName: 'BetterDays',
  wordmark: 'betterdays',
  tagline: 'Small steps. Better days.',
  splashTagline: 'Small steps, every day',
  description:
    'Better Days is a habit tracker that logs the story behind each habit, not just a checkmark. Build good habits, break bad ones, and see your own trends over time.',
  themeColor: '#e8734a',
  url: resolveSiteUrl(),
  ogImage: '/og.png',
  links: {
    about: '/about',
    privacy: '/privacy',
    contact: '/contact',
  },
} as const;

export type SiteConfig = typeof siteConfig;

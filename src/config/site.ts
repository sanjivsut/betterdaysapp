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
  // Resolution order: explicit public URL -> Netlify deploy URL -> localhost.
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.URL ??
    'http://localhost:3000',
  ogImage: '/og.png',
  links: {
    about: '/about',
    privacy: '/privacy',
    contact: '/contact',
  },
} as const;

export type SiteConfig = typeof siteConfig;

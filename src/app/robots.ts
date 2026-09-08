import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Private zones — never index.
        disallow: ['/app/', '/admin/', '/onboarding', '/api/', '/login', '/signup'],
      },
    ],
    sitemap: new URL('/sitemap.xml', siteConfig.url).toString(),
    host: siteConfig.url,
  };
}

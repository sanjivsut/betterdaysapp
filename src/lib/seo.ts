import type { Metadata } from 'next';
import { siteConfig } from '@/config/site';

/**
 * Builds full SEO metadata for a PUBLIC page: title, description, canonical
 * URL, and OpenGraph tags. Authenticated routes do not use this — they are
 * marked noindex.
 */
export function pageMetadata({
  title,
  description = siteConfig.description,
  path = '/',
  noindex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  noindex?: boolean;
}): Metadata {
  const url = new URL(path, siteConfig.url).toString();
  const fullTitle = title ? `${title} — ${siteConfig.name}` : `${siteConfig.name} — ${siteConfig.tagline}`;

  return {
    title: title ?? undefined,
    description,
    alternates: { canonical: url },
    robots: noindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      siteName: siteConfig.name,
      title: fullTitle,
      description,
      images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [siteConfig.ogImage],
    },
  };
}

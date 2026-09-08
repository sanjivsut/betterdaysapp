import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/** Public pages only. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths = ['/', '/about', '/privacy', '/contact'];
  return paths.map((path) => ({
    url: new URL(path, siteConfig.url).toString(),
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.6,
  }));
}

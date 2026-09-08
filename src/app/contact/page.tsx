import type { Metadata } from 'next';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  path: '/contact',
  description: 'Get in touch with the Better Days team for support or feedback.',
});

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Contact</h1>
        <p className="mt-6 text-content-muted">
          Questions, bugs or feedback are all welcome. Email{' '}
          <a
            href="mailto:hello@betterdays.app"
            className="font-medium text-brand-dark underline"
          >
            hello@betterdays.app
          </a>{' '}
          and we&apos;ll get back to you.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}

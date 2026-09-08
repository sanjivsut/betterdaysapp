import type { Metadata } from 'next';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy',
  path: '/privacy',
  description:
    'How Better Days handles your account, habits and logged notes. Your data is private to your account and is not sold or used for ad tracking.',
});

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold">Privacy</h1>
        <p className="mt-2 text-sm text-content-subtle">
          Plain-language summary. This is a starting point and will be expanded
          into a full policy before launch.
        </p>

        <div className="mt-8 space-y-6 text-content-muted">
          <section>
            <h2 className="text-lg font-semibold text-content">What we store</h2>
            <p className="mt-2">
              Your email address, your password (stored scrambled, never in
              plain text) if you sign up with email, your name and timezone, and
              the habits and entries you create — including the notes you write.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-content">
              How it is used
            </h2>
            <p className="mt-2">
              Your habit data is used only to show you your own dashboard,
              charts and tips. The tips come from your own history and nobody
              else&apos;s. We do not sell your data or use it for advertising.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-content">
              Third parties
            </h2>
            <p className="mt-2">
              If you choose &ldquo;Continue with Google&rdquo;, Google handles
              that sign-in. A few trusted service providers help run Better Days
              — for example to deliver reminder notifications — and each one only
              receives what it needs to do its job. None of them are given your
              data to use for their own purposes.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-content">Your control</h2>
            <p className="mt-2">
              You can edit or delete any habit and its entries from Settings.
              Contact us to delete your account entirely.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

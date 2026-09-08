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
              Your email address, a hashed password (if you sign up with
              email/password), your display name and timezone, and the habits and
              log entries you create — including the free-text notes you add.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-content">
              How it is used
            </h2>
            <p className="mt-2">
              Your habit data is used only to show you your dashboard, progress
              charts and insights. Insights are generated from your own logged
              history. We do not sell your data or use it for advertising.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-content">
              Third parties
            </h2>
            <p className="mt-2">
              Sign-in can be handled by Google if you choose that option.
              Notifications may be delivered through a push provider. Hosting and
              the database are managed infrastructure providers. Each only
              receives what it needs to perform its function.
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

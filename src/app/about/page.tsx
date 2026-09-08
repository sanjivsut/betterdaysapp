import type { Metadata } from 'next';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About',
  path: '/about',
  description:
    'Why Better Days exists: habit tracking that keeps the context behind every entry, so you can build good habits and break bad ones against your own history.',
});

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="font-display text-3xl font-semibold">About Better Days</h1>
        <div className="mt-6 space-y-4 text-content-muted">
          <p>
            Better Days started from a simple frustration with streak apps: a row
            of checkmarks tells you <em>that</em> you did something, but never{' '}
            <em>what</em> or <em>why</em>. When a habit slips, the checkmark
            disappears and takes the useful information with it.
          </p>
          <p>
            Better Days is a habit tracker built around context. Every time you
            log a habit you can add a short note — how much, where you were, what
            was going on. Over time those notes become the most valuable part of
            your history. They show you that the sugar tends to appear at weekend
            gatherings, or that the morning walk holds together on days you lay
            your shoes out the night before.
          </p>
          <p>
            The app works for habits you want to build and habits you want to
            break. Progress is always measured against what is normal for you, so
            a week where you had one slice of cake instead of your usual three is
            shown as progress, not failure.
          </p>
          <p>
            You can add Better Days to your phone or computer home screen and use
            it like any other app, even offline, and set one gentle daily
            reminder per habit in your own local time. The current version is
            free.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

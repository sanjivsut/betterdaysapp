import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteHeader } from '@/components/marketing/SiteHeader';
import { SiteFooter } from '@/components/marketing/SiteFooter';
import { HeroDecor } from '@/components/marketing/HeroDecor';
import { AppPreview } from '@/components/marketing/AppPreview';
import { Walkthrough } from '@/components/marketing/Walkthrough';
import { InstallBanner } from '@/components/pwa/InstallBanner';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/config/site';

// Statically generated (no dynamic flags) — pre-rendered to HTML at build time.
export const metadata: Metadata = pageMetadata({
  path: '/',
  description:
    'Better Days is a habit tracker that captures the story behind each habit, not just a checkmark. Build good habits, break bad ones, and watch your own trends improve over time.',
});

const STEPS = [
  {
    icon: 'plus',
    color: 'text-brand',
    bg: 'bg-brand/12',
    title: 'Log it',
    body: 'Record what actually happened with a short note — "one slice of cake at a friend’s birthday, down from my usual three." Context beats a bare checkmark for building good habits and breaking bad ones.',
  },
  {
    icon: 'chart-bar',
    color: 'text-success',
    bg: 'bg-success/12',
    title: 'Track it',
    body: 'Every entry builds a clear picture of your progress — your current streak, how much you have done this week, and how that compares with what is normal for you.',
  },
  {
    icon: 'bulb',
    color: 'text-[#3b82c4]',
    bg: 'bg-[#3b82c4]/12',
    title: 'Learn from it',
    body: 'Better Days looks back over your own notes and shows you the patterns — the days, places and moods where a habit tends to slip — so you can plan around them.',
  },
];

const BENEFITS = [
  {
    icon: 'bell',
    title: 'Gentle daily reminders',
    body: 'A single, customizable daily nudge per habit keeps tracking consistent without turning into noise.',
  },
  {
    icon: 'notes',
    title: 'Notes, not just checkmarks',
    body: 'Record how much, and what was going on. Better Days remembers the story behind each habit — not just a yes or no.',
  },
  {
    icon: 'device-mobile-share',
    title: 'Works on every device',
    body: 'Add Better Days to your phone or computer home screen and open it like any other app. It keeps working even without a connection.',
  },
  {
    icon: 'lock',
    title: 'Your data stays yours',
    body: 'Your habits and notes are private to your account. No ad tracking, no selling your behavioral data.',
  },
];

const FAQS = [
  {
    q: 'How is Better Days different from a normal habit tracker?',
    a: 'Most habit trackers only record whether you did something. Better Days records what happened and lets you add a short note, so you can see how a good habit is growing or how a bad habit is shrinking relative to your own past — not an arbitrary goal.',
  },
  {
    q: 'Can I track habits I want to quit or reduce?',
    a: 'Yes. Mark a habit as one to build (do more of) or one to break (do less of). For a break habit you can log both the good days and the slips, and Better Days shows whether you are above or below what is usual for you.',
  },
  {
    q: 'Is Better Days free?',
    a: 'Yes. The current version is completely free — habit tracking, progress charts, reminders and tips based on your own history. Paid plans may come later, but the core stays free.',
  },
  {
    q: 'Do I need to install an app from an app store?',
    a: 'No. Open Better Days in your browser, then choose "Add to Home Screen" on your phone or "Install" on your computer to get an icon you can tap like a normal app. It also works offline.',
  },
  {
    q: 'Will I get reminders at the right time?',
    a: 'Yes. You choose one reminder time per habit, and it arrives in your local time — you set your timezone once when you first sign in.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: siteConfig.name,
  applicationCategory: 'HealthApplication',
  operatingSystem: 'Web',
  description: siteConfig.description,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />

      {/* Shows only when the browser can install the app (or on iOS Safari);
          `empty:hidden` collapses the wrapper when the banner renders nothing. */}
      <div className="mx-auto max-w-app px-4 pt-4 empty:hidden sm:px-6">
        <InstallBanner />
      </div>

      <main>
        {/* ---------- Hero ---------- */}
        <section
          className="relative overflow-hidden text-white"
          style={{
            background: 'linear-gradient(135deg, #e8734a, #d9522e)',
          }}
        >
          <HeroDecor />
          <div className="relative mx-auto max-w-app px-4 py-16 sm:px-6 sm:py-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
                  Small steps.
                  <br />
                  Better days.
                </h1>
                <p className="mt-4 max-w-md text-base text-white/90 sm:text-lg">
                  A habit tracker that logs the context behind every habit — not
                  just a checkmark — so you can build good habits and break bad
                  ones against your own history.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button
                    as="link"
                    href="/signup"
                    size="lg"
                    variant="onColor"
                    className="w-full sm:w-auto"
                  >
                    Get started free
                  </Button>
                  <Button
                    as="link"
                    href="#how-it-works"
                    size="lg"
                    variant="onColorOutline"
                    className="w-full sm:w-auto"
                  >
                    See how it works
                  </Button>
                </div>
              </div>
              <div className="lg:pl-6">
                <AppPreview />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section
          id="how-it-works"
          className="mx-auto max-w-app px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold">
              How Better Days works
            </h2>
            <p className="mt-3 text-content-muted">
              A simple loop that turns everyday habit tracking into something you
              can actually learn from.
            </p>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-3">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${step.bg} ${step.color}`}
                >
                  <Icon name={step.icon} className="text-2xl" />
                </span>
                <h3 className="text-lg font-semibold">
                  <span className="text-content-subtle">{i + 1}. </span>
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-content-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Walkthrough (one real example) ---------- */}
        <section className="bg-surface">
          <div className="mx-auto max-w-app px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-semibold">
                See it with one habit
              </h2>
              <p className="mt-3 text-content-muted">
                Here is the whole loop for someone cutting down on sugar — add,
                log, see the trend, learn from it.
              </p>
            </div>
            <div className="mt-12">
              <Walkthrough />
            </div>
          </div>
        </section>

        {/* ---------- Why Better Days ---------- */}
        <section className="bg-surface">
          <div className="mx-auto max-w-app px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-semibold">
                Why Better Days
              </h2>
              <p className="mt-3 text-content-muted">
                Built for people who have tried streak apps and want something
                that explains the streak.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <div
                  key={b.title}
                  className="flex gap-4 rounded-card border border-border bg-background p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-badge bg-brand/12 text-brand">
                    <Icon name={b.icon} className="text-xl" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{b.title}</h3>
                    <p className="mt-1 text-sm text-content-muted">{b.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="mx-auto max-w-app px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center font-display text-3xl font-semibold">
              Frequently asked questions
            </h2>
            <div className="mt-10 divide-y divide-border">
              {FAQS.map((f) => (
                <details key={f.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                    {f.q}
                    <Icon
                      name="chevron-down"
                      className="shrink-0 text-content-subtle transition-transform group-open:rotate-180"
                    />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-content-muted">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Secondary CTA ---------- */}
        <section className="mx-auto max-w-app px-4 pb-20 sm:px-6">
          <div className="overflow-hidden rounded-[24px] border border-border bg-surface p-8 text-center sm:p-12">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Start your first better day
            </h2>
            <p className="mx-auto mt-3 max-w-md text-content-muted">
              Add a habit, log it with a note, and let the trends build. It takes
              about a minute to set up.
            </p>
            <Button
              as="link"
              href="/signup"
              size="lg"
              className="mt-6"
            >
              Get started free
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />

      {/* Testimonials / social proof — placeholder for a future pass. */}
      <div hidden data-placeholder="testimonials" />

      <p className="pb-8 text-center text-xs text-content-subtle">
        <Link href="/app/dashboard" className="hover:text-content">
          Already have an account? Open the app
        </Link>
      </p>
    </>
  );
}

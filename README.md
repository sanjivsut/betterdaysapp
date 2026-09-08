# Better Days

Habit-tracking Progressive Web App. Log habits with the context behind each
entry — not just a checkmark — and track them against your own history.

This is the free, pre-monetization MVP. Payments are intentionally not built;
`src/lib/plan.ts` is the extension point (`isPremium()` always returns `false`).

## Stack

| Concern        | Choice |
| -------------- | ------ |
| Framework      | Next.js (App Router) |
| Public pages   | Static generation (SEO: metadata, OpenGraph, `sitemap.xml`, `robots.txt`) |
| App pages      | Client-rendered behind auth (`/app/*`), `noindex` |
| Styling        | Tailwind CSS |
| Backend        | Next.js route handlers → deployed as Netlify Functions |
| Database       | Netlify Database (managed Postgres / Neon) via `@neondatabase/serverless` |
| Auth           | Auth.js (NextAuth v5): email/password + Google, Postgres adapter, JWT sessions |
| Charts         | Recharts |
| Hosting        | Netlify (`@netlify/plugin-nextjs`) |

No route uses `dynamic = 'force-dynamic'` / per-request SSR by design.

## Local setup

```bash
npm install
cp .env.example .env.local     # then fill in DATABASE_URL and AUTH_SECRET
npm run db:migrate             # applies src/lib/schema.sql (idempotent)
npm run icons:generate         # regenerate PWA icons (already committed)
npm run dev
```

You need a Postgres connection string in `DATABASE_URL` (Neon's free tier works).
`AUTH_SECRET` can be any random string locally. Google sign-in needs
`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`; without them, email/password still works.

### Make yourself an admin

`/admin` is gated on the `is_admin` column (checked server-side in
`src/lib/admin.ts`). After signing up:

```sql
UPDATE users SET is_admin = true WHERE email = 'you@example.com';
```

Sign out and back in so the flag lands in your session token.

## Project layout

```
src/
  app/
    (public)          page.tsx, about, privacy, contact, sitemap.ts, robots.ts, manifest.ts
    login, signup, onboarding
    app/              authenticated zone — dashboard, progress, insights, settings
    admin/            protected admin panel
    api/              route handlers (habits, log-entries, dashboard, reminders,
                      insights, progress, account, admin/*, auth/*, push/*)
  components/          brand, ui, marketing, app (nav/shell), dashboard, habits,
                      progress, insights, settings, admin, splash, pwa
  lib/                db, auth(.config), repo, habits, insights, plan,
                      notifications (stub), habit-visuals, seo, api, client
  config/             site.ts, nav.ts
public/               sw.js, icons/
scripts/              migrate.mjs, generate-icons.mjs
```

## Notable stubs / extension points

- **Payments** — none. `src/lib/plan.ts` (`isPremium`, `planLimits`, `limitsFor`).
- **Push delivery** — `src/lib/notifications.ts` `sendHabitReminder()` logs only.
  Wire OneSignal here. Subscriptions are stored via `/api/push/subscribe`.
- **Reminders** — free tier writes one row per habit; the `reminders` table and
  `/api/reminders` already allow multiple/custom schedules for a future tier.
- **Insights** — `src/lib/insights.ts` is rule-based and designed to be replaced
  by note pattern-detection without changing the Insights view.
- **Landing page** — `AppPreview` is a hand-built mock; swap in a real dashboard
  screenshot before launch. Testimonials section is a placeholder.

## Deploy (Netlify)

1. Connect the repo. Netlify auto-detects Next.js (`netlify.toml` pins Node 20
   and the Next runtime plugin).
2. Add a Netlify Database — it injects `NETLIFY_DATABASE_URL`.
3. Set env vars: `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`,
   `NEXT_PUBLIC_SITE_URL`, `AUTH_TRUST_HOST=true`.
4. Run the schema once against the database (`npm run db:migrate` with
   `DATABASE_URL` set to the Netlify database URL, or via a one-off).
```

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
| Database       | Postgres (local: Docker; prod: Netlify Database) via `pg` |
| Auth           | Auth.js (NextAuth v5): email/password + Google, Postgres adapter, JWT sessions |
| Charts         | Recharts |
| Hosting        | Netlify (`@netlify/plugin-nextjs`) |

No route uses `dynamic = 'force-dynamic'` / per-request SSR by design.

## Local setup

```bash
npm install
cp .env.example .env.local     # then fill in AUTH_SECRET (+ Google keys, optional)
docker-compose up -d           # local Postgres on localhost:5432
npm run db:migrate             # applies src/lib/schema.sql (idempotent)
npm run dev
```

`.env.example` already points `DATABASE_URL` at the Docker Postgres.
`AUTH_SECRET` can be any random string locally. Google sign-in needs
`AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`; without them, email/password still works.
`npm run icons:generate` regenerates the PWA icons (already committed).

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
   and the Next runtime plugin). Build command is just `npm run build`.
2. Add a Netlify Database — it injects `NETLIFY_DATABASE_URL` (the app reads
   `DATABASE_URL` first, then `NETLIFY_DATABASE_URL`, so don't also set a
   `DATABASE_URL` unless it points at that same database).
3. Set env vars: `AUTH_SECRET` (fresh random), `AUTH_URL` (the site URL),
   `AUTH_TRUST_HOST=true`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`,
   `NEXT_PUBLIC_SITE_URL` (the site URL — build-time, redeploy after setting).
4. Apply the schema once, from your machine, against the prod DB:
   `DATABASE_URL="<prod url>" npm run db:migrate`
   (or paste `src/lib/schema.sql` into the Netlify DB SQL console).
5. In Google Cloud, add the prod redirect URI
   `https://<site>/api/auth/callback/google` and publish the consent screen.
6. After first login, promote yourself:
   `UPDATE users SET is_admin = true WHERE email = '<you>';`
```

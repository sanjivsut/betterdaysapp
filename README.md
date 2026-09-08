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

## Deploy to Netlify — step by step

`netlify.toml` sets the build command to `npm run build`, publishes `.next`,
pins Node 20, and enables `@netlify/plugin-nextjs`. Migrations are **not** part
of the build — you run them once by hand (step 4).

### 0. Prerequisites

- The repo is pushed to GitHub/GitLab/Bitbucket.
- A Google OAuth 2.0 **Web application** client exists (Google Cloud Console →
  APIs & Services → Credentials). Keep the Client ID and Client secret handy.

### 1. Create the Netlify site

1. Netlify → **Add new site → Import an existing project** → pick the repo.
2. Netlify reads `netlify.toml`, so leave the build settings as detected
   (build command `npm run build`, publish directory `.next`).
3. Deploy. The first build **succeeds** even without a database — the app only
   touches the DB at request time, not at build time. Note the site URL, e.g.
   `https://your-site.netlify.app`.

### 2. Provision the database

Netlify DB is Postgres powered by Neon.

1. Site → **Extensions** (or the "Add a database" prompt) → add **Netlify DB**.
2. It provisions a database and makes `NETLIFY_DATABASE_URL` available to builds
   and functions. Auto-provisioned databases are a trial — open the Neon
   Console from the extension panel and **Claim** it to a free Neon account so
   it doesn't expire.
3. Get the **pooled** connection string: Neon Console → project →
   **Dashboard → Connection string** → turn **Connection pooling ON** (the host
   then contains `-pooler`). It looks like:

   ```
   postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

> `NETLIFY_DATABASE_URL` does not show up as an editable row in the Environment
> variables table — that's normal (it's injected by the extension). Setting
> `DATABASE_URL` explicitly (next step) is the reliable path; the app reads
> `DATABASE_URL` first, then falls back to `NETLIFY_DATABASE_URL`.

### 3. Set environment variables

Site → **Site configuration → Environment variables** → add:

| Key | Value | Notes |
| --- | --- | --- |
| `DATABASE_URL` | the pooled Neon string from step 2 | |
| `AUTH_SECRET` | output of `openssl rand -base64 33` | a fresh value, not the dev placeholder |
| `AUTH_URL` | `https://your-site.netlify.app` | your real site URL (or custom domain) |
| `AUTH_TRUST_HOST` | `true` | |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client secret | |
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.netlify.app` | baked into the client bundle at build — redeploy after changing |

### 4. Apply the database schema (once)

`src/lib/schema.sql` is idempotent. From your machine, using the same pooled
connection string:

```bash
DATABASE_URL="postgresql://...-pooler...neon.tech/neondb?sslmode=require&channel_binding=require" \
  npm run db:migrate
```

Expect `Applying schema… Done.` (A `pg` SSL deprecation warning is harmless.)
Alternatively, paste the whole of `src/lib/schema.sql` into the Neon Console's
SQL editor and run it.

Verify the eight tables exist:

```bash
DATABASE_URL="<same url>" node -e "const{Client}=require('pg');(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();const r=await c.query(\"select table_name from information_schema.tables where table_schema='public' order by 1\");console.log(r.rows.map(x=>x.table_name).join(', '));await c.end()})()"
# accounts, habits, log_entries, push_subscriptions, reminders, sessions, users, verification_token
```

### 5. Configure Google OAuth for production

Google Cloud Console → APIs & Services → **Credentials** → your OAuth client:

- **Authorized JavaScript origins**: add `https://your-site.netlify.app`
- **Authorized redirect URIs**: add `https://your-site.netlify.app/api/auth/callback/google`
  (keep the `http://localhost:3000/...` one for local dev)

Then **OAuth consent screen → Publish app** (moves it out of "Testing", where
only listed test users can sign in). The `openid`/`email`/`profile` scopes are
non-sensitive, so publishing is immediate — no Google review.

### 6. Redeploy

Netlify → **Deploys → Trigger deploy → Clear cache and deploy**. The cache
clear is required so the new `NEXT_PUBLIC_SITE_URL` is compiled into the bundle.

### 7. Make yourself an admin

Sign in on the live site once (creates your `users` row), then:

```bash
DATABASE_URL="<neon url>" node -e "const{Client}=require('pg');(async()=>{const c=new Client({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});await c.connect();await c.query('update users set is_admin = true where email = \$1',['you@example.com']);console.log('promoted');await c.end()})()"
```

(or `UPDATE users SET is_admin = true WHERE email = 'you@example.com';` in the
Neon SQL editor). Sign out and back in so the flag lands in your session token,
then open `/admin`.

### 8. Smoke test

- `https://your-site.netlify.app/` — landing page renders
- `/robots.txt` and `/sitemap.xml` — URLs point at your production domain
- `/api/auth/providers` — lists `google` and `credentials`
- Sign in with Google → first time lands on `/onboarding`, then `/app/dashboard`
- `/admin` — reachable after step 7

### Troubleshooting

| Symptom | Fix |
| --- | --- |
| Build fails immediately | Check the deploy log for the failing command. The build itself needs no DB; a DB error means something still runs `db:migrate` in the build — confirm `netlify.toml` build command is `npm run build`. |
| App loads but every authed page errors / 500 | `DATABASE_URL` wrong or unreachable. Confirm it's the **pooled** Neon string (`-pooler` in host) and set in Netlify env vars. |
| Google login → `redirect_uri_mismatch` | The redirect URI in Google must be exactly `https://your-site.netlify.app/api/auth/callback/google` (no trailing slash, https). |
| Google login → "app not verified / access blocked" | Publish the OAuth consent screen, or add the tester's email under **Test users**. |
| SEO tags / OG image show `localhost` | `NEXT_PUBLIC_SITE_URL` not set, or set but not redeployed with cache cleared. |
| Redirect loop between `/onboarding` and `/app` | Complete onboarding once in the browser; the session token refreshes on the next request. |

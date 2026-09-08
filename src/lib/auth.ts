import NextAuth from 'next-auth';
import type { Pool } from 'pg';
import PostgresAdapter from '@auth/pg-adapter';
import { authConfig } from '@/lib/auth.config';
import { getPool } from '@/lib/db';

/**
 * Full Auth.js instance — the shared config plus the Postgres adapter.
 * Imported by the `/api/auth/[...nextauth]` route handler and by server
 * components that need `auth()`. `proxy.ts` uses its own adapter-less instance.
 *
 * The adapter persists Google OAuth users + accounts into our `users` table.
 * Credentials users are created by the `/api/auth/register` route directly.
 *
 * `getPool()` is lazy, so `next build` can import this without a live database.
 */
const lazyPool = new Proxy({} as Pool, {
  get(_t, prop) {
    const real = getPool() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PostgresAdapter(lazyPool),
});

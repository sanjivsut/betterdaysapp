import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { sql } from '@/lib/db';

/**
 * Edge-safe Auth.js configuration.
 *
 * This half contains NO database adapter so it can run in Next.js middleware
 * (Edge runtime). The Postgres adapter is attached in `auth.ts`, which is only
 * imported by the Node route handler. Both halves share these providers and
 * callbacks.
 *
 * Session strategy is JWT: the Credentials provider requires it, and it lets
 * middleware read role/plan/onboarding flags without a DB round-trip.
 */

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const authConfig = {
  trustHost: true,
  session: {
    strategy: 'jwt',
    // Stay signed in until an explicit sign-out. The window is renewed on
    // every visit (at most once a day), so an active user is never logged
    // out; 365 days is the practical ceiling since browsers cap cookie
    // lifetime at ~400 days.
    maxAge: 60 * 60 * 24 * 365,
    updateAge: 60 * 60 * 24,
  },
  pages: { signIn: '/login' },
  providers: [
    Google({
      // A user may sign up with email/password, then later "Continue with
      // Google" using the same address. Link rather than error.
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const rows = (await sql`
          SELECT id, email, name, display_name, image, password_hash, is_active
          FROM users
          WHERE email = ${email.toLowerCase()}
          LIMIT 1
        `) as Array<{
          id: number;
          email: string;
          name: string | null;
          display_name: string | null;
          image: string | null;
          password_hash: string | null;
          is_active: boolean;
        }>;

        const user = rows[0];
        if (!user || !user.password_hash || !user.is_active) return null;

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.display_name ?? user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) token.uid = user.id;

      // Load authoritative role / plan / onboarding state from the DB on
      // sign-in, on an explicit session refresh, and — until it flips true —
      // on every request while the user has not finished onboarding. The last
      // case is a tiny, self-healing window that avoids an onboarding→app
      // redirect loop if the client-side session refresh lags.
      if (user?.id || trigger === 'update' || token.onboarded !== true) {
        const id = Number(token.uid);
        if (Number.isFinite(id)) {
          const rows = (await sql`
            SELECT is_admin, plan, is_active, onboarded_at
            FROM users WHERE id = ${id} LIMIT 1
          `) as Array<{
            is_admin: boolean;
            plan: string;
            is_active: boolean;
            onboarded_at: string | null;
          }>;
          const u = rows[0];
          if (u) {
            token.isAdmin = u.is_admin;
            token.plan = u.plan;
            token.isActive = u.is_active;
            token.onboarded = Boolean(u.onboarded_at);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.uid ?? '');
        session.user.isAdmin = Boolean(token.isAdmin);
        session.user.plan = (token.plan as string) ?? 'free';
        session.user.onboarded = Boolean(token.onboarded);
        session.user.isActive = token.isActive !== false;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

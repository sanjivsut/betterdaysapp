import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';

// Next 16 `proxy` convention (formerly `middleware`); runs on the Node.js
// runtime. Adapter-less Auth.js instance — this only needs to decode the JWT to
// gate routes, not touch the database adapter.
const { auth } = NextAuth(authConfig);

/**
 * Gatekeeping for the private zones:
 *  - /app/*      requires a session and completed onboarding
 *  - /onboarding requires a session
 *  - /admin/*    requires a session AND user.isAdmin (server-side check;
 *                the /admin layout re-verifies against the DB)
 * Non-admins hitting /admin are redirected away, not shown an error page.
 */
export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const session = req.auth;
  const isLoggedIn = Boolean(session?.user);

  const isApp = path.startsWith('/app');
  const isAdmin = path.startsWith('/admin');
  const isOnboarding = path === '/onboarding';

  if ((isApp || isAdmin || isOnboarding) && !isLoggedIn) {
    const url = new URL('/login', nextUrl);
    url.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && session?.user) {
    if (isAdmin && !session.user.isAdmin) {
      return NextResponse.redirect(new URL('/app/dashboard', nextUrl));
    }
    if (session.user.isActive === false) {
      return NextResponse.redirect(new URL('/login?error=AccountDisabled', nextUrl));
    }
    if (isApp && !session.user.onboarded) {
      return NextResponse.redirect(new URL('/onboarding', nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/app/:path*', '/admin/:path*', '/onboarding'],
};

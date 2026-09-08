'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/app/Sidebar';
import { BottomTabBar } from '@/components/app/BottomTabBar';
import { TopBar } from '@/components/app/TopBar';
import { SplashScreen } from '@/components/splash/SplashScreen';

const SPLASH_KEY = 'bd-splash-seen';

/**
 * Authenticated app frame. Renders the animated splash once per browser session,
 * then the responsive nav: bottom tab bar on mobile, left sidebar on md+. Both
 * are driven by the shared route config in src/config/nav.ts.
 */
export function AppShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name?: string | null; email?: string | null };
}) {
  const [showSplash, setShowSplash] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SPLASH_KEY) === '1';
    } catch {
      /* storage unavailable */
    }
    setShowSplash(!seen);
    setReady(true);
  }, []);

  function dismissSplash() {
    try {
      sessionStorage.setItem(SPLASH_KEY, '1');
    } catch {
      /* ignore */
    }
    setShowSplash(false);
  }

  if (!ready) return null;

  return (
    <>
      {showSplash && <SplashScreen onDone={dismissSplash} />}
      <div className="mx-auto flex min-h-dvh max-w-app">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar name={user.name} email={user.email} />
          <main className="flex-1 pb-24 md:pb-8">{children}</main>
        </div>
      </div>
      <BottomTabBar />
    </>
  );
}

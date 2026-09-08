'use client';

import { useEffect } from 'react';

/**
 * Registers the service worker that makes the app installable + offline-shell.
 * Runs in every environment. In development the SW is registered with
 * `?mode=dev`, which tells it to skip all caching (so it never serves stale
 * build output) while still providing a real `fetch` handler — enough for
 * Chrome to treat the app as installable and fire `beforeinstallprompt`.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const swUrl =
      process.env.NODE_ENV === 'production' ? '/sw.js' : '/sw.js?mode=dev';
    const register = () => {
      navigator.serviceWorker.register(swUrl).catch(() => {
        /* registration failures are non-fatal */
      });
    };
    if (document.readyState === 'complete') register();
    else {
      window.addEventListener('load', register);
      return () => window.removeEventListener('load', register);
    }
  }, []);
  return null;
}

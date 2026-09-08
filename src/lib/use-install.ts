'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * PWA install state.
 *
 * - `installed`    — already running as an installed app (standalone)
 * - `installable`  — Chrome/Edge/Android fired `beforeinstallprompt`; call
 *                    `promptInstall()` to show the native dialog
 * - `ios`          — iOS Safari (no install event; needs Share → Add to Home Screen)
 * - `other`        — no native prompt available; user adds via the browser menu
 *
 * The `beforeinstallprompt` event is captured by an inline script in the root
 * layout (it can fire before React hydrates) and stashed on
 * `window.__bdInstallEvent`.
 */
export type InstallStatus = 'installed' | 'installable' | 'ios' | 'other';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface Window {
    __bdInstallEvent?: BeforeInstallPromptEvent | null;
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches === true ||
    // iOS Safari
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  const ua = navigator.userAgent || '';
  return (
    /iphone|ipad|ipod/i.test(ua) ||
    // iPadOS 13+ reports as Mac
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener('bd:installable', onChange);
  window.addEventListener('bd:installed', onChange);
  const mq = window.matchMedia('(display-mode: standalone)');
  mq.addEventListener?.('change', onChange);
  return () => {
    window.removeEventListener('bd:installable', onChange);
    window.removeEventListener('bd:installed', onChange);
    mq.removeEventListener?.('change', onChange);
  };
}

function getSnapshot(): InstallStatus {
  if (isStandalone()) return 'installed';
  if (window.__bdInstallEvent) return 'installable';
  if (isIOS()) return 'ios';
  return 'other';
}

export function useInstall() {
  const status = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => 'other' as InstallStatus,
  );

  const promptInstall = useCallback(async (): Promise<
    'accepted' | 'dismissed' | 'unavailable'
  > => {
    const event = window.__bdInstallEvent;
    if (!event) return 'unavailable';
    await event.prompt();
    const { outcome } = await event.userChoice;
    window.__bdInstallEvent = null;
    window.dispatchEvent(new Event('bd:installed'));
    return outcome;
  }, []);

  return { status, promptInstall };
}

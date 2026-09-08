'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

/**
 * Connectivity state, from the browser's `online` / `offline` events.
 * `navigator.onLine` is best-effort (it can be true on a network with no
 * internet), so components that fetch also treat a failed request while
 * `navigator.onLine === false` as offline.
 */
function subscribe(onChange: () => void): () => void {
  window.addEventListener('online', onChange);
  window.addEventListener('offline', onChange);
  return () => {
    window.removeEventListener('online', onChange);
    window.removeEventListener('offline', onChange);
  };
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true, // assume online during SSR
  );
}

/**
 * Runs `callback` when the connection is restored after having been lost.
 * Driven by the `bd:reconnected` event that <OfflineIndicator /> dispatches.
 */
export function useReconnect(callback: () => void): void {
  const ref = useRef(callback);
  useEffect(() => {
    ref.current = callback;
  });
  useEffect(() => {
    const handler = () => ref.current();
    window.addEventListener('bd:reconnected', handler);
    return () => window.removeEventListener('bd:reconnected', handler);
  }, []);
}

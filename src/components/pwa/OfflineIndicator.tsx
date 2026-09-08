'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useOnline } from '@/lib/use-online';

/**
 * Global connectivity feedback:
 *  - while offline: a persistent pill telling the user they're offline and that
 *    the app will reconnect on its own;
 *  - when the connection returns: a short "Back online" pill, and a
 *    `bd:reconnected` event so data views can reload themselves.
 *
 * Positioned above the mobile bottom nav so it never covers it.
 */
export function OfflineIndicator() {
  const online = useOnline();
  const wasOffline = useRef(false);
  const [backOnline, setBackOnline] = useState(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      setBackOnline(false);
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      setBackOnline(true);
      window.dispatchEvent(new Event('bd:reconnected'));
      const t = setTimeout(() => setBackOnline(false), 4000);
      return () => clearTimeout(t);
    }
  }, [online]);

  if (!online) {
    return (
      <div
        role="status"
        aria-live="assertive"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-6"
      >
        <div className="flex items-center gap-2 rounded-full border border-warning/40 bg-surface px-4 py-2 text-sm text-content shadow-lg">
          <Icon name="wifi-off" className="text-warning" />
          <span>
            You&apos;re offline. Turn on Wi-Fi or mobile data — Better Days will
            reconnect on its own.
          </span>
        </div>
      </div>
    );
  }

  if (backOnline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4 md:bottom-6"
      >
        <div className="flex items-center gap-2 rounded-full border border-success/40 bg-surface px-4 py-2 text-sm text-content shadow-lg">
          <Icon name="wifi" className="text-success" />
          <span>Back online.</span>
        </div>
      </div>
    );
  }

  return null;
}

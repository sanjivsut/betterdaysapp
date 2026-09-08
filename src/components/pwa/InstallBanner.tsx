'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useInstall } from '@/lib/use-install';

const DISMISS_KEY = 'bd-install-dismissed';

/**
 * Small dismissible "Install" nudge for the dashboard. Chrome/Android no longer
 * shows an automatic install banner, so we surface our own. Hidden once
 * installed or dismissed.
 */
export function InstallBanner() {
  const { status, promptInstall } = useInstall();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  if (dismissed || (status !== 'installable' && status !== 'ios')) return null;

  function close() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mb-4 flex items-center gap-3 rounded-card border border-border bg-surface p-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-badge bg-brand/12 text-brand">
        <Icon name="device-mobile-down" className="text-lg" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Add Better Days to your home screen</p>
        <p className="text-xs text-content-subtle">
          {status === 'ios'
            ? 'Tap Share, then “Add to Home Screen”.'
            : 'Opens in its own window and works offline.'}
        </p>
      </div>
      {status === 'installable' && (
        <button
          onClick={() => promptInstall()}
          className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-dark"
        >
          Install
        </button>
      )}
      <button
        onClick={close}
        aria-label="Dismiss"
        className="shrink-0 rounded-full p-1 text-content-subtle hover:bg-surface-muted"
      >
        <Icon name="x" />
      </button>
    </div>
  );
}

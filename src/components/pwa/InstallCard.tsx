'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useInstall } from '@/lib/use-install';

/** Install guidance for the Settings screen, adapting to the platform. */
export function InstallCard() {
  const { status, promptInstall } = useInstall();
  const [busy, setBusy] = useState(false);

  if (status === 'installed') {
    return (
      <p className="flex items-center gap-2 text-sm text-success">
        <Icon name="circle-check" /> Better Days is installed on this device.
      </p>
    );
  }

  if (status === 'installable') {
    return (
      <div className="space-y-2">
        <p className="text-sm text-content-muted">
          Add Better Days to your home screen — it opens in its own window and
          works offline.
        </p>
        <Button
          size="sm"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await promptInstall();
            setBusy(false);
          }}
        >
          <Icon name="download" /> Install Better Days
        </Button>
      </div>
    );
  }

  if (status === 'ios') {
    return (
      <div className="space-y-2 text-sm text-content-muted">
        <p>Add Better Days to your iPhone or iPad home screen:</p>
        <ol className="ml-1 space-y-1">
          <li className="flex items-center gap-2">
            <span className="text-content-subtle">1.</span> Tap the
            <Icon name="share-2" className="mx-0.5 text-base" /> Share button in
            Safari&apos;s toolbar.
          </li>
          <li className="flex items-center gap-2">
            <span className="text-content-subtle">2.</span> Choose
            <span className="mx-1 rounded bg-surface-muted px-1.5 py-0.5 text-xs">
              Add to Home Screen
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-content-subtle">3.</span> Tap
            <span className="mx-1 font-medium">Add</span>.
          </li>
        </ol>
      </div>
    );
  }

  return (
    <p className="text-sm text-content-muted">
      Open your browser menu and choose &ldquo;Add to Home screen&rdquo; (phone)
      or &ldquo;Install&rdquo; (computer). Better Days then opens in its own
      window and works offline.
    </p>
  );
}

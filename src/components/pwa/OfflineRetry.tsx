'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

/** Auto-reloads the offline page once the connection returns; also a manual retry. */
export function OfflineRetry() {
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const onOnline = () => window.location.reload();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, []);

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={checking}
      onClick={() => {
        setChecking(true);
        window.location.reload();
      }}
    >
      <Icon name={checking ? 'rotate-clockwise' : 'refresh'} /> Try again
    </Button>
  );
}

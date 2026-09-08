'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

/** First-login step: confirm display name + timezone (timezone drives reminders). */
export function OnboardingForm({
  defaultName = '',
}: {
  defaultName?: string;
}) {
  const router = useRouter();
  const { update } = useSession();

  const guessedTz = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);

  const zones = useMemo(() => {
    // Supported() is available in modern browsers; fall back to a short list.
    const supported =
      (Intl as unknown as { supportedValuesOf?: (k: string) => string[] })
        .supportedValuesOf?.('timeZone') ?? [];
    return supported.length ? supported : [guessedTz, 'UTC'];
  }, [guessedTz]);

  const [name, setName] = useState(defaultName);
  const [tz, setTz] = useState(guessedTz);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ displayName: name.trim(), timezone: tz }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not save. Try again.');
      setPending(false);
      return;
    }
    // Refresh the JWT so `onboarded` flips before middleware re-checks.
    await update();
    router.replace('/app/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Display name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
          className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Timezone</span>
        <select
          value={tz}
          onChange={(e) => setTz(e.target.value)}
          className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
        >
          {zones.map((z) => (
            <option key={z} value={z}>
              {z.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <span className="mt-1 block text-xs text-content-subtle">
          Used to send your daily reminders at the right local time.
        </span>
      </label>

      {error && <p className="text-sm text-danger">{error}</p>}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Saving…' : 'Continue to Better Days'}
      </Button>
    </form>
  );
}

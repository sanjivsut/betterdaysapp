import { FlameIcon } from '@/components/brand/FlameIcon';

export const metadata = { title: 'Offline', robots: { index: false } };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
      <FlameIcon className="h-14 w-auto text-brand opacity-60" />
      <h1 className="font-display text-2xl font-semibold">You&apos;re offline</h1>
      <p className="text-sm text-content-muted">
        Better Days needs a connection to sync your habits. Your logged entries
        are safe — reconnect and open the app again.
      </p>
    </main>
  );
}

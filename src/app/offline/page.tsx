import { FlameIcon } from '@/components/brand/FlameIcon';
import { OfflineRetry } from '@/components/pwa/OfflineRetry';

export const metadata = { title: 'Offline', robots: { index: false } };

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
      <FlameIcon className="h-14 w-auto text-brand opacity-60" />
      <h1 className="font-display text-2xl font-semibold">You&apos;re offline</h1>
      <p className="text-sm text-content-muted">
        Better Days needs a connection to load your habits. Turn on Wi-Fi or
        mobile data — anything you have already saved is safe, and this page will
        reload itself the moment you&apos;re back online.
      </p>
      <OfflineRetry />
    </main>
  );
}

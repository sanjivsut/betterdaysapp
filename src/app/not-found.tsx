import Link from 'next/link';
import { FlameIcon } from '@/components/brand/FlameIcon';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-4 px-6 text-center">
      <FlameIcon className="h-14 w-auto text-brand opacity-60" />
      <h1 className="font-display text-2xl font-semibold">Page not found</h1>
      <p className="text-sm text-content-muted">
        That page doesn&apos;t exist or has moved.
      </p>
      <Button as="link" href="/">
        Back to home
      </Button>
    </main>
  );
}

import { redirect } from 'next/navigation';
import { Logo } from '@/components/brand/Logo';
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';
import { Providers } from '@/components/providers/Providers';
import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';

export const metadata = { title: 'Get started', robots: { index: false } };

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/onboarding');

  const rows = (await sql`
    SELECT display_name, name, onboarded_at
    FROM users WHERE id = ${Number(session.user.id)} LIMIT 1
  `) as Array<{ display_name: string | null; name: string | null; onboarded_at: string | null }>;

  if (rows[0]?.onboarded_at) redirect('/app/dashboard');
  const defaultName = rows[0]?.display_name ?? rows[0]?.name ?? '';

  return (
    <Providers>
      <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
        <Logo className="mb-8" />
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold">
            Welcome to Better Days
          </h1>
          <p className="mb-6 mt-1 text-sm text-content-muted">
            Two quick details and you&apos;re in.
          </p>
          <OnboardingForm defaultName={defaultName} />
        </div>
      </main>
    </Providers>
  );
}

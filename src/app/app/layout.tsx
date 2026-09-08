import { redirect } from 'next/navigation';
import { Providers } from '@/components/providers/Providers';
import { AppShell } from '@/components/app/AppShell';
import { auth } from '@/lib/auth';

// Authenticated zone. Client-rendered UI; no SEO, no SSR data fetching.
// Middleware already gates access — this is defense in depth.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/app/dashboard');
  if (!session.user.onboarded) redirect('/onboarding');

  return (
    <Providers>
      <AppShell user={{ name: session.user.name, email: session.user.email }}>
        {children}
      </AppShell>
    </Providers>
  );
}

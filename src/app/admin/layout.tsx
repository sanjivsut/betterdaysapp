import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Providers } from '@/components/providers/Providers';
import { requireAdmin } from '@/lib/admin';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

/**
 * Server-side gate. `requireAdmin` re-checks the is_admin flag against the DB.
 * Non-admins are redirected to the app, not shown a permission error.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminId = await requireAdmin();
  if (!adminId) redirect('/app/dashboard');

  return (
    <Providers>
      <div className="min-h-dvh bg-background">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <span className="rounded-full bg-brand/12 px-2 py-0.5 text-xs font-medium text-brand-dark">
                Admin
              </span>
            </div>
            <Link
              href="/app/dashboard"
              className="text-sm text-content-muted hover:text-content"
            >
              Back to app
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-app px-4 py-6 sm:px-6">{children}</main>
      </div>
    </Providers>
  );
}

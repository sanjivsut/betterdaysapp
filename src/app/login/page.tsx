import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { AuthCard } from '@/components/auth/AuthCard';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Log in',
  path: '/login',
  noindex: true,
});

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8" aria-label="Better Days home">
        <Logo />
      </Link>
      <Suspense fallback={<div className="h-96 w-full max-w-sm" />}>
        <AuthCard mode="login" />
      </Suspense>
    </main>
  );
}

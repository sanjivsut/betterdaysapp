import { Suspense } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { AuthCard } from '@/components/auth/AuthCard';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Sign up',
  path: '/signup',
  noindex: true,
});

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8" aria-label="Better Days home">
        <Logo />
      </Link>
      <Suspense fallback={<div className="h-96 w-full max-w-sm" />}>
        <AuthCard mode="signup" />
      </Suspense>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { GoogleIcon } from '@/components/brand/GoogleIcon';

const ERRORS: Record<string, string> = {
  CredentialsSignin: 'That email and password combination is not right.',
  AccountDisabled: 'This account has been disabled. Contact support.',
  OAuthAccountNotLinked:
    'This email is already registered with a different sign-in method.',
};

export function AuthCard({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/app/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get('error') ? (ERRORS[params.get('error')!] ?? 'Something went wrong.') : null,
  );

  const isSignup = mode === 'signup';

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      if (isSignup) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? 'Could not create your account.');
          setPending(false);
          return;
        }
      }
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError(ERRORS[result.error] ?? 'That did not work. Try again.');
        setPending(false);
        return;
      }
      // New accounts always need onboarding; middleware will route as needed.
      router.push(isSignup ? '/onboarding' : callbackUrl);
      router.refresh();
    } catch {
      setError('Network error. Try again.');
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-2xl font-semibold">
        {isSignup ? 'Create your account' : 'Welcome back'}
      </h1>
      <p className="mt-1 text-sm text-content-muted">
        {isSignup
          ? 'Start tracking habits with context in about a minute.'
          : 'Log in to pick up where you left off.'}
      </p>

      <Button
        type="button"
        variant="secondary"
        className="mt-6 w-full"
        onClick={() => signIn('google', { callbackUrl })}
      >
        <GoogleIcon /> Continue with Google
      </Button>

      <div className="my-5 flex items-center gap-3 text-xs text-content-subtle">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {isSignup && (
          <Field
            label="Name"
            type="text"
            value={name}
            onChange={setName}
            autoComplete="name"
            required
          />
        )}
        <Field
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <Field
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={8}
          required
          hint={isSignup ? 'At least 8 characters.' : undefined}
        />

        {error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending
            ? 'One moment…'
            : isSignup
              ? 'Create account'
              : 'Log in'}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-content-muted">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-dark">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{' '}
            <Link href="/signup" className="font-medium text-brand-dark">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function Field({
  label,
  hint,
  onChange,
  ...props
}: {
  label: string;
  hint?: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
      />
      {hint && <span className="mt-1 block text-xs text-content-subtle">{hint}</span>}
    </label>
  );
}

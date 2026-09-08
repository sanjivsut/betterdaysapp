'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Logo } from '@/components/brand/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { Icon } from '@/components/ui/Icon';

/** Mobile top app bar: logo left, initials avatar right (profile menu). */
export function TopBar({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="pt-safe sticky top-0 z-40 border-b border-border bg-surface md:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <Link href="/app/dashboard" aria-label="Better Days home">
          <Logo size="sm" />
        </Link>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Account menu"
            aria-expanded={open}
          >
            <Avatar name={name} email={email} size={32} />
          </button>
          {open && (
            <>
              <button
                type="button"
                aria-hidden
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
                <div className="border-b border-border px-3 py-2 text-xs text-content-subtle">
                  {email}
                </div>
                <Link
                  href="/app/settings"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-surface-muted"
                  onClick={() => setOpen(false)}
                >
                  <Icon name="settings" /> Settings
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-content-muted hover:bg-surface-muted"
                >
                  <Icon name="logout" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

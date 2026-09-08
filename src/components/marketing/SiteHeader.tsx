'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

const LINKS = [
  { href: '#how-it-works', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '/about', label: 'About' },
];

/**
 * Public site header. Sits on the plain surface background, separate from the
 * hero gradient. Desktop: inline nav + solid CTA. Mobile: hamburger opens a
 * drawer with the same links + CTA.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-app items-center justify-between px-4 py-3.5 sm:px-6">
        <Link href="/" aria-label="Better Days home">
          <Logo size="xl" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm text-content-muted transition-colors hover:text-content"
            >
              {l.label}
            </Link>
          ))}
          <Button as="link" href="/signup" size="sm">
            Get started
          </Button>
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-content md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? 'x' : 'menu-2'} className="text-2xl" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-surface md:hidden">
          <nav
            className="mx-auto flex max-w-app flex-col gap-1 px-4 py-3"
            aria-label="Mobile"
          >
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-lg px-2 py-2.5 text-sm text-content-muted hover:bg-surface-muted"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Button
              as="link"
              href="/signup"
              size="sm"
              className="mt-2"
              onClick={() => setOpen(false)}
            >
              Get started
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { appNav } from '@/config/nav';
import { Logo } from '@/components/brand/Logo';
import { Icon } from '@/components/ui/Icon';

/** Tablet/desktop primary nav. Hidden below md where the bottom bar takes over. */
export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="px-5 py-5">
        <Link href="/app/dashboard" aria-label="Better Days home">
          <Logo size="sm" />
        </Link>
      </div>
      <nav className="flex-1 px-3" aria-label="Primary">
        <ul className="space-y-1">
          {appNav.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-brand/12 text-brand-dark'
                      : 'text-content-muted hover:bg-surface-muted'
                  }`}
                >
                  <Icon name={item.icon} className="text-lg" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="m-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-content-muted hover:bg-surface-muted"
      >
        <Icon name="logout" className="text-lg" />
        Sign out
      </button>
    </aside>
  );
}

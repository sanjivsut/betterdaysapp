'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { appNav } from '@/config/nav';
import { Icon } from '@/components/ui/Icon';

/** Mobile primary nav. Hidden at md+ where the sidebar takes over. */
export function BottomTabBar() {
  const pathname = usePathname();
  return (
    <nav
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface md:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-app">
        {appNav.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${
                  active ? 'text-brand' : 'text-content-subtle'
                }`}
              >
                <Icon name={item.icon} className="text-xl" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

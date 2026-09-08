import Link from 'next/link';
import { Logo } from '@/components/brand/Logo';
import { siteConfig } from '@/config/site';

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-app flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/" aria-label="Better Days home">
          <Logo size="sm" />
        </Link>
        <nav
          className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-content-muted"
          aria-label="Footer"
        >
          <Link href="/about" className="hover:text-content">
            About
          </Link>
          <Link href="/privacy" className="hover:text-content">
            Privacy
          </Link>
          <Link href="/contact" className="hover:text-content">
            Contact
          </Link>
        </nav>
        <p className="text-xs text-content-subtle">
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
      </div>
    </footer>
  );
}

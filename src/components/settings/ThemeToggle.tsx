'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';

type Mode = 'light' | 'dark' | 'system';

/** Persists to localStorage('bd-theme'); the root layout script reads it on boot. */
export function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('bd-theme');
      setMode(stored === 'dark' || stored === 'light' ? stored : 'system');
    } catch {
      /* ignore */
    }
  }, []);

  function apply(next: Mode) {
    setMode(next);
    try {
      if (next === 'system') {
        localStorage.removeItem('bd-theme');
      } else {
        localStorage.setItem('bd-theme', next);
      }
    } catch {
      /* ignore */
    }
    const dark =
      next === 'dark' ||
      (next === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
  }

  const options: { value: Mode; icon: string; label: string }[] = [
    { value: 'light', icon: 'sun', label: 'Light' },
    { value: 'dark', icon: 'moon', label: 'Dark' },
    { value: 'system', icon: 'device-desktop', label: 'System' },
  ];

  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => apply(o.value)}
          className={`flex flex-1 flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-xs transition-colors ${
            mode === o.value
              ? 'border-brand bg-brand/10 text-brand-dark'
              : 'border-border text-content-muted'
          }`}
        >
          <Icon name={o.icon} className="text-lg" />
          {o.label}
        </button>
      ))}
    </div>
  );
}

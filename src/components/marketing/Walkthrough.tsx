'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/brand/Logo';

/**
 * Auto-playing walkthrough of one real example — the habit "Cut sugar" — so a
 * visitor sees exactly how the app is used before signing up. Four steps loop
 * every few seconds; the dots are clickable. `prefers-reduced-motion` falls
 * back to a static, numbered list of the same steps.
 */

const STEPS = [
  {
    label: 'Add the habit',
    caption: 'Say what you want to change and what’s normal for you now.',
    screen: <AddScreen />,
  },
  {
    label: 'Log it with a note',
    caption: 'Not just a checkmark — record what actually happened.',
    screen: <LogScreen />,
  },
  {
    label: 'See the trend',
    caption: 'Better Days compares it with your own usual, not a target.',
    screen: <TrendScreen />,
  },
  {
    label: 'Learn from it',
    caption: 'Patterns from your notes show you where to plan ahead.',
    screen: <InsightScreen />,
  },
];

const INTERVAL = 3600;

export function Walkthrough() {
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    if (reduced) return;
    timer.current = setInterval(
      () => setActive((s) => (s + 1) % STEPS.length),
      INTERVAL,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [reduced]);

  function jump(i: number) {
    setActive(i);
    if (timer.current) clearInterval(timer.current);
  }

  if (reduced) {
    return (
      <ol className="mx-auto max-w-md space-y-4">
        {STEPS.map((s, i) => (
          <li key={s.label} className="flex gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/12 text-sm font-semibold text-brand-dark">
              {i + 1}
            </span>
            <div>
              <p className="font-medium">{s.label}</p>
              <p className="text-sm text-content-muted">{s.caption}</p>
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center">
      <PhoneFrame>
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className={`transition-opacity duration-500 ${
              i === active ? 'opacity-100' : 'pointer-events-none absolute inset-0 opacity-0'
            }`}
          >
            {s.screen}
          </div>
        ))}
      </PhoneFrame>

      <p className="mt-5 text-center text-sm font-medium">
        <span className="text-content-subtle">{active + 1}. </span>
        {STEPS[active].label}
      </p>
      <p className="mt-1 h-10 max-w-xs text-center text-sm text-content-muted">
        {STEPS[active].caption}
      </p>

      <div className="mt-3 flex gap-2" role="tablist" aria-label="Walkthrough steps">
        {STEPS.map((s, i) => (
          <button
            key={s.label}
            role="tab"
            aria-selected={i === active}
            aria-label={s.label}
            onClick={() => jump(i)}
            className={`h-2 rounded-full transition-all ${
              i === active ? 'w-6 bg-brand' : 'w-2 bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-[28px] border border-border bg-surface p-3 shadow-xl shadow-black/5">
      <div className="relative min-h-[340px] overflow-hidden rounded-[20px] bg-background p-4 text-content">
        <div className="mb-4 flex items-center justify-between">
          <Logo size="sm" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand-dark">
            AR
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-content-muted">
        {label}
      </span>
      <span className="flex h-10 items-center rounded-lg border border-border bg-surface px-3 text-sm">
        {value}
      </span>
    </label>
  );
}

function AddScreen() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-content-subtle">
        New habit
      </p>
      <Field label="Name" value="Cut sugar" />
      <div className="grid grid-cols-2 gap-2">
        <span className="rounded-lg border border-brand bg-brand/10 px-3 py-2 text-sm font-medium">
          Break
        </span>
        <span className="rounded-lg border border-border px-3 py-2 text-sm text-content-subtle">
          Build
        </span>
      </div>
      <Field label="Your usual amount" value="3 pieces a day" />
    </div>
  );
}

function LogScreen() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-content-subtle">
        Log entry · Cut sugar
      </p>
      <Field label="Amount" value="1 piece" />
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-content-muted">
          Context
        </span>
        <span className="block rounded-lg border border-border bg-surface px-3 py-2 text-sm leading-snug">
          one slice at a friend&apos;s birthday &mdash; down from my usual three
        </span>
      </label>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-medium text-white">
        <Icon name="check" className="text-sm" /> Saved
      </span>
    </div>
  );
}

function TrendScreen() {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium uppercase tracking-wide text-content-subtle">
        Today
      </p>
      <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-badge bg-danger/12 text-danger">
          <Icon name="cookie" className="text-lg" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Cut sugar</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-success">
            <Icon name="arrow-down" className="text-xs" />
            down from usual 3 &middot; 1 today
          </p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
          <Icon name="plus" className="text-base" />
        </span>
      </div>
      <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-badge bg-success/12 text-success">
          <Icon name="walk" className="text-lg" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Morning walk</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-success">
            <Icon name="arrow-up" className="text-xs" />4 day streak
          </p>
        </div>
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-white">
          <Icon name="plus" className="text-base" />
        </span>
      </div>
    </div>
  );
}

function InsightScreen() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wide text-content-subtle">
        Insight
      </p>
      <div className="flex items-start gap-3 rounded-card bg-accent p-4">
        <Icon name="bulb" className="mt-0.5 text-lg text-accent-foreground" />
        <p className="text-sm text-accent-foreground">
          Your sugar slips cluster around weekend events. Plan a swap before
          Saturday.
        </p>
      </div>
      <p className="text-xs text-content-subtle">
        Built from the notes you wrote &mdash; nobody else&apos;s.
      </p>
    </div>
  );
}

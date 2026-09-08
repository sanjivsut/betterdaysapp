'use client';

import { useEffect, useState } from 'react';
import { FlameIcon } from '@/components/brand/FlameIcon';
import { Icon } from '@/components/ui/Icon';
import { siteConfig } from '@/config/site';

/**
 * Animated splash sequence (~2.6s):
 *   flame pops in + settles into a flicker loop
 *   -> wordmark fades up -> tagline fades in
 *   -> the three loop icons pop in left to right.
 *
 * Pure CSS keyframes (see tailwind.config.ts) — no animation library.
 * prefers-reduced-motion: everything is shown instantly, no flicker/stagger.
 */

const STEPS = [
  { icon: 'plus', label: 'Log it' },
  { icon: 'chart-bar', label: 'Track it' },
  { icon: 'bulb', label: 'Learn from it' },
];

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const t = setTimeout(onDone, mq.matches ? 700 : 2900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background"
      role="status"
      aria-label="Loading Better Days"
    >
      <FlameIcon
        className={`h-20 w-auto text-brand ${
          reducedMotion ? '' : 'animate-flame-pop'
        }`}
        style={
          reducedMotion
            ? undefined
            : { animation: 'flame-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both, flame-flicker 2.4s ease-in-out 0.7s infinite' }
        }
      />

      <div className="flex flex-col items-center gap-1.5">
        <span
          className={`font-display text-3xl font-semibold leading-none ${
            reducedMotion ? '' : 'animate-fade-up'
          }`}
          style={reducedMotion ? undefined : { animationDelay: '1.2s' }}
        >
          <span className="text-brand">better</span>
          <span className="text-content">days</span>
        </span>
        <span
          className={`text-sm text-content-muted ${
            reducedMotion ? '' : 'animate-fade-in opacity-0'
          }`}
          style={
            reducedMotion
              ? undefined
              : { animationDelay: '1.7s', animationFillMode: 'forwards' }
          }
        >
          {siteConfig.splashTagline}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-6">
        {STEPS.map((step, i) => (
          <div
            key={step.icon}
            className={`flex flex-col items-center gap-1.5 ${
              reducedMotion ? '' : 'animate-icon-pop opacity-0'
            }`}
            style={
              reducedMotion
                ? undefined
                : {
                    animationDelay: `${2.1 + i * 0.22}s`,
                    animationFillMode: 'forwards',
                  }
            }
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-muted text-content-muted">
              <Icon name={step.icon} className="text-xl" />
            </span>
            <span className="text-[11px] text-content-subtle">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

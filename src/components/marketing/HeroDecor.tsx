import { FlameIcon } from '@/components/brand/FlameIcon';

/**
 * Decorative-only background layer for the hero. Translucent circles, faint
 * flame silhouettes as a brand-echo texture, and scattered dots. Everything is
 * low-contrast and aria-hidden — it must never compete with the headline.
 */
export function HeroDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* soft translucent circles */}
      <span className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-white/[0.07]" />
      <span className="absolute -right-16 -top-10 h-52 w-52 rounded-full bg-white/[0.06]" />
      <span className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-white/[0.05]" />

      {/* faint flame silhouettes — brand echo, not a repeated logo */}
      <FlameIcon className="absolute -left-6 bottom-0 h-48 w-auto text-white opacity-[0.13]" />
      <FlameIcon className="absolute right-6 top-6 h-28 w-auto text-white opacity-[0.12] rotate-12" />
      <FlameIcon className="absolute right-1/3 -bottom-8 h-36 w-auto text-white opacity-[0.10] -rotate-6" />

      {/* scattered dots */}
      {DOTS.map((d, i) => (
        <span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-white"
          style={{ left: d.left, top: d.top, opacity: d.o }}
        />
      ))}
    </div>
  );
}

const DOTS = [
  { left: '12%', top: '22%', o: 0.28 },
  { left: '84%', top: '32%', o: 0.22 },
  { left: '68%', top: '14%', o: 0.3 },
  { left: '30%', top: '72%', o: 0.24 },
  { left: '52%', top: '18%', o: 0.2 },
  { left: '90%', top: '68%', o: 0.26 },
  { left: '8%', top: '58%', o: 0.22 },
  { left: '44%', top: '86%', o: 0.2 },
];

import { FlameIcon } from '@/components/brand/FlameIcon';
import { siteConfig } from '@/config/site';

const SIZES = {
  sm: { flame: 'h-[18px]', text: 'text-[16px]' },
  md: { flame: 'h-6', text: 'text-xl' },
  lg: { flame: 'h-9', text: 'text-3xl' },
  xl: { flame: 'h-9', text: 'text-[32px]' },
} as const;

/**
 * Full logo lockup: flame + "betterdays" wordmark, side by side with a small
 * gap, wordmark bottom-aligned to the flame's baseline. "better" is brand
 * orange; "days" uses the theme text token (dark-mode safe).
 *
 * Icon alone (favicon / PWA icon) is handled separately — this component is
 * always the full lockup.
 */
export function Logo({
  size = 'md',
  className = '',
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const s = SIZES[size];
  return (
    <span className={`inline-flex items-end gap-1 ${className}`}>
      <FlameIcon className={`${s.flame} w-auto text-brand`} />
      <span
        className={`font-display font-semibold leading-none ${s.text} text-content`}
      >
        <span className="text-brand">better</span>days
      </span>
      <span className="sr-only">{siteConfig.name}</span>
    </span>
  );
}

import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';
import type { Insight } from '@/lib/insights';

/**
 * Full-width accent card at the bottom of the habit list. Surfaces one
 * personalized insight. This is the natural upsell surface for the future
 * premium "personalized insights" feature.
 */
export function InsightBanner({ insight }: { insight: Insight }) {
  return (
    <Link
      href="/app/insights"
      className="flex items-start gap-3 rounded-card bg-accent p-4 transition-opacity hover:opacity-90"
    >
      <Icon name="bulb" className="mt-0.5 text-lg text-accent-foreground" />
      <div>
        <p className="text-sm font-medium text-accent-foreground">
          {insight.text}
        </p>
        <p className="mt-0.5 text-xs text-accent-foreground/80">
          See all insights →
        </p>
      </div>
    </Link>
  );
}

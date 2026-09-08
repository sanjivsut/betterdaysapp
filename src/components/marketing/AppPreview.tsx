import { Logo } from '@/components/brand/Logo';
import { Icon } from '@/components/ui/Icon';

/**
 * Stylized preview of the app dashboard. This is a hand-built mock, NOT a real
 * screenshot — replace with an actual dashboard screenshot before launch (see
 * the landing-page notes). It exists so the marketing page shows the product,
 * not just icons.
 */
export function AppPreview() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-[28px] border border-border bg-surface p-3 text-content shadow-xl shadow-black/5">
      <div className="rounded-[20px] bg-background p-4">
        <div className="mb-4 flex items-center justify-between">
          <Logo size="sm" />
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-xs font-semibold text-brand-dark">
            AR
          </span>
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            { icon: 'flame', v: '7', l: 'day streak', c: 'text-brand' },
            { icon: 'target-arrow', v: '82%', l: 'this week', c: 'text-success' },
            { icon: 'trophy', v: '5', l: 'habits', c: 'text-warning' },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-xl border border-border bg-surface p-2 text-center"
            >
              <Icon name={s.icon} className={`text-base ${s.c}`} />
              <div className="text-sm font-semibold">{s.v}</div>
              <div className="text-[10px] text-content-subtle">{s.l}</div>
            </div>
          ))}
        </div>

        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-content-subtle">
          Today
        </p>
        <div className="space-y-2">
          {[
            {
              icon: 'cookie',
              tint: 'bg-danger/12 text-danger',
              name: 'Cut sugar',
              trend: 'down from 3',
              dir: 'down' as const,
            },
            {
              icon: 'walk',
              tint: 'bg-success/12 text-success',
              name: 'Morning walk',
              trend: '7 day streak',
              dir: 'up' as const,
            },
            {
              icon: 'device-mobile',
              tint: 'bg-warning/15 text-warning',
              name: 'Screen time',
              trend: 'up from 2h',
              dir: 'down' as const,
            },
          ].map((h) => (
            <div
              key={h.name}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-badge ${h.tint}`}
              >
                <Icon name={h.icon} className="text-base" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium">{h.name}</div>
                <div
                  className={`flex items-center gap-1 text-[11px] ${
                    h.dir === 'up'
                      ? 'text-success'
                      : h.trend.startsWith('up')
                        ? 'text-danger'
                        : 'text-success'
                  }`}
                >
                  <Icon
                    name={h.trend.startsWith('up') && h.dir === 'down' ? 'arrow-up' : h.dir === 'up' ? 'arrow-up' : 'arrow-down'}
                    className="text-[11px]"
                  />
                  {h.trend}
                </div>
              </div>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
                <Icon name="plus" className="text-sm" />
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-xl bg-accent p-3">
          <Icon name="bulb" className="mt-0.5 text-sm text-accent-foreground" />
          <p className="text-[11px] leading-snug text-accent-foreground">
            Your sugar slips cluster around weekend events.
          </p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Icon } from '@/components/ui/Icon';
import { habitBadge, habitIcon, trendStyle } from '@/lib/habit-visuals';
import type { DashboardCard } from '@/types/api';

export function HabitCard({
  card,
  onQuickLog,
}: {
  card: DashboardCard;
  onQuickLog: (habitId: string) => void;
}) {
  const { habit, stat, todayEntries } = card;
  const badge = habitBadge(habit, stat.trend.direction);
  const trend = trendStyle(stat.trend.direction, habit.type);

  return (
    <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-badge ${badge.wrap}`}
      >
        <Icon name={habitIcon(habit)} className="text-lg" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{habit.name}</p>
        <p className={`mt-0.5 flex items-center gap-1 text-xs ${trend.text}`}>
          {trend.icon && <Icon name={trend.icon} className="text-xs" />}
          <span>{stat.trend.label}</span>
          {todayEntries.length > 0 && (
            <span className="text-content-subtle">
              · {todayEntries.length} today
            </span>
          )}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onQuickLog(habit.id)}
        aria-label={`Log ${habit.name}`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark"
      >
        <Icon name="plus" className="text-base" />
      </button>
    </div>
  );
}

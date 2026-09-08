'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { StatStrip } from '@/components/dashboard/StatStrip';
import { HabitCard } from '@/components/dashboard/HabitCard';
import { InsightBanner } from '@/components/dashboard/InsightBanner';
import { QuickLogSheet } from '@/components/dashboard/QuickLogSheet';
import { HabitFormSheet } from '@/components/habits/HabitFormSheet';
import { apiGet } from '@/lib/client';
import type { DashboardResponse } from '@/types/api';

export function Dashboard() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [quickLogId, setQuickLogId] = useState<string | null>(null);
  const [showNewHabit, setShowNewHabit] = useState(false);

  const load = useCallback(async () => {
    try {
      setData(await apiGet<DashboardResponse>('/api/dashboard'));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const quickLogHabit = data?.cards.find((c) => c.habit.id === quickLogId)?.habit;

  return (
    <div className="mx-auto max-w-2xl px-4 py-5 md:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Today</h1>
        <Button size="sm" variant="secondary" onClick={() => setShowNewHabit(true)}>
          <Icon name="plus" /> New habit
        </Button>
      </div>

      {loading && <SkeletonList />}

      {error && !loading && (
        <div className="rounded-card border border-border bg-surface p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          <StatStrip
            bestStreak={data.stats.bestStreak}
            weeklyCompletion={data.stats.weeklyCompletion}
            activeHabits={data.stats.activeHabits}
          />

          {data.cards.length === 0 ? (
            <EmptyState onAdd={() => setShowNewHabit(true)} />
          ) : (
            <div className="mt-5 space-y-2.5">
              {data.cards.map((card) => (
                <HabitCard
                  key={card.habit.id}
                  card={card}
                  onQuickLog={setQuickLogId}
                />
              ))}
            </div>
          )}

          {data.insight && (
            <div className="mt-4">
              <InsightBanner insight={data.insight} />
            </div>
          )}
        </>
      )}

      {quickLogHabit && (
        <QuickLogSheet
          habit={quickLogHabit}
          onClose={() => setQuickLogId(null)}
          onLogged={load}
        />
      )}
      {showNewHabit && (
        <HabitFormSheet
          onClose={() => setShowNewHabit(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-2.5">
      <div className="h-20 animate-pulse rounded-card bg-surface-muted" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 animate-pulse rounded-card bg-surface-muted" />
      ))}
    </div>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="mt-6 rounded-card border border-dashed border-border bg-surface p-8 text-center">
      <Icon name="seeding" className="text-3xl text-content-subtle" />
      <h2 className="mt-2 font-medium">No habits yet</h2>
      <p className="mx-auto mt-1 max-w-xs text-sm text-content-muted">
        Add the first habit you want to build or break. You&apos;ll log each one
        with a short note, not just a checkmark.
      </p>
      <Button className="mt-4" onClick={onAdd}>
        <Icon name="plus" /> Add a habit
      </Button>
    </div>
  );
}

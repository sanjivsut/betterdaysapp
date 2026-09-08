'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Icon } from '@/components/ui/Icon';
import { apiGet } from '@/lib/client';
import type { Habit } from '@/lib/habits';

interface ProgressResponse {
  habits: Habit[];
  series: Record<string, { date: string; value: number; slips: number }[]>;
  days: number;
}

const RANGES = [
  { days: 14, label: '14d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
];

export function ProgressView() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [activeHabit, setActiveHabit] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet<ProgressResponse>(`/api/progress?days=${days}`)
      .then((res) => {
        setData(res);
        setActiveHabit((cur) => cur ?? res.habits[0]?.id ?? null);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Could not load progress.'),
      )
      .finally(() => setLoading(false));
  }, [days]);

  const habit = data?.habits.find((h) => h.id === activeHabit) ?? null;
  const chartData = useMemo(() => {
    if (!data || !activeHabit) return [];
    return (data.series[activeHabit] ?? []).map((d) => ({
      ...d,
      label: d.date.slice(5),
    }));
  }, [data, activeHabit]);

  const total = chartData.reduce((s, d) => s + d.value, 0);
  const totalSlips = chartData.reduce((s, d) => s + d.slips, 0);

  return (
    <div className="mx-auto max-w-2xl px-4 py-5 md:px-6">
      <h1 className="mb-4 text-xl font-semibold">Progress</h1>

      {loading && (
        <div className="h-72 animate-pulse rounded-card bg-surface-muted" />
      )}
      {error && !loading && (
        <p className="rounded-card border border-border bg-surface p-4 text-sm text-danger">
          {error}
        </p>
      )}

      {data && !loading && data.habits.length === 0 && (
        <p className="rounded-card border border-dashed border-border bg-surface p-8 text-center text-sm text-content-muted">
          Add a habit and log a few entries to see trends here.
        </p>
      )}

      {data && !loading && data.habits.length > 0 && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            {data.habits.map((h) => (
              <button
                key={h.id}
                onClick={() => setActiveHabit(h.id)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeHabit === h.id
                    ? 'border-brand bg-brand/10 text-brand-dark'
                    : 'border-border text-content-muted'
                }`}
              >
                {h.name}
              </button>
            ))}
          </div>

          <div className="rounded-card border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{habit?.name}</p>
                <p className="text-xs text-content-subtle">
                  {total.toLocaleString()} total
                  {habit?.type === 'break' && ` · ${totalSlips} slips`} in {days}{' '}
                  days
                </p>
              </div>
              <div className="flex gap-1">
                {RANGES.map((r) => (
                  <button
                    key={r.days}
                    onClick={() => setDays(r.days)}
                    className={`rounded-md px-2 py-1 text-xs ${
                      days === r.days
                        ? 'bg-brand/10 text-brand-dark'
                        : 'text-content-subtle'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e8734a" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#e8734a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }}
                    interval="preserveStartEnd"
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }}
                    allowDecimals={false}
                    width={36}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#e8734a"
                    strokeWidth={2}
                    fill="url(#fill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="mt-3 flex items-center gap-1.5 text-xs text-content-subtle">
            <Icon name="info-circle" />
            Trends compare your recent activity with your own baseline, not a
            fixed target.
          </p>
        </>
      )}
    </div>
  );
}

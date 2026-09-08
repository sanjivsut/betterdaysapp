'use client';

import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { apiGet } from '@/lib/client';
import type { Insight } from '@/lib/insights';

const TONE: Record<Insight['tone'], { icon: string; cls: string }> = {
  positive: { icon: 'trending-up', cls: 'text-success' },
  watch: { icon: 'alert-triangle', cls: 'text-warning' },
  neutral: { icon: 'bulb', cls: 'text-content-subtle' },
};

export function InsightsView() {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ insights: Insight[] }>('/api/insights')
      .then((res) => setInsights(res.insights))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Could not load insights.'),
      );
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-5 md:px-6">
      <h1 className="mb-1 text-xl font-semibold">Insights</h1>
      <p className="mb-4 text-sm text-content-muted">
        Patterns spotted in your own logged history.
      </p>

      {error && (
        <p className="rounded-card border border-border bg-surface p-4 text-sm text-danger">
          {error}
        </p>
      )}

      {!insights && !error && (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-card bg-surface-muted"
            />
          ))}
        </div>
      )}

      {insights && (
        <div className="space-y-2.5">
          {insights.map((ins) => {
            const tone = TONE[ins.tone];
            return (
              <div
                key={ins.id}
                className="flex items-start gap-3 rounded-card border border-border bg-surface p-4"
              >
                <Icon name={tone.icon} className={`mt-0.5 text-lg ${tone.cls}`} />
                <p className="text-sm">{ins.text}</p>
              </div>
            );
          })}
        </div>
      )}

      {/*
        v1 is rule-based (src/lib/insights.ts). It is designed to be replaced by
        pattern detection over the free-text context notes — the premium
        "personalized insights" feature — without changing this view.
      */}
      <p className="mt-6 flex items-center gap-1.5 text-xs text-content-subtle">
        <Icon name="sparkles" />
        Deeper, note-based insights are coming.
      </p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { apiSend } from '@/lib/client';
import type { Habit } from '@/lib/habits';

type Values = {
  name: string;
  type: 'build' | 'break';
  category: string;
  unit: string;
  baselineValue: string;
};

/** Create or edit a habit. Used from the dashboard and settings. */
export function HabitFormSheet({
  habit,
  onClose,
  onSaved,
}: {
  habit?: Habit | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editing = Boolean(habit);
  const [v, setV] = useState<Values>({
    name: habit?.name ?? '',
    type: habit?.type ?? 'build',
    category: habit?.category ?? '',
    unit: habit?.unit ?? '',
    baselineValue:
      habit?.baselineValue != null ? String(habit.baselineValue) : '',
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set<K extends keyof Values>(key: K, val: Values[K]) {
    setV((prev) => ({ ...prev, [key]: val }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!v.name.trim()) {
      setError('Give the habit a name.');
      return;
    }
    setPending(true);
    setError(null);
    const payload = {
      name: v.name.trim(),
      type: v.type,
      category: v.category.trim() || null,
      unit: v.unit.trim() || null,
      baselineValue: v.baselineValue === '' ? null : Number(v.baselineValue),
    };
    try {
      if (editing && habit) {
        await apiSend(`/api/habits/${habit.id}`, 'PATCH', payload);
      } else {
        await apiSend('/api/habits', 'POST', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the habit.');
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="pb-safe relative w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {editing ? 'Edit habit' : 'New habit'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-surface-muted"
            aria-label="Close"
          >
            <Icon name="x" className="text-xl" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Name</span>
            <input
              value={v.name}
              onChange={(e) => set('name', e.target.value)}
              maxLength={120}
              placeholder="e.g. Morning walk"
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>

          <div>
            <span className="mb-1 block text-sm font-medium">Goal</span>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  ['build', 'Build', 'Do more of it'],
                  ['break', 'Break', 'Do less of it'],
                ] as const
              ).map(([val, label, hint]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('type', val)}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    v.type === val
                      ? 'border-brand bg-brand/10'
                      : 'border-border'
                  }`}
                >
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-content-subtle">
                    {hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Category <span className="text-content-subtle">(optional)</span>
              </span>
              <input
                value={v.category}
                onChange={(e) => set('category', e.target.value)}
                maxLength={60}
                placeholder="sugar, walk…"
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                Unit <span className="text-content-subtle">(optional)</span>
              </span>
              <input
                value={v.unit}
                onChange={(e) => set('unit', e.target.value)}
                maxLength={30}
                placeholder="piece, minute…"
                className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Your usual amount{' '}
              <span className="text-content-subtle">(optional baseline)</span>
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={v.baselineValue}
              onChange={(e) => set('baselineValue', e.target.value)}
              placeholder="e.g. 3"
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
            <span className="mt-1 block text-xs text-content-subtle">
              Trends compare against this. Leave blank to use your logged history.
            </span>
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : editing ? 'Save changes' : 'Add habit'}
          </Button>
        </form>
      </div>
    </div>
  );
}

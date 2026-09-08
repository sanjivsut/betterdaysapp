'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { apiSend } from '@/lib/client';
import type { Habit } from '@/lib/habits';

/**
 * Inline quick-log flow. Opens from a habit card's "+" button. Captures
 * amount/instance, a good/slip toggle (for "break" habits), and the context
 * note that makes Better Days more than a checkmark.
 */
export function QuickLogSheet({
  habit,
  onClose,
  onLogged,
}: {
  habit: Habit;
  onClose: () => void;
  onLogged: () => void;
}) {
  const [value, setValue] = useState('1');
  const [kind, setKind] = useState<'good' | 'slip'>('good');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) {
      setError('Enter an amount greater than zero.');
      return;
    }
    setPending(true);
    setError(null);
    try {
      await apiSend('/api/log-entries', 'POST', {
        habitId: Number(habit.id),
        value: num,
        kind: habit.type === 'break' ? kind : 'good',
        note: note.trim() || null,
      });
      onLogged();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the entry.');
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
          <div>
            <p className="text-xs text-content-subtle">Log entry</p>
            <h2 className="text-lg font-semibold">{habit.name}</h2>
          </div>
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
          {habit.type === 'break' && (
            <div className="grid grid-cols-2 gap-2">
              {(['good', 'slip'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors ${
                    kind === k
                      ? k === 'good'
                        ? 'border-success bg-success/10 text-success'
                        : 'border-danger bg-danger/10 text-danger'
                      : 'border-border text-content-muted'
                  }`}
                >
                  {k === 'good' ? 'Good instance' : 'Slip'}
                </button>
              ))}
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Amount{habit.unit ? ` (${habit.unit})` : ''}
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">
              Context <span className="text-content-subtle">(optional)</span>
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="e.g. one slice at a birthday party — down from my usual three"
              className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Saving…' : 'Save entry'}
          </Button>
        </form>
      </div>
    </div>
  );
}

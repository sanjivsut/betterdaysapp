'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ThemeToggle } from '@/components/settings/ThemeToggle';
import { HabitFormSheet } from '@/components/habits/HabitFormSheet';
import { apiGet, apiSend } from '@/lib/client';
import type { Habit } from '@/lib/habits';

interface ReminderRow {
  habit: Habit;
  reminder: { id: string; timeOfDay: string; enabled: boolean } | null;
}
interface Account {
  email: string | null;
  displayName: string;
  timezone: string;
  plan: string;
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-card border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-content-subtle">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SettingsView() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [h, r, a] = await Promise.all([
      apiGet<{ habits: Habit[] }>('/api/habits'),
      apiGet<{ reminders: ReminderRow[] }>('/api/reminders'),
      apiGet<Account>('/api/account'),
    ]);
    setHabits(h.habits);
    setReminders(r.reminders);
    setAccount(a);
  }, []);

  useEffect(() => {
    load().catch((e) => setMsg(e instanceof Error ? e.message : 'Load failed'));
  }, [load]);

  async function removeHabit(id: string) {
    if (!confirm('Delete this habit and all its entries?')) return;
    await apiSend(`/api/habits/${id}`, 'DELETE');
    await load();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 md:px-6">
      <h1 className="text-xl font-semibold">Settings</h1>
      {msg && <p className="text-sm text-danger">{msg}</p>}

      <Section title="Habits">
        <ul className="divide-y divide-border">
          {habits.map((h) => (
            <li key={h.id} className="flex items-center gap-3 py-2.5">
              <span className="flex-1">
                <span className="text-sm font-medium">{h.name}</span>
                <span className="ml-2 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] uppercase text-content-subtle">
                  {h.type}
                </span>
              </span>
              <button
                onClick={() => setEditing(h)}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface-muted"
                aria-label={`Edit ${h.name}`}
              >
                <Icon name="pencil" />
              </button>
              <button
                onClick={() => removeHabit(h.id)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-danger hover:bg-danger/10"
                aria-label={`Delete ${h.name}`}
              >
                <Icon name="trash" />
              </button>
            </li>
          ))}
          {habits.length === 0 && (
            <li className="py-3 text-sm text-content-muted">No habits yet.</li>
          )}
        </ul>
        <Button
          size="sm"
          variant="secondary"
          className="mt-3"
          onClick={() => setCreating(true)}
        >
          <Icon name="plus" /> New habit
        </Button>
      </Section>

      <Section title="Reminders">
        <p className="mb-3 text-xs text-content-subtle">
          One daily reminder per habit, sent in your local timezone.
        </p>
        <ul className="divide-y divide-border">
          {reminders.map((row) => (
            <ReminderControl key={row.habit.id} row={row} onSaved={load} />
          ))}
          {reminders.length === 0 && (
            <li className="py-3 text-sm text-content-muted">
              Add a habit to set a reminder.
            </li>
          )}
        </ul>
      </Section>

      {account && <AccountSection account={account} onSaved={load} />}

      <Section title="Appearance">
        <ThemeToggle />
      </Section>

      <Section title="Install">
        <p className="text-sm text-content-muted">
          Better Days is a Progressive Web App. On mobile, use your browser&apos;s
          &ldquo;Add to Home Screen&rdquo;. On desktop Chrome or Edge, use the
          install icon in the address bar for an app window and offline access.
        </p>
      </Section>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => signOut({ callbackUrl: '/' })}
      >
        <Icon name="logout" /> Sign out
      </Button>

      {editing && (
        <HabitFormSheet
          habit={editing}
          onClose={() => setEditing(null)}
          onSaved={load}
        />
      )}
      {creating && (
        <HabitFormSheet onClose={() => setCreating(false)} onSaved={load} />
      )}
    </div>
  );
}

function ReminderControl({
  row,
  onSaved,
}: {
  row: ReminderRow;
  onSaved: () => void;
}) {
  const [time, setTime] = useState(row.reminder?.timeOfDay ?? '09:00');
  const [enabled, setEnabled] = useState(row.reminder?.enabled ?? false);
  const [saving, setSaving] = useState(false);

  async function save(next: { time?: string; enabled?: boolean }) {
    const t = next.time ?? time;
    const e = next.enabled ?? enabled;
    setTime(t);
    setEnabled(e);
    setSaving(true);
    try {
      await apiSend('/api/reminders', 'PUT', {
        habitId: Number(row.habit.id),
        timeOfDay: t,
        enabled: e,
      });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className="flex-1 text-sm font-medium">{row.habit.name}</span>
      <input
        type="time"
        value={time}
        onChange={(e) => save({ time: e.target.value })}
        className="h-9 rounded-lg border border-border bg-surface px-2 text-sm"
      />
      <button
        role="switch"
        aria-checked={enabled}
        aria-label="Toggle reminder"
        disabled={saving}
        onClick={() => save({ enabled: !enabled })}
        className={`relative h-6 w-10 rounded-full transition-colors ${
          enabled ? 'bg-brand' : 'bg-surface-muted'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </li>
  );
}

function AccountSection({
  account,
  onSaved,
}: {
  account: Account;
  onSaved: () => void;
}) {
  const [name, setName] = useState(account.displayName);
  const [tz, setTz] = useState(account.timezone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const zones = useMemo(() => {
    const supported =
      (Intl as unknown as { supportedValuesOf?: (k: string) => string[] })
        .supportedValuesOf?.('timeZone') ?? [];
    return supported.length ? supported : [account.timezone, 'UTC'];
  }, [account.timezone]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await apiSend('/api/account', 'PATCH', {
        displayName: name.trim(),
        timezone: tz,
      });
      setSaved(true);
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title="Account">
      <form onSubmit={save} className="space-y-3">
        <div className="text-sm text-content-muted">{account.email}</div>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Timezone</span>
          <select
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30"
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-3">
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          {saved && (
            <span className="text-xs text-success">Saved</span>
          )}
        </div>
      </form>
    </Section>
  );
}

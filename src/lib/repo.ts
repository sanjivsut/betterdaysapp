/**
 * Typed data access for habits, log entries and reminders. All queries are
 * scoped by user_id so a handler can't accidentally leak another user's data.
 * Uses the stateless `sql` query function to keep Netlify function calls lean.
 */
import { sql } from '@/lib/db';
import type { Habit, LogEntry, HabitType, LogKind } from '@/lib/habits';

interface HabitRow {
  id: string;
  name: string;
  type: HabitType;
  category: string | null;
  unit: string | null;
  baseline_value: string | null;
  created_at: string;
}

interface LogRow {
  id: string;
  habit_id: string;
  value: string;
  kind: LogKind;
  note: string | null;
  logged_at: string;
}

function toHabit(r: HabitRow): Habit {
  return {
    id: String(r.id),
    name: r.name,
    type: r.type,
    category: r.category,
    unit: r.unit,
    baselineValue: r.baseline_value == null ? null : Number(r.baseline_value),
    createdAt: r.created_at,
  };
}

function toLog(r: LogRow): LogEntry {
  return {
    id: String(r.id),
    habitId: String(r.habit_id),
    value: Number(r.value),
    kind: r.kind,
    note: r.note,
    loggedAt: r.logged_at,
  };
}

export async function listHabits(userId: number): Promise<Habit[]> {
  const rows = (await sql`
    SELECT id, name, type, category, unit, baseline_value, created_at
    FROM habits
    WHERE user_id = ${userId} AND archived_at IS NULL
    ORDER BY created_at ASC
  `) as HabitRow[];
  return rows.map(toHabit);
}

export async function getHabit(
  userId: number,
  habitId: number,
): Promise<Habit | null> {
  const rows = (await sql`
    SELECT id, name, type, category, unit, baseline_value, created_at
    FROM habits
    WHERE id = ${habitId} AND user_id = ${userId} AND archived_at IS NULL
    LIMIT 1
  `) as HabitRow[];
  return rows[0] ? toHabit(rows[0]) : null;
}

export interface HabitInput {
  name: string;
  type: HabitType;
  category?: string | null;
  unit?: string | null;
  baselineValue?: number | null;
}

export async function createHabit(
  userId: number,
  input: HabitInput,
): Promise<Habit> {
  const rows = (await sql`
    INSERT INTO habits (user_id, name, type, category, unit, baseline_value)
    VALUES (${userId}, ${input.name}, ${input.type}, ${input.category ?? null},
            ${input.unit ?? null}, ${input.baselineValue ?? null})
    RETURNING id, name, type, category, unit, baseline_value, created_at
  `) as HabitRow[];
  return toHabit(rows[0]);
}

export async function updateHabit(
  userId: number,
  habitId: number,
  input: Partial<HabitInput>,
): Promise<Habit | null> {
  // The neon tagged template has no nested-fragment support, so merge in JS
  // against the current row and write every column back.
  const current = await getHabit(userId, habitId);
  if (!current) return null;

  const next = {
    name: input.name ?? current.name,
    type: input.type ?? current.type,
    category: input.category === undefined ? current.category : input.category,
    unit: input.unit === undefined ? current.unit : input.unit,
    baselineValue:
      input.baselineValue === undefined
        ? current.baselineValue
        : input.baselineValue,
  };

  const rows = (await sql`
    UPDATE habits SET
      name           = ${next.name},
      type           = ${next.type},
      category       = ${next.category},
      unit           = ${next.unit},
      baseline_value = ${next.baselineValue}
    WHERE id = ${habitId} AND user_id = ${userId} AND archived_at IS NULL
    RETURNING id, name, type, category, unit, baseline_value, created_at
  `) as HabitRow[];
  return rows[0] ? toHabit(rows[0]) : null;
}

export async function archiveHabit(
  userId: number,
  habitId: number,
): Promise<boolean> {
  const rows = (await sql`
    UPDATE habits SET archived_at = NOW()
    WHERE id = ${habitId} AND user_id = ${userId} AND archived_at IS NULL
    RETURNING id
  `) as Array<{ id: string }>;
  return rows.length > 0;
}

export async function listEntries(
  userId: number,
  opts: { habitId?: number; sinceDays?: number } = {},
): Promise<LogEntry[]> {
  const since = new Date(
    Date.now() - (opts.sinceDays ?? 60) * 24 * 60 * 60 * 1000,
  ).toISOString();
  const rows = (await sql`
    SELECT id, habit_id, value, kind, note, logged_at
    FROM log_entries
    WHERE user_id = ${userId}
      AND logged_at >= ${since}
      AND (${opts.habitId ?? null}::bigint IS NULL OR habit_id = ${opts.habitId ?? null})
    ORDER BY logged_at DESC
    LIMIT 2000
  `) as LogRow[];
  return rows.map(toLog);
}

export interface LogInput {
  habitId: number;
  value: number;
  kind: LogKind;
  note?: string | null;
  loggedAt?: string;
}

export async function createEntry(
  userId: number,
  input: LogInput,
): Promise<LogEntry | null> {
  // Ownership check: the habit must belong to this user.
  const owns = (await sql`
    SELECT 1 FROM habits WHERE id = ${input.habitId} AND user_id = ${userId} LIMIT 1
  `) as unknown[];
  if (owns.length === 0) return null;

  const rows = (await sql`
    INSERT INTO log_entries (habit_id, user_id, value, kind, note, logged_at)
    VALUES (${input.habitId}, ${userId}, ${input.value}, ${input.kind},
            ${input.note ?? null}, ${input.loggedAt ?? new Date().toISOString()})
    RETURNING id, habit_id, value, kind, note, logged_at
  `) as LogRow[];
  return toLog(rows[0]);
}

export async function deleteEntry(
  userId: number,
  entryId: number,
): Promise<boolean> {
  const rows = (await sql`
    DELETE FROM log_entries WHERE id = ${entryId} AND user_id = ${userId}
    RETURNING id
  `) as unknown[];
  return rows.length > 0;
}

/* --- reminders (free tier: one per habit) --------------------------------- */

export interface Reminder {
  id: string;
  habitId: string;
  timeOfDay: string;
  enabled: boolean;
}

export async function getReminder(
  userId: number,
  habitId: number,
): Promise<Reminder | null> {
  const rows = (await sql`
    SELECT id, habit_id, to_char(time_of_day, 'HH24:MI') AS time_of_day, enabled
    FROM reminders
    WHERE user_id = ${userId} AND habit_id = ${habitId}
    ORDER BY id ASC LIMIT 1
  `) as Array<{ id: string; habit_id: string; time_of_day: string; enabled: boolean }>;
  const r = rows[0];
  return r
    ? { id: String(r.id), habitId: String(r.habit_id), timeOfDay: r.time_of_day, enabled: r.enabled }
    : null;
}

export async function upsertReminder(
  userId: number,
  habitId: number,
  timeOfDay: string,
  enabled: boolean,
  timezone: string | null,
): Promise<Reminder | null> {
  const owns = (await sql`
    SELECT 1 FROM habits WHERE id = ${habitId} AND user_id = ${userId} LIMIT 1
  `) as unknown[];
  if (owns.length === 0) return null;

  const existing = await getReminder(userId, habitId);
  if (existing) {
    const rows = (await sql`
      UPDATE reminders SET time_of_day = ${timeOfDay}, enabled = ${enabled}, timezone = ${timezone}
      WHERE id = ${Number(existing.id)} AND user_id = ${userId}
      RETURNING id, habit_id, to_char(time_of_day, 'HH24:MI') AS time_of_day, enabled
    `) as Array<{ id: string; habit_id: string; time_of_day: string; enabled: boolean }>;
    const r = rows[0];
    return { id: String(r.id), habitId: String(r.habit_id), timeOfDay: r.time_of_day, enabled: r.enabled };
  }
  const rows = (await sql`
    INSERT INTO reminders (habit_id, user_id, time_of_day, enabled, timezone)
    VALUES (${habitId}, ${userId}, ${timeOfDay}, ${enabled}, ${timezone})
    RETURNING id, habit_id, to_char(time_of_day, 'HH24:MI') AS time_of_day, enabled
  `) as Array<{ id: string; habit_id: string; time_of_day: string; enabled: boolean }>;
  const r = rows[0];
  return { id: String(r.id), habitId: String(r.habit_id), timeOfDay: r.time_of_day, enabled: r.enabled };
}

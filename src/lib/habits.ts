/** Shared habit domain types + pure derivation helpers (streaks, trends). */

export type HabitType = 'build' | 'break';
export type LogKind = 'good' | 'slip';

export interface Habit {
  id: string;
  name: string;
  type: HabitType;
  category: string | null;
  unit: string | null;
  baselineValue: number | null;
  createdAt: string;
}

export interface LogEntry {
  id: string;
  habitId: string;
  value: number;
  kind: LogKind;
  note: string | null;
  loggedAt: string;
}

export type TrendDirection = 'improvement' | 'regression' | 'neutral';

export interface HabitStat {
  /** Consecutive days with a qualifying entry (good, for build habits). */
  streakDays: number;
  /** Sum of today's values. */
  todayValue: number;
  /** Rolling average used for the trend comparison. */
  recentAverage: number | null;
  trend: {
    direction: TrendDirection;
    /** e.g. "down from usual 3", "7 day streak" */
    label: string;
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return d.toISOString().slice(0, 10);
}

export function computeStreak(entries: LogEntry[], type: HabitType): number {
  const goodDays = new Set(
    entries
      .filter((e) => (type === 'build' ? e.kind === 'good' : true))
      .map((e) => dayKey(e.loggedAt)),
  );
  let streak = 0;
  for (let i = 0; ; i++) {
    const key = dayKey(new Date(Date.now() - i * DAY_MS));
    if (goodDays.has(key)) {
      streak++;
    } else if (i === 0) {
      // today not logged yet — keep counting from yesterday
      continue;
    } else {
      break;
    }
    if (i > 400) break;
  }
  return streak;
}

/**
 * Trend is always measured against the user's OWN history — either an explicit
 * baseline they set, or their trailing average before the last 7 days.
 */
export function computeHabitStat(habit: Habit, entries: LogEntry[]): HabitStat {
  const sorted = [...entries].sort(
    (a, b) => +new Date(a.loggedAt) - +new Date(b.loggedAt),
  );
  const todayKey = dayKey(new Date());
  const todayValue = sorted
    .filter((e) => dayKey(e.loggedAt) === todayKey)
    .reduce((s, e) => s + e.value, 0);

  const last7 = sorted.filter(
    (e) => Date.now() - +new Date(e.loggedAt) <= 7 * DAY_MS,
  );
  const recentAverage =
    last7.length > 0
      ? last7.reduce((s, e) => s + e.value, 0) / last7.length
      : null;

  const streakDays = computeStreak(sorted, habit.type);

  // Reference point: explicit baseline, else average of entries older than 7d.
  const older = sorted.filter(
    (e) => Date.now() - +new Date(e.loggedAt) > 7 * DAY_MS,
  );
  const historicalAvg =
    habit.baselineValue ??
    (older.length > 0
      ? older.reduce((s, e) => s + e.value, 0) / older.length
      : null);

  let direction: TrendDirection = 'neutral';
  let label: string;

  if (habit.type === 'break' && historicalAvg != null && recentAverage != null) {
    if (recentAverage < historicalAvg - 0.01) {
      direction = 'improvement';
      label = `down from usual ${trimNum(historicalAvg)}`;
    } else if (recentAverage > historicalAvg + 0.01) {
      direction = 'regression';
      label = `up from usual ${trimNum(historicalAvg)}`;
    } else {
      direction = 'neutral';
      label = `holding at ${trimNum(recentAverage)}`;
    }
  } else if (habit.type === 'build') {
    if (streakDays > 0) {
      direction = 'improvement';
      label = `${streakDays} day streak`;
    } else if (historicalAvg != null && recentAverage != null && recentAverage < historicalAvg) {
      direction = 'regression';
      label = 'slower than usual this week';
    } else {
      direction = 'neutral';
      label = 'no entries yet today';
    }
  } else {
    direction = 'neutral';
    label =
      recentAverage != null
        ? `${trimNum(recentAverage)} ${habit.unit ?? ''}`.trim() + ' this week'
        : 'no entries yet';
  }

  return {
    streakDays,
    todayValue,
    recentAverage,
    trend: { direction, label },
  };
}

function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

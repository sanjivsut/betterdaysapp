import { apiError, currentUserId, json } from '@/lib/api';
import { listEntries, listHabits } from '@/lib/repo';
import { computeHabitStat, type LogEntry } from '@/lib/habits';
import { primaryInsight, type InsightInput } from '@/lib/insights';

/**
 * One composed payload for the Home screen so the client makes a single
 * request instead of N+1 (keeps Netlify function usage lean).
 */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const [habits, entries] = await Promise.all([
    listHabits(userId),
    listEntries(userId, { sinceDays: 60 }),
  ]);

  const byHabit = new Map<string, LogEntry[]>();
  for (const e of entries) {
    const list = byHabit.get(e.habitId) ?? [];
    list.push(e);
    byHabit.set(e.habitId, list);
  }

  const cards = habits.map((habit) => {
    const habitEntries = byHabit.get(habit.id) ?? [];
    return {
      habit,
      stat: computeHabitStat(habit, habitEntries),
      todayEntries: habitEntries.filter(
        (e) =>
          new Date(e.loggedAt).toISOString().slice(0, 10) ===
          new Date().toISOString().slice(0, 10),
      ),
    };
  });

  // Stat strip.
  const bestStreak = cards.reduce((m, c) => Math.max(m, c.stat.streakDays), 0);
  const activeHabits = habits.length;

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const loggedDayKeys = new Set(
    entries
      .filter((e) => new Date(e.loggedAt) >= weekStart)
      .map((e) => `${e.habitId}:${new Date(e.loggedAt).toISOString().slice(0, 10)}`),
  );
  const weeklyCompletion =
    activeHabits > 0
      ? Math.min(1, loggedDayKeys.size / (activeHabits * 7))
      : 0;

  // Primary insight.
  const insightInputs: InsightInput[] = habits.map((habit) => ({
    habitId: habit.id,
    habitName: habit.name,
    type: habit.type,
    baselineValue: habit.baselineValue,
    entries: (byHabit.get(habit.id) ?? []).map((e) => ({
      value: e.value,
      kind: e.kind,
      loggedAt: new Date(e.loggedAt),
    })),
  }));
  const insight = habits.length > 0 ? primaryInsight(insightInputs) : null;

  return json({
    stats: {
      bestStreak,
      weeklyCompletion,
      activeHabits,
    },
    cards,
    insight,
  });
}

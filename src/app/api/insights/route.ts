import { apiError, currentUserId, json } from '@/lib/api';
import { listEntries, listHabits } from '@/lib/repo';
import { computeInsights, type InsightInput } from '@/lib/insights';

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const [habits, entries] = await Promise.all([
    listHabits(userId),
    listEntries(userId, { sinceDays: 90 }),
  ]);

  const inputs: InsightInput[] = habits.map((habit) => ({
    habitId: habit.id,
    habitName: habit.name,
    type: habit.type,
    baselineValue: habit.baselineValue,
    entries: entries
      .filter((e) => e.habitId === habit.id)
      .map((e) => ({
        value: e.value,
        kind: e.kind,
        loggedAt: new Date(e.loggedAt),
      })),
  }));

  return json({ insights: habits.length ? computeInsights(inputs) : [] });
}

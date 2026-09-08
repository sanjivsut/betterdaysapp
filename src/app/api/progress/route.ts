import { apiError, currentUserId, json } from '@/lib/api';
import { listEntries, listHabits } from '@/lib/repo';

/**
 * Time series per habit for the Progress charts. Returns a daily bucket
 * (summed value + slip count) for the requested window.
 */
export async function GET(req: Request) {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const url = new URL(req.url);
  const days = Math.min(365, Math.max(7, Number(url.searchParams.get('days')) || 30));
  const habitParam = url.searchParams.get('habitId');
  const habitId = habitParam ? Number(habitParam) : undefined;

  const [habits, entries] = await Promise.all([
    listHabits(userId),
    listEntries(userId, {
      habitId: Number.isInteger(habitId) ? habitId : undefined,
      sinceDays: days,
    }),
  ]);

  const series: Record<string, { date: string; value: number; slips: number }[]> =
    {};
  const startKeys: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    startKeys.push(d.toISOString().slice(0, 10));
  }

  for (const habit of habits) {
    series[habit.id] = startKeys.map((date) => ({ date, value: 0, slips: 0 }));
  }
  for (const e of entries) {
    const key = new Date(e.loggedAt).toISOString().slice(0, 10);
    const bucket = series[e.habitId]?.find((b) => b.date === key);
    if (bucket) {
      bucket.value += e.value;
      if (e.kind === 'slip') bucket.slips += 1;
    }
  }

  return json({ habits, series, days });
}

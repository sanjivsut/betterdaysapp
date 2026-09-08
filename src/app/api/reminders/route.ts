import { z } from 'zod';
import { apiError, currentUser, currentUserId, json } from '@/lib/api';
import { getReminder, listHabits, upsertReminder } from '@/lib/repo';
import { sql } from '@/lib/db';
import { maxRemindersForUser, sendHabitReminder } from '@/lib/notifications';

/** GET /api/reminders -> one reminder row per habit (free tier). */
export async function GET() {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const habits = await listHabits(userId);
  const reminders = await Promise.all(
    habits.map((h) => getReminder(userId, Number(h.id))),
  );
  return json({
    reminders: habits.map((h, i) => ({ habit: h, reminder: reminders[i] })),
  });
}

const putSchema = z.object({
  habitId: z.coerce.number().int().positive(),
  timeOfDay: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM'),
  enabled: z.boolean().default(true),
});

/**
 * PUT /api/reminders — free tier: create or update THE single daily reminder
 * for a habit. The data model already supports multiple rows per habit for a
 * future premium tier; this endpoint just caps writes at the plan limit.
 */
export async function PUT(req: Request) {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON');
  }
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const user = await currentUser();
  if (maxRemindersForUser(user ?? {}) < 1) {
    return apiError('Reminders are not available on your plan', 403);
  }

  const tzRows = (await sql`
    SELECT timezone FROM users WHERE id = ${userId} LIMIT 1
  `) as Array<{ timezone: string | null }>;
  const timezone = tzRows[0]?.timezone ?? null;

  const reminder = await upsertReminder(
    userId,
    parsed.data.habitId,
    parsed.data.timeOfDay,
    parsed.data.enabled,
    timezone,
  );
  if (!reminder) return apiError('Habit not found', 404);

  // Stubbed: this is where the schedule would be registered with the push
  // provider. Currently a no-op that just logs in dev.
  const habit = (await listHabits(userId)).find(
    (h) => h.id === reminder.habitId,
  );
  if (reminder.enabled && habit) {
    await sendHabitReminder({
      userId: String(userId),
      habitId: reminder.habitId,
      habitName: habit.name,
      timeOfDay: reminder.timeOfDay,
      timezone,
    });
  }

  return json({ reminder });
}

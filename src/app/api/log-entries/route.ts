import { z } from 'zod';
import { apiError, currentUserId, json } from '@/lib/api';
import { createEntry, listEntries } from '@/lib/repo';

export async function GET(req: Request) {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const url = new URL(req.url);
  const habitParam = url.searchParams.get('habitId');
  const sinceParam = url.searchParams.get('sinceDays');
  const habitId = habitParam ? Number(habitParam) : undefined;
  const sinceDays = sinceParam ? Number(sinceParam) : undefined;

  const entries = await listEntries(userId, {
    habitId: Number.isInteger(habitId) ? habitId : undefined,
    sinceDays: Number.isFinite(sinceDays) ? sinceDays : undefined,
  });
  return json({ entries });
}

const createSchema = z.object({
  habitId: z.coerce.number().int().positive(),
  value: z.number().finite().positive().max(100000).default(1),
  kind: z.enum(['good', 'slip']).default('good'),
  note: z.string().trim().max(2000).nullish(),
  loggedAt: z.string().datetime().optional(),
});

export async function POST(req: Request) {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON');
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const entry = await createEntry(userId, {
    habitId: parsed.data.habitId,
    value: parsed.data.value,
    kind: parsed.data.kind,
    note: parsed.data.note ?? null,
    loggedAt: parsed.data.loggedAt,
  });
  if (!entry) return apiError('Habit not found', 404);
  return json({ entry }, 201);
}

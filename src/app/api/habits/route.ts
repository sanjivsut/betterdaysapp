import { z } from 'zod';
import { apiError, currentUser, currentUserId, json } from '@/lib/api';
import { createHabit, listHabits } from '@/lib/repo';
import { limitsFor } from '@/lib/plan';

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);
  const habits = await listHabits(userId);
  return json({ habits });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.enum(['build', 'break']),
  category: z.string().trim().max(60).nullish(),
  unit: z.string().trim().max(30).nullish(),
  baselineValue: z.number().finite().nonnegative().nullish(),
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

  const user = await currentUser();
  const existing = await listHabits(userId);
  const limit = limitsFor(user).maxHabits;
  if (existing.length >= limit) {
    return apiError(
      `Free plan is limited to ${limit} habits. Archive one to add another.`,
      403,
    );
  }

  const habit = await createHabit(userId, {
    name: parsed.data.name,
    type: parsed.data.type,
    category: parsed.data.category ?? null,
    unit: parsed.data.unit ?? null,
    baselineValue: parsed.data.baselineValue ?? null,
  });
  return json({ habit }, 201);
}

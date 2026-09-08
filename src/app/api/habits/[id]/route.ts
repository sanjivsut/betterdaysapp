import { z } from 'zod';
import { apiError, currentUserId, json } from '@/lib/api';
import { archiveHabit, getHabit, updateHabit } from '@/lib/repo';

function parseId(raw: string): number | null {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  type: z.enum(['build', 'break']).optional(),
  category: z.string().trim().max(60).nullable().optional(),
  unit: z.string().trim().max(30).nullable().optional(),
  baselineValue: z.number().finite().nonnegative().nullable().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);
  const id = parseId((await params).id);
  if (!id) return apiError('Not found', 404);

  const habit = await getHabit(userId, id);
  return habit ? json({ habit }) : apiError('Not found', 404);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);
  const id = parseId((await params).id);
  if (!id) return apiError('Not found', 404);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON');
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const habit = await updateHabit(userId, id, parsed.data);
  return habit ? json({ habit }) : apiError('Not found', 404);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);
  const id = parseId((await params).id);
  if (!id) return apiError('Not found', 404);

  const ok = await archiveHabit(userId, id);
  return ok ? json({ ok: true }) : apiError('Not found', 404);
}

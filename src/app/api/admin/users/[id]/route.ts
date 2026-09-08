import { z } from 'zod';
import { apiError, json } from '@/lib/api';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';

const schema = z.object({ isActive: z.boolean() });

/** Deactivate / reactivate an account (abuse handling). Not full moderation. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await requireAdmin();
  if (!adminId) return apiError('Not found', 404);

  const targetId = Number((await params).id);
  if (!Number.isInteger(targetId) || targetId <= 0) {
    return apiError('Not found', 404);
  }
  if (targetId === adminId) {
    return apiError('You cannot change your own account status', 400);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return apiError('Invalid input');

  const rows = (await sql`
    UPDATE users SET is_active = ${parsed.data.isActive}
    WHERE id = ${targetId}
    RETURNING id, is_active
  `) as Array<{ id: string; is_active: boolean }>;
  if (rows.length === 0) return apiError('Not found', 404);

  return json({ id: String(rows[0].id), isActive: rows[0].is_active });
}

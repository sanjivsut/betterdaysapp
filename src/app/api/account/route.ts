import { z } from 'zod';
import { sql } from '@/lib/db';
import { apiError, currentUserId, json } from '@/lib/api';

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);
  const rows = (await sql`
    SELECT email, display_name, name, timezone, plan
    FROM users WHERE id = ${userId} LIMIT 1
  `) as Array<Record<string, unknown>>;
  const u = rows[0];
  return json({
    email: u?.email ?? null,
    displayName: (u?.display_name as string) ?? (u?.name as string) ?? '',
    timezone: (u?.timezone as string) ?? 'UTC',
    plan: (u?.plan as string) ?? 'free',
  });
}

const schema = z.object({
  displayName: z.string().trim().min(1).max(120),
  timezone: z.string().trim().min(1).max(64),
});

export async function PATCH(req: Request) {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError('Invalid JSON');
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  await sql`
    UPDATE users
    SET display_name = ${parsed.data.displayName},
        timezone = ${parsed.data.timezone},
        last_active_at = NOW()
    WHERE id = ${userId}
  `;
  return json({ ok: true });
}

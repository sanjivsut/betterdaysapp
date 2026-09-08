import { z } from 'zod';
import { sql } from '@/lib/db';
import { apiError, currentUserId, json } from '@/lib/api';

const schema = z.object({
  displayName: z.string().trim().min(1).max(120),
  // IANA timezone, e.g. "Europe/London". Required so reminders fire locally.
  timezone: z.string().trim().min(1).max(64),
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
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? 'Invalid input');
  }
  const { displayName, timezone } = parsed.data;

  await sql`
    UPDATE users
    SET display_name = ${displayName},
        name = COALESCE(name, ${displayName}),
        timezone = ${timezone},
        onboarded_at = COALESCE(onboarded_at, NOW()),
        last_active_at = NOW()
    WHERE id = ${userId}
  `;

  return json({ ok: true });
}

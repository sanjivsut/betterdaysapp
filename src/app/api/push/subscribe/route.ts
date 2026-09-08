import { z } from 'zod';
import { apiError, currentUserId, json } from '@/lib/api';
import { sql } from '@/lib/db';

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
});

/** Store a Web Push subscription for the current browser/device. */
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
  if (!parsed.success) return apiError('Invalid subscription');

  const { endpoint, keys } = parsed.data;
  await sql`
    INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (${userId}, ${endpoint}, ${keys.p256dh}, ${keys.auth})
    ON CONFLICT (endpoint) DO UPDATE
      SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, user_id = EXCLUDED.user_id
  `;
  return json({ ok: true }, 201);
}

export async function DELETE(req: Request) {
  const userId = await currentUserId();
  if (!userId) return apiError('Unauthorized', 401);
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get('endpoint');
  if (!endpoint) return apiError('Missing endpoint');
  await sql`
    DELETE FROM push_subscriptions
    WHERE user_id = ${userId} AND endpoint = ${endpoint}
  `;
  return json({ ok: true });
}

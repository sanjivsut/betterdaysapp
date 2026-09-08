import { auth } from '@/lib/auth';
import { sql } from '@/lib/db';

/**
 * Server-side admin gate. Re-checks the `is_admin` flag against the DB (not just
 * the JWT) so a stale token can't grant access. Returns the numeric user id
 * when the caller is a verified admin, otherwise null.
 */
export async function requireAdmin(): Promise<number | null> {
  const session = await auth();
  const id = Number(session?.user?.id);
  if (!Number.isFinite(id)) return null;

  const rows = (await sql`
    SELECT is_admin, is_active FROM users WHERE id = ${id} LIMIT 1
  `) as Array<{ is_admin: boolean; is_active: boolean }>;
  const row = rows[0];
  if (!row || !row.is_admin || !row.is_active) return null;
  return id;
}

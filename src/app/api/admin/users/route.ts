import { apiError, json } from '@/lib/api';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';

const PAGE_SIZE = 20;

export async function GET(req: Request) {
  const adminId = await requireAdmin();
  if (!adminId) return apiError('Not found', 404);

  const url = new URL(req.url);
  const q = (url.searchParams.get('q') ?? '').trim().toLowerCase();
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const like = `%${q}%`;

  const rows = (await sql`
    SELECT
      u.id, u.email, u.display_name, u.name, u.plan, u.is_admin, u.is_active,
      u.created_at, u.last_active_at,
      (SELECT COUNT(*) FROM habits h WHERE h.user_id = u.id) AS habit_count
    FROM users u
    WHERE (${q} = '' OR LOWER(u.email) LIKE ${like} OR LOWER(COALESCE(u.display_name, '')) LIKE ${like})
    ORDER BY u.created_at DESC
    LIMIT ${PAGE_SIZE} OFFSET ${offset}
  `) as Array<Record<string, unknown>>;

  const countRows = (await sql`
    SELECT COUNT(*) AS total FROM users u
    WHERE (${q} = '' OR LOWER(u.email) LIKE ${like} OR LOWER(COALESCE(u.display_name, '')) LIKE ${like})
  `) as Array<{ total: string }>;
  const total = Number(countRows[0].total);

  return json({
    users: rows.map((r) => ({
      id: String(r.id),
      email: r.email,
      name: r.display_name ?? r.name ?? null,
      plan: r.plan,
      isAdmin: r.is_admin,
      isActive: r.is_active,
      habitCount: Number(r.habit_count),
      createdAt: r.created_at,
      lastActiveAt: r.last_active_at,
    })),
    page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  });
}

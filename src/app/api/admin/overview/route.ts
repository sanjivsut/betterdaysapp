import { apiError, json } from '@/lib/api';
import { requireAdmin } from '@/lib/admin';
import { sql } from '@/lib/db';

export async function GET() {
  const adminId = await requireAdmin();
  if (!adminId) return apiError('Not found', 404);

  const [totals, signups, habitTypes, topCategories] = await Promise.all([
    sql`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days') AS new_users_7d,
        (SELECT COUNT(*) FROM habits) AS total_habits,
        (SELECT COUNT(*) FROM log_entries) AS total_entries
    `,
    sql`
      SELECT to_char(d::date, 'YYYY-MM-DD') AS date,
             COUNT(u.id) AS count
      FROM generate_series(NOW() - INTERVAL '29 days', NOW(), INTERVAL '1 day') AS d
      LEFT JOIN users u ON u.created_at::date = d::date
      GROUP BY d::date
      ORDER BY d::date
    `,
    sql`SELECT type, COUNT(*) AS count FROM habits GROUP BY type`,
    sql`
      SELECT COALESCE(NULLIF(category, ''), 'uncategorised') AS category, COUNT(*) AS count
      FROM habits GROUP BY 1 ORDER BY count DESC LIMIT 8
    `,
  ]);

  const t = (totals as Array<Record<string, string>>)[0];
  return json({
    totals: {
      totalUsers: Number(t.total_users),
      newUsers7d: Number(t.new_users_7d),
      totalHabits: Number(t.total_habits),
      totalEntries: Number(t.total_entries),
    },
    signups: (signups as Array<{ date: string; count: string }>).map((r) => ({
      date: r.date,
      count: Number(r.count),
    })),
    habitTypes: (habitTypes as Array<{ type: string; count: string }>).map((r) => ({
      type: r.type,
      count: Number(r.count),
    })),
    topCategories: (topCategories as Array<{ category: string; count: string }>).map(
      (r) => ({ category: r.category, count: Number(r.count) }),
    ),
  });
}

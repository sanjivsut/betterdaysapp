'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Icon } from '@/components/ui/Icon';
import { apiGet, apiSend } from '@/lib/client';

interface Overview {
  totals: {
    totalUsers: number;
    newUsers7d: number;
    totalHabits: number;
    totalEntries: number;
  };
  signups: { date: string; count: number }[];
  habitTypes: { type: string; count: number }[];
  topCategories: { category: string; count: number }[];
}

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  isAdmin: boolean;
  isActive: boolean;
  habitCount: number;
  createdAt: string;
  lastActiveAt: string | null;
}
interface UsersResponse {
  users: UserRow[];
  page: number;
  totalPages: number;
  total: number;
}

export function AdminDashboard() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<UsersResponse | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Overview>('/api/admin/overview')
      .then(setOverview)
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, []);

  const loadUsers = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page) });
    if (query.trim()) params.set('q', query.trim());
    setUsers(await apiGet<UsersResponse>(`/api/admin/users?${params}`));
  }, [page, query]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadUsers().catch((e) =>
        setError(e instanceof Error ? e.message : 'Load failed'),
      );
    }, 250);
    return () => clearTimeout(t);
  }, [loadUsers]);

  async function toggleActive(u: UserRow) {
    await apiSend(`/api/admin/users/${u.id}`, 'PATCH', { isActive: !u.isActive });
    loadUsers();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Overview</h1>
      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          icon="users"
          label="Total users"
          value={overview?.totals.totalUsers}
        />
        <Stat
          icon="user-plus"
          label="New (7 days)"
          value={overview?.totals.newUsers7d}
        />
        <Stat
          icon="target"
          label="Habits created"
          value={overview?.totals.totalHabits}
        />
        <Stat
          icon="pencil"
          label="Log entries"
          value={overview?.totals.totalEntries}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-card border border-border bg-surface p-4 lg:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Signups (last 30 days)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={overview?.signups ?? []}
                margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
              >
                <CartesianGrid stroke="var(--color-border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }}
                  tickFormatter={(d: string) => d.slice(5)}
                  minTickGap={20}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: 'var(--color-text-subtle)' }}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="#e8734a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-card border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold">Habit types</h2>
            {(overview?.habitTypes ?? []).map((t) => (
              <Row key={t.type} label={t.type} value={t.count} />
            ))}
            {overview && overview.habitTypes.length === 0 && (
              <p className="text-sm text-content-subtle">No habits yet.</p>
            )}
          </div>
          <div className="rounded-card border border-border bg-surface p-4">
            <h2 className="mb-3 text-sm font-semibold">Top categories</h2>
            {(overview?.topCategories ?? []).map((c) => (
              <Row key={c.category} label={c.category} value={c.count} />
            ))}
            {overview && overview.topCategories.length === 0 && (
              <p className="text-sm text-content-subtle">No data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Users</h2>
          <div className="relative">
            <Icon
              name="search"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-content-subtle"
            />
            <input
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              placeholder="Search email or name"
              className="h-9 w-56 rounded-lg border border-border bg-surface pl-7 pr-2 text-sm outline-none focus:border-brand"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase text-content-subtle">
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Joined</th>
                <th className="py-2 pr-3 font-medium">Habits</th>
                <th className="py-2 pr-3 font-medium">Last active</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 font-medium" />
              </tr>
            </thead>
            <tbody>
              {(users?.users ?? []).map((u) => (
                <tr key={u.id} className="border-b border-border">
                  <td className="py-2 pr-3">
                    <span className="font-medium">{u.email}</span>
                    {u.isAdmin && (
                      <span className="ml-2 rounded bg-brand/12 px-1.5 py-0.5 text-[10px] text-brand-dark">
                        admin
                      </span>
                    )}
                    {u.name && (
                      <span className="block text-xs text-content-subtle">
                        {u.name}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-content-muted">
                    {fmtDate(u.createdAt)}
                  </td>
                  <td className="py-2 pr-3 text-content-muted">{u.habitCount}</td>
                  <td className="py-2 pr-3 text-content-muted">
                    {u.lastActiveAt ? fmtDate(u.lastActiveAt) : '—'}
                  </td>
                  <td className="py-2 pr-3">
                    <span
                      className={
                        u.isActive ? 'text-success' : 'text-danger'
                      }
                    >
                      {u.isActive ? 'active' : 'disabled'}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => toggleActive(u)}
                      disabled={u.isAdmin}
                      className="rounded-md border border-border px-2 py-1 text-xs hover:bg-surface-muted disabled:opacity-40"
                    >
                      {u.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users && users.totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-content-subtle">
              {users.total} users · page {users.page}/{users.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-md border border-border px-2 py-1 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                disabled={page >= users.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-md border border-border px-2 py-1 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: number;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <Icon name={icon} className="text-lg text-content-subtle" />
      <div className="mt-1 text-2xl font-semibold">
        {value == null ? '—' : value.toLocaleString()}
      </div>
      <div className="text-xs text-content-subtle">{label}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="capitalize text-content-muted">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

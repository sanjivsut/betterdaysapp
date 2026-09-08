import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

/** JSON helpers so route handlers stay short. */
export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(
    data,
    typeof init === 'number' ? { status: init } : init,
  );
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Resolves the authenticated user's numeric id, or null. Route handlers call
 * this first and bail with 401 when null.
 */
export async function currentUserId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user || session.user.isActive === false) return null;
  const id = Number(session.user.id);
  return Number.isFinite(id) ? id : null;
}

export async function currentUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

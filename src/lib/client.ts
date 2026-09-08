'use client';

/** Tiny fetch helpers for client components. Throws on non-2xx with the API message. */

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error((await safeError(res)) ?? `Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export async function apiSend<T>(
  url: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error((await safeError(res)) ?? `Request failed (${res.status})`);
  return (res.status === 204 ? undefined : res.json()) as Promise<T>;
}

async function safeError(res: Response): Promise<string | null> {
  try {
    const data = await res.json();
    return typeof data?.error === 'string' ? data.error : null;
  } catch {
    return null;
  }
}

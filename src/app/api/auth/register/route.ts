import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';
import { apiError, json } from '@/lib/api';

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  name: z.string().trim().min(1).max(120).optional(),
});

/** Email/password signup. Creates the user row the Credentials provider reads. */
export async function POST(req: Request) {
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
  const email = parsed.data.email.toLowerCase();
  const { password, name } = parsed.data;

  const existing = (await sql`
    SELECT id FROM users WHERE email = ${email} LIMIT 1
  `) as unknown[];
  if (existing.length > 0) {
    return apiError('An account with that email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const rows = (await sql`
    INSERT INTO users (email, name, display_name, password_hash)
    VALUES (${email}, ${name ?? null}, ${name ?? null}, ${passwordHash})
    RETURNING id, email
  `) as Array<{ id: string; email: string }>;

  return json({ id: String(rows[0].id), email: rows[0].email }, 201);
}

import { Pool, type PoolClient, type QueryResultRow } from 'pg';

/**
 * Database access.
 *
 * A single node-postgres Pool serves the whole app. This works identically for
 * local Docker Postgres and for Netlify Database / Neon in production (Neon
 * accepts standard wire-protocol connections; use its `-pooler` host in prod).
 * Next 16's `proxy` runs on the Node runtime, so there is no Edge constraint
 * that would require an HTTP driver.
 *
 * `sql` is a tagged-template helper: `sql\`SELECT * FROM t WHERE id = ${id}\``
 * builds a parameterised query ($1, $2, …) and resolves to the row array
 * (matching the shape the codebase expects). `sql.query(text, params)` runs a
 * raw parameterised query.
 *
 * The connection string is validated lazily (first query) so `next build` can
 * analyse modules without a live database.
 */
function connectionString(): string {
  const cs = process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL;
  if (!cs) {
    throw new Error(
      'No database connection string. Set DATABASE_URL in .env.local (or deploy with Netlify Database, which provides NETLIFY_DATABASE_URL).',
    );
  }
  return cs;
}

const globalForPool = globalThis as unknown as { _bdPool?: Pool };

export function getPool(): Pool {
  if (!globalForPool._bdPool) {
    const cs = connectionString();
    globalForPool._bdPool = new Pool({
      connectionString: cs,
      max: 5, // keep serverless connection use small
      // Managed Postgres (Neon/Netlify) requires TLS; local Docker does not.
      ssl: /\bsslmode=require\b/.test(cs) || /neon\.tech|netlify/.test(cs)
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return globalForPool._bdPool;
}

interface SqlFn {
  <T extends QueryResultRow = QueryResultRow>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ): Promise<T[]>;
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ) => Promise<T[]>;
}

async function tagged<T extends QueryResultRow>(
  strings: TemplateStringsArray,
  values: unknown[],
): Promise<T[]> {
  let text = strings[0];
  for (let i = 0; i < values.length; i++) {
    text += `$${i + 1}` + strings[i + 1];
  }
  const res = await getPool().query<T>(text, values as unknown[]);
  return res.rows;
}

export const sql = Object.assign(
  <T extends QueryResultRow = QueryResultRow>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) => tagged<T>(strings, values),
  {
    query: async <T extends QueryResultRow = QueryResultRow>(
      text: string,
      params: unknown[] = [],
    ) => {
      const res = await getPool().query<T>(text, params);
      return res.rows;
    },
  },
) as SqlFn;

/** Run a set of statements in a single transaction. */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

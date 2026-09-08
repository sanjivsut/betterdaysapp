/**
 * Applies src/lib/schema.sql to the database in DATABASE_URL (or
 * NETLIFY_DATABASE_URL). The schema is idempotent, so this doubles as a
 * "make sure the DB is up to date" command. Run: npm run db:migrate
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import pg from 'pg';

// Load .env.local without a dependency.
try {
  const envPath = join(process.cwd(), '.env.local');
  const raw = await readFile(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
} catch {
  // no .env.local — rely on the ambient environment (e.g. Netlify build)
}

const connectionString =
  process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL;

if (!connectionString) {
  console.error(
    'No DATABASE_URL / NETLIFY_DATABASE_URL. Set one in .env.local first.',
  );
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = await readFile(join(__dirname, '../src/lib/schema.sql'), 'utf8');

const ssl =
  /\bsslmode=require\b/.test(connectionString) ||
  /neon\.tech|netlify/.test(connectionString)
    ? { rejectUnauthorized: false }
    : undefined;

const client = new pg.Client({ connectionString, ssl });
await client.connect();

console.log('Applying schema…');
try {
  // schema.sql is idempotent; run it as one script.
  await client.query(schema);
  console.log('Done.');
} catch (err) {
  console.error('\nMigration failed:\n', err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}

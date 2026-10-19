import pg from 'pg';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Only use for a freshly provisioned development database. Refuse existing tables.
const url = new URL(process.env.DATABASE_URL);
const fingerprint = createHash('sha256').update(`${url.hostname}:${url.port || '5432'}${url.pathname}`).digest('hex');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const tables = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') AND table_type='BASE TABLE'");
  if (tables.rows.length) throw new Error('TARGET_NOT_EMPTY');
  mkdirSync('.local', { recursive: true });
  writeFileSync('.local/database-verification.json', JSON.stringify({ fingerprint, host: url.hostname, database: url.pathname.slice(1), verifiedAt: new Date().toISOString(), tableCount: 0, environment: 'user-confirmed dedicated development database', backup: 'No application tables or records existed; no data backup required.' }, null, 2));
  console.log('Empty development target verified; local manifest saved.');
} catch (error) { console.error(error.message === 'TARGET_NOT_EMPTY' ? 'Refused: database is not empty.' : 'Target inspection failed.'); process.exitCode = 1; }
finally { await client.end(); }

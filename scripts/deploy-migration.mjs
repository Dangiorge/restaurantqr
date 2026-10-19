import pg from 'pg';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const manifest = JSON.parse(readFileSync('.local/database-verification.json', 'utf8'));
const test = JSON.parse(readFileSync('.local/migration-test.json', 'utf8'));
const url = new URL(process.env.DATABASE_URL);
const fingerprint = createHash('sha256').update(`${url.hostname}:${url.port || '5432'}${url.pathname}`).digest('hex');
const sql = readFileSync('prisma/migrations/20261019090000_phase_one/migration.sql', 'utf8');
if (fingerprint !== manifest.fingerprint || test.fingerprint !== fingerprint || test.sqlHash !== createHash('sha256').update(sql).digest('hex') || !test.passed) throw new Error('Verified target or tested SQL mismatch.');
if (/^\s*(DROP|TRUNCATE|DELETE|UPDATE)\b/im.test(sql)) throw new Error('Destructive SQL rejected.');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
try {
  await client.connect();
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'");
  if (tables.rows.length) throw new Error('Target changed since inspection. Stop and inspect migration state.');
} finally { await client.end(); }
const result = spawnSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { stdio: 'inherit', env: process.env });
process.exitCode = result.status ?? 1;

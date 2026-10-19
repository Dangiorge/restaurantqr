import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const verification=JSON.parse(readFileSync('.local/taxonomy-migration-verification.json'));
const url=new URL(process.env.DATABASE_URL);
const hash=text=>createHash('sha256').update(text).digest('hex');
if(hash(`${url.hostname}:${url.port||'5432'}${url.pathname}`)!==verification.fingerprint||!verification.restoreVerified||!verification.testPassed||hash(readFileSync(verification.backupPath))!==verification.backupHash||hash(readFileSync('prisma/migrations/20261019170000_menu_taxonomy/migration.sql'))!==verification.sqlHash)throw new Error('Database, backup or tested SQL verification mismatch.');
// Schema migrations need a stable session. Keep runtime traffic pooled, and
// connect directly to the same verified Neon endpoint for the migration only.
const migrationUrl=new URL(url);
if(migrationUrl.hostname.endsWith('.neon.tech'))migrationUrl.hostname=migrationUrl.hostname.replace('-pooler.','.');
const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{stdio:'inherit',env:{...process.env,DATABASE_URL:migrationUrl.toString()}});
process.exitCode=result.status??1;

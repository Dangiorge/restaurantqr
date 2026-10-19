import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const verification=JSON.parse(readFileSync('.local/guest-migration-verification.json'));
const url=new URL(process.env.DATABASE_URL);
const hash=text=>createHash('sha256').update(text).digest('hex');
if(hash(`${url.hostname}:${url.port||'5432'}${url.pathname}`)!==verification.fingerprint||!verification.restoreVerified||!verification.testPassed||hash(readFileSync(verification.backupPath))!==verification.backupHash||hash(readFileSync('prisma/migrations/20261019140000_guest_ordering/migration.sql'))!==verification.sqlHash)throw new Error('Database, backup or tested SQL verification mismatch.');
const result=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{stdio:'inherit',env:process.env});
process.exitCode=result.status??1;

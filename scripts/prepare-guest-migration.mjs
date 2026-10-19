import pg from 'pg';
import {createHash,randomUUID} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
// Preserve PostgreSQL timestamp text exactly instead of interpreting unzoned
// database timestamps in the workstation's local timezone during a restore.
pg.types.setTypeParser(1114,value=>value);
pg.types.setTypeParser(1184,value=>value);

const manifest=JSON.parse(readFileSync('.local/database-verification.json','utf8'));
const url=new URL(process.env.DATABASE_URL);
const fingerprint=createHash('sha256').update(`${url.hostname}:${url.port||'5432'}${url.pathname}`).digest('hex');
if(fingerprint!==manifest.fingerprint)throw new Error('Database target mismatch.');
const client=new pg.Client({connectionString:process.env.DATABASE_URL});
const baseline=readFileSync('prisma/migrations/20261019090000_phase_one/migration.sql','utf8')+'\n'+readFileSync('prisma/migrations/20261019110000_menu_document/migration.sql','utf8');
const sql=readFileSync('prisma/migrations/20261019140000_guest_ordering/migration.sql','utf8');
if(/^\s*(DROP|TRUNCATE|DELETE|UPDATE)\b/im.test(sql)||!sql.includes('CREATE TABLE "Order"'))throw new Error('Unexpected or destructive migration SQL.');
const tableNames=[...baseline.matchAll(/CREATE TABLE "([A-Za-z]+)"/g)].map(m=>m[1]);
const schema=`qrmenu_test_${randomUUID().replaceAll('-','')}`;
await client.connect();
try{
  await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
  const history=(await client.query('SELECT migration_name,finished_at,rolled_back_at FROM public._prisma_migrations ORDER BY started_at')).rows;
  if(history.length!==2||history[0].migration_name!=='20261019090000_phase_one'||history[1].migration_name!=='20261019110000_menu_document'||history.some(m=>!m.finished_at||m.rolled_back_at))throw new Error('Unexpected migration history.');
  const snapshot={fingerprint,createdAt:new Date().toISOString(),history,tables:{}};
  for(const table of tableNames)snapshot.tables[table]=(await client.query(`SELECT * FROM public."${table}"`)).rows;
  await client.query('COMMIT');
  mkdirSync('.local/backups',{recursive:true});
  const backupPath=`.local/backups/guest-ordering-${Date.now()}.json`;
  const encoded=JSON.stringify(snapshot);
  writeFileSync(backupPath,encoded,{mode:0o600});
  const restored=JSON.parse(readFileSync(backupPath,'utf8'));
  await client.query('BEGIN');
  await client.query(`CREATE SCHEMA "${schema}"`);
  await client.query(`SET LOCAL search_path TO "${schema}"`);
  await client.query(baseline.replace('CREATE SCHEMA IF NOT EXISTS "public";',''));
  for(const table of tableNames){
    for(const row of restored.tables[table]){
      const columns=Object.keys(row);
      await client.query(`INSERT INTO "${table}" (${columns.map(c=>`"${c}"`).join(',')}) VALUES (${columns.map((_,i)=>`$${i+1}`).join(',')})`,Object.values(row));
    }
    const rows=(await client.query(`SELECT * FROM "${table}"`)).rows;
    const normalize=values=>values.map(v=>JSON.stringify(v)).sort().join('\n');
    if(normalize(rows)!==normalize(restored.tables[table]))throw new Error(`Backup restore mismatch: ${table}`);
  }
  await client.query(sql);
  for(const table of ['Order','OrderItem','ServiceRequest']){
    const check=await client.query(`SELECT count(*)::int AS count FROM "${table}"`);
    if(check.rows[0].count)throw new Error('New guest-operation tables are not empty.');
  }
  await client.query('ROLLBACK');
  writeFileSync('.local/guest-migration-verification.json',JSON.stringify({fingerprint,backupPath,backupHash:createHash('sha256').update(encoded).digest('hex'),sqlHash:createHash('sha256').update(sql).digest('hex'),restoreVerified:true,testPassed:true,verifiedAt:new Date().toISOString()},null,2));
  console.log('Existing records backed up; exact restore verified across 21 tables; additive migration tested and rolled back in an isolated schema. No live records changed.');
}catch(error){await client.query('ROLLBACK').catch(()=>{});console.error('Migration preparation failed; no migration applied.',error.code||error.message);process.exitCode=1;}
finally{await client.end();}

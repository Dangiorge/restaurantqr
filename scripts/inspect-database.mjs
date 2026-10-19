// Read-only inspection. Never print connection strings, credentials, or row data.
import pg from 'pg';

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 });
try {
  await client.connect();
  await client.query('BEGIN READ ONLY');
  const identity = await client.query('SELECT current_database() AS database, current_schema() AS schema, version() AS version');
  const tables = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') AND table_type = 'BASE TABLE' ORDER BY 1,2");
  const migrations = tables.rows.find(t => t.table_name === '_prisma_migrations');
  let history = [];
  if (migrations) {
    const schema = migrations.table_schema.replaceAll('"', '""');
    history = (await client.query(`SELECT migration_name, finished_at, rolled_back_at FROM "${schema}"._prisma_migrations ORDER BY started_at`)).rows;
  }
  console.log(JSON.stringify({ identity: identity.rows[0], tables: tables.rows, migrations: history }, null, 2));
  await client.query('ROLLBACK');
} catch (error) {
  console.error(JSON.stringify({ status: 'inspection_failed', code: error.code || 'CONNECTION_FAILED' }));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}

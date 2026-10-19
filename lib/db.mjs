import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

export function createDatabase(connectionString = process.env.DATABASE_URL, schema = process.env.DATABASE_SCHEMA || 'public') {
  if (!connectionString) throw new Error('DATABASE_URL is required');
  if (!/^[a-z][a-z0-9_]*$/.test(schema)) throw new Error('Invalid database schema');
  return new PrismaClient({ adapter: new PrismaPg({ connectionString, max: 5 }, { schema }), log: [], transactionOptions: { maxWait: 10000, timeout: 30000 } });
}

export function database() {
  // Hot reload preserves globals even after Prisma Client is regenerated.
  // Discard clients generated before the current menu fields and ordering models.
  if (globalThis.qrmenuDatabase && (!globalThis.qrmenuDatabase.menu.fields.documentUrl || !globalThis.qrmenuDatabase.menuCategory?.fields?.parentId || !globalThis.qrmenuDatabase.menuItem?.fields?.dietaryType || !globalThis.qrmenuDatabase.order || !globalThis.qrmenuDatabase.serviceRequest)) {
    const stale = globalThis.qrmenuDatabase;
    delete globalThis.qrmenuDatabase;
    delete globalThis.qrmenuAuth;
    void stale.$disconnect().catch(() => {});
  }
  globalThis.qrmenuDatabase ??= createDatabase();
  return globalThis.qrmenuDatabase;
}

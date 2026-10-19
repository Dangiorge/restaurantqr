import { betterAuth } from 'better-auth/minimal';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { database } from './db.mjs';

export function authentication() {
  if (!process.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET.length < 32) throw new Error('Configure BETTER_AUTH_SECRET (at least 32 characters)');
  if (!process.env.BETTER_AUTH_URL) throw new Error('Configure BETTER_AUTH_URL');
  globalThis.qrmenuAuth ??= betterAuth({
    database: prismaAdapter(database(), { provider: 'postgresql' }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: { enabled: true, storage: 'database', modelName: 'rateLimit', window: 60, max: 60 },
    user: { additionalFields: { status: { type: 'string', defaultValue: 'ACTIVE', input: false }, platformAdmin: { type: 'boolean', defaultValue: false, input: false } } },
    databaseHooks: { session: { create: { before: async session => {
      const user = await database().user.findUnique({ where: { id: session.userId }, select: { status: true } });
      return user?.status === 'ACTIVE' ? { data: session } : false;
    } } } },
  });
  return globalThis.qrmenuAuth;
}

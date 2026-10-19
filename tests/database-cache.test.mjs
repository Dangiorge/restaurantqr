import test from 'node:test';
import assert from 'node:assert/strict';
import { database } from '../lib/db.mjs';

test('hot reload replaces a pre-documentUrl client and invalidates cached auth', async () => {
  const previousClient = globalThis.qrmenuDatabase;
  const previousAuth = globalThis.qrmenuAuth;
  const previousUrl = process.env.DATABASE_URL;
  let disconnected = false;
  let replacement;
  process.env.DATABASE_URL ||= 'postgresql://test:test@localhost:5432/test';
  globalThis.qrmenuDatabase = { menu: { fields: {} }, $disconnect: async () => { disconnected = true; } };
  globalThis.qrmenuAuth = { stale: true };
  try {
    replacement = database();
    assert.equal(disconnected, true);
    assert.ok(replacement.menu.fields.documentUrl);
    assert.equal(globalThis.qrmenuAuth, undefined);
    assert.equal(database(), replacement, 'a current client remains cached');
  } finally {
    if (replacement) await replacement.$disconnect();
    globalThis.qrmenuDatabase = previousClient;
    globalThis.qrmenuAuth = previousAuth;
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
  }
});

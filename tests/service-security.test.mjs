import test from 'node:test';
import assert from 'node:assert/strict';
import { mutate } from '../modules/workspace/service.mjs';

test('QR management verifies tenant membership before querying table records', async () => {
  let queried = false;
  const tx = { membership: { findUnique: async () => null }, diningTable: { findFirst: async () => { queried = true; return {}; } } };
  const db = { $transaction: callback => callback(tx) };
  await assert.rejects(mutate(db, {id:'user',status:'ACTIVE'}, 'other-tenant', 'qr', {tableId:'table',action:'generate'}));
  assert.equal(queried,false);
});

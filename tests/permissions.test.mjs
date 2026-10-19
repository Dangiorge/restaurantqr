import test from 'node:test';
import assert from 'node:assert/strict';
import { authorize, authorizeGrant, permissions } from '../modules/identity/permissions.mjs';

const owner = { tenantId: 'a', status: 'ACTIVE', userStatus: 'ACTIVE', tenantStatus: 'ACTIVE', permissions, branchIds: null };
test('another tenant cannot be read or modified', () => {
  for (const permission of ['menu.view', 'menu.edit']) {
    assert.throws(() => authorize(owner, { tenantId: 'b', permission }), /FORBIDDEN/);
  }
});
test('branch staff cannot access other branches or missing scope', () => {
  const request = { tenantId: 'a', branchId: 'two', permission: 'menu.view' };
  assert.throws(() => authorize({ ...owner, branchIds: ['one'] }, request), /FORBIDDEN/);
  assert.throws(() => authorize({ ...owner, branchIds: undefined }, request), /FORBIDDEN/);
  assert.deepEqual(authorize({ ...owner, branchIds: ['two'] }, request), { tenantId: 'a', branchId: 'two' });
});
test('custom permissions are enforced', () => {
  const member = { ...owner, permissions: ['menu.view'] };
  assert.throws(() => authorize(member, { tenantId: 'a', permission: 'menu.edit' }), /FORBIDDEN/);
  assert.deepEqual(authorize(member, { tenantId: 'a', permission: 'menu.view' }), { tenantId: 'a' });
});
test('restaurant owners cannot grant platform privileges', () => {
  assert.throws(() => authorizeGrant(owner, 'a', ['platform.admin']), /FORBIDDEN/);
});
test('delegates cannot grant permissions they do not possess', () => {
  assert.throws(() => authorizeGrant({ ...owner, permissions: ['roles.manage'] }, 'a', ['payments.configure']), /FORBIDDEN/);
  assert.deepEqual(authorizeGrant(owner, 'a', ['menu.view', 'menu.view']), ['menu.view']);
});
test('inactive users, memberships and restaurants fail closed', () => {
  for (const field of ['status', 'userStatus', 'tenantStatus']) {
    assert.throws(() => authorize({ ...owner, [field]: 'SUSPENDED' }, { tenantId: 'a', permission: 'menu.view' }), /FORBIDDEN/);
  }
  assert.throws(() => authorize(null, { tenantId: 'a', permission: 'menu.view' }), /FORBIDDEN/);
});

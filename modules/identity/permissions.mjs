// Call only with a membership loaded server-side for the authenticated user.
// These helpers do not authenticate browser input.
export const permissions = Object.freeze([
  'restaurant.manage', 'branches.manage', 'staff.manage', 'roles.manage',
  'menu.view', 'menu.edit', 'prices.manage', 'tables.manage', 'qr.manage',
  'promotions.manage', 'orders.process', 'kitchen.manage', 'service.manage',
  'payments.configure', 'payments.view', 'refunds.issue', 'feedback.view',
  'reports.view', 'reports.export',
]);

export const defaultRoles = Object.freeze({
  owner: permissions,
  restaurant_manager: ['restaurant.manage', 'branches.manage', 'menu.view', 'menu.edit', 'prices.manage', 'tables.manage', 'qr.manage', 'orders.process', 'feedback.view', 'reports.view'],
  branch_manager: ['menu.view', 'tables.manage', 'qr.manage', 'orders.process', 'kitchen.manage', 'service.manage', 'feedback.view', 'reports.view'],
  waiter: ['menu.view', 'orders.process', 'service.manage'],
  kitchen: ['menu.view', 'kitchen.manage'],
  cashier: ['orders.process', 'payments.view'],
  marketing: ['menu.view', 'promotions.manage', 'feedback.view'],
});
Object.values(defaultRoles).forEach(Object.freeze);

export function authorize(membership, { tenantId, branchId, permission }) {
  if (!membership || membership.status !== 'ACTIVE' || membership.userStatus !== 'ACTIVE' || membership.tenantStatus !== 'ACTIVE') throw new Error('FORBIDDEN');
  if (!tenantId || membership.tenantId !== tenantId) throw new Error('FORBIDDEN');
  if (!permissions.includes(permission) || !membership.permissions?.includes(permission)) throw new Error('FORBIDDEN');
  // null means explicitly tenant-wide. Missing or empty scope grants no branches.
  if (branchId && membership.branchIds !== null && !membership.branchIds?.includes(branchId)) throw new Error('FORBIDDEN');
  return Object.freeze({ tenantId, ...(branchId ? { branchId } : {}) });
}

export function authorizeGrant(membership, tenantId, requestedPermissions) {
  authorize(membership, { tenantId, permission: 'roles.manage' });
  if (!Array.isArray(requestedPermissions) || requestedPermissions.some(p => !permissions.includes(p) || !membership.permissions.includes(p))) throw new Error('FORBIDDEN');
  // Branch staff may not create tenant-wide roles.
  if (membership.branchIds !== null) throw new Error('FORBIDDEN');
  return [...new Set(requestedPermissions)];
}

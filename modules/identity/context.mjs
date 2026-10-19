import { authorize } from './permissions.mjs';
import { HttpError } from '../../lib/http.mjs';

export async function context(db, user, restaurantId, permission, branchId) {
  const membership = await db.membership.findUnique({
    where: { restaurantId_userId: { restaurantId, userId: user.id } },
    include: { restaurant: true, role: { include: { permissions: true } }, branches: true },
  });
  if (!membership) throw new HttpError(403, 'Access denied.');
  const verified = {
    tenantId: restaurantId, status: membership.status, userStatus: user.status,
    tenantStatus: membership.restaurant.status,
    branchIds: membership.allBranches ? null : membership.branches.map(b => b.branchId),
    permissions: membership.role.permissions.map(p => p.permissionKey),
  };
  authorize(verified, { tenantId: restaurantId, branchId, permission });
  return { ...verified, membership, user };
}

export function tenantWide(ctx) {
  if (ctx.branchIds !== null) throw new HttpError(403, 'This operation requires restaurant-wide access.');
}
export function branchFilter(ctx) {
  return ctx.branchIds === null ? {} : { id: { in: ctx.branchIds } };
}

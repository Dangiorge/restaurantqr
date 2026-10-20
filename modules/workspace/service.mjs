import { createHash, randomBytes } from 'node:crypto';
import { HttpError } from '../../lib/http.mjs';
import { context, tenantWide, branchFilter } from '../identity/context.mjs';
import { authorizeGrant, defaultRoles, permissions } from '../identity/permissions.mjs';
import * as v from '../validation.mjs';
import {publicMenuSelect} from '../menus/public.mjs';

export const hashToken = token => createHash('sha256').update(token).digest('hex');
const token = () => randomBytes(32).toString('base64url');
const audit = (tx, ctx, action, entityId, details = {}) => tx.auditLog.create({ data: { restaurantId: ctx.tenantId, actorId: ctx.user.id, action, entityId, details } });
const required = record => { if (!record) throw new HttpError(404, 'Record unavailable.'); return record; };

export async function onboard(db, user, input) {
  const { brand, ...data } = v.restaurantInput.parse(input);
  return db.$transaction(async tx => {
    const restaurant = await tx.restaurant.create({ data: { ...data, ...(brand === 'romina' ? { primaryColor: '#D42028', logoUrl: '/brand/romina-logo.svg' } : {}), settings: { create: {} }, menus: { create: { name: 'Main menu' } } } });
    await tx.permission.createMany({ data: permissions.map(key => ({ key })), skipDuplicates: true });
    let ownerId;
    for (const [name, keys] of Object.entries(defaultRoles)) {
      const role = await tx.role.create({ data: { restaurantId: restaurant.id, name, isOwner: name === 'owner', permissions: { create: keys.map(permissionKey => ({ permissionKey })) } } });
      if (name === 'owner') ownerId = role.id;
    }
    await tx.membership.create({ data: { restaurantId: restaurant.id, userId: user.id, roleId: ownerId, allBranches: true } });
    await tx.auditLog.create({ data: { restaurantId: restaurant.id, actorId: user.id, action: 'restaurant.created', entityId: restaurant.id } });
    return { id: restaurant.id, name: restaurant.name, slug: restaurant.slug };
  });
}

export async function overview(db, user, restaurantId) {
  // No implicit menu permission: kitchen, marketing, cashiers and custom roles
  // may have a different first permission. Membership is always checked.
  const member = await db.membership.findUnique({ where: { restaurantId_userId: { restaurantId, userId: user.id } }, include: { role: { include: { permissions: true } } } });
  const first = member?.role.permissions[0]?.permissionKey;
  if (!first) throw new HttpError(403, 'No workspace permissions.');
  const ctx = await context(db, user, restaurantId, first);
  const can = p => ctx.permissions.includes(p);
  const branches = await db.branch.findMany({ where: { restaurantId, ...branchFilter(ctx) }, orderBy: { name: 'asc' } });
  const branchIds = branches.map(b => b.id);
  const [menus, tables, areas, roles, members, invitations] = await Promise.all([
    can('menu.view') || can('menu.edit') ? db.menu.findMany({ where: { restaurantId }, include: { categories: { orderBy: { displayOrder: 'asc' }, include: { items: { orderBy: { displayOrder: 'asc' } } } } } }) : [],
    can('tables.manage') || can('qr.manage') ? db.diningTable.findMany({ where: { restaurantId, branchId: { in: branchIds } }, include: { qrCodes: { where: { revokedAt: null }, orderBy: { createdAt: 'desc' } } }, orderBy: { name: 'asc' } }) : [],
    can('tables.manage') ? db.diningArea.findMany({ where: { restaurantId, branchId: { in: branchIds } } }) : [],
    can('staff.manage') || can('roles.manage') ? db.role.findMany({ where: { restaurantId }, include: { permissions: true } }) : [],
    can('staff.manage') && ctx.branchIds === null ? db.membership.findMany({ where: { restaurantId }, include: { user: { select: { name: true, email: true } }, branches: true } }) : [],
    can('staff.manage') && ctx.branchIds === null ? db.invitation.findMany({ where: { restaurantId, acceptedAt: null, revokedAt: null }, select: { id: true, email: true, expiresAt: true } }) : [],
  ]);
  const restaurant = await db.restaurant.findUnique({ where: { id: restaurantId }, include: { settings: true } });
  return { restaurant, branches, menus, tables, areas, roles, members, invitations, permissions: ctx.permissions, allBranches: ctx.branchIds === null, currentUserId: user.id };
}

const resources = {
  branches: { model: 'branch', schema: v.branchInput, permission: 'branches.manage', global: true },
  areas: { model: 'diningArea', schema: v.areaInput, permission: 'tables.manage' },
  tables: { model: 'diningTable', schema: v.tableInput, permission: 'tables.manage' },
  menus: { model: 'menu', schema: v.menuInput, permission: 'menu.edit', global: true },
  categories: { model: 'menuCategory', schema: v.categoryInput, permission: 'menu.edit', global: true },
  items: { model: 'menuItem', schema: v.itemInput, permission: 'menu.edit', global: true },
};

export async function mutate(db, user, restaurantId, resource, input, recordId) {
  if (!resources[resource]) return special(db, user, restaurantId, resource, input, recordId);
  const spec = resources[resource];
  const data = spec.schema.parse(input);
  return db.$transaction(async tx => {
    const ctx = await context(tx, user, restaurantId, spec.permission, data.branchId);
    if (spec.global) tenantWide(ctx);
    if(resource==='categories')await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`menu-categories:${restaurantId}`},0))`;
    const existing = recordId ? required(await tx[spec.model].findFirst({ where: { id: recordId, restaurantId, ...(!spec.global && ctx.branchIds !== null ? { branchId: { in: ctx.branchIds } } : {}) } })) : null;
    if (existing?.branchId) await context(tx, user, restaurantId, spec.permission, existing.branchId);
    if (existing?.branchId && existing.branchId !== data.branchId) throw new HttpError(400, 'Create a new table or area to change its branch.');
    if (data.branchId) required(await tx.branch.findFirst({ where: { id: data.branchId, restaurantId } }));
    if (data.areaId) required(await tx.diningArea.findFirst({ where: { id: data.areaId, restaurantId, branchId: data.branchId } }));
    if (data.menuId) required(await tx.menu.findFirst({ where: { id: data.menuId, restaurantId } }));
    if (data.categoryId) required(await tx.menuCategory.findFirst({ where: { id: data.categoryId, restaurantId } }));
    if(resource==='categories'){
      if(data.parentId){
        if(data.parentId===recordId)throw new HttpError(400,'A category cannot be its own parent.');
        const parent=required(await tx.menuCategory.findFirst({where:{id:data.parentId,restaurantId,menuId:data.menuId}}));
        if(parent.parentId)throw new HttpError(400,'Choose a top-level parent category. Only parent and child categories are supported.');
      }
      if(existing&&(data.parentId||data.menuId!==existing.menuId)&&await tx.menuCategory.count({where:{restaurantId,parentId:existing.id}}))throw new HttpError(400,'Move this category’s children first before changing its parent or menu.');
    }
    if (resource === 'items' && (!existing || existing.basePrice.toFixed(2) !== Number(data.basePrice).toFixed(2))) {
      await context(tx, user, restaurantId, 'prices.manage');
    }
    const result = existing
      ? await tx[spec.model].update({ where: { id: existing.id, restaurantId }, data })
      : await tx[spec.model].create({ data: { ...data, restaurantId } });
    await audit(tx, ctx, `${resource}.${existing ? 'updated' : 'created'}`, result.id,
      resource === 'items' ? { previousPrice: existing?.basePrice.toString() || null, newPrice: data.basePrice } : {});
    return { id: result.id };
  });
}

async function validateAssignment(tx, ctx, data) {
  tenantWide(ctx);
  const role = required(await tx.role.findFirst({ where: { restaurantId: ctx.tenantId, id: data.roleId }, include: { permissions: true } }));
  // Granting staff roles requires the separate authority to delegate each permission.
  authorizeGrant(ctx, ctx.tenantId, role.permissions.map(p => p.permissionKey));
  if (role.isOwner) throw new HttpError(403, 'Ownership transfer is not available.');
  if (new Set(data.branchIds).size !== data.branchIds.length) throw new HttpError(400, 'Duplicate branches.');
  const count = await tx.branch.count({ where: { restaurantId: ctx.tenantId, id: { in: data.branchIds } } });
  if (count !== data.branchIds.length || (!data.allBranches && !count)) throw new HttpError(400, 'Select valid branches.');
  return role;
}

async function special(db, user, restaurantId, resource, input, recordId) {
  return db.$transaction(async tx => {
    if(resource==='guest-content'){
      const ctx=await context(tx,user,restaurantId,'menu.edit');tenantWide(ctx);
      const data=v.guestContentInput.parse(input);
      const count=await tx.menuItem.count({where:{restaurantId,id:{in:data.recommendedItemIds}}});
      if(count!==data.recommendedItemIds.length)throw new HttpError(400,'Choose recommendations from this restaurant’s dishes.');
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`guest-content:${restaurantId}`},0))`;
      const previous=await tx.restaurantSettings.findUnique({where:{restaurantId},select:{guestContent:true}});
      data.appearance=data.appearance??previous?.guestContent?.appearance??v.appearanceInput.parse({});
      await tx.restaurantSettings.update({where:{restaurantId},data:{guestContent:data}});
      await audit(tx,ctx,'guest-content.updated',restaurantId);
      return {id:restaurantId};
    }
    if(resource==='appearance'){
      const ctx=await context(tx,user,restaurantId,'menu.edit');tenantWide(ctx);
      const appearance=v.appearanceInput.parse(input);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`guest-content:${restaurantId}`},0))`;
      const previous=required(await tx.restaurantSettings.findUnique({where:{restaurantId},select:{guestContent:true}}));
      await tx.restaurantSettings.update({where:{restaurantId},data:{guestContent:{...previous.guestContent,appearance}}});
      await audit(tx,ctx,'appearance.updated',restaurantId);
      return {id:restaurantId};
    }
    if (resource === 'settings') {
      const ctx = await context(tx, user, restaurantId, 'restaurant.manage'); tenantWide(ctx);
      const { currency, timezone, taxRate, serviceChargeRate, ...profile } = v.settingsInput.parse(input);
      await tx.restaurant.update({ where: { id: restaurantId }, data: profile });
      await tx.restaurantSettings.update({ where: { restaurantId }, data: { currency, timezone, taxRate, serviceChargeRate } });
      await audit(tx, ctx, 'settings.updated', restaurantId);
      return { id: restaurantId };
    }
    if (resource === 'roles') {
      const ctx = await context(tx, user, restaurantId, 'roles.manage'); tenantWide(ctx);
      const data = v.roleInput.parse(input);
      const granted = authorizeGrant(ctx, restaurantId, data.permissions);
      const old = recordId ? required(await tx.role.findFirst({ where: { id: recordId, restaurantId }, include: { memberships: true } })) : null;
      if (old?.isOwner) throw new HttpError(403, 'The owner role cannot be changed.');
      if (old) {
        // Editing a role must not let a delegate remove protections from roles
        // whose current privileges exceed their own grant authority.
        const current = await tx.rolePermission.findMany({ where: { roleId: old.id } });
        authorizeGrant(ctx, restaurantId, current.map(p => p.permissionKey));
        await tx.rolePermission.deleteMany({ where: { roleId: old.id } });
      }
      const dataFields = { name: data.name, permissions: { create: granted.map(permissionKey => ({ permissionKey })) } };
      const role = old ? await tx.role.update({ where: { id: old.id, restaurantId }, data: dataFields }) : await tx.role.create({ data: { ...dataFields, restaurantId } });
      await audit(tx, ctx, 'roles.saved', role.id, { permissions: granted });
      return { id: role.id };
    }
    if (resource === 'invitations') {
      const ctx = await context(tx, user, restaurantId, 'staff.manage');
      const data = v.invitationInput.parse(input);
      await validateAssignment(tx, ctx, data);
      const raw = token();
      const invite = await tx.invitation.create({ data: { ...data, restaurantId, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + 72 * 3600000) } });
      await audit(tx, ctx, 'invitation.created', invite.id);
      return { id: invite.id, invitationToken: raw };
    }
    if (resource === 'revoke-invitation') {
      const ctx = await context(tx, user, restaurantId, 'staff.manage'); tenantWide(ctx);
      const invite = required(await tx.invitation.findFirst({ where: { id: recordId, restaurantId, acceptedAt: null } }));
      await tx.invitation.update({ where: { id: invite.id, restaurantId }, data: { revokedAt: new Date() } });
      await audit(tx, ctx, 'invitation.revoked', invite.id);
      return { id: invite.id };
    }
    if (resource === 'members') {
      const ctx = await context(tx, user, restaurantId, 'staff.manage');
      const data = v.memberInput.parse(input);
      await validateAssignment(tx, ctx, data);
      const member = required(await tx.membership.findFirst({ where: { restaurantId, id: recordId }, include: { role: { include: { permissions: true } } } }));
      if (member.role.isOwner || member.userId === user.id) throw new HttpError(403, 'You cannot change this membership.');
      authorizeGrant(ctx, restaurantId, member.role.permissions.map(p => p.permissionKey));
      await tx.membershipBranch.deleteMany({ where: { restaurantId, membershipId: member.id } });
      await tx.membership.update({ where: { id: member.id, restaurantId }, data: { roleId: data.roleId, status: data.status, allBranches: data.allBranches, branches: { create: data.allBranches ? [] : data.branchIds.map(branchId => ({ branchId })) } } });
      await audit(tx, ctx, 'membership.updated', member.id);
      return { id: member.id };
    }
    if (resource === 'qr') {
      const data = v.qrInput.parse(input);
      const ctx = await context(tx, user, restaurantId, 'qr.manage');
      const table = required(await tx.diningTable.findFirst({ where: { id: data.tableId, restaurantId, ...(ctx.branchIds !== null ? { branchId: { in: ctx.branchIds } } : {}) } }));
      if (data.expiresAt && new Date(data.expiresAt) <= new Date()) throw new HttpError(400, 'Expiry must be in the future.');
      // Serialize regeneration without writing stale table profile fields.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`${restaurantId}:${table.id}`}, 0))`;
      await tx.qrCode.updateMany({ where: { restaurantId, tableId: table.id, revokedAt: null }, data: { revokedAt: new Date() } });
      const qr = data.action === 'generate' ? await tx.qrCode.create({ data: { restaurantId, tableId: table.id, token: token(), expiresAt: data.expiresAt ? new Date(data.expiresAt) : null } }) : null;
      await audit(tx, ctx, `qr.${data.action}`, table.id);
      return { id: qr?.id || table.id };
    }
    throw new HttpError(404, 'Unknown resource.');
  });
}

export async function acceptInvitation(db, user, raw) {
  if (typeof raw !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(raw)) throw new HttpError(400, 'Invalid invitation.');
  return db.$transaction(async tx => {
    const invite = required(await tx.invitation.findFirst({ where: { tokenHash: hashToken(raw), email: user.email.toLowerCase(), acceptedAt: null, revokedAt: null, expiresAt: { gt: new Date() }, restaurant: { status: 'ACTIVE' } } }));
    // Conditional claim prevents a concurrent replay from being accepted.
    const claim = await tx.invitation.updateMany({ where: { id: invite.id, acceptedAt: null, revokedAt: null }, data: { acceptedAt: new Date() } });
    if (claim.count !== 1) throw new HttpError(409, 'Invitation already accepted.');
    await tx.membership.create({ data: { restaurantId: invite.restaurantId, userId: user.id, roleId: invite.roleId, allBranches: invite.allBranches, branches: { create: invite.allBranches ? [] : invite.branchIds.map(branchId => ({ branchId })) } } });
    await tx.auditLog.create({ data: { restaurantId: invite.restaurantId, actorId: user.id, action: 'invitation.accepted', entityId: invite.id } });
    return { restaurantId: invite.restaurantId };
  });
}

export async function resolveQr(db, raw) {
  if (!/^[A-Za-z0-9_-]{43}$/.test(raw)) return null;
  const qr = await db.qrCode.findFirst({ where: { token: raw, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }], table: { active: true, branch: { active: true, restaurant: { status: 'ACTIVE' } } } }, select: { table: { select: { name: true, branch: { select: { name: true, restaurant: { select: { id: true, slug: true, name: true, description: true, logoUrl: true, primaryColor: true, settings: { select: { currency: true, taxRate: true, serviceChargeRate: true, guestContent:true } } } } } } } } } });
  if (!qr) return null;
  const restaurant = qr.table.branch.restaurant;
  const menus = await db.menu.findMany({ where: { restaurantId: restaurant.id, active: true }, select:publicMenuSelect });
  const { id: _id, ...profile } = restaurant;
  return { restaurant: profile, branch: qr.table.branch.name, table: qr.table.name, menus };
}

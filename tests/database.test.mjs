import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import pg from 'pg';
import { createDatabase } from '../lib/db.mjs';
import { onboard, mutate, overview, resolveQr, acceptInvitation } from '../modules/workspace/service.mjs';
import { context } from '../modules/identity/context.mjs';
import { authentication } from '../lib/auth.mjs';
import { currentUser, sameOrigin } from '../lib/http.mjs';
import {quoteOrder,placeOrder,requestService,guestStatus,operations,updateOperation} from '../modules/ordering/service.mjs';
import {publicRestaurant} from '../modules/menus/public.mjs';

test('Phase 1 disposable PostgreSQL schema integration', { skip: !process.env.DATABASE_URL }, async t => {
  const manifest = JSON.parse(readFileSync('.local/database-verification.json', 'utf8'));
  const url = new URL(process.env.DATABASE_URL);
  const fingerprint = createHash('sha256').update(`${url.hostname}:${url.port || '5432'}${url.pathname}`).digest('hex');
  assert.equal(fingerprint, manifest.fingerprint, 'Use the verified development database only');
  const schema = `qrmenu_test_${randomUUID().replaceAll('-', '')}`;
  const admin = new pg.Client({ connectionString: process.env.DATABASE_URL });
  const sql = readFileSync('prisma/migrations/20261019090000_phase_one/migration.sql', 'utf8') + '\n' + readFileSync('prisma/migrations/20261019110000_menu_document/migration.sql', 'utf8')+'\n'+readFileSync('prisma/migrations/20261019140000_guest_ordering/migration.sql','utf8')+'\n'+readFileSync('prisma/migrations/20261019170000_menu_taxonomy/migration.sql','utf8');
  assert.doesNotMatch(sql, /^\s*(DROP|TRUNCATE|DELETE|UPDATE)\b/im);
  let db;
  await admin.connect();
  try {
    await admin.query(`CREATE SCHEMA "${schema}"`);
    await admin.query(`SET search_path TO "${schema}"`);
    await admin.query(sql.replace('CREATE SCHEMA IF NOT EXISTS "public";', ''));
    const count = await admin.query('SELECT count(*)::int AS count FROM information_schema.tables WHERE table_schema=$1', [schema]);
    assert.equal(count.rows[0].count, 24);
    writeFileSync('.local/migration-test.json', JSON.stringify({ fingerprint, sqlHash: createHash('sha256').update(sql).digest('hex'), passed: true, testedAt: new Date().toISOString(), isolation: 'disposable PostgreSQL schema', tables: count.rows[0].count }, null, 2));
    db = createDatabase(process.env.DATABASE_URL, schema);
    const a = await db.user.create({ data: { id: randomUUID(), name: 'Owner A', email: 'a@example.test' } });
    const b = await db.user.create({ data: { id: randomUUID(), name: 'Owner B', email: 'b@example.test' } });
    const staff = await db.user.create({ data: { id: randomUUID(), name: 'Staff', email: 'staff@example.test' } });
    const ra = await onboard(db, a, { name: 'Restaurant A', slug: 'restaurant-a' });
    const rb = await onboard(db, b, { name: 'Restaurant B', slug: 'restaurant-b' });
    const branchA = await mutate(db, a, ra.id, 'branches', { name: 'Bole' });
    const branchA2 = await mutate(db, a, ra.id, 'branches', { name: 'Piazza' });
    const branchB = await mutate(db, b, rb.id, 'branches', { name: 'Other' });
    let tableA, category, item, qr;

    await t.test('tenant isolation is enforced on reads and writes', async () => {
      await assert.rejects(overview(db, a, rb.id));
      await assert.rejects(mutate(db, a, ra.id, 'branches', { name: 'Changed' }, branchB.id));
      await assert.rejects(mutate(db, a, ra.id, 'tables', { name: '1', branchId: branchB.id }));
      assert.equal((await db.branch.findUnique({ where: { id: branchB.id } })).name, 'Other');
    });
    await t.test('menu creation and price audits preserve decimal values', async () => {
      const menu = await db.menu.findFirst({ where: { restaurantId: ra.id } });
      category = await mutate(db, a, ra.id, 'categories', { menuId: menu.id, name: 'Mains' });
      item = await mutate(db, a, ra.id, 'items', { categoryId: category.id, name: 'Dish', basePrice: '245.50' });
      await mutate(db, a, ra.id, 'items', { categoryId: category.id, name: 'Dish', basePrice: '250.25' }, item.id);
      const record = await db.menuItem.findUnique({ where: { id: item.id } });
      assert.equal(record.basePrice.toString(), '250.25');
      const log = await db.auditLog.findFirst({ where: { restaurantId: ra.id, entityId: item.id, action: 'items.updated' } });
      assert.equal(log.details.previousPrice, '245.5');
      assert.equal(log.details.newPrice, '250.25');
    });
    await t.test('cross-tenant category reassignment is rejected', async () => {
      const menu = await db.menu.findFirst({ where: { restaurantId: rb.id } });
      await assert.rejects(mutate(db, a, ra.id, 'categories', { menuId: menu.id, name: 'Bad category' }));
    });
    await t.test('custom roles and branch restrictions are enforced', async () => {
      const role = await mutate(db, a, ra.id, 'roles', { name: 'Table helper', permissions: ['tables.manage','qr.manage'] });
      await db.membership.create({ data: { restaurantId: ra.id, userId: staff.id, roleId: role.id, allBranches: false, branches: { create: { branchId: branchA.id } } } });
      tableA = await mutate(db, staff, ra.id, 'tables', { name: '1', branchId: branchA.id });
      await assert.rejects(mutate(db, staff, ra.id, 'tables', { name: '2', branchId: branchA2.id }));
      await assert.rejects(mutate(db, staff, ra.id, 'items', { categoryId: category.id, name: 'Bad', basePrice: '1' }));
      const data = await overview(db, staff, ra.id);
      assert.equal(data.branches.length, 1);
      assert.equal(data.branches[0].id, branchA.id);
      assert.equal(data.menus.length, 0);
    });
    await t.test('platform privileges cannot be granted by an owner', async () => {
      await assert.rejects(mutate(db, a, ra.id, 'roles', { name: 'Escalate', permissions: ['platform.admin'] }));
      assert.equal((await db.user.findUnique({ where: { id: a.id } })).platformAdmin, false);
    });
    await t.test('invalid, revoked and expired QR tokens are rejected', async () => {
      assert.equal(await resolveQr(db, 'invalid'), null);
      await mutate(db, a, ra.id, 'qr', { tableId: tableA.id, action: 'generate' });
      qr = await db.qrCode.findFirst({ where: { tableId: tableA.id, revokedAt: null } });
      const menu = await resolveQr(db, qr.token);
      assert.equal(menu.table, '1');
      assert.equal(menu.menus[0].categories[0].items[0].basePrice.toString(), '250.25');
      assert.equal('id' in menu.restaurant, false);
      assert.equal(JSON.stringify(menu).includes('example.test'), false);
      await mutate(db, a, ra.id, 'qr', { tableId: tableA.id, action: 'generate' });
      assert.equal(await resolveQr(db, qr.token), null);
      await Promise.all([
        mutate(db, a, ra.id, 'qr', { tableId: tableA.id, action: 'generate' }),
        mutate(db, a, ra.id, 'qr', { tableId: tableA.id, action: 'generate' }),
      ]);
      assert.equal(await db.qrCode.count({ where: { tableId: tableA.id, revokedAt: null } }), 1);
      qr = await db.qrCode.findFirst({ where: { tableId: tableA.id, revokedAt: null } });
      await db.qrCode.update({ where: { id: qr.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
      assert.equal(await resolveQr(db, qr.token), null);
    });
    await t.test('suspended memberships and restaurants cannot access resources', async () => {
      await db.membership.update({ where: { restaurantId_userId: { restaurantId: ra.id, userId: staff.id } }, data: { status: 'SUSPENDED' } });
      await assert.rejects(context(db, staff, ra.id, 'tables.manage', branchA.id));
      await db.restaurant.update({ where: { id: ra.id }, data: { status: 'SUSPENDED' } });
      await assert.rejects(overview(db, a, ra.id));
      await db.restaurant.update({ where: { id: ra.id }, data: { status: 'ACTIVE' } });
    });
    await t.test('invitations match email, expire and cannot be replayed', async () => {
      const role = await db.role.findFirst({ where: { restaurantId: ra.id, name: 'waiter' } });
      const invited = await db.user.create({ data: { id: randomUUID(), name: 'Invited', email: 'invited@example.test' } });
      const input = { email: invited.email, roleId: role.id, allBranches: false, branchIds: [branchA.id] };
      const invite = await mutate(db, a, ra.id, 'invitations', input);
      await assert.rejects(acceptInvitation(db, b, invite.invitationToken));
      await acceptInvitation(db, invited, invite.invitationToken);
      await assert.rejects(acceptInvitation(db, invited, invite.invitationToken));
      const second = await mutate(db, a, ra.id, 'invitations', { ...input, email: 'expired@example.test' });
      await db.invitation.update({ where: { id: second.id }, data: { expiresAt: new Date(0) } });
      await assert.rejects(acceptInvitation(db, { ...invited, email: 'expired@example.test' }, second.invitationToken));
    });
    await t.test('database foreign keys reject cross-tenant relationships', async () => {
      await assert.rejects(db.diningTable.create({ data: { restaurantId: ra.id, branchId: branchB.id, name: 'Bad FK' } }));
    });
    await t.test('browser-supplied privilege and unknown pricing fields are rejected', async () => {
      await assert.rejects(mutate(db, a, ra.id, 'items', { categoryId: category.id, name: 'Bad', basePrice: '1', price: '0' }));
      await assert.rejects(onboard(db, a, { name: 'Bad', slug: 'bad-slug', platformAdmin: true }));
    });
    await t.test('dine-in quotes use authoritative decimal prices and snapshot orders idempotently',async()=>{
      await mutate(db,a,ra.id,'qr',{tableId:tableA.id,action:'generate'});
      const live=await db.qrCode.findFirst({where:{tableId:tableA.id,revokedAt:null}});
      await db.restaurantSettings.update({where:{restaurantId:ra.id},data:{taxRate:'15.00',serviceChargeRate:'10.00'}});
      const cart={items:[{itemId:item.id,quantity:2}],notes:'No chilli, please.'};
      const quote=await quoteOrder(db,live.token,cart);
      assert.equal(quote.subtotal,'500.50');assert.equal(quote.taxAmount,'75.08');assert.equal(quote.serviceAmount,'50.05');assert.equal(quote.total,'625.63');
      const input={...cart,requestKey:randomUUID(),quoteVersion:quote.version};
      const receipt=await placeOrder(db,live.token,input);
      assert.equal(receipt.status,'PLACED');assert.equal(receipt.total.toFixed(2),'625.63');
      const repeated=await placeOrder(db,live.token,input);
      assert.equal(repeated.reference,receipt.reference);
      assert.equal(await db.order.count({where:{restaurantId:ra.id}}),1);
      await db.menuItem.update({where:{id:item.id},data:{basePrice:'275.00',name:'Changed dish name'}});
      const snapshot=await guestStatus(db,receipt.reference,'order');
      assert.equal(snapshot.items[0].name,'Dish');assert.equal(snapshot.items[0].unitPrice.toFixed(2),'250.25');
      await assert.rejects(placeOrder(db,live.token,{...input,requestKey:randomUUID()}),e=>e.status===409);
      await assert.rejects(placeOrder(db,live.token,{...input,total:'0.01'}));
      await db.menuItem.update({where:{id:item.id},data:{basePrice:'250.25',name:'Dish'}});
      await assert.rejects(quoteOrder(db,live.token,{items:[{itemId:item.id,quantity:0}]}));
      await assert.rejects(quoteOrder(db,live.token,{items:[{itemId:item.id,quantity:1},{itemId:item.id,quantity:1}]}),e=>e.status===400);
      await db.menuItem.update({where:{id:item.id},data:{available:false}});
      await assert.rejects(quoteOrder(db,live.token,cart),e=>e.status===409);
      await db.menuItem.update({where:{id:item.id},data:{available:true}});
      const otherMenu=await db.menu.findFirst({where:{restaurantId:rb.id}});
      const otherCategory=await mutate(db,b,rb.id,'categories',{menuId:otherMenu.id,name:'Other dishes'});
      const otherItem=await mutate(db,b,rb.id,'items',{categoryId:otherCategory.id,name:'Other dish',basePrice:'1.00'});
      await assert.rejects(quoteOrder(db,live.token,{items:[{itemId:otherItem.id,quantity:1}]}),e=>e.status===409);
      const updatedQuote=await quoteOrder(db,live.token,cart);
      const parallelKey=randomUUID();
      const parallel=await Promise.all([placeOrder(db,live.token,{...cart,requestKey:parallelKey,quoteVersion:updatedQuote.version}),placeOrder(db,live.token,{...cart,requestKey:parallelKey,quoteVersion:updatedQuote.version})]);
      assert.equal(parallel[0].reference,parallel[1].reference);
      assert.equal(await db.order.count({where:{restaurantId:ra.id,requestKey:parallelKey}}),1);
    });
    await t.test('table service is deduplicated and operations enforce tenant, branch and status permissions',async()=>{
      const live=await db.qrCode.findFirst({where:{tableId:tableA.id,revokedAt:null}});
      const input={type:'WAITER',requestKey:randomUUID()};
      const first=await requestService(db,live.token,input);
      const duplicate=await requestService(db,live.token,input);
      const activeDuplicate=await requestService(db,live.token,{...input,requestKey:randomUUID()});
      assert.equal(first.reference,duplicate.reference);assert.equal(first.reference,activeDuplicate.reference);
      await assert.rejects(requestService(db,live.token,{...input,type:'BILL'}),e=>e.status===409);
      const bill=await requestService(db,live.token,{type:'BILL',requestKey:randomUUID()});
      assert.equal(bill.type,'BILL');
      const secondTable=await mutate(db,a,ra.id,'tables',{name:'Other table',branchId:branchA2.id});
      await mutate(db,a,ra.id,'qr',{tableId:secondTable.id,action:'generate'});
      const otherQr=await db.qrCode.findFirst({where:{tableId:secondTable.id,revokedAt:null}});
      await requestService(db,otherQr.token,{type:'WATER',requestKey:randomUUID()});
      const waiterRole=await db.role.findFirst({where:{restaurantId:ra.id,name:'waiter'}});
      await db.membership.update({where:{restaurantId_userId:{restaurantId:ra.id,userId:staff.id}},data:{roleId:waiterRole.id,status:'ACTIVE'}});
      const scoped=await operations(db,staff,ra.id);
      assert.ok(scoped.requests.length>=2);assert.ok(scoped.requests.every(r=>r.branchId===branchA.id));
      await assert.rejects(operations(db,b,ra.id));
      const all=await operations(db,a,ra.id);
      assert.ok(all.requests.some(r=>r.branchId===branchA2.id));
      assert.equal(JSON.stringify(all).includes(first.reference),false,'private references are omitted from staff queues');
      const otherRequest=all.requests.find(r=>r.branchId===branchA2.id);
      await assert.rejects(updateOperation(db,staff,ra.id,{kind:'service',id:otherRequest.id,status:'ACKNOWLEDGED'}),e=>e.status===404);
      const ownRequest=scoped.requests.find(r=>r.type==='WAITER');
      await updateOperation(db,staff,ra.id,{kind:'service',id:ownRequest.id,status:'ACKNOWLEDGED'});
      assert.equal((await guestStatus(db,first.reference,'service')).status,'ACKNOWLEDGED');
      await updateOperation(db,staff,ra.id,{kind:'service',id:ownRequest.id,status:'RESOLVED'});
      await assert.rejects(updateOperation(db,staff,ra.id,{kind:'service',id:ownRequest.id,status:'OPEN'}),e=>e.status===409);
      const order=all.orders[0];
      await assert.rejects(updateOperation(db,staff,ra.id,{kind:'order',id:order.id,status:'COMPLETED'}),e=>e.status===409);
      for(const status of ['ACCEPTED','PREPARING','READY','SERVED','COMPLETED'])await updateOperation(db,staff,ra.id,{kind:'order',id:order.id,status});
      await assert.rejects(guestStatus(db,'A'.repeat(43),'order'),e=>e.status===404);
      await mutate(db,a,ra.id,'qr',{tableId:tableA.id,action:'revoke'});
      await assert.rejects(requestService(db,live.token,{type:'HELP',requestKey:randomUUID()}),e=>e.status===404);
      await assert.rejects(quoteOrder(db,live.token,{items:[{itemId:item.id,quantity:1}]}),e=>e.status===404);
      assert.equal((await guestStatus(db,first.reference,'service')).status,'RESOLVED');
    });
    await t.test('dietary classification and parent categories preserve menu scope and hidden-parent ordering rules',async()=>{
      const tenant=await onboard(db,a,{name:'Taxonomy test',slug:'taxonomy-test'});
      const menu=await db.menu.findFirst({where:{restaurantId:tenant.id}});
      const otherMenu=await mutate(db,a,tenant.id,'menus',{name:'Other menu'});
      const root=await mutate(db,a,tenant.id,'categories',{menuId:menu.id,name:'Traditional'});
      const child=await mutate(db,a,tenant.id,'categories',{menuId:menu.id,parentId:root.id,name:'Stews'});
      const dish=await mutate(db,a,tenant.id,'items',{categoryId:child.id,name:'Shiro',basePrice:'100.00',dietaryType:'VEGAN'});
      assert.equal((await db.menuItem.findUnique({where:{id:dish.id}})).dietaryType,'VEGAN');
      await assert.rejects(mutate(db,a,tenant.id,'categories',{menuId:menu.id,parentId:child.id,name:'Too deep'}),e=>e.status===400);
      await assert.rejects(mutate(db,a,tenant.id,'categories',{menuId:menu.id,parentId:root.id,name:'Self'},root.id),e=>e.status===400);
      await assert.rejects(mutate(db,a,tenant.id,'categories',{menuId:otherMenu.id,parentId:root.id,name:'Wrong menu'}),e=>e.status===404);
      await assert.rejects(mutate(db,a,tenant.id,'categories',{menuId:otherMenu.id,name:'Move parent'},root.id),e=>e.status===400);
      const foreign=await db.menuCategory.findFirst({where:{restaurantId:rb.id}});
      await assert.rejects(mutate(db,a,tenant.id,'categories',{menuId:menu.id,parentId:foreign.id,name:'Wrong tenant'}),e=>e.status===404);
      await assert.rejects(db.menuCategory.create({data:{restaurantId:tenant.id,menuId:otherMenu.id,parentId:root.id,name:'Invalid FK'}}));
      const root2=await mutate(db,a,tenant.id,'categories',{menuId:menu.id,name:'Other root'});
      await assert.rejects(mutate(db,a,tenant.id,'categories',{menuId:menu.id,parentId:root2.id,name:'Traditional'},root.id),e=>e.status===400);
      const root3=await mutate(db,a,tenant.id,'categories',{menuId:menu.id,name:'Third root'});
      const attempts=await Promise.allSettled([
        mutate(db,a,tenant.id,'categories',{menuId:menu.id,parentId:root3.id,name:'Other root'},root2.id),
        mutate(db,a,tenant.id,'categories',{menuId:menu.id,parentId:root2.id,name:'Third root'},root3.id),
      ]);
      assert.equal(attempts.filter(result=>result.status==='fulfilled').length,1,'concurrent writes cannot create a cycle');
      const branch=await mutate(db,a,tenant.id,'branches',{name:'Taxonomy branch'});
      const table=await mutate(db,a,tenant.id,'tables',{branchId:branch.id,name:'1'});
      await mutate(db,a,tenant.id,'qr',{tableId:table.id,action:'generate'});
      const qr=await db.qrCode.findFirst({where:{tableId:table.id,revokedAt:null}});
      assert.equal((await quoteOrder(db,qr.token,{items:[{itemId:dish.id,quantity:1}]})).subtotal,'100.00');
      const publicProfile=await publicRestaurant(db,'taxonomy-test');
      assert.equal(publicProfile.menus[0].categories.find(c=>c.id===child.id).parentId,root.id);
      assert.equal(publicProfile.menus[0].categories.find(c=>c.id===child.id).items[0].dietaryType,'VEGAN');
      await mutate(db,a,tenant.id,'categories',{menuId:menu.id,name:'Traditional',active:false},root.id);
      assert.ok(!(await publicRestaurant(db,'taxonomy-test')).menus[0].categories.some(c=>c.id===child.id));
      assert.ok(!(await resolveQr(db,qr.token)).menus[0].categories.some(c=>c.id===child.id));
      await assert.rejects(quoteOrder(db,qr.token,{items:[{itemId:dish.id,quantity:1}]}),e=>e.status===409);
    });
    await t.test('authentication persists sessions and rejects privilege injection and suspended users', async () => {
      const previousDb = globalThis.qrmenuDatabase;
      const previousAuth = globalThis.qrmenuAuth;
      globalThis.qrmenuDatabase = db;
      delete globalThis.qrmenuAuth;
      try {
        const base = process.env.BETTER_AUTH_URL;
        const response = await authentication().handler(new Request(`${base}/api/auth/sign-up/email`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', origin: base },
          body: JSON.stringify({ name: 'Auth test', email: 'auth@example.test', password: randomUUID() + randomUUID(), platformAdmin: true, status: 'SUSPENDED' }),
        }));
        assert.equal(response.status, 200, 'Email sign-up must succeed');
        const payload = await response.json();
        assert.equal(payload.user.platformAdmin, false);
        assert.equal(payload.user.status, 'ACTIVE');
        assert.equal('password' in payload.user, false);
        const cookie = response.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
        assert.ok(cookie.length > 20);
        const request = new Request(`${base}/api/restaurants`, { headers: { cookie } });
        const signedIn = await currentUser(request);
        assert.equal(signedIn.id, payload.user.id);
        await db.user.update({ where: { id: signedIn.id }, data: { status: 'SUSPENDED' } });
        await assert.rejects(currentUser(request), e => e.status === 403);
        await assert.rejects(currentUser(new Request(`${base}/api/restaurants`)), e => e.status === 401);
        assert.throws(() => sameOrigin(new Request(base, { headers: { origin: 'https://untrusted.example' } })), e => e.status === 403);
      } finally {
        globalThis.qrmenuDatabase = previousDb;
        globalThis.qrmenuAuth = previousAuth;
      }
    });
  } finally {
    if (db) await db.$disconnect();
    // The name is generated above, never supplied by an environment or user.
    assert.match(schema, /^qrmenu_test_[a-f0-9]{32}$/);
    await admin.query('SET search_path TO public');
    await admin.query(`DROP SCHEMA "${schema}" CASCADE`);
    await admin.end();
  }
});

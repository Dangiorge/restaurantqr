import {createHash,randomBytes} from 'node:crypto';
import {z} from 'zod';
import {HttpError} from '../../lib/http.mjs';
import {context} from '../identity/context.mjs';
import {visibleCategoryWhere} from '../menus/public.mjs';

const token=()=>randomBytes(32).toString('base64url');
const key=z.uuid();
const line=z.object({itemId:z.string().min(1).max(100),quantity:z.number().int().min(1).max(20)}).strict();
export const cartInput=z.object({items:z.array(line).min(1).max(30),notes:z.string().trim().max(500).default('')}).strict();
export const orderInput=cartInput.extend({requestKey:key,quoteVersion:z.string().regex(/^[a-f0-9]{64}$/)}).strict();
export const serviceInput=z.object({type:z.enum(['WAITER','BILL','WATER','CUTLERY','HELP']),requestKey:key}).strict();
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const expires=()=>new Date(Date.now()+7*86400000);
export const money=cents=>`${cents/100n}.${String(cents%100n).padStart(2,'0')}`;
const cents=amount=>{
  const value=String(amount);
  if(!/^\d+(\.\d{1,2})?$/.test(value))throw new HttpError(400,'Invalid menu price.');
  const [whole,fraction='']=value.split('.');
  return BigInt(whole)*100n+BigInt(fraction.padEnd(2,'0'));
};
export function calculateTotals(items,taxRate,serviceRate){
  const subtotal=items.reduce((sum,i)=>sum+cents(i.unitPrice)*BigInt(i.quantity),0n);
  if(subtotal>1000000000n)throw new HttpError(400,'This order is too large. Please speak to a staff member.');
  const taxAmount=(subtotal*cents(taxRate)+5000n)/10000n;
  const serviceAmount=(subtotal*cents(serviceRate)+5000n)/10000n;
  return {subtotal:money(subtotal),taxAmount:money(taxAmount),serviceAmount:money(serviceAmount),total:money(subtotal+taxAmount+serviceAmount)};
}
export async function tableContext(db,raw){
  if(typeof raw!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(raw))throw new HttpError(404,'This table QR is unavailable. Please ask a staff member.');
  const qr=await db.qrCode.findFirst({where:{token:raw,revokedAt:null,OR:[{expiresAt:null},{expiresAt:{gt:new Date()}}],table:{active:true,branch:{active:true,restaurant:{status:'ACTIVE'}}}},include:{table:{include:{branch:{include:{restaurant:{include:{settings:true}}}}}}}});
  if(!qr)throw new HttpError(404,'This table QR is unavailable. Please ask a staff member.');
  return qr;
}
async function quoteForTable(db,qr,data){
  if(new Set(data.items.map(i=>i.itemId)).size!==data.items.length)throw new HttpError(400,'Combine duplicate dishes before ordering.');
  const dishes=await db.menuItem.findMany({where:{restaurantId:qr.restaurantId,id:{in:data.items.map(i=>i.itemId)},active:true,available:true,category:{...visibleCategoryWhere,menu:{active:true,restaurantId:qr.restaurantId}}}});
  if(dishes.length!==data.items.length)throw new HttpError(409,'A dish is unavailable or has been removed. Refresh your menu and review your order.');
  const settings=qr.table.branch.restaurant.settings;
  if(!settings||settings.currency!=='ETB')throw new HttpError(409,'Ordering is unavailable at this restaurant. Please ask our team.');
  const items=data.items.map(i=>{
    const dish=dishes.find(d=>d.id===i.itemId);
    return {menuItemId:dish.id,name:dish.name,quantity:i.quantity,unitPrice:dish.basePrice.toFixed(2),lineTotal:money(cents(dish.basePrice)*BigInt(i.quantity))};
  });
  const version=hash({items,taxRate:settings.taxRate.toFixed(2),serviceChargeRate:settings.serviceChargeRate.toFixed(2)});
  return {items,version,currency:settings.currency,taxRate:settings.taxRate.toFixed(2),serviceChargeRate:settings.serviceChargeRate.toFixed(2),...calculateTotals(items,settings.taxRate,settings.serviceChargeRate)};
}
export async function quoteOrder(db,raw,input){
  const data=cartInput.parse(input);
  return db.$transaction(async tx=>quoteForTable(tx,await tableContext(tx,raw),data));
}
function orderReceipt(order){
  return {reference:order.publicToken,status:order.status,createdAt:order.createdAt,table:order.table?.name,currency:order.currency,subtotal:order.subtotal,taxAmount:order.taxAmount,serviceAmount:order.serviceAmount,total:order.total,items:order.items.map(i=>({name:i.name,quantity:i.quantity,unitPrice:i.unitPrice,lineTotal:i.lineTotal}))};
}
export async function placeOrder(db,raw,input){
  const data=orderInput.parse(input);
  const payloadHash=hash({items:[...data.items].sort((a,b)=>a.itemId.localeCompare(b.itemId)),notes:data.notes,quoteVersion:data.quoteVersion});
  return db.$transaction(async tx=>{
    const qr=await tableContext(tx,raw);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`guest-order:${qr.id}`},0))`;
    const existing=await tx.order.findUnique({where:{qrCodeId_requestKey:{qrCodeId:qr.id,requestKey:data.requestKey}},include:{items:true,table:{select:{name:true}}}});
    if(existing){if(existing.payloadHash!==payloadHash)throw new HttpError(409,'This submission reference was already used for a different order.');return orderReceipt(existing);}
    const count=await tx.order.count({where:{restaurantId:qr.restaurantId,tableId:qr.tableId,createdAt:{gte:new Date(Date.now()-3600000)}}});
    if(count>=20)throw new HttpError(429,'This table has reached its online order limit. Please call a waiter.');
    const quote=await quoteForTable(tx,qr,data);
    if(quote.version!==data.quoteVersion)throw new HttpError(409,'Menu prices changed. Review the updated totals before placing your order.');
    const {items,version:_version,...totals}=quote;
    const order=await tx.order.create({data:{restaurantId:qr.restaurantId,branchId:qr.table.branchId,tableId:qr.tableId,qrCodeId:qr.id,requestKey:data.requestKey,payloadHash,publicToken:token(),publicExpiresAt:expires(),notes:data.notes,...totals,items:{create:items}},include:{items:true,table:{select:{name:true}}}});
    await tx.auditLog.create({data:{restaurantId:qr.restaurantId,actorId:'guest',action:'order.placed',entityId:order.id,details:{tableId:qr.tableId,total:quote.total}}});
    return orderReceipt(order);
  });
}
const serviceReceipt=request=>({reference:request.publicToken,type:request.type,status:request.status,createdAt:request.createdAt});
export async function requestService(db,raw,input){
  const data=serviceInput.parse(input);
  return db.$transaction(async tx=>{
    const qr=await tableContext(tx,raw);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`guest-service:${qr.restaurantId}:${qr.tableId}`},0))`;
    const existing=await tx.serviceRequest.findUnique({where:{qrCodeId_requestKey:{qrCodeId:qr.id,requestKey:data.requestKey}}});
    if(existing){if(existing.type!==data.type)throw new HttpError(409,'This submission reference was already used.');return serviceReceipt(existing);}
    const open=await tx.serviceRequest.findFirst({where:{restaurantId:qr.restaurantId,tableId:qr.tableId,type:data.type,status:{in:['OPEN','ACKNOWLEDGED']},createdAt:{gte:new Date(Date.now()-600000)}}});
    if(open)return serviceReceipt(open);
    const count=await tx.serviceRequest.count({where:{restaurantId:qr.restaurantId,tableId:qr.tableId,createdAt:{gte:new Date(Date.now()-3600000)}}});
    if(count>=30)throw new HttpError(429,'Please wait for a staff member before sending more requests.');
    const request=await tx.serviceRequest.create({data:{restaurantId:qr.restaurantId,branchId:qr.table.branchId,tableId:qr.tableId,qrCodeId:qr.id,requestKey:data.requestKey,publicToken:token(),publicExpiresAt:expires(),type:data.type}});
    await tx.auditLog.create({data:{restaurantId:qr.restaurantId,actorId:'guest',action:'service.requested',entityId:request.id,details:{type:data.type,tableId:qr.tableId}}});
    return serviceReceipt(request);
  });
}
export async function guestStatus(db,reference,type){
  if(!/^[A-Za-z0-9_-]{43}$/.test(reference))throw new HttpError(404,'Reference unavailable.');
  const where={publicToken:reference,publicExpiresAt:{gt:new Date()}};
  if(type==='order'){
    const order=await db.order.findFirst({where,include:{items:true,table:{select:{name:true}}}});
    if(!order)throw new HttpError(404,'Order reference unavailable.');
    return orderReceipt(order);
  }
  const request=await db.serviceRequest.findFirst({where});
  if(!request)throw new HttpError(404,'Request reference unavailable.');
  return serviceReceipt(request);
}

const orderSelect={id:true,branchId:true,status:true,notes:true,total:true,currency:true,createdAt:true,table:{select:{name:true}},items:{select:{name:true,quantity:true,unitPrice:true,lineTotal:true}}};
const serviceSelect={id:true,branchId:true,type:true,status:true,createdAt:true,table:{select:{name:true}}};
export async function operations(db,user,restaurantId){
  const membership=await db.membership.findUnique({where:{restaurantId_userId:{restaurantId,userId:user.id}},include:{role:{include:{permissions:true}}}});
  const allowed=membership?.role.permissions.map(p=>p.permissionKey)||[];
  const permission=['orders.process','service.manage','kitchen.manage'].find(p=>allowed.includes(p));
  if(!permission)throw new HttpError(403,'Operations permission required.');
  const ctx=await context(db,user,restaurantId,permission);
  const can=p=>ctx.permissions.includes(p);
  const where={restaurantId,...(ctx.branchIds!==null?{branchId:{in:ctx.branchIds}}:{})};
  const since=new Date(Date.now()-86400000);
  const [orders,requests]=await Promise.all([
    can('orders.process')||can('kitchen.manage')?db.order.findMany({where:{...where,createdAt:{gte:since}},select:orderSelect,orderBy:{createdAt:'desc'},take:100}):[],
    can('service.manage')?db.serviceRequest.findMany({where:{...where,createdAt:{gte:since}},select:serviceSelect,orderBy:{createdAt:'desc'},take:100}):[],
  ]);
  return {orders,requests};
}
export const operationInput=z.object({kind:z.enum(['order','service']),id:z.string().min(1).max(100),status:z.string().max(30)}).strict();
export async function updateOperation(db,user,restaurantId,input){
  const data=operationInput.parse(input);
  return db.$transaction(async tx=>{
    const permission=data.kind==='service'?'service.manage':(['PREPARING','READY'].includes(data.status)?'kitchen.manage':'orders.process');
    let ctx;
    try{ctx=await context(tx,user,restaurantId,permission);}catch(error){if(permission!=='kitchen.manage')throw error;ctx=await context(tx,user,restaurantId,'orders.process');}
    const model=data.kind==='order'?'order':'serviceRequest';
    const existing=await tx[model].findFirst({where:{id:data.id,restaurantId,...(ctx.branchIds!==null?{branchId:{in:ctx.branchIds}}:{})}});
    if(!existing)throw new HttpError(404,'Record unavailable.');
    const transitions=data.kind==='order'?{PLACED:['ACCEPTED','CANCELLED'],ACCEPTED:['PREPARING','CANCELLED'],PREPARING:['READY','CANCELLED'],READY:['SERVED'],SERVED:['COMPLETED']}:{OPEN:['ACKNOWLEDGED','RESOLVED'],ACKNOWLEDGED:['RESOLVED']};
    if(!transitions[existing.status]?.includes(data.status))throw new HttpError(409,'That status change is not allowed. Refresh the queue.');
    const changed=await tx[model].updateMany({where:{id:data.id,restaurantId,status:existing.status},data:{status:data.status}});
    if(changed.count!==1)throw new HttpError(409,'Another staff member has updated this record.');
    await tx.auditLog.create({data:{restaurantId,actorId:user.id,action:`${data.kind}.status`,entityId:data.id,details:{from:existing.status,to:data.status}}});
    return {ok:true};
  });
}

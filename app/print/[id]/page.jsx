import {brandLogoUrl} from '@/lib/brand.mjs';
import { appOrigin } from '@/lib/app-origin.mjs';
import { Suspense } from 'react';
import Image from 'next/image';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { database } from '@/lib/db.mjs';
import { currentUser } from '@/lib/http.mjs';
import { context } from '@/modules/identity/context.mjs';
import PrintButton from '@/components/print-button';

export const metadata = { title: 'Print table QR', robots: { index: false, follow: false } };
async function PrintCard({ params, searchParams }) {
  const requestHeaders = await headers();
  let user;
  try { user = await currentUser(new Request(appOrigin(), { headers: requestHeaders })); } catch { redirect('/workspace'); }
  const { id } = await params;
  const { restaurantId } = await searchParams;
  if (typeof restaurantId !== 'string') notFound();
  const db = database();
  let ctx;
  try { ctx = await context(db, user, restaurantId, 'qr.manage'); } catch { notFound(); }
  const qr = await db.qrCode.findFirst({ where: { id, restaurantId, ...(ctx.branchIds !== null ? { table: { branchId: { in: ctx.branchIds } } } : {}), revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, include: { table: { include: { branch: { include: { restaurant: true } } } } } });
  if (!qr) notFound();
  const restaurant = qr.table.branch.restaurant;
  const url = `${appOrigin()}/q/${qr.token}`;
  const image = await QRCode.toDataURL(url, { width: 600, margin: 4, errorCorrectionLevel: 'M' });
  return <><PrintButton /><main className="qr-print branded-qr" style={{fontFamily:'Poppins, Arial, sans-serif','--qr-brand':/^#[a-fA-F0-9]{6}$/.test(restaurant.primaryColor)?restaurant.primaryColor:'#D42028'}}><div className="qr-brand-logo">{restaurant.logoUrl ? <Image className="restaurant-logo" src={brandLogoUrl(restaurant.logoUrl)} alt={restaurant.name} width={180} height={155} unoptimized /> : <h2 style={{color:'#171717'}}>{restaurant.name}</h2>}</div><h1>A good meal starts here.</h1><p>Scan to explore our menu.</p><div className="qr-white-panel"><Image className="qr-image" src={image} alt={`Menu QR code for table ${qr.table.name}`} width={300} height={300} unoptimized /></div><h2>Table {qr.table.name}</h2><p>{qr.table.branch.name} · {restaurant.name}</p></main></>;
}
export default function PrintPage(props) { return <Suspense fallback={<main className="loading">Preparing print card…</main>}><PrintCard {...props} /></Suspense>; }

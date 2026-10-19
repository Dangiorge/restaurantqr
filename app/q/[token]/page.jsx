import {Suspense} from 'react';
import {connection} from 'next/server';
import {database} from '@/lib/db.mjs';
import {resolveQr} from '@/modules/workspace/service.mjs';
import GuestMenu from '@/components/guest-menu';

export const metadata={title:'Restaurant menu',robots:{index:false,follow:false}};
async function Menu({params}){
  await connection();
  const {token}=await params;
  const data=await resolveQr(database(),token);
  if(!data)return <main className="unavailable"><h1>This menu link is unavailable.</h1><p>Please ask a staff member for a current QR code.</p></main>;
  const safe=JSON.parse(JSON.stringify(data));
  return <GuestMenu {...safe} token={token} romina={safe.restaurant.slug===(process.env.ROMINA_RESTAURANT_SLUG||'romina')||['/brand/romina-logo.png','/brand/romina-logo.svg'].includes(safe.restaurant.logoUrl)}/>;
}
export default function Page(props){return <Suspense fallback={<main className="loading">Opening menu…</main>}><Menu {...props}/></Suspense>;}

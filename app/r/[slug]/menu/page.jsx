import {Suspense} from 'react';
import {connection} from 'next/server';
import {notFound} from 'next/navigation';
import {database} from '@/lib/db.mjs';
import {publicRestaurant} from '@/modules/menus/public.mjs';
import GuestMenu from '@/components/guest-menu';

export const metadata={title:'Guest menu',description:'Explore our restaurant menu.'};
async function Menu({params}) {
  await connection();
  const {slug}=await params;
  const restaurant=await publicRestaurant(database(),slug);
  if(!restaurant)notFound();
  return <GuestMenu restaurant={JSON.parse(JSON.stringify(restaurant))} menus={JSON.parse(JSON.stringify(restaurant.menus))} romina={slug===(process.env.ROMINA_RESTAURANT_SLUG||'romina')}/>;
}
export default function Page(props){return <Suspense fallback={<main className="loading">Preparing your menu…</main>}><Menu {...props}/></Suspense>;}

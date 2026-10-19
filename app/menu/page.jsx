import {Suspense} from 'react';
import Link from 'next/link';
import {connection} from 'next/server';
import {database} from '@/lib/db.mjs';
import {publicRestaurant} from '@/modules/menus/public.mjs';
import GuestMenu from '@/components/guest-menu';

export const metadata={title:'Our Menu · Romina Restaurants',description:'Explore the Romina Restaurants menu and find your next favourite.'};
async function Menu(){
  await connection();
  const restaurant=await publicRestaurant(database(),process.env.ROMINA_RESTAURANT_SLUG||'romina');
  if(!restaurant)return <main className="unavailable"><h1>Our menu is being prepared.</h1><p>Please check back soon or ask our team for the current menu.</p><Link href="/">Back to Romina Restaurants</Link></main>;
  return <GuestMenu restaurant={JSON.parse(JSON.stringify(restaurant))} menus={JSON.parse(JSON.stringify(restaurant.menus))} romina/>;
}
export default function Page(){return <Suspense fallback={<main className="loading">Preparing your menu…</main>}><Menu/></Suspense>;}

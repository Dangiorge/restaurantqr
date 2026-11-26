import {Suspense} from 'react';
import Link from 'next/link';
import {cachedPublicSite} from '@/modules/menus/public-cache.mjs';
import GuestMenu from '@/components/guest-menu';

export const metadata={title:'Our Menu · Romina Restaurants',description:'Explore the Romina Restaurants menu and find your next favourite.',alternates:{canonical:'/menu'},openGraph:{type:'website',siteName:'Romina Restaurants',title:'Our Menu · Romina Restaurants',description:'Explore the Romina Restaurants menu and find your next favourite.',url:'/menu',images:[{url:'/og-romina.jpg',width:1200,height:630}]}};
async function Menu({searchParams}){
  const {restaurant}=await cachedPublicSite(process.env.ROMINA_RESTAURANT_SLUG||'romina');
  if(!restaurant)return <main className="unavailable"><h1>Our menu is being prepared.</h1><p>Please check back soon or ask our team for the current menu.</p><Link href="/">Back to Romina Restaurants</Link></main>;
  const query=await searchParams;
  const initialQuery={view:query?.view,category:query?.category,dish:query?.dish};
  return <GuestMenu key={JSON.stringify(initialQuery)} initialQuery={initialQuery} restaurant={restaurant} menus={restaurant.menus} romina/>;
}
export default function Page(props){return <Suspense fallback={<main className="loading">Preparing your menu…</main>}><Menu {...props}/></Suspense>;}

import {Suspense} from 'react';
import {connection} from 'next/server';
import {database} from '@/lib/db.mjs';
import {publicRestaurant} from '@/modules/menus/public.mjs';
import RestaurantWebsite from '@/components/restaurant-website';
import BrandIntro from '@/components/brand-intro';

export const metadata={title:'Romina Restaurants | Good Food. Great Company.',description:'Come hungry. Discover Romina food, 4 Killo stories, and Balderace catering for weddings, graduations, and events near the British Embassy.'};
async function Website(){
  await connection();
  const restaurant=await publicRestaurant(database(),process.env.ROMINA_RESTAURANT_SLUG||'romina');
  return <RestaurantWebsite restaurant={restaurant?JSON.parse(JSON.stringify(restaurant)):null}/>;
}
export default function Home(){return <><BrandIntro/><Suspense fallback={<RestaurantWebsite restaurant={null} staticPreview/>}><Website/></Suspense></>;}

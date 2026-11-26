import {cachedPublicSite} from '@/modules/menus/public-cache.mjs';
import {restaurantStructuredData,jsonLd} from '@/modules/menus/structured-data.mjs';
import {appOrigin} from '@/lib/app-origin.mjs';
import RestaurantWebsite from '@/components/restaurant-website';
import BrandIntro from '@/components/brand-intro';

const title='Romina Restaurants | Good Food. Great Company.';
const description='Come hungry. Discover Romina food, 4 Killo stories, and Balderace catering for weddings, graduations, and events near the British Embassy.';

export const metadata={
  title,
  description,
  alternates:{canonical:'/'},
  openGraph:{type:'website',siteName:'Romina Restaurants',title,description,url:'/',images:[{url:'/og-romina.jpg',width:1200,height:630,alt:'A plated steak with wine and bread on a Romina table'}]},
  twitter:{card:'summary_large_image',title,description,images:['/og-romina.jpg']},
};

export default async function Home(){
  const {restaurant,now}=await cachedPublicSite(process.env.ROMINA_RESTAURANT_SLUG||'romina');
  const structured=restaurantStructuredData(restaurant,appOrigin());
  return <>
    {structured&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(structured)}}/>}
    <BrandIntro/>
    <RestaurantWebsite restaurant={restaurant} now={now}/>
  </>;
}

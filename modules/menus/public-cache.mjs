import {cacheLife,cacheTag} from 'next/cache';
import {database} from '../../lib/db.mjs';
import {publicRestaurant} from './public.mjs';

// Admin writes call revalidateTag(PUBLIC_SITE_TAG) so edits appear on the next visit.
export const PUBLIC_SITE_TAG='public-site';

// The public site changes rarely, so it is served from cache instead of querying the
// database on every visit. The hourly refresh keeps scheduled events and backgrounds current.
export async function cachedPublicSite(slug){
  'use cache';
  cacheLife('hours');
  cacheTag(PUBLIC_SITE_TAG);
  const restaurant=await publicRestaurant(database(),slug);
  return {restaurant:restaurant?JSON.parse(JSON.stringify(restaurant)):null,now:Date.now()};
}

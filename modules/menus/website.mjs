import {guestDiscovery} from './discovery.mjs';

export function websiteContent(restaurant,now=Date.now()){
  const categories=(restaurant?.menus||[]).flatMap(menu=>menu.categories);
  const dishes=categories.flatMap(category=>category.items.map(item=>({...item,categoryId:category.id,categoryName:category.name})));
  const discovery=guestDiscovery(restaurant?.settings?.guestContent,dishes,now);
  const recommended=new Set(discovery.recommendations.map(item=>item.id));
  const featured=[...discovery.recommendations,...dishes.filter(item=>item.available&&!recommended.has(item.id))].slice(0,6);
  return {now,featured,events:discovery.events,hero:discovery.heroUrl||featured.find(item=>item.photoUrl)?.photoUrl||'/brand/romina-kitchen.webp',categories:categories.filter(category=>!category.parentId).map(category=>{
    const items=[...category.items,...categories.filter(child=>child.parentId===category.id).flatMap(child=>child.items)];
    return {...category,count:items.length,photo:items.find(item=>item.available&&item.photoUrl)?.photoUrl||items.find(item=>item.photoUrl)?.photoUrl||''};
  })};
}

export function menuDestination(menus,query={}){
  const categories=menus.flatMap(menu=>menu.categories);
  const selected=typeof query?.category==='string'?categories.find(category=>category.id===query.category):null;
  const dish=typeof query?.dish==='string'?categories.flatMap(category=>category.items.map(item=>({...item,categoryName:category.name,categoryId:category.id}))).find(item=>item.id===query.dish):null;
  return {screen:dish||selected?'items':query?.view==='menu'?'menu':'welcome',category:dish?.categoryId||selected?.id||'all',dish:dish||null};
}

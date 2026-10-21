const destinations=[
  {id:'ethiopia',place:'Ethiopia',name:'Ethiopian cuisine',line:'A taste of home.',description:'Rich spices. Injera to share. Food that brings us together.',coordinates:'9.03° N · 38.75° E',match:/ethiop|ethip|traditional|habesha|abyssin|ኢትዮጵ|የሀገር|አገር/i},
  {id:'europe',place:'Europe',name:'European cuisine',line:'Comfort, beautifully served.',description:'Familiar favourites. Beautiful details. One more forkful.',coordinates:'49.00° N · 12.00° E',match:/europ|italian|french|mediterranean|continental/i},
  {id:'asia',place:'Asia',name:'Asian cuisine',line:'A little more adventure.',description:'Bright flavours. A new favourite. Something worth discovering.',coordinates:'31.00° N · 95.00° E',match:/asian?|chinese|indian|thai|japanese|korean|vietnamese/i},
];

// Resolve cuisine from category ancestry, never by guessing a dish's origin.
export function cuisineJourney(restaurant){
  const categories=(restaurant?.menus||[]).filter(menu=>menu.active!==false).flatMap(menu=>menu.categories||[]);
  const byId=new Map(categories.map(category=>[category.id,category]));
  const stops=destinations.map(({match,...destination})=>({...destination,categoryId:null,dishes:[],count:0}));
  const seen=new Set();
  for(const category of categories){
    const ancestry=[];const visited=new Set();let cursor=category;
    while(cursor&&!visited.has(cursor.id)){
      visited.add(cursor.id);ancestry.push(cursor);cursor=byId.get(cursor.parentId);
    }
    if(ancestry.some(ancestor=>ancestor.active===false))continue;
    let index=-1,matched;
    for(const ancestor of ancestry){
      index=destinations.findIndex(destination=>destination.match.test(ancestor.name||''));
      if(index>=0){matched=ancestor;break;}
    }
    if(index<0)continue;
    const stop=stops[index];
    stop.categoryId??=matched.id;
    for(const item of category.items||[]){
      if(!item.available||item.active===false||seen.has(item.id))continue;
      seen.add(item.id);stop.count++;
      stop.dishes.push({id:item.id,name:item.name,photoUrl:item.photoUrl||'',basePrice:String(item.basePrice),dietaryType:item.dietaryType,categoryName:category.name});
    }
  }
  // Lead with photographs, while keeping image-less dishes available on the menu.
  return stops.map(stop=>({...stop,dishes:[...stop.dishes.filter(dish=>dish.photoUrl),...stop.dishes.filter(dish=>!dish.photoUrl)].slice(0,3)}));
}

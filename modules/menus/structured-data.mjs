// schema.org Restaurant data so search engines and maps can show address, phone,
// branches and opening hours. Built only from what is stored for the restaurant.
const days={mon:'Monday',tue:'Tuesday',wed:'Wednesday',thu:'Thursday',fri:'Friday',sat:'Saturday',sun:'Sunday'};

function openingHours(hours={}){
  return Object.entries(hours).filter(([day,value])=>days[day]&&typeof value==='string'&&value.includes('-')).map(([day,value])=>{
    const [opens,closes]=value.split('-');
    return {'@type':'OpeningHoursSpecification',dayOfWeek:`https://schema.org/${days[day]}`,opens,closes};
  });
}

function address(text){
  return text?{'@type':'PostalAddress',streetAddress:text,addressLocality:'Addis Ababa',addressCountry:'ET'}:undefined;
}

export function restaurantStructuredData(restaurant,origin){
  if(!restaurant)return null;
  const cuisines=[...new Set((restaurant.menus||[]).flatMap(menu=>menu.categories||[]).filter(category=>!category.parentId).map(category=>category.name))];
  const branches=(restaurant.branches||[]).map(branch=>({
    '@type':'Restaurant',
    name:branch.name.toLowerCase().includes(restaurant.name.split(' ')[0].toLowerCase())?branch.name:`${restaurant.name} ${branch.name}`,
    address:address(branch.address),
    telephone:branch.phone||undefined,
    openingHoursSpecification:openingHours(branch.openingHours),
  }));
  return {
    '@context':'https://schema.org',
    '@type':'Restaurant',
    name:restaurant.name,
    description:restaurant.description||undefined,
    url:`${origin}/`,
    image:`${origin}/og-romina.jpg`,
    logo:`${origin}/brand/romina-logo.svg`,
    telephone:restaurant.phone||undefined,
    address:address(restaurant.address),
    foundingDate:'1973',
    servesCuisine:cuisines.length?cuisines:undefined,
    hasMenu:`${origin}/menu`,
    acceptsReservations:true,
    department:branches.length?branches:undefined,
  };
}

// Serialized for a <script> tag: escaping "<" keeps stored text from closing the tag.
export function jsonLd(data){
  return JSON.stringify(data).replace(/</g,'\\u003c');
}

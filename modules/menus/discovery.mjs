export function guestDiscovery(content={},dishes=[],now=Date.now()){
  const available=dishes.filter(item=>item.available);
  const recommendations=(content?.recommendedItemIds||[]).map(id=>available.find(item=>item.id===id)).filter(Boolean);
  const events=(content?.events||[]).filter(event=>event.active&&event.posterUrl&&(!event.startsAt||Date.parse(event.startsAt)<=now)&&(!event.endsAt||Date.parse(event.endsAt)>=now));
  return {heroUrl:content?.heroUrl||'',recommendations,slides:recommendations.length?recommendations:available.slice(0,6),events};
}

export function orderInstructions(lines,dishes,notes,itemNotes){
  return [notes.trim(),...lines.filter(line=>itemNotes[line.itemId]?.trim()).map(line=>`${dishes.find(dish=>dish.id===line.itemId)?.name}: ${itemNotes[line.itemId].trim()}`)].filter(Boolean).join('\n');
}

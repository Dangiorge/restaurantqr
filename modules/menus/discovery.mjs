export function guestDiscovery(content={},dishes=[],now=Date.now()){
  const available=dishes.filter(item=>item.available);
  const recommendations=(content?.recommendedItemIds||[]).map(id=>available.find(item=>item.id===id)).filter(Boolean);
  const events=(content?.events||[]).filter(event=>event.active&&event.posterUrl&&(!event.startsAt||Date.parse(event.startsAt)<=now)&&(!event.endsAt||Date.parse(event.endsAt)>=now));
  const eventIds=new Set(events.map(event=>event.id));
  const backgrounds=(content?.backgrounds||[]).filter(image=>image.active&&image.url&&(!image.startsAt||Date.parse(image.startsAt)<=now)&&(!image.endsAt||Date.parse(image.endsAt)>now)&&(!image.eventId||eventIds.has(image.eventId)))
    .sort((a,b)=>(b.priority||0)-(a.priority||0)||Number(Boolean(b.eventId))-Number(Boolean(a.eventId))||(Date.parse(b.startsAt)||0)-(Date.parse(a.startsAt)||0));
  return {heroUrl:backgrounds[0]?.url||content?.heroUrl||'',backgroundId:backgrounds[0]?.id||null,recommendations,slides:recommendations.length?recommendations:available.slice(0,6),events};
}

export function nextDiscoveryChange(content={},now=Date.now()){
  const dates=[...(content?.backgrounds||[]),...(content?.events||[])].flatMap(entry=>[Date.parse(entry.startsAt),Date.parse(entry.endsAt)]).filter(date=>date>now);
  return Math.max(50,Math.min(30000,...dates.map(date=>date-now+1)));
}

export function orderInstructions(lines,dishes,notes,itemNotes){
  return [notes.trim(),...lines.filter(line=>itemNotes[line.itemId]?.trim()).map(line=>`${dishes.find(dish=>dish.id===line.itemId)?.name}: ${itemNotes[line.itemId].trim()}`)].filter(Boolean).join('\n');
}

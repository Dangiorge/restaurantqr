export function branchOpenStatus(openingHours,timezone,now=Date.now()){
  if(!openingHours||!Object.keys(openingHours).length)return null;
  let parts;
  try{parts=new Intl.DateTimeFormat('en-GB',{timeZone:timezone,weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(now);}
  catch{return null;}
  const minutesOf=value=>{const [h,m]=value.split(':').map(Number);return h*60+m;};
  const weekdayShort=parts.find(p=>p.type==='weekday')?.value?.toLowerCase().slice(0,3);
  const map={sun:'sun',mon:'mon',tue:'tue',wed:'wed',thu:'thu',fri:'fri',sat:'sat'};
  const key=map[weekdayShort];
  const hour=Number(parts.find(p=>p.type==='hour')?.value);
  const minute=Number(parts.find(p=>p.type==='minute')?.value);
  if(!key)return null;
  const today=openingHours[key];
  const nowMinutes=hour*60+minute;
  if(!today||today==='closed')return{open:false};
  const [start,end]=today.split('-');
  const startMinutes=minutesOf(start),endMinutes=minutesOf(end);
  const open=endMinutes>startMinutes?nowMinutes>=startMinutes&&nowMinutes<endMinutes:nowMinutes>=startMinutes||nowMinutes<endMinutes;
  return{open,opensAt:start,closesAt:end};
}

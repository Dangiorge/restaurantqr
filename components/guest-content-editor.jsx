"use client";

import {useState} from 'react';
import UploadField from './upload-field';

export default function GuestContentEditor({restaurantId,initial={},items,save}){
  const [events,setEvents]=useState(initial.events||[]);
  const [busy,setBusy]=useState(false);
  const [uploads,setUploads]=useState({});
  const [message,setMessage]=useState('');
  const uploading=Object.values(uploads).some(Boolean);
  const watchUpload=key=>value=>setUploads(previous=>({...previous,[key]:value}));
  async function submit(event){
    event.preventDefault();setBusy(true);setMessage('');
    try{
      const form=new FormData(event.currentTarget);
      await save({heroUrl:String(form.get('heroUrl')||''),recommendedItemIds:form.getAll('recommendedItemIds'),events:events.map(entry=>({...entry,posterUrl:String(form.get(`poster:${entry.id}`)||'')}))});
      setMessage('Guest experience saved.');
    }catch(error){setMessage(error.message);}finally{setBusy(false);}
  }
  function update(id,key,value){setEvents(previous=>previous.map(entry=>entry.id===id?{...entry,[key]:value}:entry));}
  return <section className="panel guest-content-editor"><h2>Guest welcome & discovery</h2><p className="small muted">Choose daily recommendations and publish event posters. Events appear only while published and within their optional schedule.</p><form onSubmit={submit}>
    <div className="form-grid"><UploadField name="heroUrl" label="Welcome background" initialValue={initial.heroUrl||''} restaurantId={restaurantId} kind="dish" onBusy={watchUpload('hero')}/><label className="field">Daily recommendations<select name="recommendedItemIds" multiple defaultValue={initial.recommendedItemIds||[]} size={Math.min(6,Math.max(3,items.length))}>{items.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select><small className="muted">Choose up to 12 dishes. Hold Ctrl or Command to select several. Hidden or unavailable dishes are skipped.</small></label></div>
    <div className="section-heading"><h3>Events</h3><button type="button" className="secondary" disabled={events.length>=10} onClick={()=>setEvents(previous=>[...previous,{id:crypto.randomUUID(),title:'',description:'',posterUrl:'',active:true,startsAt:'',endsAt:''}])}>+ Add event</button></div>
    {events.map(entry=><fieldset className="guest-event-editor" key={entry.id}><legend>{entry.title||'New event'}</legend><div className="form-grid"><label className="field">Event title<input value={entry.title} required maxLength={120} onChange={event=>update(entry.id,'title',event.target.value)}/></label><label className="check"><input type="checkbox" checked={entry.active} onChange={event=>update(entry.id,'active',event.target.checked)}/>Published</label><label className="field">Event details<textarea value={entry.description} maxLength={2000} onChange={event=>update(entry.id,'description',event.target.value)}/></label><UploadField name={`poster:${entry.id}`} label="Event poster" initialValue={entry.posterUrl} restaurantId={restaurantId} kind="dish" onBusy={watchUpload(entry.id)}/>{[['startsAt','Show from'],['endsAt','Hide after']].map(([key,label])=><label className="field" key={key}>{label} (optional)<input type="datetime-local" value={entry[key]?new Date(new Date(entry[key]).getTime()-new Date(entry[key]).getTimezoneOffset()*60000).toISOString().slice(0,16):''} onChange={event=>update(entry.id,key,event.target.value?new Date(event.target.value).toISOString():'')}/><small className="muted">Times use your device’s local timezone.</small></label>)}</div><button type="button" className="text-button danger" onClick={()=>{setEvents(previous=>previous.filter(event=>event.id!==entry.id));setUploads(previous=>({...previous,[entry.id]:false}));}}>Remove event</button></fieldset>)}
    {message&&<p role="status">{message}</p>}<div className="form-actions"><button disabled={busy||uploading}>{busy?'Saving…':'Save guest experience'}</button></div>
  </form></section>;
}

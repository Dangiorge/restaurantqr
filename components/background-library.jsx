"use client";

import {useState} from 'react';
import Image from 'next/image';

export function localDateTime(value){
  if(!value)return '';
  const date=new Date(value);
  return Number.isNaN(date.getTime())?'':new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,16);
}

export default function BackgroundLibrary({restaurantId,backgrounds,setBackgrounds,events,onBusy}){
  const [progress,setProgress]=useState('');
  const [error,setError]=useState('');
  const busy=Boolean(progress);
  function update(id,key,value){setBackgrounds(previous=>previous.map(image=>image.id===id?{...image,[key]:value}:image));}
  async function upload(event){
    const input=event.target;
    const files=Array.from(input.files||[]);
    if(!files.length)return;
    setError('');
    if(backgrounds.length+files.length>20){setError('Keep up to 20 background images in this library.');input.value='';return;}
    onBusy(true);
    const failures=[];
    try{
      for(let index=0;index<files.length;index++){
        const file=files[index];setProgress(`Uploading ${index+1} of ${files.length}…`);
        try{
          if(file.size>12*1024*1024)throw new Error(`${file.name}: choose an image under 12 MB.`);
          const form=new FormData();form.set('file',file);
          const response=await fetch(`/api/workspace/${restaurantId}/uploads?kind=dish`,{method:'POST',body:form});
          const result=await response.json();
          if(!response.ok)throw new Error(result.error||`Unable to upload ${file.name}.`);
          const image={id:crypto.randomUUID(),label:file.name.replace(/\.[^.]+$/,'').slice(0,120)||'Background',url:result.url,active:true,startsAt:'',endsAt:'',eventId:null,priority:0};
          setBackgrounds(previous=>[...previous,image]);
        }catch(failure){failures.push(failure.message);}
      }
      if(failures.length)setError(failures.join(' '));
    }finally{setProgress('');onBusy(false);input.value='';}
  }
  return <section className="background-library" aria-label="Scheduled welcome backgrounds"><div className="section-heading"><div><h3>Welcome background library</h3><p className="small muted">Upload several images together. The highest-priority eligible image is shown; event-linked images win ties, then the latest start time. Use your device’s local time for schedules.</p></div></div>
    <label className="background-bulk-upload">{progress||'Upload background images'}<input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy||backgrounds.length>=20} onChange={upload} aria-label="Upload background images"/><small>JPG, PNG or WebP · 12 MB per image · up to 20 images. Save to publish.</small></label>
    {error&&<p className="error" role="alert">{error}</p>}{progress&&<p role="status">{progress}</p>}
    <div className="background-library-grid">{backgrounds.map(image=><fieldset className="background-card" key={image.id}><legend>{image.label||'Background'}</legend><Image src={image.url} alt={image.label} width={600} height={380} unoptimized/><div className="background-card-fields"><label className="field">Background name<input value={image.label} maxLength={120} required onChange={event=>update(image.id,'label',event.target.value)}/></label><label className="check"><input type="checkbox" checked={image.active} onChange={event=>update(image.id,'active',event.target.checked)}/>Enabled</label><label className="field">Priority<input aria-label="Priority" type="number" min={0} max={100} value={image.priority||0} onChange={event=>update(image.id,'priority',Number(event.target.value))}/><small className="muted">Higher numbers take precedence.</small></label><label className="field">Linked event<select aria-label={`Linked event for ${image.label}`} value={image.eventId||''} onChange={event=>update(image.id,'eventId',event.target.value||null)}><option value="">No event link</option>{events.map(entry=><option key={entry.id} value={entry.id}>{entry.title||'Untitled event'}</option>)}</select><small className="muted">Appears only while the linked event is published and in its display schedule.</small></label>{[['startsAt','Show from'],['endsAt','Hide after']].map(([key,label])=><label className="field" key={key}>{label}<input type="datetime-local" aria-label={`${label} for ${image.label}`} value={localDateTime(image[key])} onChange={event=>update(image.id,key,event.target.value?new Date(event.target.value).toISOString():'')}/></label>)}<button type="button" className="text-button danger" disabled={busy} onClick={()=>setBackgrounds(previous=>previous.filter(entry=>entry.id!==image.id))}>Remove background</button></div></fieldset>)}</div>
    {!backgrounds.length&&<p className="small muted">Your fallback background is used until scheduled images are added.</p>}
  </section>;
}

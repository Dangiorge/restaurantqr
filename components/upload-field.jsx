"use client";

import {useState} from 'react';
import Image from 'next/image';

export default function UploadField({name,label,initialValue='',restaurantId,kind,onBusy,onChange}) {
  const [url,setUrl]=useState(initialValue);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [warning,setWarning]=useState('');
  async function upload(event) {
    const file=event.target.files?.[0];
    if(!file) return;
    if(file.size>12*1024*1024){setError('Choose a file smaller than 12 MB.');return;}
    setBusy(true);onBusy(true);setError('');setWarning('');
    try {
      const form=new FormData();form.set('file',file);
      const response=await fetch(`/api/workspace/${restaurantId}/uploads?kind=${kind}`,{method:'POST',body:form});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error || 'Upload failed.');
      setUrl(result.url);
      onChange?.(result.url);
      setWarning(result.warning||'');
    }catch(e){setError(e.message);}finally{setBusy(false);onBusy(false);event.target.value='';}
  }
  return <div className="upload-field"><span className="field-label">{label}</span>{url && <div className="upload-preview">{kind !== 'menu' && <Image src={url} width={160} height={110} alt={`${label} preview`} unoptimized />}<a href={url} target="_blank" rel="noreferrer">View uploaded {kind === 'menu' ? 'menu' : 'image'} ↗</a><button className="text-button danger" type="button" onClick={()=>{setUrl('');onChange?.('');}}>Remove from form</button></div>}<label className="upload-picker">{busy?'Uploading…':url?'Replace file':'Choose a file to upload'}<input type="file" accept={kind==='menu'?'image/jpeg,image/png,image/webp,application/pdf':'image/jpeg,image/png,image/webp'} onChange={upload} disabled={busy} aria-label={`Upload ${label.toLowerCase()}`} /></label><input type="hidden" name={name} value={url} /><small className="muted">JPG, PNG, WebP{kind==='menu'?' or PDF':''} · up to 12 MB. Save changes to publish.</small>{warning&&<p className="upload-warning" role="status">{warning}</p>}{error&&<p className="error" role="alert">{error}</p>}</div>;
}

"use client";

import '@/app/catering-form.css';
import {useEffect,useRef,useState} from 'react';
import MenuIcon from './menu-icons';

async function submit(data){
  const response=await fetch('/api/catering',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
  const result=await response.json();
  if(!response.ok)throw new Error(result.error||'Please try again.');
  return result;
}

export default function CateringForm({restaurantSlug,label='Plan your catering'}){
  const [open,setOpen]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [sent,setSent]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{
    if(!open)return;
    const previous=document.activeElement;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    ref.current?.focus();
    function keydown(event){if(event.key==='Escape')setOpen(false);}
    document.addEventListener('keydown',keydown);
    return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',keydown);previous?.focus?.();};
  },[open]);
  async function onSubmit(event){
    event.preventDefault();setBusy(true);setError('');
    try{
      const form=new FormData(event.currentTarget);
      await submit({
        restaurantSlug,
        name:String(form.get('name')||''),
        email:String(form.get('email')||''),
        phone:String(form.get('phone')||''),
        eventDate:String(form.get('eventDate')||''),
        guestCount:Number(form.get('guestCount')||0),
        message:String(form.get('message')||''),
      });
      setSent(true);
    }catch(e){setError(e.message);}finally{setBusy(false);}
  }
  return <>
    <button type="button" className="rs-button" onClick={()=>{setOpen(true);setSent(false);setError('');}}>{label}<MenuIcon name="arrow" size={17}/></button>
    {open&&<div className="rs-catering-overlay" onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
      <section className="rs-catering-modal" role="dialog" aria-modal="true" aria-labelledby="catering-form-title" tabIndex={-1} ref={ref}>
        <button type="button" className="rs-catering-close" onClick={()=>setOpen(false)} aria-label="Close">
          <MenuIcon name="close"/>
        </button>
        {sent
          ? <div className="rs-catering-sent"><span className="rs-confirm-icon"><MenuIcon name="check" size={28}/></span><h3>Thank you.</h3><p>We’ve received your catering inquiry and our team will reach out shortly.</p><button type="button" className="rs-button" onClick={()=>setOpen(false)}>Close</button></div>
          : <form onSubmit={onSubmit}>
            <span className="rs-eyebrow">BALDERACE · NEAR THE BRITISH EMBASSY</span>
            <h3 id="catering-form-title">Plan your catering</h3>
            <p className="rs-catering-lead">Tell us a little about your event and we’ll be in touch.</p>
            <label className="rs-catering-field">Your name<input name="name" required maxLength={120}/></label>
            <label className="rs-catering-field">Email<input name="email" type="email" required maxLength={200}/></label>
            <label className="rs-catering-field">Phone (optional)<input name="phone" type="tel" maxLength={40}/></label>
            <div className="rs-catering-row">
              <label className="rs-catering-field">Event date<input name="eventDate" type="date"/></label>
              <label className="rs-catering-field">Guests<input name="guestCount" type="number" min="0" step="1"/></label>
            </div>
            <label className="rs-catering-field">Tell us about your event<textarea name="message" rows={4} maxLength={2000}/></label>
            {error&&<p className="rs-catering-error" role="alert">{error}</p>}
            <button className="rs-button rs-catering-submit" disabled={busy}>{busy?'Sending…':'Send inquiry'}<MenuIcon name="arrow" size={17}/></button>
          </form>}
      </section>
    </div>}
  </>;
}

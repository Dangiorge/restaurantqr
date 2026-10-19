"use client";

import {useEffect,useId,useRef,useState} from 'react';
import MenuIcon from './menu-icons';

export default function GuestActions({count,total,busy,menu,cart,call,help}){
  const [open,setOpen]=useState(false);
  const root=useRef(null);
  const toggle=useRef(null);
  const panelId=useId();
  useEffect(()=>{
    if(!open)return;
    const frame=requestAnimationFrame(()=>{
      const navigation=root.current?.querySelector('nav');
      if(navigation)navigation.scrollLeft=0;
      navigation?.querySelector('button')?.focus({preventScroll:true});
    });
    function outside(event){if(!root.current?.contains(event.target))setOpen(false);}
    function escape(event){if(event.key==='Escape'){setOpen(false);toggle.current?.focus();}}
    document.addEventListener('pointerdown',outside);
    document.addEventListener('keydown',escape);
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[open]);
  function act(callback){setOpen(false);callback();}
  const actions=[['menu','Menu',menu],['cart','My order',cart],['bell','Call waiter',()=>call('WAITER')],['bill','Ask for bill',()=>call('BILL')],['water','Drinking water',()=>call('WATER')],['help','More help',help]];
  return <>
    {count>0&&!open&&<button className="rg-floating-cart" onClick={cart}><span>{count}</span><span>View your order<small>{total} ETB</small></span><MenuIcon name="arrow" size={18}/></button>}
    <div className={`rg-actions ${open?'is-open':''}`} ref={root} onBlur={event=>{if(event.relatedTarget&&!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}>
      <div className="rg-actions-reveal"><nav id={panelId} className="rg-actions-panel" aria-label="Table actions" aria-hidden={!open} inert={!open}>{actions.map(([icon,label,callback])=><button key={label} disabled={busy&&['Call waiter','Ask for bill','Drinking water'].includes(label)} onClick={()=>act(callback)}><span className="rg-action-icon"><MenuIcon name={icon} size={21}/>{icon==='cart'&&count>0&&<i>{count}</i>}</span><span>{label}</span></button>)}</nav></div>
      <button ref={toggle} className="rg-more-toggle" aria-label="More" aria-expanded={open} aria-controls={panelId} onClick={()=>setOpen(value=>!value)}><span className="rg-more-symbol"><MenuIcon name={open?'close':'more'} size={23}/></span><span>More</span></button>
    </div>
  </>;
}

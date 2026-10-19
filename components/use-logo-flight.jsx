"use client";

import {useEffect,useRef} from 'react';
import {flushSync} from 'react-dom';

export default function useLogoFlight(){
  const active=useRef(null);
  function finish(flight){
    if(!flight)return;
    flight.clone.remove();flight.target.style.visibility='';
    if(active.current===flight)active.current=null;
  }
  useEffect(()=>()=>{const flight=active.current;if(flight){flight.animation.cancel();flight.clone.remove();flight.target.style.visibility='';active.current=null;}},[]);
  return (source,change,getTarget)=>{
    if(active.current){active.current.animation.cancel();finish(active.current);}
    const motion=source&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const rect=motion?source.getBoundingClientRect():null;
    const clone=rect?source.cloneNode(true):null;
    if(clone){
      clone.removeAttribute('id');clone.setAttribute('aria-hidden','true');clone.alt='';
      Object.assign(clone.style,{position:'fixed',left:`${rect.left}px`,top:`${rect.top}px`,width:`${rect.width}px`,height:`${rect.height}px`,margin:'0',zIndex:'1001',pointerEvents:'none',transformOrigin:'top left',objectFit:'contain',animation:'none',filter:getComputedStyle(source).filter});
      clone.className='rg-logo-flight';document.body.appendChild(clone);
    }
    flushSync(change);
    const target=getTarget();
    if(!clone||!target||!rect.width||!clone.animate){clone?.remove();return;}
    const destination=target.getBoundingClientRect();target.style.visibility='hidden';
    const animation=clone.animate([{transform:'translate(0,0) scale(1)'},{transform:`translate(${destination.left-rect.left}px,${destination.top-rect.top}px) scale(${destination.width/rect.width})`}],{duration:650,easing:'cubic-bezier(.25,.8,.25,1)',fill:'forwards'});
    const flight={clone,target,animation};active.current=flight;
    animation.finished.then(()=>finish(flight),()=>finish(flight));
  };
}

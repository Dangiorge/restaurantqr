"use client";

import Image from 'next/image';
import {useEffect,useRef} from 'react';

const introSeenKey='romina-brand-intro-v2';

export default function BrandIntro(){
  const ref=useRef(null);
  const playing=useRef(false);
  useEffect(()=>{
    const element=ref.current;
    const root=document.documentElement;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    if(preference.matches||window.scrollY>80)return;
    try{
      if(sessionStorage.getItem(introSeenKey)&&!playing.current)return;
      sessionStorage.setItem(introSeenKey,'seen');
    }catch{/* A disabled storage API must not prevent opening the menu. */}
    playing.current=true;
    element.dataset.play='true';
    root.dataset.rominaEntry='opening';
    const reveal=setTimeout(()=>{root.dataset.rominaEntry='revealing';},1150);
    function finish(){
      delete element.dataset.play;
      delete root.dataset.rominaEntry;
    }
    const timeout=setTimeout(finish,2350);
    // Interaction always takes priority over the entrance.
    function skip(){clearTimeout(reveal);clearTimeout(timeout);finish();}
    window.addEventListener('pointerdown',skip,{once:true});
    window.addEventListener('keydown',skip,{once:true});
    window.addEventListener('wheel',skip,{once:true,passive:true});
    window.addEventListener('touchmove',skip,{once:true,passive:true});
    preference.addEventListener('change',skip);
    return()=>{
      skip();
      window.removeEventListener('pointerdown',skip);
      window.removeEventListener('keydown',skip);
      window.removeEventListener('wheel',skip);
      window.removeEventListener('touchmove',skip);
      preference.removeEventListener('change',skip);
    };
  },[]);
  return <div ref={ref} className="romina-intro" aria-hidden="true">
    <div className="romina-intro-stage">
      <span className="romina-intro-origin">ADDIS ABABA <span/> SINCE 1973</span>
      <div className="romina-intro-plate">
        <svg className="romina-intro-ring" viewBox="0 0 360 360" fill="none"><circle cx="180" cy="180" r="178"/><circle cx="180" cy="180" r="161" pathLength="100"/></svg>
        <Image src="/brand/romina-logo.svg" alt="" width={240} height={204} unoptimized priority/>
      </div>
      <span className="romina-intro-signature">Good food. Great company.</span>
      <span className="romina-intro-line"/>
    </div>
  </div>;
}

"use client";

import Image from 'next/image';
import {useEffect,useRef} from 'react';

export default function BrandIntro(){
  const ref=useRef(null);
  const playing=useRef(false);
  useEffect(()=>{
    const element=ref.current;
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    try{
      if(sessionStorage.getItem('romina-brand-intro')&&!playing.current)return;
      sessionStorage.setItem('romina-brand-intro','seen');
    }catch{/* A disabled storage API must not prevent opening the menu. */}
    playing.current=true;
    element.dataset.play='true';
    const timeout=setTimeout(()=>{delete element.dataset.play;},1400);
    return()=>{clearTimeout(timeout);delete element.dataset.play;};
  },[]);
  return <div ref={ref} className="romina-intro" aria-hidden="true"><div className="romina-intro-mark"><Image src="/brand/romina-logo.svg" alt="" width={240} height={204} unoptimized priority/><span className="romina-intro-line"/></div></div>;
}

"use client";

import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useRef} from 'react';
import {useSiteMotionPaused} from './site-motion';
import MenuIcon from './menu-icons';
import sequence from '@/public/animations/beer-pour/manifest.json';

const ASSETS='/animations/beer-pour/';
const clamp=value=>Math.max(0,Math.min(1,value));

export default function BeerPour({dish}){
  const section=useRef(null);
  const canvas=useRef(null);
  const paused=useSiteMotionPaused();
  const pauseRef=useRef(paused);
  useEffect(()=>{pauseRef.current=paused;section.current.dataset.paused=String(paused);window.dispatchEvent(new Event('resize'));},[paused]);

  useEffect(()=>{
    const root=section.current;
    const surface=canvas.current;
    const context=surface.getContext('2d');
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection=navigator.connection;
    const cache=new Map();
    const pending=new Set();
    let active=false,disposed=false,raf=0,target=0,shown=-1,failed=false;
    function still(){return preference.matches||connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType)||failed||!context;}
    function paint(){
      raf=0;
      if(disposed)return;
      root.dataset.mode=still()?'still':'scroll';
      if(still()||!active||pauseRef.current||document.hidden)return;
      const rect=root.getBoundingClientRect();
      const progress=clamp(-rect.top/Math.max(1,rect.height-window.innerHeight));
      target=Math.round(progress*(sequence.frames-1));
      root.style.setProperty('--pour-progress',String(progress));
      const frame=cache.get(target);
      if(frame&&shown!==target){
        context.clearRect(0,0,sequence.width,sequence.height);
        context.drawImage(frame,0,0);
        shown=target;root.dataset.frame=String(target);root.dataset.ready='true';
      }
      // Request the exact frame first, then a small neighbourhood. Keep decoded
      // memory bounded instead of retaining the entire sequence on a phone.
      const wanted=[target];
      for(let offset=1;offset<=4;offset++)wanted.push(target+offset,target-offset);
      for(const index of wanted){
        if(index<0||index>=sequence.frames||cache.has(index)||pending.has(index)||pending.size>=4)continue;
        pending.add(index);
        const picture=new window.Image();
        picture.decoding='async';
        picture.onload=async()=>{
          try{await picture.decode();}catch{/* onload already provides a drawable image */}
          pending.delete(index);
          if(disposed)return;
          cache.set(index,picture);
          if(cache.size>12){
            const furthest=[...cache.keys()].sort((a,b)=>Math.abs(b-target)-Math.abs(a-target));
            while(cache.size>12)cache.delete(furthest.shift());
          }
          schedule();
        };
        picture.onerror=()=>{pending.delete(index);if(disposed)return;failed=true;root.dataset.ready='false';schedule();};
        picture.src=`${ASSETS}${String(index).padStart(3,'0')}.webp`;
      }
    }
    function schedule(){if(!raf&&!disposed)raf=requestAnimationFrame(paint);}
    const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{active=entries[0].isIntersecting;schedule();},{rootMargin:'400px 0px'}):null;
    if(observer)observer.observe(root);else active=true;
    root.dataset.mode=still()?'still':'scroll';
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    document.addEventListener('visibilitychange',schedule);
    preference.addEventListener('change',schedule);
    connection?.addEventListener('change',schedule);
    schedule();
    return()=>{
      disposed=true;observer?.disconnect();cancelAnimationFrame(raf);cache.clear();
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);
      document.removeEventListener('visibilitychange',schedule);preference.removeEventListener('change',schedule);connection?.removeEventListener('change',schedule);
    };
  },[]);

  return <section ref={section} id="perfectly-poured" className="rs-pour" data-mode="still" aria-labelledby="pour-title">
    <div className="rs-pour-pin">
      <div className="rs-pour-wash" aria-hidden="true"/><div className="rs-pour-grain" aria-hidden="true"/>
      <div className="rs-pour-layout">
        <div className="rs-pour-copy">
          <span className="rs-eyebrow"><span className="rs-pour-live"/> GOOD FOOD. GREAT COMPANY.</span>
          <h2 id="pour-title">Perfectly<br/><em>poured.</em></h2>
          <p>A golden pour. A plate worth staying for.</p>
          <Link href="/menu?view=menu" className="rs-button">Explore the menu<span><MenuIcon name="arrow" size={19}/></span></Link>
          <span className="rs-pour-scroll" aria-hidden="true"><span/><span className="rs-pour-scroll-label">SCROLL TO POUR</span><span className="rs-pour-still-label">SAVOUR THE MOMENT</span></span>
        </div>
        <div className="rs-pour-art">
          <div className="rs-pour-halo" aria-hidden="true"/>
          <span className="rs-pour-art-label" aria-hidden="true">A MOMENT WORTH SLOWING DOWN FOR</span>
          <div className="rs-pour-glass">
            <Image src={`${ASSETS}poster.webp`} alt="Golden beer and a creamy head, poured into a glass at Romina" width={sequence.width} height={sequence.height} unoptimized loading="lazy"/>
            <canvas ref={canvas} width={sequence.width} height={sequence.height} aria-hidden="true"/>
          </div>
          <span className="rs-pour-note" aria-hidden="true">POUR. PAIR. ENJOY.</span>
        </div>
        {dish?.id&&<Link href={`/menu?dish=${encodeURIComponent(dish.id)}`} className="rs-pour-pairing"><span className="rs-pour-pairing-icon"><MenuIcon name="cutlery" size={28}/></span><span><small>BETTER TOGETHER</small><strong>{dish.name}</strong><span>Take a closer look <MenuIcon name="arrow" size={14}/></span></span></Link>}
      </div>
      <span className="rs-pour-bottom" aria-hidden="true"><span>ROMINA RESTAURANTS</span><span className="rs-pour-track"/><span>STAY A LITTLE LONGER.</span></span>
    </div>
  </section>;
}

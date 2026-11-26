"use client";

import {useEffect,useRef} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {useSiteMotionPaused} from './site-motion';

// Every image uses the same centre and radius. Small crop corrections align
// the different source photographs without changing their original files.
const pizzas=[
  {file:1,scale:1.1},
  {file:2,scale:1.13},
  {file:3,scale:1.02},
  {file:4,scale:1.13},
  {file:5,scale:1.045},
  {file:6,scale:1.08},
  {file:7,scale:1.17},
  {file:8,scale:1.07},
];
const clamp=value=>Math.max(0,Math.min(1,value));
const point=(angle,radius=50)=>{
  const radians=angle*Math.PI/180;
  return [50+Math.cos(radians)*radius,50+Math.sin(radians)*radius];
};
function bladeStyle(index,scale){
  const start=-90+index*45+.22,end=start+44.56,mid=-67.5+index*45;
  const arc=Array.from({length:13},(_,step)=>point(start+(end-start)*step/12));
  const pivot=point(mid,46),spread=point(mid,12);
  return {
    '--blade-index':index,
    '--image-scale':scale,
    '--blade-x':`${(spread[0]-50).toFixed(3)}%`,
    '--blade-y':`${(spread[1]-50).toFixed(3)}%`,
    transformOrigin:`${pivot[0].toFixed(3)}% ${pivot[1].toFixed(3)}%`,
    clipPath:`polygon(50% 50%,${arc.map(([x,y])=>`${x.toFixed(4)}% ${y.toFixed(4)}%`).join(',')})`,
  };
}

export default function PizzaIris(){
  const section=useRef(null);
  const paused=useSiteMotionPaused();
  const pauseRef=useRef(paused);
  useEffect(()=>{pauseRef.current=paused;window.dispatchEvent(new Event('resize'));},[paused]);

  useEffect(()=>{
    const root=section.current;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const connection=navigator.connection;
    let frame=0,disposed=false;
    const still=()=>preference.matches||connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType)||innerHeight<700;
    function paint(){
      frame=0;
      if(disposed||document.hidden)return;
      root.dataset.mode=still()?'still':'scroll';
      if(still()||pauseRef.current)return;
      const bounds=root.getBoundingClientRect();
      if(bounds.bottom<0||bounds.top>innerHeight)return;
      const pin=root.querySelector('.rs-iris-pin');
      const progress=clamp(-bounds.top/Math.max(1,bounds.height-pin.offsetHeight));
      root.style.setProperty('--iris-progress',progress.toFixed(4));
    }
    function schedule(){if(!disposed&&!frame)frame=requestAnimationFrame(paint);}
    root.dataset.mode=still()?'still':'scroll';
    schedule();
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
    preference.addEventListener('change',schedule);connection?.addEventListener('change',schedule);
    document.addEventListener('visibilitychange',schedule);
    return()=>{
      disposed=true;cancelAnimationFrame(frame);
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);
      preference.removeEventListener('change',schedule);connection?.removeEventListener('change',schedule);
      document.removeEventListener('visibilitychange',schedule);
    };
  },[]);

  return <section ref={section} id="pizza-craft" className="rs-iris" data-mode="still" aria-labelledby="pizza-iris-title">
    <div className="rs-iris-pin">
      <header className="rs-iris-heading"><span>ROMINA PIZZA</span><h2 id="pizza-iris-title">A slice of <em>everything.</em></h2><p>Find the one you’ll fall for.</p></header>
      <div className="rs-iris-stage">
        <div className="rs-iris-orbit" aria-hidden="true"/>
        <div className="rs-iris-wheel" role="img" aria-label="Eight pizza slices arranged around the original Romina Restaurants logo">
          <div className="rs-iris-brand" aria-hidden="true"><Image className="rs-iris-emblem" src="/brand/romina-emblem.svg" alt="" width={160} height={160} unoptimized/><Image className="rs-iris-wordmark" src="/brand/romina-wordmark.svg" alt="" width={220} height={53} unoptimized/></div>
          {pizzas.map((pizza,index)=><div className="rs-iris-blade" key={pizza.file} style={bladeStyle(index,pizza.scale)} aria-hidden="true"><div className="rs-iris-photo"><Image src={`/pizza/pizza (${pizza.file}).jpg`} alt="" fill unoptimized sizes="(max-width:700px) 75vw, (max-height:800px) 420px, 560px"/></div></div>)}
        </div>
      </div>
      <div className="rs-iris-footer"><p className="rs-iris-instruction">Scroll to close. Scroll back to open.</p><Link href="/menu?view=menu" className="rs-button">Explore the menu</Link></div>
    </div>
  </section>;
}

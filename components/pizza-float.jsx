"use client";

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useSiteMotionPaused} from './site-motion';
import MenuIcon from './menu-icons';

const SRC='/media/pizza/piza-animation.mp4';
const chips=[
  ['Hand-stretched dough','top'],
  ['San Marzano tomatoes','right'],
  ['Wood-fired at 450°C','bottom'],
  ['Ready in 90 seconds','left'],
];

export default function PizzaFloat(){
  const root=useRef(null),video=useRef(null),stage=useRef(null);
  const paused=useSiteMotionPaused();
  const [playable,setPlayable]=useState(false);
  useEffect(()=>{
    const container=root.current,film=video.current;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const connection=navigator.connection;
    let near=false,visible=false,disposed=false;
    const restricted=()=>preference.matches||connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType);
    function sync(){
      const automatic=!restricted()&&!paused;
      setPlayable(automatic);
      if(near&&automatic&&!film.getAttribute('src')){film.src=SRC;film.load();}
      if(visible&&automatic&&!document.hidden)film.play().catch(()=>{});else film.pause();
    }
    const nearby=new IntersectionObserver(entries=>{near=entries[0].isIntersecting;sync();},{rootMargin:'300px 0px'});
    const onscreen=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.2});
    nearby.observe(container);onscreen.observe(container);
    preference.addEventListener('change',sync);connection?.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    sync();
    return()=>{disposed=true;nearby.disconnect();onscreen.disconnect();film.pause();preference.removeEventListener('change',sync);connection?.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
  },[paused]);
  useEffect(()=>{
    const panel=stage.current;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const fine=matchMedia('(pointer: fine)');
    if(!fine.matches||preference.matches)return;
    function move(event){
      const bounds=panel.getBoundingClientRect();
      const x=(event.clientX-bounds.left)/bounds.width-0.5;
      const y=(event.clientY-bounds.top)/bounds.height-0.5;
      panel.style.setProperty('--tilt-x',`${(-y*10).toFixed(2)}deg`);
      panel.style.setProperty('--tilt-y',`${(x*12).toFixed(2)}deg`);
      panel.style.setProperty('--tilt-shift-x',`${(x*14).toFixed(1)}px`);
      panel.style.setProperty('--tilt-shift-y',`${(y*10).toFixed(1)}px`);
    }
    function leave(){panel.style.setProperty('--tilt-x','0deg');panel.style.setProperty('--tilt-y','0deg');panel.style.setProperty('--tilt-shift-x','0px');panel.style.setProperty('--tilt-shift-y','0px');}
    panel.addEventListener('pointermove',move);panel.addEventListener('pointerleave',leave);
    return()=>{panel.removeEventListener('pointermove',move);panel.removeEventListener('pointerleave',leave);};
  },[]);
  return <section ref={root} id="pizza-craft" className="rs-float" data-playable={playable} aria-labelledby="pizza-float-title">
    <div className="rs-float-glow" aria-hidden="true"/>
    <div className="rs-float-embers" aria-hidden="true"/>
    <div className="rs-float-layout">
      <div className="rs-float-copy" data-site-reveal="up">
        <span className="rs-eyebrow rs-light"><i/> MADE BY HAND, FIRED BY WOOD</span>
        <h2 id="pizza-float-title">Watch it<br/><em className="rs-float-shimmer">come together.</em></h2>
        <p>Dough stretched to order. Fire that never goes out. The same pizza, every single time.</p>
        <Link href="/menu?view=menu" className="rs-button">See today's pizzas<MenuIcon name="arrow" size={19}/></Link>
      </div>
      <div ref={stage} className="rs-float-stage">
        <div className="rs-float-ring" aria-hidden="true"/>
        <div className="rs-float-ring rs-float-ring-outer" aria-hidden="true"/>
        <div className="rs-float-shadow" aria-hidden="true"/>
        <div className="rs-float-halo" aria-hidden="true"/>
        <video ref={video} className="rs-float-video" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}/>
        {chips.map(([label,pos],i)=><span key={label} className={`rs-float-chip rs-float-chip-${pos}`} data-site-reveal="up" style={{'--rs-delay':`${i*120}ms`}}>{label}</span>)}
      </div>
    </div>
  </section>;
}

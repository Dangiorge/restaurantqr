"use client";

import {useEffect,useRef} from 'react';
import Link from 'next/link';
import {useSiteMotionPaused} from './site-motion';
import MenuIcon from './menu-icons';

const SRC='/media/pizza/pizza-cutting.mp4';
const clamp=value=>Math.max(0,Math.min(1,value));

export default function PizzaSlice(){
  const section=useRef(null);
  const video=useRef(null);
  const paused=useSiteMotionPaused();
  const pauseRef=useRef(paused);
  useEffect(()=>{pauseRef.current=paused;window.dispatchEvent(new Event('resize'));},[paused]);

  useEffect(()=>{
    const root=section.current;
    const film=video.current;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const connection=navigator.connection;
    let active=false,near=false,disposed=false,raf=0,loaded=false;
    const restricted=()=>preference.matches||connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType)||pauseRef.current;
    function paint(){
      raf=0;
      if(disposed)return;
      const still=restricted();
      root.dataset.mode=still?'still':'scroll';
      if(still){
        if(active&&!document.hidden)film.play().catch(()=>{});else film.pause();
        return;
      }
      film.pause();
      if(!loaded||!film.duration)return;
      const rect=root.getBoundingClientRect();
      const progress=clamp(-rect.top/Math.max(1,rect.height-window.innerHeight));
      root.style.setProperty('--slice-progress',progress.toFixed(4));
      const target=progress*film.duration;
      if(Math.abs(film.currentTime-target)>0.03)film.currentTime=target;
    }
    function schedule(){if(!raf&&!disposed)raf=requestAnimationFrame(paint);}
    function onLoaded(){loaded=true;schedule();}
    film.addEventListener('loadedmetadata',onLoaded);
    const nearby=new IntersectionObserver(entries=>{
      near=entries[0].isIntersecting;
      if(near&&!film.getAttribute('src')){film.src=SRC;film.load();}
      schedule();
    },{rootMargin:'400px 0px'});
    const onscreen=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;schedule();},{threshold:.1});
    nearby.observe(root);onscreen.observe(root);
    root.dataset.mode=restricted()?'still':'scroll';
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule);
    document.addEventListener('visibilitychange',schedule);
    preference.addEventListener('change',schedule);
    connection?.addEventListener('change',schedule);
    schedule();
    return()=>{
      disposed=true;nearby.disconnect();onscreen.disconnect();cancelAnimationFrame(raf);
      film.removeEventListener('loadedmetadata',onLoaded);film.pause();
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);
      document.removeEventListener('visibilitychange',schedule);preference.removeEventListener('change',schedule);connection?.removeEventListener('change',schedule);
    };
  },[]);

  return <section ref={section} id="pizza-cutting" className="rs-slice" data-mode="still" aria-labelledby="pizza-slice-title">
    <div className="rs-slice-pin">
      <video ref={video} className="rs-slice-video" muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1}/>
      <div className="rs-slice-shade" aria-hidden="true"/>
      <svg className="rs-slice-cut" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1000" d="M-5 78 L105 18"/></svg>
      <div className="rs-slice-intro">
        <span className="rs-eyebrow rs-light"><i/> SLICE BY SLICE</span>
        <h2 id="pizza-slice-title">Cut the way<br/><em>it's meant to be shared.</em></h2>
        <span className="rs-slice-scroll" aria-hidden="true"><span/>KEEP SCROLLING</span>
      </div>
      <div className="rs-slice-outro">
        <span className="rs-eyebrow rs-light"><i/> FRESH FROM THE WOOD OVEN</span>
        <h3>Straight to your table.<br/>Still steaming.</h3>
        <Link href="/menu?view=menu" className="rs-button">Explore the menu<MenuIcon name="arrow" size={19}/></Link>
      </div>
      <span className="rs-slice-track" aria-hidden="true"><span/></span>
    </div>
  </section>;
}

"use client";

import {createContext,useContext,useEffect,useRef,useState} from 'react';
import MenuIcon from './menu-icons';

const MotionPause=createContext(false);
export function useSiteMotionPaused(){return useContext(MotionPause);}

export default function SiteMotion({children}){
  const ref=useRef(null);
  const [paused,setPaused]=useState(false);
  useEffect(()=>{
    const root=ref.current;
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const sections=[...root.querySelectorAll('[data-site-reveal]')];
    const scenes=[...root.querySelectorAll('[data-site-parallax]')];
    const hero=root.querySelector('.rs-hero-photo');
    const progress=root.querySelector('.rs-scroll-progress');
    let observer,frame;
    function paint(){
      frame=null;
      if(paused||preference.matches)return;
      hero?.style.setProperty('--rs-shift',`${Math.min(window.scrollY,window.innerHeight)*.12}px`);
      if(progress)progress.style.transform=`scaleX(${window.scrollY/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)})`;
      scenes.forEach(scene=>{
        const bounds=scene.getBoundingClientRect();
        if(bounds.bottom<-100||bounds.top>window.innerHeight+100)return;
        const value=Math.max(0,Math.min(1,(window.innerHeight-bounds.top)/(window.innerHeight+bounds.height)));
        scene.style.setProperty('--rs-scene',value.toFixed(3));
      });
    }
    function scroll(){if(!frame)frame=requestAnimationFrame(paint);}
    function configure(){
      observer?.disconnect();
      if(paused||preference.matches){sections.forEach(section=>section.dataset.siteState='visible');return;}
      const waiting=sections.filter(section=>section.dataset.siteState!=='visible');
      if('IntersectionObserver' in window){
        waiting.forEach(section=>section.dataset.siteState='waiting');
        observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.dataset.siteState='visible';observer.unobserve(entry.target);}}),{threshold:.1});
        waiting.forEach(section=>observer.observe(section));
      }
      scroll();
    }
    configure();window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);preference.addEventListener('change',configure);
    return()=>{observer?.disconnect();if(frame)cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);preference.removeEventListener('change',configure);};
  },[paused]);
  return <MotionPause.Provider value={paused}><div className="rs-site" ref={ref} data-site-paused={paused}><div className="rs-scroll-progress" aria-hidden="true"/>{children}<button className="rs-motion-toggle" onClick={()=>setPaused(value=>!value)} aria-pressed={paused} aria-label={paused?'Resume website animations':'Pause website animations'}><MenuIcon name={paused?'play':'pause'} size={13}/><span>{paused?'Motion paused':'Pause motion'}</span></button></div></MotionPause.Provider>;
}

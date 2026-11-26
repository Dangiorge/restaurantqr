"use client";

import {useEffect,useRef} from 'react';
import {useSiteMotionPaused} from './site-motion';

const clamp=value=>Math.max(0,Math.min(1,value));

export default function HistoryMotion({children}){
  const root=useRef(null);
  const paused=useSiteMotionPaused();
  const pauseRef=useRef(paused);
  useEffect(()=>{pauseRef.current=paused;if(!paused)window.dispatchEvent(new Event('resize'));},[paused]);

  useEffect(()=>{
    const element=root.current;
    const scenes=[...element.querySelectorAll('[data-history-scene]')];
    const reveals=[...element.querySelectorAll('[data-history-reveal]')];
    const homeColorCue=element.querySelector('[data-home-color-cue]');
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const connection=navigator.connection;
    let frame=0,disposed=false,observer;
    const still=()=>preference.matches||connection?.saveData||innerHeight<620;
    function configure(){
      observer?.disconnect();
      element.dataset.historyMotion=still()?'still':'scroll';
      if(still()){reveals.forEach(node=>node.dataset.historyVisible='true');return;}
      if('IntersectionObserver' in window){
        observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
          if(entry.isIntersecting){entry.target.dataset.historyVisible='true';observer.unobserve(entry.target);}
        }),{threshold:.12});
        reveals.forEach(node=>{if(node.dataset.historyVisible!=='true'){node.dataset.historyVisible='false';observer.observe(node);}});
      }
      schedule();
    }
    function paint(){
      frame=0;
      if(disposed||document.hidden||pauseRef.current||still())return;
      scenes.forEach(scene=>{
        const bounds=scene.getBoundingClientRect();
        if(bounds.bottom<0||bounds.top>innerHeight)return;
        const pinned=scene.querySelector('.rh-opening-pin,.rh-family-pin');
        const progress=pinned?clamp(-bounds.top/Math.max(1,bounds.height-innerHeight)):clamp((innerHeight-bounds.top)/(innerHeight+bounds.height));
        scene.style.setProperty('--history-progress',progress.toFixed(4));
        if(scene.dataset.historyScene==='homecoming'&&homeColorCue){
          const color=clamp((innerHeight-homeColorCue.getBoundingClientRect().top)/Math.min(180,innerHeight*.2));
          scene.style.setProperty('--home-color',color.toFixed(4));
        }
      });
    }
    function schedule(){if(!frame&&!disposed)frame=requestAnimationFrame(paint);}
    function resize(){
      const mode=still()?'still':'scroll';
      if(element.dataset.historyMotion!==mode)configure();else schedule();
    }
    configure();
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',resize);
    preference.addEventListener('change',configure);connection?.addEventListener('change',configure);document.addEventListener('visibilitychange',schedule);
    return()=>{
      disposed=true;cancelAnimationFrame(frame);observer?.disconnect();
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',resize);
      preference.removeEventListener('change',configure);connection?.removeEventListener('change',configure);document.removeEventListener('visibilitychange',schedule);
    };
  },[]);

  return <div ref={root} id="our-table" className="rh-history" data-history-motion="still" aria-label="The story of Romina Restaurants">{children}</div>;
}

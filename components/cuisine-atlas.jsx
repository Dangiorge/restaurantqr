"use client";

import Image from 'next/image';
import Link from 'next/link';
import {useEffect,useRef} from 'react';
import {useSiteMotionPaused} from './site-motion';
import MenuIcon from './menu-icons';

const clamp=value=>Math.max(0,Math.min(1,value));
const ease=value=>value*value*(3-2*value);
const arrivals=[.23,.57,.90];
const cameras=[{point:[0,12],zoom:1},{point:[38.75,9.03],zoom:5.8},{point:[12,49],zoom:2.8},{point:[95,31],zoom:1.9}];
const segments=[[.04,.20],[.39,.54],[.72,.87]];
const showAt=[.18,.52,.85];
const hideAt=[.36,.69,1.1];
const formatPrice=value=>Number(value).toLocaleString('en-ET',{minimumFractionDigits:2,maximumFractionDigits:2});

function cameraFrame(camera,ratio,compact){
  const zoom=compact&&camera.zoom>1?camera.zoom*(camera.zoom>5?1.6:1.18):camera.zoom;
  const width=1120/zoom,height=width/ratio;
  const [longitude,latitude]=camera.point;
  return [(longitude+180)*3-width*(camera.zoom===1?.5:compact?.5:.36),(90-latitude)*3-height*(compact?.46:.55),width,height];
}

export default function CuisineAtlas({stops,map}){
  const section=useRef(null);
  const paused=useSiteMotionPaused();
  const pauseRef=useRef(paused);
  useEffect(()=>{
    pauseRef.current=paused;
    section.current.dataset.paused=String(paused);
    if(!paused)window.dispatchEvent(new Event('resize'));
  },[paused]);

  useEffect(()=>{
    const root=section.current;
    const pin=root.querySelector('.rs-atlas-pin');
    const surface=root.querySelector('[data-atlas-map]');
    const stage=root.querySelector('.rs-atlas-stage');
    const groups=[...root.querySelectorAll('.rs-atlas-destination')];
    const links=[...root.querySelectorAll('.rs-atlas-nav a')];
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection=navigator.connection;
    let frame=0,visible=true,disposed=false,currentCamera=null,previousTime=0,forcedProgress=null,measureCards=true;
    const isStatic=()=>preference.matches||connection?.saveData||innerHeight<640;

    function restore(){
      root.dataset.mode='static';delete root.dataset.destination;
      surface.setAttribute('viewBox','0 0 1080 540');
      groups.forEach(group=>{
        group.inert=false;group.removeAttribute('aria-hidden');
        group.querySelectorAll('.rs-atlas-card').forEach(card=>{card.inert=false;card.removeAttribute('aria-hidden');});
      });
      links.forEach(link=>link.removeAttribute('aria-current'));
      currentCamera=null;
    }
    function render(time){
      frame=0;
      if(disposed||document.hidden)return;
      if(isStatic()){restore();return;}
      root.dataset.mode='scroll';
      if((pauseRef.current&&forcedProgress===null)||!visible)return;
      const bounds=root.getBoundingClientRect();
      const progress=forcedProgress??clamp(-bounds.top/Math.max(1,bounds.height-innerHeight));
      const forced=forcedProgress!==null;forcedProgress=null;
      const compact=innerWidth<=760;
      const ratio=stage.clientWidth/Math.max(1,stage.clientHeight);
      if(measureCards){
        groups.forEach(group=>{
          const rail=group.querySelector('.rs-atlas-cards');
          group.querySelectorAll('.rs-atlas-card').forEach(card=>{
            card.style.setProperty('--card-from-x',compact?'-35px':`${stage.clientWidth*.36-rail.offsetLeft-card.offsetLeft}px`);
            card.style.setProperty('--card-from-y',compact?'20px':`${stage.clientHeight*.55-rail.offsetTop-card.offsetTop}px`);
          });
        });
        measureCards=false;
      }
      let target=cameraFrame(cameras[0],ratio,compact);
      segments.forEach(([start,end],index)=>{
        if(progress<start)return;
        const from=cameraFrame(cameras[index],ratio,compact),to=cameraFrame(cameras[index+1],ratio,compact);
        const amount=ease(clamp((progress-start)/(end-start)));
        target=from.map((value,axis)=>value+(to[axis]-value)*amount);
      });
      const destination=progress<.12?'world':progress<.46?'ethiopia':progress<.79?'europe':'asia';
      root.dataset.destination=destination;
      root.style.setProperty('--atlas-progress',String(progress));
      const activeIndex=stops.findIndex(stop=>stop.id===destination);
      groups.forEach((group,index)=>{
        const active=activeIndex===index;
        const exit=1-clamp((progress-hideAt[index])/.04);
        const stopShow=clamp((progress-showAt[index])/.035)*exit;
        const accessible=active&&stopShow>.01;
        group.inert=!accessible;group.setAttribute('aria-hidden',String(!accessible));
        group.querySelectorAll('.rs-atlas-card').forEach((card,cardIndex)=>{
          const reveal=clamp((progress-showAt[index]-cardIndex*.012)/.035)*exit;
          card.style.setProperty('--card-show',reveal.toFixed(4));
          card.inert=reveal<.01;card.setAttribute('aria-hidden',String(reveal<.01));
        });
        group.style.setProperty('--stop-show',String(stopShow));
      });
      links.forEach((link,index)=>{if(index===activeIndex)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
      pin.style.opacity=String(activeIndex<0?0:clamp((progress-showAt[activeIndex]+.015)/.04)*(1-clamp((progress-hideAt[activeIndex])/.04)));
      const blend=forced?1:1-Math.exp(-Math.min(64,time-previousTime||16)/85);
      previousTime=time;
      currentCamera=currentCamera&&!forced?currentCamera.map((value,axis)=>value+(target[axis]-value)*blend):target;
      surface.setAttribute('viewBox',currentCamera.map(value=>value.toFixed(3)).join(' '));
      if(currentCamera.some((value,axis)=>Math.abs(value-target[axis])>.025))schedule();
    }
    function schedule(){if(!frame&&!disposed)frame=requestAnimationFrame(render);}
    function onResize(){measureCards=true;schedule();}
    function configure(){measureCards=true;if(isStatic())restore();else root.dataset.mode='scroll';schedule();}
    function jump(event){
      if(isStatic())return;
      event.preventDefault();
      const index=links.indexOf(event.currentTarget);
      const top=root.getBoundingClientRect().top+scrollY;
      const target=top+arrivals[index]*(root.offsetHeight-innerHeight);
      if(pauseRef.current){forcedProgress=arrivals[index];window.scrollTo({top:target,behavior:'instant'});}
      else window.scrollTo({top:target,behavior:'smooth'});
      schedule();
    }
    const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();},{rootMargin:'200px 0px'}):null;
    observer?.observe(root);
    const resize=typeof ResizeObserver==='function'?new ResizeObserver(onResize):null;
    resize?.observe(stage);
    links.forEach(link=>link.addEventListener('click',jump));
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',onResize);
    document.addEventListener('visibilitychange',schedule);preference.addEventListener('change',configure);connection?.addEventListener('change',configure);
    configure();
    return()=>{
      disposed=true;cancelAnimationFrame(frame);observer?.disconnect();resize?.disconnect();
      links.forEach(link=>link.removeEventListener('click',jump));
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',onResize);
      document.removeEventListener('visibilitychange',schedule);preference.removeEventListener('change',configure);connection?.removeEventListener('change',configure);
    };
  },[stops]);

  return <section ref={section} id="world-of-flavour" className="rs-atlas" data-mode="static" aria-labelledby="atlas-title">
    <div className="rs-atlas-stage">
      <div className="rs-atlas-cartography">{map}</div>
      <div className="rs-atlas-wash" aria-hidden="true"/>
      <header className="rs-atlas-heading"><span className="rs-eyebrow">THREE CUISINES. ONE ROMINA TABLE.</span><h2 id="atlas-title">A world of <em>flavour.</em></h2><p>Follow your appetite. We’ll take you somewhere delicious.</p></header>
      <div className="rs-atlas-pin" aria-hidden="true"><span/><i/></div>
      <span className="rs-atlas-world-note" aria-hidden="true">Every journey begins<br/><em>with an appetite.</em></span>
      <div className="rs-atlas-destinations">{stops.map((stop,index)=><article key={stop.id} id={`cuisine-${stop.id}`} className="rs-atlas-destination" data-cuisine={stop.id} aria-labelledby={`cuisine-${stop.id}-title`}>
        <div className="rs-atlas-place"><span className="rs-atlas-stop-number">0{index+1} / A TASTE OF {stop.place.toUpperCase()}</span><h3 id={`cuisine-${stop.id}-title`}>{stop.place}<span>.</span></h3><p>{stop.line}</p><span className="rs-atlas-coordinates" aria-hidden="true">{stop.coordinates}</span></div>
        <div className="rs-atlas-cards"><div className="rs-atlas-food-rail">{stop.dishes.map((dish,dishIndex)=><Link key={dish.id} href={`/menu?dish=${encodeURIComponent(dish.id)}`} className="rs-atlas-card" style={{'--card-index':dishIndex}}>
          <div className="rs-atlas-food">{dish.photoUrl?<Image src={dish.photoUrl} alt={dish.name} fill unoptimized sizes="(max-width:760px) 180px, 350px" loading="lazy"/>:<span className="rs-atlas-food-fallback"><MenuIcon name="cutlery" size={32}/></span>}{dish.dietaryType==='VEGAN'&&<span className="rs-atlas-vegan">Vegan</span>}</div>
          <div className="rs-atlas-card-copy"><span className="rs-atlas-cuisine-label">{stop.name}</span><h4>{dish.name}</h4><div><strong>{formatPrice(dish.basePrice)} <small>ETB</small></strong><span className="rs-atlas-discover" aria-label={`Discover ${dish.name}`}><MenuIcon name="arrow" size={19}/></span></div></div>
        </Link>)}
        {!stop.dishes.length&&<div className="rs-atlas-empty rs-atlas-card"><MenuIcon name="cutlery" size={30}/><p>{stop.description}</p><span>Ask our team for today’s {stop.name.toLowerCase()} favourites.</span></div>}
        </div><Link className="rs-atlas-all" href={stop.categoryId?`/menu?category=${encodeURIComponent(stop.categoryId)}`:'/menu?view=menu'}>Explore {stop.name}<MenuIcon name="arrow" size={17}/></Link>
        </div>
      </article>)}</div>
      <div className="rs-atlas-bottom"><span className="rs-atlas-scroll"><MenuIcon name="arrow" size={16}/><span>SCROLL TO DISCOVER</span></span><nav className="rs-atlas-nav" aria-label="Cuisine destinations">{stops.map((stop,index)=><a key={stop.id} href={`#cuisine-${stop.id}`}><span>0{index+1}</span>{stop.name.replace(' cuisine','')}<i/></a>)}</nav><span className="rs-atlas-signature">A WORLD OF FLAVOUR.<br/>ALWAYS ROMINA.</span></div>
    </div>
  </section>;
}

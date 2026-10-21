"use client";

import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
import {useSiteMotionPaused} from './site-motion';
import MenuIcon from './menu-icons';

// Real restaurant footage: load near the viewport, play only while visible.
// Posters remain available without JavaScript, on failures, and for reduced data.
export default function RestaurantFilm({src,poster,alt,title,portrait=false}){
  const root=useRef(null),video=useRef(null);
  const globalPause=useSiteMotionPaused();
  const [held,setHeld]=useState(false);
  const [playing,setPlaying]=useState(false);
  useEffect(()=>{
    const container=root.current,film=video.current;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const connection=navigator.connection;
    let visible=false,near=false,disposed=false;
    const restricted=()=>preference.matches||connection?.saveData||/^(slow-)?2g$/.test(connection?.effectiveType);
    function sync(){
      const automatic=!restricted()&&!globalPause&&!held;
      if(near&&automatic&&!film.getAttribute('src')){film.src=src;film.load();}
      container.dataset.still=String(restricted());
      if(visible&&automatic&&!document.hidden){film.play().catch(()=>{});}else film.pause();
    }
    const nearby=new IntersectionObserver(entries=>{near=entries[0].isIntersecting;sync();},{rootMargin:'250px 0px'});
    const onscreen=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.18});
    nearby.observe(container);onscreen.observe(container);
    preference.addEventListener('change',sync);connection?.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    function played(){if(!disposed){container.dataset.playing='true';setPlaying(true);}}
    function stopped(){if(!disposed)setPlaying(false);}
    function failed(){container.dataset.playing='false';stopped();}
    film.addEventListener('playing',played);film.addEventListener('pause',stopped);film.addEventListener('error',failed);
    sync();
    return()=>{disposed=true;nearby.disconnect();onscreen.disconnect();film.pause();preference.removeEventListener('change',sync);connection?.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);film.removeEventListener('playing',played);film.removeEventListener('pause',stopped);film.removeEventListener('error',failed);};
  },[src,globalPause,held]);
  return <figure ref={root} className={`rs-film${portrait?' rs-film-portrait':''}`} data-playing="false" data-still="true">
    <Image src={poster} alt={alt} fill unoptimized sizes={portrait?'(max-width:760px) 80vw, 440px':'(max-width:760px) 100vw, 1280px'}/>
    <video ref={video} muted playsInline loop preload="none" aria-hidden="true" tabIndex={-1}/>
    <figcaption><span>{title}</span><button type="button" onClick={()=>{if(playing){setHeld(true);video.current.pause();}else{setHeld(false);video.current.play().catch(()=>{});}}} aria-label={`${playing?'Pause':'Play'} ${title.toLowerCase()} film`} aria-pressed={held} disabled={globalPause}><MenuIcon name={playing?'pause':'play'} size={16}/></button></figcaption>
  </figure>;
}

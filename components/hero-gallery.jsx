"use client";

import Image from 'next/image';
import {useEffect,useState} from 'react';
import {useSiteMotionPaused} from './site-motion';
import {imageProps} from '@/lib/image.mjs';

export default function HeroGallery({slides,interval=7000}){
  const [index,setIndex]=useState(0);
  const [reduced,setReduced]=useState(false);
  const paused=useSiteMotionPaused();
  useEffect(()=>{
    const query=matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange=event=>setReduced(event.matches);
    query.addEventListener('change',onChange);
    return()=>query.removeEventListener('change',onChange);
  },[]);
  useEffect(()=>{
    if(slides.length<2||paused||reduced)return;
    const timer=setInterval(()=>{if(!document.hidden)setIndex(value=>(value+1)%slides.length);},interval);
    return()=>clearInterval(timer);
  },[slides.length,paused,reduced,interval]);
  return <div className="rs-hero-photo">{slides.map((slide,i)=>{
    const active=i===index;
    return isVideo(slide.src)
      ?<video key={slide.src} className={`rs-hero-slide ${active?'rs-hero-slide-active':''}`} src={active&&!paused&&!reduced?slide.src:undefined} poster={slide.poster} autoPlay={active&&!paused} muted loop playsInline preload={i===0?'auto':'none'} aria-hidden="true"/>
      :<Image key={slide.src} className={`rs-hero-slide ${active?'rs-hero-slide-active':''}`} {...imageProps(slide.src,2400)} alt={active?slide.alt:''} fill priority={i===0} sizes="100vw"/>;
  })}</div>;
}

function isVideo(src){return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(src||'');}

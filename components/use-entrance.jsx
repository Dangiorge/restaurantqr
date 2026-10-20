"use client";

import {useEffect,useRef} from 'react';

export default function useEntrance(){
  const ref=useRef(null);
  useEffect(()=>{
    const root=ref.current;
    if(!root||window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
    const elements=root.matches('[data-enter]')?[root]:[...root.querySelectorAll('[data-enter]')];
    elements.forEach(element=>element.dataset.reveal='waiting');
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{if(entry.isIntersecting){entry.target.dataset.reveal='visible';observer.unobserve(entry.target);}});
    },{threshold:.08});
    elements.forEach(element=>observer.observe(element));
    function settled(event){
      if(event.animationName==='rg-category-arrive'||event.animationName==='rg-photo-settle'){
        const element=event.target.closest('[data-enter]');
        if(element)element.dataset.reveal='settled';
      }
    }
    root.addEventListener('animationend',settled);
    return()=>{observer.disconnect();root.removeEventListener('animationend',settled);};
  },[]);
  return ref;
}

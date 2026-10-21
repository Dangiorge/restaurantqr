"use client";

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MenuIcon from './menu-icons';

export default function SiteHeader(){
  const [open,setOpen]=useState(false);
  const toggle=useRef(null);
  const header=useRef(null);
  useEffect(()=>{
    const element=header.current;
    function update(){
      const value=window.scrollY>48?'true':'false';
      if(element.dataset.scrolled!==value)element.dataset.scrolled=value;
    }
    update();window.addEventListener('scroll',update,{passive:true});
    return()=>window.removeEventListener('scroll',update);
  },[]);
  useEffect(()=>{
    if(!open)return;
    function keydown(event){if(event.key==='Escape'){setOpen(false);toggle.current?.focus();}}
    document.addEventListener('keydown',keydown);return()=>document.removeEventListener('keydown',keydown);
  },[open]);
  return <header ref={header} className="rs-header" data-scrolled="false" data-open={open}>
    <Link href="/" className="rs-logo" aria-label="Romina Restaurants home">
      <Image className="rs-logo-emblem" src="/brand/romina-emblem.svg" alt="" width={52} height={52} priority/>
      <Image className="rs-logo-wordmark" src="/brand/romina-wordmark.svg" alt="" width={154} height={37} priority/>
    </Link>
    <button ref={toggle} className="rs-mobile-toggle" aria-expanded={open} aria-controls="site-navigation" aria-label={open?'Close navigation':'Open navigation'} onClick={()=>setOpen(value=>!value)}><MenuIcon name={open?'close':'menu'} size={23}/></button>
    <nav id="site-navigation" className={open?'rs-nav-open':''} aria-label="Main navigation" onClick={()=>setOpen(false)}>
      <a href="#our-table">Our story</a><a href="#our-menu">The menu</a><a href="#catering">Catering</a><a href="#visit">Visit Romina</a>
      <Link href="/menu?view=menu" className="rs-button rs-nav-cta">View menu<MenuIcon name="arrow" size={19}/></Link>
    </nav>
  </header>;
}

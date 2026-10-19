"use client";

import {useEffect,useState} from 'react';
import Image from 'next/image';
import MenuIcon from './menu-icons';

export function GuestWelcome({name,logo,hero,table,branch,enter}){
  return <section className="rg-welcome" aria-label={`Welcome to ${name}`}>
    {hero&&<Image className="rg-welcome-image" src={hero} alt="" fill unoptimized priority sizes="100vw"/>}
    <div className="rg-welcome-shade"/>
    <div className="rg-welcome-content"><div className="rg-welcome-logo">{logo?<Image src={logo} alt={name} width={168} height={143} unoptimized priority/>:<strong>{name}</strong>}</div><span className="rg-kicker">GOOD FOOD. GREAT COMPANY.</span><h1>A warm welcome.<br/>An unforgettable meal.</h1><p>Find your favourites. Discover something delicious.<br/>Make yourself at home.</p>{table&&<span className="rg-table"><MenuIcon name="pin" size={16}/>{branch} · Table {table}</span>}<button className="rg-enter" onClick={enter}><MenuIcon name="cutlery" size={20}/>View Menu<MenuIcon name="arrow" size={20}/></button><span className="rg-welcome-footnote">{table?'Your table. Your menu. All at your fingertips.':'Scan the QR at your table to order and request service.'}</span></div><div className="rg-welcome-pattern" aria-hidden="true"/>
  </section>;
}

export function RecommendationSlider({items,recommended,open}){
  const [index,setIndex]=useState(0);
  const [paused,setPaused]=useState(false);
  const [hovered,setHovered]=useState(false);
  useEffect(()=>{
    if(items.length<2||paused||hovered||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const timer=setInterval(()=>{if(!document.hidden)setIndex(value=>(value+1)%items.length);},5000);
    return()=>clearInterval(timer);
  },[items.length,paused,hovered]);
  if(!items.length)return null;
  const current=index%items.length,item=items[current];
  return <section className="rg-recommendations" aria-label={recommended?'Daily recommendations':'Explore our menu'} aria-roledescription="carousel" onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)} onFocusCapture={()=>setHovered(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setHovered(false);}}>
    <div className="rg-section-heading"><div><span className="rg-kicker">FRESH FROM OUR KITCHEN</span><h2>{recommended?'Daily recommendations':'Explore our menu'}</h2></div>{items.length>1&&<button className="rm-icon-button" aria-label={paused?'Play recommendations':'Pause recommendations'} onClick={()=>setPaused(value=>!value)}><MenuIcon name={paused?'play':'pause'} size={17}/></button>}</div>
    <div className="rg-slide" role="group" aria-roledescription="slide" aria-label={`${current+1} of ${items.length}: ${item.name}`}>
      {item.photoUrl&&<Image src={item.photoUrl} alt={item.name} fill unoptimized sizes="(max-width:760px) 100vw, 1040px"/>}<div className="rg-slide-shade"/><div className="rg-slide-copy"><span>{recommended?'A little inspiration for today':'FIND YOUR NEXT FAVOURITE'}</span><h3>{item.name}</h3><p>{item.description}</p><button onClick={()=>open(item)}>View more <MenuIcon name="arrow" size={16}/></button></div>
    </div>{items.length>1&&<div className="rg-slider-controls"><button aria-label="Previous recommendation" onClick={()=>setIndex(value=>(value-1+items.length)%items.length)}><MenuIcon name="back" size={17}/></button><div>{items.map((item,i)=><button key={item.id} className={i===current?'active':''} aria-label={`Show recommendation ${i+1}: ${item.name}`} aria-pressed={i===current} onClick={()=>setIndex(i)}/>)}</div><button aria-label="Next recommendation" onClick={()=>setIndex(value=>(value+1)%items.length)}><MenuIcon name="arrow" size={17}/></button></div>}
  </section>;
}

export function GuestEvents({events}){
  if(!events.length)return null;
  return <section className="rg-events" aria-label="Events"><div className="rg-section-heading"><div><span className="rg-kicker">MAKE A DATE WITH US</span><h2>Happening at our table</h2></div></div>{events.map(event=><article key={event.id}><Image src={event.posterUrl} alt={`${event.title} poster`} width={1000} height={700} unoptimized/><div><h3>{event.title}</h3><p>{event.description}</p></div></article>)}</section>;
}

export function ParentCategories({categories,allCategories,select}){
  return <section className="rg-parent-categories" aria-label="Main categories"><div className="rg-section-heading"><div><span className="rg-kicker">SOMETHING FOR EVERY APPETITE</span><h2>Explore our categories</h2></div></div><div className="rg-parent-list">{categories.map(category=>{
    const children=allCategories.filter(child=>child.parentId===category.id);
    const dishes=[...category.items,...children.flatMap(child=>child.items)];
    const photo=dishes.find(item=>item.photoUrl)?.photoUrl;
    return <button className="rg-parent-card" key={category.id} onClick={()=>select(category.id)}>{photo?<Image src={photo} alt="" width={140} height={140} unoptimized/>:<span className="rg-category-placeholder"><MenuIcon name="cutlery" size={30}/></span>}<span><strong>{category.name}</strong><small>{children.length?children.map(child=>child.name).join(' · '):`${dishes.length} ${dishes.length===1?'dish':'dishes'} to discover`}</small></span><MenuIcon name="arrow" size={20}/></button>;
  })}</div></section>;
}

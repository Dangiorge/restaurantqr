"use client";

import {useEffect,useState} from 'react';
import Image from 'next/image';
import MenuIcon from './menu-icons';
import DishPhoto from './dish-photo';
import useEntrance from './use-entrance';

function multiline(text){
  const parts=text.split('\n');
  return parts.map((line,i)=>i===0?<span key={i}>{line}</span>:<span key={i}><br/>{line}</span>);
}

const isVideo=url=>/\.(mp4|webm|mov|m4v)(\?|$)/i.test(url||'');

function HeroMedia({gallery,name}){
  const [index,setIndex]=useState(0);
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const query=window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange=event=>setReduced(event.matches);
    query.addEventListener('change',onChange);
    return()=>query.removeEventListener('change',onChange);
  },[]);
  useEffect(()=>{
    if(gallery.length<2||reduced)return;
    const timer=setInterval(()=>{if(!document.hidden)setIndex(value=>(value+1)%gallery.length);},9000);
    return()=>clearInterval(timer);
  },[gallery.length,reduced]);
  if(!gallery.length)return null;
  return <div className="rg-hero-media" aria-hidden="true">{gallery.map((src,i)=>{
    const active=i===index;
    return isVideo(src)
      ?<video key={src} className={`rg-welcome-image rg-hero-slide ${active?'rg-hero-active':''} ${!reduced?'rg-hero-pan':''}`} src={src} autoPlay muted loop playsInline/>
      :<Image key={src} className={`rg-welcome-image rg-hero-slide ${active?'rg-hero-active':''} ${!reduced?'rg-hero-pan':''}`} src={src} alt={active?`${name} dining room`:''} fill unoptimized priority={i===0} sizes="100vw"/>;
  })}</div>;
}

export function GuestWelcome({name,logo,hero,gallery,table,branch,enter,logoRef,openStatus,rating,onShare,shared,language,setLanguage,t}){
  const welcomeLabel=`Welcome to ${name}`+(openStatus?(openStatus.open?', open now':', closed now'):'');
  const showRating=Boolean(rating&&rating.score>0);
  const ratingLabel=rating?`Rated ${rating.score} out of 5`+(rating.count?` from ${rating.count} reviews`:''):'';
  const media=gallery?.length?gallery:[hero].filter(Boolean);
  return <section className={`rg-welcome ${!media.length?'rg-welcome-fallback':''}`} aria-label={welcomeLabel}>
    <HeroMedia gallery={media} name={name}/>
    <div className="rg-welcome-shade"/>
    <div className="rg-welcome-top">
      {openStatus&&<span className={`rg-status-badge ${openStatus.open?'rg-status-open':'rg-status-closed'}`}><span aria-hidden="true"/>{openStatus.open?t('openNow','Open now'):t('closedNow','Closed now')}</span>}
      <div className="rg-welcome-top-actions">
        <button className="rg-lang-toggle" onClick={()=>setLanguage(language==='en'?'am':'en')} aria-label="Change language">{language==='en'?'አማ':'EN'}</button>
        <button className="rg-share-button" onClick={onShare} aria-label={t('shareMenu','Share menu')}><MenuIcon name={shared?'check':'share'} size={16}/></button>
      </div>
    </div>
    <div className="rg-welcome-content"><div className="rg-welcome-logo" ref={logoRef}>{logo?<Image src={logo} alt={name} width={196} height={196} unoptimized priority/>:<strong>{name}</strong>}</div><span className="rg-kicker">GOOD FOOD. GREAT COMPANY.</span><h1>{multiline(t('welcomeTitle','A warm welcome.\nAn unforgettable meal.'))}</h1>{showRating&&<span className="rg-rating" aria-label={ratingLabel}><MenuIcon name="star" size={14}/>{rating.score.toFixed(1)}{rating.count>0&&<small>{`(${rating.count})`}</small>}</span>}<p>{multiline(t('welcomeSubtitle','Find your favourites. Discover something delicious.\nMake yourself at home.'))}</p>{table&&<span className="rg-table"><MenuIcon name="pin" size={16}/>{branch} · Table {table}</span>}<button className="rg-enter" onClick={enter}><MenuIcon name="cutlery" size={20}/>{t('viewMenu','View Menu')}<MenuIcon name="arrow" size={20}/></button><span className="rg-welcome-footnote">{table?t('footnoteTable','Your table. Your menu. All at your fingertips.'):t('footnoteScan','Scan the QR at your table to order and request service.')}</span></div><div className="rg-welcome-pattern" aria-hidden="true"/>
  </section>;
}

export function RecommendationSlider({items,recommended,open,t=k=>k}){
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
    <div className="rg-section-heading"><div><span className="rg-kicker">FRESH FROM OUR KITCHEN</span><h2>{recommended?t('recommended','Daily recommendations'):t('exploreMenu','Explore our menu')}</h2></div>{items.length>1&&<button className="rm-icon-button" aria-label={paused?'Play recommendations':'Pause recommendations'} onClick={()=>setPaused(value=>!value)}><MenuIcon name={paused?'play':'pause'} size={17}/></button>}</div>
    <div className="rg-slide" role="group" aria-roledescription="slide" aria-label={`${current+1} of ${items.length}: ${item.name}`}>
      <DishPhoto key={item.id} src={item.photoUrl} alt={item.name} className="rg-slide-photo" sizes="(max-width:760px) 100vw, 1040px"/><div className="rg-slide-shade"/><div className="rg-slide-copy"><span>{recommended?'A little inspiration for today':'FIND YOUR NEXT FAVOURITE'}</span><h3>{item.name}</h3><p>{item.description}</p><button className="rg-slide-explore" onClick={()=>open(item)}>View more <span><MenuIcon name="arrow" size={17}/></span></button></div>
    </div>{items.length>1&&<div className="rg-slider-controls"><button aria-label="Previous recommendation" onClick={()=>setIndex(value=>(value-1+items.length)%items.length)}><MenuIcon name="back" size={17}/></button><div>{items.map((item,i)=><button key={item.id} className={i===current?'active':''} aria-label={`Show recommendation ${i+1}: ${item.name}`} aria-pressed={i===current} onClick={()=>setIndex(i)}/>)}</div><button aria-label="Next recommendation" onClick={()=>setIndex(value=>(value+1)%items.length)}><MenuIcon name="arrow" size={17}/></button></div>}
  </section>;
}

export function GuestEvents({events,t=k=>k}){
  if(!events.length)return null;
  return <section className="rg-events" aria-label="Events"><div className="rg-section-heading"><div><span className="rg-kicker">MAKE A DATE WITH US</span><h2>{t('happeningAtOurTable','Happening at our table')}</h2></div></div>{events.map(event=><article key={event.id}><Image src={event.posterUrl} alt={`${event.title} poster`} width={1000} height={700} unoptimized/><div><h3>{event.title}</h3><p>{event.description}</p></div></article>)}</section>;
}

export function ParentCategories({categories,allCategories,select,t=k=>k}){
  const ref=useEntrance();
  return <section className="rg-parent-categories" aria-label="Main categories"><div className="rg-section-heading"><div><span className="rg-kicker">SOMETHING FOR EVERY APPETITE</span><h2>{t('exploreCategories','Explore our categories')}</h2></div></div><div ref={ref} className="rg-parent-list">{categories.map((category,index)=>{
    const children=allCategories.filter(child=>child.parentId===category.id);
    const dishes=[...category.items,...children.flatMap(child=>child.items)];
    const photo=dishes.find(item=>item.photoUrl)?.photoUrl;
    return <button className="rg-parent-card" key={category.id} data-enter="category" style={{'--rg-enter-delay':`${Math.min(index*75,750)}ms`}} onClick={()=>select(category.id)}>{photo?<Image src={photo} alt="" width={140} height={140} unoptimized/>:<span className="rg-category-placeholder"><MenuIcon name="cutlery" size={30}/></span>}<span><strong>{category.name}</strong><small>{children.length?children.map(child=>child.name).join(' · '):`${dishes.length} ${dishes.length===1?'dish':'dishes'} to discover`}</small></span><MenuIcon name="arrow" size={20}/></button>;
  })}</div></section>;
}

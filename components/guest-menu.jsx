"use client";

import {useCallback,useEffect,useMemo,useRef,useState} from 'react';
import Image from 'next/image';
import useLogoFlight from './use-logo-flight';
import MenuBackdrop from './menu-backdrop';
import {appearanceVariables,menuAppearance,menuBackground} from '@/modules/menus/appearance.mjs';
import GuestDishDetail from './guest-dish-detail';
import GuestDishCard from './guest-dish-card';
import GuestActions from './guest-actions';
import {GuestWelcome,RecommendationSlider,GuestEvents,ParentCategories} from './guest-discovery';
import {guestDiscovery,orderInstructions,nextDiscoveryChange} from '@/modules/menus/discovery.mjs';
import {brandLogoUrl} from '@/lib/brand.mjs';
import MenuIcon from './menu-icons';
import {categoryRows,filterMenuCategories} from '@/modules/menus/taxonomy.mjs';

const serviceTypes=[['WAITER','bell','Call waiter','A little assistance at your table.'],['BILL','bill','Ask for bill','Ready when you are.'],['WATER','water','Drinking water','A refreshing top-up.'],['CUTLERY','cutlery','Cutlery','The little things you need.'],['HELP','help','Other assistance','Our team is here to help.']];
const statusLabels={PLACED:'Sent to the restaurant',ACCEPTED:'Your order is accepted',PREPARING:'Freshly preparing your meal',READY:'Your food is ready',SERVED:'Enjoy your meal',COMPLETED:'Thank you for dining with us',CANCELLED:'Order cancelled by the restaurant',OPEN:'Request sent',ACKNOWLEDGED:'A staff member has acknowledged',RESOLVED:'Request completed'};
const format=value=>Number(value||0).toFixed(2);
async function request(path,data){
  const response=await fetch(path,data?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)}:{cache:'no-store'});
  const result=await response.json();
  if(!response.ok){const error=new Error(result.error||'Please try again.');error.status=response.status;throw error;}
  return result;
}
function Quantity({value,onChange,label}){return <div className="rm-quantity"><button onClick={()=>onChange(value-1)} aria-label={`Remove one ${label}`}><MenuIcon name="minus" size={14}/></button><span>{value}</span><button disabled={value>=20} onClick={()=>onChange(value+1)} aria-label={`Add one ${label}`}><MenuIcon name="plus" size={14}/></button></div>;}
function Sheet({title,children,close,brand,logo,detail=false}){
  const ref=useRef(null);
  useEffect(()=>{
    const previous=document.activeElement;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    ref.current?.focus();
    function keydown(event){
      if(event.key==='Escape')close();
      if(event.key==='Tab'){
        const nodes=ref.current?.querySelectorAll('button:not(:disabled),a[href],input,textarea,select');
        if(!nodes?.length)return;
        const first=nodes[0],last=nodes[nodes.length-1];
        if(event.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){event.preventDefault();last.focus();}
        else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
      }
    }
    document.addEventListener('keydown',keydown);
    return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',keydown);previous?.focus?.();};
  },[close]);
  return <div className={`rm-overlay ${detail?'rg-detail-overlay':''}`} onClick={e=>{if(e.target===e.currentTarget)close();}}><section className={`rm-sheet ${detail?'rg-dish-sheet':''}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}><div className="rm-sheet-handle"/><header className={detail?'rg-detail-sheet-header':''}>{detail&&logo?<div className="rg-detail-brand"><Image src={logo} alt="" width={42} height={42} unoptimized/><span>{brand}<small>GOOD FOOD. GREAT COMPANY.</small></span></div>:<div><span className="rm-eyebrow">{brand} · AT YOUR SERVICE</span><h2>{title}</h2></div>}<button className="rm-icon-button" onClick={close} aria-label="Close"><MenuIcon name="close"/></button></header>{children}</section></div>;
}

export default function GuestMenu({restaurant,menus,branch,table,token,romina=false}){
  const [screen,setScreen]=useState('welcome');
  const [scheduleNow,setScheduleNow]=useState(undefined);
  const welcomeLogo=useRef(null);
  const headerLogo=useRef(null);
  const flyLogo=useLogoFlight();
  const [itemNotes,setItemNotes]=useState({});
  const [search,setSearch]=useState('');
  const [category,setCategory]=useState('all');
  const [diet,setDiet]=useState('all');
  const [cart,setCart]=useState({});
  const [notes,setNotes]=useState('');
  const [view,setView]=useState(null);
  const [selected,setSelected]=useState(null);
  const [quote,setQuote]=useState(null);
  const [quoteError,setQuoteError]=useState('');
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [receipt,setReceipt]=useState(null);
  const [service,setService]=useState(null);
  const pendingService=useRef({});
  const pendingOrder=useRef(null);
  const categories=useMemo(()=>menus.flatMap(m=>categoryRows(m.categories)),[menus]);
  const dishes=useMemo(()=>categories.flatMap(c=>c.items.map(i=>({...i,categoryName:c.name}))),[categories]);
  const documents=menus.filter(m=>m.documentUrl);
  const discovery=useMemo(()=>guestDiscovery(restaurant.settings?.guestContent,dishes,scheduleNow),[restaurant.settings?.guestContent,dishes,scheduleNow]);
  const heroPhoto=discovery.heroUrl||(romina?'/brand/romina-kitchen.webp':dishes.find(i=>i.photoUrl)?.photoUrl);
  const appearance=menuAppearance(restaurant.settings?.guestContent?.appearance);
  const glass=screen!=='welcome'&&appearance.style==='glass';
  const backdrop=menuBackground(appearance,discovery.heroUrl,romina?'/brand/romina-kitchen.webp':dishes.find(i=>i.photoUrl)?.photoUrl);
  const logo=romina?'/brand/romina-emblem.svg':brandLogoUrl(restaurant.logoUrl);
  const lines=useMemo(()=>dishes.filter(i=>cart[i.id]>0).map(i=>({itemId:i.id,quantity:cart[i.id]})),[dishes,cart]);
  const cartKey=JSON.stringify(lines);
  const combinedNotes=orderInstructions(lines,dishes,notes,itemNotes);
  const count=lines.reduce((sum,i)=>sum+i.quantity,0);
  const subtotal=lines.reduce((sum,i)=>sum+Number(dishes.find(d=>d.id===i.itemId).basePrice)*i.quantity,0);
  const liveQuote=quote?.key===cartKey?quote:null;
  const color=/^#[a-fA-F0-9]{6}$/.test(restaurant.primaryColor)?restaurant.primaryColor:'#D42028';
  const filtered=filterMenuCategories(categories,{category,diet,search});
  const roots=categories.filter(c=>!c.parentId);
  const currentCategory=categories.find(c=>c.id===category);
  const currentParent=currentCategory?.parentId||currentCategory?.id;
  const childCategories=categories.filter(c=>c.parentId===currentParent);
  const storageKey=`romina-table:${token||restaurant.slug}`;
  function store(nextCart,nextNotes,nextItemNotes=itemNotes){try{sessionStorage.setItem(storageKey,JSON.stringify({cart:nextCart,notes:nextNotes,itemNotes:nextItemNotes}));}catch{}}
  function navigate(destination){
    const change=()=>{setScreen(destination);setSearch('');setView(null);window.scrollTo({top:0,behavior:'instant'});};
    flyLogo(screen==='welcome'&&destination!=='welcome'?welcomeLogo.current?.querySelector('img'):null,change,()=>headerLogo.current?.querySelector('img'));

  }
  function selectCategory(id){setCategory(id);navigate('items');}
  function addDish(dish,amount,instructions){const next={...cart,[dish.id]:Math.min(20,(cart[dish.id]||0)+amount)};const nextNotes={...itemNotes,[dish.id]:instructions};setCart(next);setItemNotes(nextNotes);store(next,notes,nextNotes);close();}
  function quantity(id,value){
    const next={...cart,[id]:Math.max(0,Math.min(20,value))};setCart(next);setError('');setQuoteError('');store(next,notes);
  }
  useEffect(()=>{
    let timer;
    function refresh(){const now=Date.now();setScheduleNow(now);timer=setTimeout(refresh,nextDiscoveryChange(restaurant.settings?.guestContent,now));}
    timer=setTimeout(refresh,0);
    function visible(){if(!document.hidden){clearTimeout(timer);refresh();}}
    document.addEventListener('visibilitychange',visible);
    return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',visible);};
  },[restaurant.settings?.guestContent]);
  const close=useCallback(()=>{setView(null);setError('');},[]);
  useEffect(()=>{
    Promise.resolve().then(()=>{
      try{
        const saved=JSON.parse(sessionStorage.getItem(storageKey)||'{}');
        const valid=Object.fromEntries(Object.entries(saved.cart||{}).filter(([id,q])=>dishes.some(d=>d.id===id)&&Number.isInteger(q)&&q>0&&q<=20));
        setCart(valid);setNotes(typeof saved.notes==='string'?saved.notes.slice(0,500):'');
        setItemNotes(Object.fromEntries(Object.entries(saved.itemNotes||{}).filter(([id,note])=>dishes.some(dish=>dish.id===id)&&typeof note==='string').map(([id,note])=>[id,note.slice(0,300)])));
        const previous=sessionStorage.getItem(`${storageKey}:receipt`);
        if(token&&previous&&/^[A-Za-z0-9_-]{43}$/.test(previous))request(`/api/guest-status/order/${previous}`).then(setReceipt).catch(()=>{});
      }catch{}
    });
  },[storageKey,dishes,token]);
  useEffect(()=>{
    if(!token||!lines.length)return;
    let live=true;
    request(`/api/guest/${token}/quote`,{items:lines}).then(result=>{if(live){setQuote({...result,key:cartKey});setQuoteError('');}}).catch(e=>{if(live)setQuoteError(e.message);});
    return()=>{live=false;};
  },[token,cartKey,lines]);
  useEffect(()=>{
    if(!receipt?.reference)return;
    let live=true;
    const timer=setInterval(()=>request(`/api/guest-status/order/${receipt.reference}`).then(result=>{if(live)setReceipt(result);}).catch(()=>{}),10000);
    return()=>{live=false;clearInterval(timer);};
  },[receipt?.reference]);
  useEffect(()=>{
    if(!service?.reference)return;
    let live=true;
    const timer=setInterval(()=>request(`/api/guest-status/service/${service.reference}`).then(result=>{if(live)setService(result);}).catch(()=>{}),10000);
    return()=>{live=false;clearInterval(timer);};
  },[service?.reference]);
  async function submitOrder(){
    if(!token||!liveQuote||!lines.length)return;
    if(combinedNotes.length>500){setError('Please shorten your special instructions to 500 characters in total.');return;}
    setBusy(true);setError('');
    try{
      const fingerprint=JSON.stringify({items:[...lines].sort((a,b)=>a.itemId.localeCompare(b.itemId)),notes:combinedNotes,quoteVersion:liveQuote.version});
      let pending=pendingOrder.current;
      if(!pending)try{pending=JSON.parse(sessionStorage.getItem(`${storageKey}:pending`)||'null');}catch{}
      if(pending?.fingerprint!==fingerprint)pending={fingerprint,key:crypto.randomUUID()};
      pendingOrder.current=pending;
      try{sessionStorage.setItem(`${storageKey}:pending`,JSON.stringify(pending));}catch{}
      const result=await request(`/api/guest/${token}/order`,{items:lines,notes:combinedNotes,requestKey:pending.key,quoteVersion:liveQuote.version});
      setReceipt(result);setCart({});setNotes('');setItemNotes({});store({},'',{});
      pendingOrder.current=null;
      try{sessionStorage.setItem(`${storageKey}:receipt`,result.reference);sessionStorage.removeItem(`${storageKey}:pending`);}catch{}
      setView('receipt');
    }catch(e){
      setError(e.message);
      if(e.status===409){
        try{const updated=await request(`/api/guest/${token}/quote`,{items:lines});setQuote({...updated,key:cartKey});setQuoteError('');}
        catch(updateError){setQuoteError(updateError.message);}
      }
    }finally{setBusy(false);}
  }
  async function call(type){
    if(!token){setView('scan');return;}
    setBusy(true);setError('');
    pendingService.current[type]||=crypto.randomUUID();
    try{
      const result=await request(`/api/guest/${token}/service`,{type,requestKey:pendingService.current[type]});
      delete pendingService.current[type];setService(result);setView('service-sent');
    }catch(e){setError(e.message);setView('help');}finally{setBusy(false);}
  }
  function openDish(dish){setSelected(dish);setView('dish');}
  const listing=screen==='items'||Boolean(search.trim());
  return <main className={`rm-menu rg-experience ${screen==='welcome'?'rg-stage-welcome':''} ${glass?'rg-glass':''}`} style={{'--rm-red':color,...appearanceVariables(appearance)}}>
    {glass&&<MenuBackdrop src={backdrop} motion={appearance.motion}/>}
    {screen==='welcome'?<GuestWelcome logoRef={welcomeLogo} name={restaurant.name} logo={logo} hero={heroPhoto} table={table} branch={branch} enter={()=>navigate('menu')}/>:<>
      <header className="rm-header rg-header"><button className="rm-icon-button" aria-label={screen==='items'?'Back to categories':'Back to welcome'} onClick={()=>navigate(screen==='items'?'menu':'welcome')}><MenuIcon name="back"/></button><button ref={headerLogo} className="rg-header-logo" onClick={()=>navigate('menu')} aria-label="Menu home">{logo?<Image className="rm-brand-logo" src={logo} alt={restaurant.name} width={64} height={64} unoptimized priority/>:null}<span className="rg-brand-title"><strong>{restaurant.name}</strong><small>Good food. Great company.</small></span></button><button className="rm-header-cart rm-icon-button" onClick={()=>setView('cart')} aria-label={`Open cart, ${count} items`}><MenuIcon name="cart"/>{count>0&&<span>{count}</span>}</button></header>
      <div className="rm-main rg-main">{table&&<p className="rg-table-context"><MenuIcon name="pin" size={14}/>{branch} &middot; Table {table}</p>}
      {receipt&&<button className="rm-order-progress" onClick={()=>setView('receipt')}><span className="rm-progress-icon"><MenuIcon name={receipt.status==='COMPLETED'?'check':'clock'} size={19}/></span><span><small>Your latest order</small><strong>{statusLabels[receipt.status]}</strong></span><MenuIcon name="arrow" size={18}/></button>}
      {service&&service.status!=='RESOLVED'&&<button className="rm-service-progress" onClick={()=>setView('service-sent')}>{serviceTypes.find(t=>t[0]===service.type)?.[2]} · {statusLabels[service.status]} <MenuIcon name="arrow" size={15}/></button>}
      <label className="rm-search"><MenuIcon name="search" size={20}/><input type="search" aria-label="Search the menu" placeholder="Search menu items..." value={search} onChange={event=>setSearch(event.target.value)}/></label>
      {!listing?<><RecommendationSlider items={discovery.slides} recommended={Boolean(discovery.recommendations.length)} open={openDish}/><GuestEvents events={discovery.events}/><ParentCategories categories={roots} allCategories={categories} select={selectCategory}/>{!roots.length&&<div className="rm-empty"><h2>Our menu is being prepared.</h2><p>Please ask our team for today&apos;s choices.</p></div>}</>:<><div className="rg-section-heading"><div><span className="rg-kicker">FIND YOUR FAVOURITE</span><h1>{search?'Search results':currentCategory?.name||'Our menu'}</h1></div><button className="rg-back-link" onClick={()=>navigate('menu')}>All categories <MenuIcon name="menu" size={16}/></button></div>
      <nav className="rm-categories" aria-label="Menu categories"><button aria-pressed={category==='all'} className={category==='all'?'active':''} onClick={()=>setCategory('all')}><MenuIcon name="menu" size={16}/>All dishes</button>{roots.map(c=><button key={c.id} aria-pressed={category===c.id||currentCategory?.parentId===c.id} className={category===c.id||currentCategory?.parentId===c.id?'active':''} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</nav>
      {childCategories.length>0&&<nav className="rm-subcategories" aria-label="Child categories"><button aria-pressed={category===currentParent} className={category===currentParent?'active':''} onClick={()=>setCategory(currentParent)}>All {categories.find(c=>c.id===currentParent)?.name}</button>{childCategories.map(c=><button key={c.id} aria-pressed={category===c.id} className={category===c.id?'active':''} onClick={()=>setCategory(c.id)}>{c.name}</button>)}</nav>}
      <div className="rm-diet-filters" role="group" aria-label="Dietary filters"><span>Dietary preference</span><div>{[['all','All'],['VEGAN','Vegan'],['NON_VEGAN','Non-vegan']].map(([value,label])=><button key={value} aria-pressed={diet===value} className={diet===value?'active':''} onClick={()=>setDiet(value)}>{value==='VEGAN'&&<span className="rm-vegan-dot" aria-hidden="true"/>}{label}</button>)}</div></div>
      {filtered.map(c=><section className="rm-category" key={c.id}><div className="rm-category-title"><h2>{c.parentId&&<span className="rm-parent-name">{categories.find(parent=>parent.id===c.parentId)?.name} / </span>}{c.name}</h2><span>{c.items.length} {c.items.length===1?'dish':'dishes'}</span></div><div className="rm-dish-grid rg-dish-list">{c.items.map(i=><GuestDishCard key={i.id} dish={i} category={c.name} currency={restaurant.settings?.currency||'ETB'} open={openDish} controls={cart[i.id]>0?<Quantity value={cart[i.id]} onChange={q=>quantity(i.id,q)} label={i.name}/>:<button className="rm-add" disabled={!i.available} onClick={()=>quantity(i.id,1)} aria-label={`Add ${i.name} to order`}><MenuIcon name="plus" size={18}/><span>Add</span></button>}/>)}</div></section>)}
      {!filtered.length&&<div className="rm-empty"><MenuIcon name="search" size={32}/><h3>No matching dishes.</h3><p>Try another search, dietary preference, or category.</p></div>}</>}
      {documents.length>0&&<details className="rm-menu-files"><summary>Prefer our printed menu? <span>View menu files</span></summary>{documents.map((menu,i)=><a key={i} href={menu.documentUrl} target="_blank" rel="noreferrer">View {menu.name}</a>)}</details>}
      <footer className="rm-menu-footer"><strong>Made to be enjoyed. Shared to be remembered.</strong><p>Please let our team know about any food allergies.</p><small>ETB prices · Tax {String(restaurant.settings?.taxRate||'0')}% · Service {String(restaurant.settings?.serviceChargeRate||'0')}%. Both are calculated on the item subtotal.</small></footer>
      </div></>}
    <GuestActions count={count} total={format(liveQuote?.total||subtotal)} busy={busy} menu={()=>navigate('menu')} cart={()=>setView('cart')} call={call} help={()=>setView('help')}/>
    {view&&<Sheet logo={logo} detail={view==='dish'} brand={restaurant.name} title={view==='cart'?'Your order':view==='dish'?selected.name:view==='receipt'?'Your table, your order':view==='service-sent'?'We’ve received your request':view==='scan'?'Join us at the table':'How can we help?'} close={close}>
      {view==='dish'&&selected&&<GuestDishDetail key={selected.id} dish={selected} inCart={cart[selected.id]||0} note={itemNotes[selected.id]||''} add={addDish}/>}
      {view==='cart'&&<div className="rm-cart-sheet">{count? <><p className="rm-cart-context"><MenuIcon name="pin" size={16}/>{table?`${branch} · Table ${table}`:'Scan your table’s QR code to place this order.'}</p>{lines.map(line=>{const dish=dishes.find(d=>d.id===line.itemId);return <div className="rm-cart-line" key={line.itemId}>{dish.photoUrl?<Image src={dish.photoUrl} alt={dish.name} width={70} height={70} unoptimized/>:<span className="rm-cart-placeholder"><MenuIcon name="cutlery"/></span>}<div><strong>{liveQuote?.items.find(i=>i.menuItemId===line.itemId)?.name||dish.name}</strong><small>{format(liveQuote?.items.find(i=>i.menuItemId===line.itemId)?.unitPrice||dish.basePrice)} ETB</small>{itemNotes[dish.id]&&<small className="rg-cart-instructions">{itemNotes[dish.id]}</small>}</div><Quantity value={line.quantity} onChange={q=>quantity(dish.id,q)} label={dish.name}/></div>;})}<label className="rm-notes">Make it just right<textarea placeholder="Any special instructions? Tell our kitchen…" maxLength={500} value={notes} onChange={e=>{setNotes(e.target.value);store(cart,e.target.value);}} rows={2}/><small>For allergies, please also speak directly with your waiter.</small></label><dl className="rm-totals"><div><dt>Subtotal</dt><dd>{format(liveQuote?.subtotal||subtotal)} ETB</dd></div>{liveQuote&&<><div><dt>Tax ({liveQuote.taxRate}%)</dt><dd>{format(liveQuote.taxAmount)} ETB</dd></div><div><dt>Service ({liveQuote.serviceChargeRate}%)</dt><dd>{format(liveQuote.serviceAmount)} ETB</dd></div></>}<div className="rm-total"><dt>{liveQuote?'Total':'Estimated subtotal'}</dt><dd>{format(liveQuote?.total||subtotal)} ETB</dd></div></dl>{quoteError&&<p className="rm-error" role="alert">{quoteError}</p>}{!token&&<p className="rm-soft-note">You’re browsing our public menu. Scan the QR at your table to send an order or ask a waiter for help.</p>}<button className="rm-primary rm-full" disabled={busy||!token||!liveQuote||Boolean(quoteError)} onClick={submitOrder}>{busy?'Sending your order…':'Place order'}<MenuIcon name="arrow" size={19}/></button><p className="rm-payment-note">Your order goes to our team for acceptance. Pay at the restaurant.</p></>:<div className="rm-empty"><MenuIcon name="cart" size={40}/><h3>A good meal starts with a good choice.</h3><p>Add a dish you love and we’ll keep it here.</p><button className="rm-primary" onClick={close}>Explore the menu<MenuIcon name="arrow" size={18}/></button></div>}</div>}
      {view==='help'&&<div className="rm-help-list"><p className="rm-soft-note">{table?`Let our team know what you need at table ${table}.`:'Table service is available when you scan the QR at your table.'}</p>{serviceTypes.map(([type,icon,label,description])=><button disabled={busy} onClick={()=>call(type)} key={type}><span className="rm-help-icon"><MenuIcon name={icon}/></span><span><strong>{label}</strong><small>{description}</small></span><MenuIcon name="arrow" size={18}/></button>)}</div>}
      {view==='scan'&&<div className="rm-empty"><MenuIcon name="pin" size={38}/><h3>A little closer to your table.</h3><p>Scan your table’s QR code to place an order, call a waiter, or request your bill. Our team can help you find it.</p><button className="rm-primary" onClick={close}>Back to the menu</button></div>}
      {view==='service-sent'&&service&&<div className="rm-confirmation"><span className="rm-confirm-icon"><MenuIcon name="check" size={32}/></span><h3>{statusLabels[service.status]}</h3><p>{service.type==='BILL'?'Your bill request is on our team’s service list.':'Our team can now see your request.'}</p><span className="rm-confirm-table">{branch} · Table {table}</span><button className="rm-primary rm-full" onClick={close}>Back to the menu<MenuIcon name="arrow" size={18}/></button></div>}
      {view==='receipt'&&receipt&&<div className="rm-receipt"><div className="rm-receipt-status"><span className="rm-confirm-icon"><MenuIcon name={receipt.status==='COMPLETED'?'check':'clock'} size={30}/></span><h3>{statusLabels[receipt.status]}</h3><p>Table {receipt.table} · Updates refresh automatically</p></div>{receipt.items.map((i,index)=><div className="rm-receipt-line" key={index}><span>{i.quantity} × {i.name}</span><strong>{format(i.lineTotal)} ETB</strong></div>)}<dl className="rm-totals"><div><dt>Subtotal</dt><dd>{format(receipt.subtotal)} ETB</dd></div><div><dt>Tax</dt><dd>{format(receipt.taxAmount)} ETB</dd></div><div><dt>Service</dt><dd>{format(receipt.serviceAmount)} ETB</dd></div><div className="rm-total"><dt>Total</dt><dd>{format(receipt.total)} ETB</dd></div></dl><p className="rm-payment-note">No online payment has been taken. Your waiter will help you with payment.</p><button className="rm-primary rm-full" onClick={close}>Keep exploring<MenuIcon name="arrow" size={18}/></button></div>}
      {error&&<p className="rm-error" role="alert">{error}</p>}
    </Sheet>}
  </main>;
}

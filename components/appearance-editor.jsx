"use client";

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import UploadField from './upload-field';
import MenuBackdrop from './menu-backdrop';
import MenuIcon from './menu-icons';
import {appearanceVariables,menuAppearance,menuBackground} from '@/modules/menus/appearance.mjs';
import {guestDiscovery} from '@/modules/menus/discovery.mjs';

export default function AppearanceEditor({restaurant,save}){
  const content=restaurant.settings.guestContent||{};
  const [appearance,setAppearance]=useState(()=>menuAppearance(content.appearance));
  const [uploading,setUploading]=useState(false);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [previewTime]=useState(()=>Date.now());
  const background=menuBackground(appearance,guestDiscovery(content,[],previewTime).heroUrl,'/brand/romina-kitchen.webp');
  const glass=appearance.style==='glass';
  function update(key,value){setAppearance(previous=>({...previous,[key]:value}));setMessage('');}
  async function submit(event){
    event.preventDefault();setBusy(true);setError('');setMessage('');
    try{await save(appearance);setMessage('Appearance saved. Open the guest menu to see your design.');}
    catch(failure){setError(failure.message);}finally{setBusy(false);}
  }
  return <section className="panel appearance-editor"><div className="section-heading"><div><span className="eyebrow">THE ROMINA EXPERIENCE</span><h2>Menu appearance</h2><p className="small muted">Your setting, your atmosphere. Choose the backdrop your guests will see.</p></div><Link className="secondary" href={`/r/${restaurant.slug}/menu`} target="_blank">Open guest menu ↗</Link></div>
    <div className="appearance-layout"><form onSubmit={submit} className="appearance-controls"><fieldset className="appearance-style"><legend>Design</legend>{[['glass','Floating glass','A photograph behind soft, translucent panels.'],['classic','Classic white','A clean white canvas with Romina red accents.']].map(([value,label,description])=><label key={value} className={appearance.style===value?'selected':''}><input type="radio" name="style" value={value} checked={appearance.style===value} onChange={()=>update('style',value)}/><span><strong>{label}</strong><small>{description}</small></span></label>)}</fieldset>
      <label className="field">Menu background source<select aria-label="Menu background source" value={appearance.useWelcomeBackground?'scheduled':'custom'} onChange={event=>update('useWelcomeBackground',event.target.value==='scheduled')}><option value="scheduled">Use active welcome background</option><option value="custom">Choose a separate menu image</option></select><small className="muted">The active welcome background follows your image library schedules and events. A Romina kitchen image is used until you choose one.</small></label>
      <UploadField name="backgroundUrl" label="Menu background" initialValue={appearance.backgroundUrl} restaurantId={restaurant.id} kind="dish" onBusy={setUploading} onChange={url=>{update('backgroundUrl',url);if(url)update('useWelcomeBackground',false);}}/>
      {appearance.useWelcomeBackground&&<p className="small muted">Choose “a separate menu image” above to show this upload on your menu.</p>}
      <div className="appearance-sliders">{[['overlay','Background brightness',20,85,'%'],['panelOpacity','Glass opacity',60,95,'%'],['blur','Glass softness',0,28,'']].map(([key,label,min,max,unit])=><label key={key} className="field"><span>{label}<output>{appearance[key]}{unit}</output></span><input aria-label={label} type="range" min={min} max={max} value={appearance[key]} disabled={!glass} onChange={event=>update(key,Number(event.target.value))}/></label>)}</div>
      <label className="check"><input type="checkbox" checked={appearance.motion} disabled={!glass} onChange={event=>update('motion',event.target.checked)}/>Gentle background movement</label><p className="small muted">Guests who prefer reduced motion see a still image. Your welcome animation and table actions stay in place.</p>
      {error&&<p className="error" role="alert">{error}</p>}{message&&<p className="appearance-success" role="status">{message}</p>}<div className="form-actions"><button disabled={busy||uploading}>{busy?'Saving…':'Save appearance'}</button></div>
    </form><div className="appearance-preview-wrap"><div className="appearance-preview-caption"><span>LIVE PREVIEW</span><span>Menu screen</span></div><div className={`rg-experience rg-preview ${glass?'rg-glass':''}`} style={appearanceVariables(appearance)}>
      {glass&&<MenuBackdrop src={background} motion={appearance.motion}/>}
      <div className="rg-preview-content"><header className="rg-header"><MenuIcon name="back" size={18}/><div className="rg-preview-brand"><Image src="/brand/romina-emblem.svg" alt="" width={44} height={44}/><span>{restaurant.name}<small>GOOD FOOD. GREAT COMPANY.</small></span></div><MenuIcon name="cart" size={20}/></header><label className="rm-search"><MenuIcon name="search" size={17}/><span>Search menu items…</span></label><div className="rg-section-heading"><div><span className="rg-kicker">FRESH FROM OUR KITCHEN</span><h2>Explore our menu</h2></div></div><div className="rg-slide"><Image src="/brand/romina-kitchen.webp" alt="" fill sizes="380px"/><div className="rg-slide-shade"/><div className="rg-slide-copy"><span>MADE TO BE SHARED</span><h3>A taste of Romina</h3><p>Good food, warm company. Discover your next favourite.</p><span className="rg-preview-button">View more <MenuIcon name="arrow" size={16}/></span></div></div><div className="rg-section-heading"><div><span className="rg-kicker">SOMETHING FOR EVERY APPETITE</span><h2>Find your favourite</h2></div></div><div className="rg-parent-card"><Image src="/brand/romina-table.webp" alt="" width={70} height={70}/><span><strong>From our kitchen</strong><small>Discover the menu</small></span><MenuIcon name="arrow" size={18}/></div><div className="rg-preview-more">•••<small>More</small></div></div>
    </div><p className="small muted">Illustrative preview. Your guest menu keeps your real dishes, prices, and categories.</p></div></div>
  </section>;
}

"use client";

import {useState} from 'react';
import Image from 'next/image';
import MenuIcon from './menu-icons';
import {dietaryLabel} from '@/modules/menus/taxonomy.mjs';

export default function GuestDishDetail({dish,inCart,note,add}){
  const [quantity,setQuantity]=useState(1);
  const [instructions,setInstructions]=useState(note||'');
  const limit=Math.max(0,20-inCart);
  const amount=Number(dish.basePrice)*quantity;
  return <div className="rg-detail">
    {dish.photoUrl&&<Image className="rg-detail-photo" src={dish.photoUrl} alt={dish.name} width={900} height={675} unoptimized/>}
    <div className="rg-detail-heading"><div><span className="rg-kicker">{dish.categoryName}</span><h3>{dish.name}</h3></div><strong>ETB {Number(dish.basePrice).toFixed(2)}</strong></div>
    <p>{dish.description||'Prepared fresh by our kitchen.'}</p><div className="rg-detail-labels">{dish.dietaryType&&dish.dietaryType!=='UNSPECIFIED'&&<span className={`dietary-badge ${dish.dietaryType==='VEGAN'?'vegan':''}`}>{dietaryLabel(dish.dietaryType)}</span>}{dish.dietaryLabels.map(label=><span className="dietary-badge" key={label}>{label}</span>)}</div>
    {dish.allergens.length>0&&<p className="rm-allergens">Contains: {dish.allergens.join(', ')}</p>}
    <div className="rg-detail-quantity" aria-label="Dish quantity"><button className="rm-icon-button" aria-label="Decrease dish quantity" disabled={quantity<=1} onClick={()=>setQuantity(value=>Math.max(1,value-1))}><MenuIcon name="minus" size={17}/></button><output aria-label="Selected quantity">{quantity}</output><button className="rm-icon-button" aria-label="Increase dish quantity" disabled={quantity>=limit} onClick={()=>setQuantity(value=>Math.min(limit,value+1))}><MenuIcon name="plus" size={17}/></button></div>
    <label className="rg-special-instructions">Special instructions <small>(optional)</small><textarea rows={3} maxLength={300} placeholder="For example, less spicy or no onions…" value={instructions} onChange={event=>setInstructions(event.target.value)}/></label>
    <p className="rg-allergy-note">For allergies, please also speak directly with your waiter.</p><button className="rm-primary rm-full rg-detail-add" disabled={!dish.available||limit===0} onClick={()=>add(dish,quantity,instructions)}>{!dish.available?'Currently unavailable':limit===0?'Maximum quantity in your order':`Add to cart · ETB ${amount.toFixed(2)}`}</button>
    {dish.photoUrl&&<a className="rm-photo-original" href={dish.photoUrl} target="_blank" rel="noreferrer">Open full image <MenuIcon name="arrow" size={14}/></a>}
  </div>;
}

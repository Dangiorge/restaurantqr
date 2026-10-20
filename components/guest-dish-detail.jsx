"use client";

import {useState} from 'react';
import DishPhoto from './dish-photo';
import MenuIcon from './menu-icons';
import {dietaryLabel} from '@/modules/menus/taxonomy.mjs';

export default function GuestDishDetail({dish,inCart,note,add}){
  const [quantity,setQuantity]=useState(1);
  const [instructions,setInstructions]=useState(note||'');
  const [fullPhoto,setFullPhoto]=useState(false);
  const limit=Math.max(0,20-inCart);
  const amount=Number(dish.basePrice)*quantity;
  return <div className="rg-detail">
    <div className="rg-detail-scroll">
      <div className="rg-detail-hero"><DishPhoto src={dish.photoUrl} alt={dish.name} full={fullPhoto} imageClassName="rg-detail-photo" priority/><div className="rg-detail-photo-shade"/>{dish.photoUrl&&<button className="rg-full-photo" aria-label={fullPhoto?'Fill photo frame':'View full photo'} aria-pressed={fullPhoto} onClick={()=>setFullPhoto(value=>!value)}><MenuIcon name={fullPhoto?'contract':'expand'} size={16}/>{fullPhoto?'Fill frame':'Full photo'}</button>}</div>
      <div className="rg-detail-body"><div className="rg-detail-heading"><div><span className="rg-kicker">{dish.categoryName||'FROM OUR KITCHEN'}</span><h3>{dish.name}</h3></div><strong><small>ETB</small>{Number(dish.basePrice).toFixed(2)}</strong></div>
        <div className="rg-detail-rule" aria-hidden="true"><span/></div>
        <p className="rg-detail-description">{dish.description||'Prepared fresh by our kitchen.'}</p>
        <div className="rg-detail-labels">{dish.dietaryType&&dish.dietaryType!=='UNSPECIFIED'&&<span className={`dietary-badge ${dish.dietaryType==='VEGAN'?'vegan':''}`}>{dish.dietaryType==='VEGAN'&&<span className="rm-vegan-dot"/>}{dietaryLabel(dish.dietaryType)}</span>}{dish.dietaryLabels.map(label=><span className="dietary-badge" key={label}>{label}</span>)}</div>
        {dish.allergens.length>0&&<p className="rm-allergens">Contains: {dish.allergens.join(', ')}</p>}
        <div className="rg-detail-quantity-row"><span>Make it yours<small>How many would you like?</small></span><div className="rg-detail-quantity" aria-label="Dish quantity"><button className="rm-icon-button" aria-label="Decrease dish quantity" disabled={quantity<=1} onClick={()=>setQuantity(value=>Math.max(1,value-1))}><MenuIcon name="minus" size={17}/></button><output aria-label="Selected quantity">{quantity}</output><button className="rm-icon-button" aria-label="Increase dish quantity" disabled={quantity>=limit} onClick={()=>setQuantity(value=>Math.min(limit,value+1))}><MenuIcon name="plus" size={17}/></button></div></div>
        <label className="rg-special-instructions">A little detail, just for you <small>Special instructions (optional)</small><textarea aria-label="Special instructions" rows={3} maxLength={300} placeholder="Less spicy, no onions… tell our kitchen." value={instructions} onChange={event=>setInstructions(event.target.value)}/></label>
        <p className="rg-allergy-note">For allergies, please also speak directly with your waiter.</p>
      </div>
    </div>
    <div className="rg-detail-purchase"><button className="rm-primary rm-full rg-detail-add" disabled={!dish.available||limit===0} onClick={()=>add(dish,quantity,instructions)}><span>{!dish.available?'Currently unavailable':limit===0?'Maximum quantity in your order':'Add to cart'}<small>{dish.available&&limit>0?'Made to be enjoyed.':''}</small></span><strong>ETB {amount.toFixed(2)}<MenuIcon name="plus" size={20}/></strong></button></div>
  </div>;
}

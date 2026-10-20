"use client";

import DishPhoto from './dish-photo';
import MenuIcon from './menu-icons';
import useEntrance from './use-entrance';
import {dietaryLabel} from '@/modules/menus/taxonomy.mjs';

export default function GuestDishCard({dish,category,currency,open,controls}){
  const ref=useEntrance();
  const view=()=>open({...dish,categoryName:category});
  return <article ref={ref} data-enter="dish" className={`rm-dish rg-editorial-dish ${!dish.available?'rm-sold-out':''}`}>
    <button className="rm-dish-visual" onClick={view} aria-label={`View ${dish.name}`}>
      <DishPhoto src={dish.photoUrl} alt={dish.name} imageClassName="rm-dish-photo"/>
      <span className="rg-photo-corner"><MenuIcon name="expand" size={16}/></span>
      {!dish.available&&<span className="rm-sold-label">Sold out</span>}
    </button>
    <div className="rm-dish-info"><div className="rm-dish-meta"><span className="rm-dish-category">{category}</span>{dish.dietaryType&&dish.dietaryType!=='UNSPECIFIED'&&<span className={`dietary-badge ${dish.dietaryType==='VEGAN'?'vegan':''}`}>{dietaryLabel(dish.dietaryType)}</span>}</div>
      <button className="rm-dish-name" onClick={view}><h3>{dish.name}</h3></button><p>{dish.description||'Prepared for you, from our kitchen.'}</p>
      <button className="rg-dish-explore" onClick={view} aria-label={`View more about ${dish.name}`}><span>View more</span><span className="rg-explore-arrow"><MenuIcon name="arrow" size={15}/></span></button>
      <div className="rm-dish-bottom"><span className="dish-price">{Number(dish.basePrice).toFixed(2)} <small>{currency}</small></span>{controls}</div>
    </div>
  </article>;
}

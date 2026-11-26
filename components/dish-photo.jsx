"use client";

import {useState} from 'react';
import Image from 'next/image';
import MenuIcon from './menu-icons';
import {imageProps} from '@/lib/image.mjs';

// Center-crop without stretching. Full-photo mode keeps the complete image
// over a soft copy of the same photograph, rather than empty side bands.
export default function DishPhoto({src,alt,full=false,className='',imageClassName='',sizes='(max-width:760px) 100vw, 700px',priority=false}){
  const [failed,setFailed]=useState(null);
  const available=Boolean(src)&&failed!==src;
  return <span className={`rg-food-photo ${full?'rg-show-full':''} ${className}`}>
    {available?<><Image className="rg-food-backfill" {...imageProps(src,120)} alt="" aria-hidden="true" fill sizes="96px"/><Image className={`rg-food-image ${imageClassName}`} {...imageProps(src,1400)} alt={alt} fill sizes={sizes} priority={priority} onError={()=>setFailed(src)}/></>:<span className="rg-food-placeholder"><MenuIcon name="cutlery" size={34}/><span>Fresh from our kitchen</span></span>}
  </span>;
}

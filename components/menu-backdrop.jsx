import Image from 'next/image';
import {imageProps} from '@/lib/image.mjs';

export default function MenuBackdrop({src,motion=true}){
  return <div className={`rg-menu-backdrop ${motion?'rg-backdrop-motion':''}`} aria-hidden="true">{src&&<Image {...imageProps(src,2000)} alt="" fill priority sizes="100vw"/>}<div className="rg-menu-veil"/></div>;
}

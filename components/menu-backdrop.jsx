import Image from 'next/image';

export default function MenuBackdrop({src,motion=true}){
  return <div className={`rg-menu-backdrop ${motion?'rg-backdrop-motion':''}`} aria-hidden="true">{src&&<Image src={src} alt="" fill unoptimized priority sizes="100vw"/>}<div className="rg-menu-veil"/></div>;
}

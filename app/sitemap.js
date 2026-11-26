import {appOrigin} from '@/lib/app-origin.mjs';

export default function sitemap(){
  const origin=appOrigin();
  return [
    {url:`${origin}/`,changeFrequency:'weekly',priority:1},
    {url:`${origin}/menu`,changeFrequency:'weekly',priority:.8},
  ];
}

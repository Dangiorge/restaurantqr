import {appOrigin} from '@/lib/app-origin.mjs';

export default function robots(){
  const origin=appOrigin();
  return {
    rules:{userAgent:'*',allow:'/',disallow:['/workspace','/api/','/q/','/print/']},
    sitemap:`${origin}/sitemap.xml`,
  };
}

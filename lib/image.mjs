// Image sources for next/image:
// - Our own /public files go through the Next.js optimiser (resized, WebP).
// - Cloudinary uploads are resized by Cloudinary's CDN via URL transformations, so the
//   browser fetches a right-sized, auto-format file directly (no server round trip).
// - SVGs and any other host are served unchanged.
export function imageProps(src,width){
  if(typeof src!=='string'||!src)return {src,unoptimized:true};
  if(/\.svg(\?|$)/i.test(src))return {src,unoptimized:true};
  if(src.startsWith('/')&&!src.startsWith('//'))return {src,unoptimized:false};
  try{
    const url=new URL(src);
    if(url.hostname==='res.cloudinary.com'&&url.pathname.includes('/image/upload/')&&width){
      url.pathname=url.pathname.replace('/image/upload/',`/image/upload/f_auto,q_auto,c_limit,w_${Math.round(width)}/`);
      return {src:url.toString(),unoptimized:true};
    }
  }catch{/* Not a URL: serve as given. */}
  return {src,unoptimized:true};
}

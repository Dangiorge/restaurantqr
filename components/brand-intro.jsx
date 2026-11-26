import '@/app/brand-intro.css';
import Image from 'next/image';
import ReadySignal from './ready-signal';

// Runs while the HTML is still arriving, before React loads, so the loading screen
// can show real progress: page parsed, first-screen images, fonts, full load, and
// hydration. Progress lives in CSS variables on <html> (not in React-rendered markup)
// so it never conflicts with hydration. A 12s ceiling means it can never trap a visitor.
const loader=`(function(){
var d=document,h=d.documentElement,shown=0,target=0,start=performance.now(),done=false;
var stage={dom:0,img:0,font:0,load:0,ready:0},repeat=false;
try{repeat=!!sessionStorage.getItem('romina-loaded');}catch(e){}
var minTime=repeat?450:1300;
h.setAttribute('data-romina-entry','loading');
function aim(){target=Math.min(100,stage.dom*10+stage.img*45+stage.font*15+stage.load*20+stage.ready*10);}
function paint(){
if(done)return;
if(shown<target)shown=Math.min(target,shown+Math.max(.35,(target-shown)*.12));
h.style.setProperty('--romina-progress',(shown/100).toFixed(3));
h.style.setProperty('--romina-pct',String(Math.floor(shown)));
if(shown>=100&&performance.now()-start>=minTime){finish();return;}
requestAnimationFrame(paint);
}
function finish(){
done=true;
try{sessionStorage.setItem('romina-loaded','1');}catch(e){}
h.setAttribute('data-romina-entry','revealing');
setTimeout(function(){h.setAttribute('data-romina-entry','done');},1500);
}
function images(){
var list=[].slice.call(d.images).filter(function(image){
if(image.closest('.romina-intro'))return false;
if(image.getAttribute('fetchpriority')==='high')return true;
var box=image.getBoundingClientRect();
return image.loading!=='lazy'&&box.top<innerHeight*1.2&&box.bottom>0;
});
if(!list.length){stage.img=1;aim();return;}
var left=list.length;
function one(){left--;stage.img=1-left/list.length;aim();}
list.forEach(function(image){if(image.complete)one();else{image.addEventListener('load',one,{once:true});image.addEventListener('error',one,{once:true});}});
}
function parsed(){stage.dom=1;aim();images();}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',parsed,{once:true});else parsed();
if(d.fonts&&d.fonts.ready)d.fonts.ready.then(function(){stage.font=1;aim();});else stage.font=1;
if(d.readyState==='complete')stage.load=1;else addEventListener('load',function(){stage.load=1;aim();},{once:true});
if(window.__rominaReady)stage.ready=1;else addEventListener('romina:ready',function(){stage.ready=1;aim();},{once:true});
setTimeout(function(){if(!done){stage={dom:1,img:1,font:1,load:1,ready:1};aim();}},12000);
aim();requestAnimationFrame(paint);
})();`;

export default function BrandIntro(){
  return <>
    <script dangerouslySetInnerHTML={{__html:loader}}/>
    <noscript><style>{'.romina-intro{display:none!important}'}</style></noscript>
    <div className="romina-intro" aria-hidden="true">
      <div className="romina-intro-stage">
        <span className="romina-intro-origin">ADDIS ABABA <span/> SINCE 1973</span>
        <div className="romina-intro-plate">
          <svg className="romina-intro-ring" viewBox="0 0 360 360" fill="none"><circle cx="180" cy="180" r="178"/><circle cx="180" cy="180" r="161" pathLength="100"/></svg>
          <Image src="/brand/romina-logo.svg" alt="" width={240} height={204} unoptimized priority/>
        </div>
        <span className="romina-intro-signature">Good food. Great company.</span>
        <div className="romina-intro-progress"><span className="romina-intro-bar"><i/></span><span className="romina-intro-pct"/></div>
      </div>
    </div>
    <ReadySignal/>
  </>;
}

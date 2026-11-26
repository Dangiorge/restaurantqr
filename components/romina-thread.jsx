"use client";

import '@/app/romina-thread.css';
import {Children,cloneElement,useEffect,useRef} from 'react';
import {useSiteMotionPaused} from './site-motion';
import MenuIcon from './menu-icons';

const FOUNDED=1973;
const RULER=[1960,2030];

function Ink({children,viewBox='0 0 240 180'}){
  let order=0;
  return <svg className="rt-ink" viewBox={viewBox} aria-hidden="true">{Children.map(children,child=>child.type==='text'?child:cloneElement(child,{pathLength:1,style:{'--i':order++}}))}</svg>;
}

function School(){
  return <Ink>
    <path d="M10 160H230"/>
    <path d="M40 82 120 36l80 46"/>
    <rect x="50" y="80" width="140" height="80"/>
    <rect x="105" y="20" width="30" height="22"/>
    <path d="M100 22 120 6l20 16"/>
    <circle className="rt-red" cx="120" cy="32" r="5"/>
    <path d="M108 160v-36a12 12 0 0 1 24 0v36"/>
    <rect x="62" y="98" width="26" height="22"/>
    <rect x="152" y="98" width="26" height="22"/>
    <path d="M75 98v22M62 109h26M165 98v22M152 109h26"/>
    <rect x="12" y="108" width="32" height="26"/>
    <path d="M17 134l-4 26M39 134l4 26"/>
    <path className="rt-red" d="M18 128l4-12 4 12M19.5 124h5M31 116v12M31 116h4a3 3 0 0 1 0 6h-4M31 122h4.5a3 3 0 0 1 0 6H31"/>
  </Ink>;
}

function Jebena(){
  return <Ink>
    <path d="M10 162H230"/>
    <ellipse cx="120" cy="156" rx="38" ry="6"/>
    <path d="M95 152c-17-22-9-48 25-51 34 3 42 29 25 51z"/>
    <path d="M112 102c-2-18-2-36 2-52M128 102c2-18 2-36-2-52"/>
    <path d="M110 50h20"/>
    <path d="M112 68c-22 0-30 30-18 46"/>
    <path d="M149 128c15-6 23-20 31-30M152 138c16-8 24-24 31-36M180 98l3 4"/>
    <path className="rt-red" d="M116 42c-6-8 6-12 0-22M126 40c-6-8 6-12 0-20"/>
    <path d="M30 142h24l-3 15H33z"/>
    <path d="M188 142h24l-3 15h-18z"/>
    <path className="rt-red" d="M42 136c-3-5 3-7 0-12M200 136c-3-5 3-7 0-12"/>
  </Ink>;
}

function SnackShop(){
  return <Ink>
    <path d="M10 160H230"/>
    <path d="M40 160V70h160v90"/>
    <path className="rt-red" d="M32 70h176l-12 22H44z"/>
    <path className="rt-red" d="M44 92q9.5 9 19 0q9.5 9 19 0q9.5 9 19 0q9.5 9 19 0q9.5 9 19 0q9.5 9 19 0q9.5 9 19 0q9.5 9 19 0"/>
    <path className="rt-red" d="M66 70l7 22M98 70l3 22M130 70l-1 22M162 70l-6 22M190 70l-10 22"/>
    <rect x="76" y="40" width="88" height="22"/>
    <text x="120" y="55">SHEWAYE</text>
    <rect x="56" y="104" width="80" height="32"/>
    <path d="M50 136h92"/>
    <rect x="64" y="118" width="12" height="18" rx="3"/>
    <rect x="82" y="113" width="12" height="23" rx="3"/>
    <path d="M102 136q11-14 22 0"/>
    <rect x="156" y="102" width="32" height="58"/>
    <circle cx="181" cy="132" r="2"/>
  </Ink>;
}

function Restaurant(){
  return <Ink>
    <path d="M10 160H230"/>
    <path d="M28 160V58h184v102"/>
    <rect x="22" y="48" width="196" height="10"/>
    <rect x="70" y="20" width="100" height="24"/>
    <text x="120" y="37">ROMINA</text>
    <path className="rt-red" d="M28 68q23 9 46 0q23 9 46 0q23 9 46 0q23 9 46 0"/>
    <rect x="40" y="82" width="54" height="44"/>
    <rect x="146" y="82" width="54" height="44"/>
    <path d="M52 116h30M58 116v10M76 116v10M158 116h30M164 116v10M182 116v10"/>
    <path className="rt-red" d="M98 92h44l-5-9h-34z"/>
    <rect x="104" y="92" width="32" height="68"/>
    <path d="M120 92v68"/>
    <path className="rt-dot" d="M115 128h.1M125 128h.1"/>
    <circle className="rt-red" cx="206" cy="24" r="17"/>
    <text className="rt-stamp-text" x="206" y="27.5">1973</text>
  </Ink>;
}

function SecondHome(){
  return <Ink>
    <path d="M10 160H230"/>
    <path d="M120 2v20"/>
    <path d="M106 32q14-18 28 0z"/>
    <path className="rt-red" d="M112 40l-4 6M120 42v7M128 40l4 6"/>
    <path d="M66 112h108"/>
    <path d="M78 112v48M162 112v48"/>
    <path d="M100 112v-9h14v9M114 105a4 4 0 0 1 0 6M128 112v-9h14v9M142 105a4 4 0 0 1 0 6"/>
    <path d="M36 160V98M36 124h24v36"/>
    <path d="M204 160V98M204 124h-24v36"/>
    <path d="M22 50a8 8 0 0 1 8-8h44a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8H48L38 82V72h-8a8 8 0 0 1-8-8z"/>
    <path className="rt-dot" d="M40 57h.1M52 57h.1M64 57h.1"/>
    <path d="M158 54a8 8 0 0 1 8-8h44a8 8 0 0 1 8 8v14a8 8 0 0 1-8 8h-8v10l-10-10h-26a8 8 0 0 1-8-8z"/>
    <path className="rt-red" d="M188 58c-3-5-11-2-7 4l7 7 7-7c4-6-4-9-7-4z"/>
  </Ink>;
}

// Small pictures the string draws in one continuous line. Each starts and ends at
// its anchor (0,0) so the thread can carry straight on to the next chapter.
const glyphs={
  book:[['C',-8,-5,-20,-5,-28,-1],['L',-28,-36],['C',-20,-40,-8,-40,0,-35],['L',0,0],['C',8,-5,20,-5,28,-1],['L',28,-36],['C',20,-40,8,-40,0,-35],['L',0,0],['L',3,10],['L',0,7],['L',-3,10],['L',0,0]],
  cup:[['L',12,0],['L',14,-9],['C',24,-9,24,-21,15.5,-20],['L',16,-26],['L',0,-26],['C',-5,-32,5,-36,0,-42],['C',-5,-47,4,-50,0,-56],['C',4,-50,-5,-47,0,-42],['C',5,-36,-5,-32,0,-26],['L',-16,-26],['L',-12,0],['L',0,0]],
  shop:[['L',-18,0],['L',-18,-24],['L',-22,-24],['L',0,-42],['L',22,-24],['L',18,-24],['L',18,0],['L',6,0],['L',6,-14],['L',-6,-14],['L',-6,0],['L',0,0]],
  key:[['A',10,10,0,1,0,-20,0],['A',10,10,0,1,0,0,0],['L',30,0],['L',30,8],['L',26,8],['L',26,3],['L',21,3],['L',21,7],['L',17,7],['L',17,0],['L',0,0]],
  heart:[['C',-6,-6,-20,-14,-20,-24],['C',-20,-32,-8,-34,0,-25],['C',8,-34,20,-32,20,-24],['C',20,-14,6,-6,0,0]],
  bow:[['C',-16,-18,-38,-16,-36,-2],['C',-34,10,-14,8,0,0],['C',16,-18,38,-16,36,-2],['C',34,10,14,8,0,0],['L',-10,26],['L',0,0],['L',10,26]],
};

const stops=[
  {id:'teacher',glyph:'book',year:'Before 1973',ruler:1962,era:'THE FIRST CALLING',title:'A teacher first.',body:'Girma Taye’s first calling was the classroom. He founded Atse Naod School, and when it passed into government hands, he set out in a new direction.',note:'A different path. The same determination.',Art:School},
  {id:'coffee',glyph:'cup',year:'Before 1973',ruler:1966,era:'A NEW DIRECTION',title:'Then, coffee.',body:'From teaching to trade. Coffee became part of the family’s story, and it has stayed in the cup ever since.',note:'Some threads never break.',Art:Jebena},
  {id:'shewaye',glyph:'shop',year:'Before 1973',ruler:1970,era:'THE GROUND WE STAND ON',title:'Shewaye’s snack shop.',body:'On the very ground where Romina stands today, his mother, Shewaye, ran a small snack shop. When she could no longer carry on, she handed it to her son.',note:'He took over a struggling business, and kept going.',Art:SnackShop},
  {id:'opening',glyph:'key',year:'1973',ruler:1973,era:'4 KILO · ADDIS ABABA',title:'Romina opens its doors.',body:'In 1973, a restaurant story began at 4 Kilo: a place to eat, to meet, and to return to.',note:'The first table. Not the last.',Art:Restaurant},
  {id:'home',glyph:'heart',year:'For decades',ruler:1992,era:'GENERATIONS OF YOU',title:'A second home.',body:'Friends who became regulars. Students, teachers, families. Conversations that outlasted the coffee.',note:'If these tables could talk…',Art:SecondHome},
];

const fixed=value=>value.toFixed(1);

function glyphPath(name,anchor,scale){
  return glyphs[name].map(([command,...values])=>{
    if(command==='A'){const [rx,ry,rotation,large,sweep,x,y]=values;return ` A${fixed(rx*scale)} ${fixed(ry*scale)} ${rotation} ${large} ${sweep} ${fixed(anchor.x+x*scale)} ${fixed(anchor.y+y*scale)}`;}
    let text=` ${command}`;
    for(let index=0;index<values.length;index+=2)text+=`${index?' ':''}${fixed(anchor.x+values[index]*scale)} ${fixed(anchor.y+values[index+1]*scale)}`;
    return text;
  }).join('');
}

// Catmull–Rom through the waypoints: one continuous, tangent-smooth sweep.
function smooth(points){
  let d='';
  for(let index=0;index<points.length-1;index++){
    const before=points[index-1]||points[index],from=points[index],to=points[index+1],after=points[index+2]||to;
    d+=` C${fixed(from.x+(to.x-before.x)/6)} ${fixed(from.y+(to.y-before.y)/6)} ${fixed(to.x-(after.x-from.x)/6)} ${fixed(to.y-(after.y-from.y)/6)} ${fixed(to.x)} ${fixed(to.y)}`;
  }
  return d;
}

export default function RominaThread(){
  const root=useRef(null),canvas=useRef(null),line=useRef(null),shade=useRef(null),stitches=useRef(null),needle=useRef(null);
  const paused=useSiteMotionPaused();
  const pausedRef=useRef(paused);
  useEffect(()=>{pausedRef.current=paused;window.dispatchEvent(new Event('resize'));},[paused]);

  useEffect(()=>{
    const section=root.current,svg=canvas.current,thread=line.current,under=shade.current,stitchLayer=stitches.current,tip=needle.current;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const cards=[...section.querySelectorAll('.rt-stop')];
    const markers=[...section.querySelectorAll('[data-thread-stop]')];
    const start=section.querySelector('[data-thread-start]');
    const knot=section.querySelector('[data-thread-knot]');
    const track=section.querySelector('[data-thread-track]');
    const label=section.querySelector('[data-thread-label]');
    const now=new Date().getFullYear();
    section.querySelectorAll('[data-thread-years]').forEach(node=>{node.textContent=String(now-FOUNDED);});
    let table=[],total=0,stopLengths=[],stitchPaths=[],frame=0,layoutFrame=0,disposed=false,shown=-2;
    const still=()=>preference.matches||pausedRef.current;

    function build(){
      const width=section.offsetWidth,height=section.offsetHeight;
      if(!width||cards.length!==stops.length)return;
      const origin=section.getBoundingClientRect();
      const box=node=>{const r=node.getBoundingClientRect();return {left:r.left-origin.left,right:r.right-origin.left,top:r.top-origin.top,bottom:r.bottom-origin.top,width:r.width,height:r.height};};
      const centre=node=>{const r=box(node);return {x:r.left+r.width/2,y:r.top+r.height/2};};
      svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('width',width);svg.setAttribute('height',height);

      const narrow=width<760,edge=narrow?12:30,scale=narrow?1.05:1.55;
      const rects=cards.map(box);
      const sides=cards.map(card=>card.dataset.side);
      // Desktop: each picture sits in the open half beside its card. Phone: in the gap above it.
      const anchors=rects.map((rect,index)=>narrow
        ?{x:width/2,y:rect.top-(index?Math.min(75,(rect.top-rects[index-1].bottom)/2):60)}
        :{x:sides[index]==='left'?rect.right+(width-rect.right)*.42:rect.left*.58,y:rect.top+rect.height*.42});
      const first=centre(start),bow=centre(knot);

      const runs=[];
      runs.push(narrow?[first,anchors[0]]:[first,{x:width-edge,y:(first.y+anchors[0].y)/2},anchors[0]]);
      for(let index=0;index<anchors.length;index++){
        const from=anchors[index],to=index<anchors.length-1?anchors[index+1]:bow,rect=rects[index];
        if(narrow){
          const lane=index%2?edge:width-edge;
          runs.push([from,{x:lane,y:rect.top-6},{x:lane,y:rect.bottom+6},to]);
        }else{
          const rightward=sides[index]==='left';
          const nextTop=index<anchors.length-1?rects[index+1].top:bow.y-80;
          const gap=(rect.bottom+nextTop)/2;
          // Keep travelling the way the string arrived (towards the centre), dip under
          // the picture, then sweep across the gap to the far edge: no sharp turns.
          const far=rightward?edge:width-edge;
          runs.push([from,{x:from.x+(width/2-from.x)*.25,y:from.y+(gap-from.y)*.6},{x:width/2,y:gap},{x:far,y:gap+(to.y-gap)*.45},to]);
        }
      }

      let d=`M${fixed(first.x)} ${fixed(first.y)}`;
      stopLengths=[];
      const marks=[];
      runs.forEach((run,index)=>{
        d+=smooth(run);
        const glyph=index<stops.length?stops[index].glyph:'bow',anchor=index<stops.length?anchors[index]:bow;
        const drawing=glyphPath(glyph,anchor,scale);
        d+=drawing;
        marks.push(`M${fixed(anchor.x)} ${fixed(anchor.y)}${drawing}`);
        under.setAttribute('d',d);
        stopLengths.push(under.getTotalLength());
      });
      thread.setAttribute('d',d);under.setAttribute('d',d);
      total=thread.getTotalLength();

      stitchLayer.replaceChildren();
      stitchPaths=marks.map(mark=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',mark);path.setAttribute('class','rt-stitch');stitchLayer.append(path);return path;});

      const samples=Math.max(300,Math.round(total/5));
      let deepest=-Infinity;
      table=Array.from({length:samples+1},(_,index)=>{
        const length=total*index/samples,point=thread.getPointAtLength(length);
        deepest=Math.max(deepest,point.y);
        return {length,reach:deepest};
      });
      thread.style.strokeDasharray=under.style.strokeDasharray=`${total} ${total}`;
      paint();
    }
    function lengthAt(target){
      if(!table.length||target<=table[0].reach)return 0;
      let low=0,high=table.length-1;
      while(low<high){const middle=(low+high+1)>>1;if(table[middle].reach<=target)low=middle;else high=middle-1;}
      return table[low].length;
    }
    function update(index){
      const stop=index<0?null:index<stops.length?stops[index]:{year:String(now),ruler:now};
      const year=Math.min(RULER[1],Math.max(RULER[0],stop?stop.ruler:RULER[0]));
      track.style.setProperty('--at',((year-RULER[0])/(RULER[1]-RULER[0])).toFixed(4));
      label.textContent=stop?stop.year:'Follow the thread';
    }
    function paint(){
      frame=0;
      if(disposed||!total)return;
      const calm=still();
      section.dataset.mode=calm?'still':'scroll';
      const drawn=calm?total:lengthAt(innerHeight*.62-section.getBoundingClientRect().top);
      thread.style.strokeDashoffset=under.style.strokeDashoffset=String(Math.max(0,total-drawn));
      let reached=-1;
      markers.forEach((node,index)=>{
        const on=calm||drawn>=stopLengths[index]-2;
        node.dataset.reached=String(on);
        stitchPaths[index]?.classList.toggle('rt-stitch-on',on);
        if(on)reached=index;
      });
      if(reached!==shown){shown=reached;update(reached);}
      if(!calm&&drawn>2&&drawn<total-2){
        const point=thread.getPointAtLength(drawn),behind=thread.getPointAtLength(drawn-3);
        const angle=Math.atan2(point.y-behind.y,point.x-behind.x)*180/Math.PI;
        tip.setAttribute('transform',`translate(${fixed(point.x)} ${fixed(point.y)}) rotate(${fixed(angle)})`);
        tip.style.opacity='1';
      }else tip.style.opacity='0';
    }
    function schedule(){if(!frame&&!disposed)frame=requestAnimationFrame(paint);}
    function relayout(){if(!layoutFrame&&!disposed)layoutFrame=requestAnimationFrame(()=>{layoutFrame=0;build();});}
    const resize=new ResizeObserver(relayout);resize.observe(section);
    document.fonts?.ready.then(relayout);
    window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',relayout);
    preference.addEventListener('change',schedule);document.addEventListener('visibilitychange',schedule);
    build();
    return()=>{
      disposed=true;cancelAnimationFrame(frame);cancelAnimationFrame(layoutFrame);resize.disconnect();
      window.removeEventListener('scroll',schedule);window.removeEventListener('resize',relayout);
      preference.removeEventListener('change',schedule);document.removeEventListener('visibilitychange',schedule);
    };
  },[]);

  return <section ref={root} id="history-thread" className="rt" data-mode="still" aria-labelledby="thread-title">
    <svg ref={canvas} className="rt-string" aria-hidden="true">
      <path ref={shade} className="rt-string-shade"/>
      <path ref={line} className="rt-string-line"/>
      <g ref={stitches}/>
      <g ref={needle} className="rt-needle" style={{opacity:0}}>
        <path d="M-3 0H34" stroke="#8b857f" strokeWidth="2.6"/>
        <path d="M34 0h8" stroke="#8b857f" strokeWidth="1.3"/>
        <ellipse cx="2" cy="0" rx="3.4" ry="1.1" fill="#f6f0e5"/>
      </g>
    </svg>

    <div className="rt-board">
      <div className="rt-rail" aria-hidden="true">
        <div className="rt-ruler">
          <div className="rt-ruler-track" data-thread-track>
            {[1970,1980,1990,2000,2010,2020].map(year=><span key={year} style={{'--at':((year-RULER[0])/(RULER[1]-RULER[0])).toFixed(4)}}><i/>’{String(year).slice(2)}</span>)}
            <b/>
          </div>
          <strong data-thread-label>Follow the thread</strong>
        </div>
      </div>

      <header className="rt-intro">
        <div className="rt-intro-copy">
          <span className="rt-kicker"><i/>THE ROMINA THREAD</span>
          <h2 id="thread-title">Fifty-plus years.<br/><em>One thread.</em></h2>
          <p>Pull any thread at Romina and it leads back to family. Follow it from a classroom, to a cup of coffee, to a mother’s snack shop, and on to the table you know today.</p>
          <span className="rt-hint" aria-hidden="true">SCROLL TO FOLLOW THE THREAD</span>
        </div>
        <div className="rt-fifty"><span aria-hidden="true">50</span><span className="rt-plus" aria-hidden="true">+<i data-thread-start/></span><small><span data-thread-years>50+</span> YEARS · SINCE 1973</small></div>
      </header>

      <ol className="rt-stops">
        {stops.map(({id,year,era,title,body,note,Art},index)=><li key={id} className="rt-stop" data-side={index%2?'right':'left'} data-thread-stop data-reached="true">
          <article className="rt-paper">
            <span className="rt-stamp">{year}</span>
            <div className="rt-art"><Art/></div>
            <span className="rt-era"><b>{String(index+1).padStart(2,'0')}</b>{era}</span>
            <h3>{title}</h3>
            <p>{body}</p>
            <p className="rt-note">{note}</p>
          </article>
        </li>)}
      </ol>

      <div className="rt-end" data-thread-stop data-reached="true">
        <div className="rt-bow" data-thread-knot aria-hidden="true"/>
        <p className="rt-end-kicker">TIED TOGETHER SINCE 1973</p>
        <h3><span data-thread-years>50+</span> years.<br/><em>Still at the table.</em></h3>
        <p>The faces change. The feeling stays.</p>
        <a href="#history-family" className="rt-next">Meet the family in the name<MenuIcon name="arrow" size={18}/></a>
      </div>
    </div>
  </section>;
}

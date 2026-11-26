import Image from 'next/image';
import HistoryMotion from './history-motion';
import MenuIcon from './menu-icons';
import RominaThread from './romina-thread';

const MEDIA='/media/romina/';
const milestones=[
  ['2009','Romina Coffee','Ethiopian coffee finds a wider world.'],
  ['2017','Jaquar World','A new chapter in international trading.'],
  ['2020','KOBA','Patisserie, bakery and the craft of making.'],
  ['2021','Bacio Cremeria','Handcrafted gelato joins the family.'],
  ['2026','KOBA Peacock','A new milestone in coffee roasting.'],
];

function Chapter({number,children,light=false}){
  return <div className={`rh-chapter${light?' rh-chapter-light':''}`}><span>{number}</span><span>{children}</span><i/></div>;
}

export default function RominaHistory(){
  return <HistoryMotion>
    <section id="history-beginnings" className="rh-opening" data-history-scene="opening" aria-labelledby="history-opening-title">
      <div className="rh-opening-pin">
        <div className="rh-opening-frame">
          <Image src={`${MEDIA}story-dining.webp`} alt="The tables and pendant lights of a Romina dining room today" fill unoptimized sizes="100vw"/>
          <div className="rh-shutter" data-history-reveal aria-hidden="true">{Array.from({length:8},(_,index)=><i key={index} style={{'--slat':index}}/>)}</div>
        </div>
        <span className="rh-opening-edge" aria-hidden="true"/>
        <div className="rh-opening-shade" aria-hidden="true"/>
        <div className="rh-opening-top"><Chapter number="01" light>THE BEGINNING</Chapter><span className="rh-edition">THE ROMINA STORY<br/>ADDIS ABABA, ETHIOPIA</span></div>
        <div className="rh-opening-copy"><span className="rh-kicker">SOME PLACES BECOME PART OF YOU.</span><h2 id="history-opening-title">One small place.<br/><em>A lifetime of stories.</em></h2><p>A mother’s snack shop. A son who chose to begin again.<br/>And a city that made room at the table.</p></div>
        <div className="rh-year" aria-label="Since 1973"><span className="rh-year-digits" data-history-reveal aria-hidden="true">{'1973'.split('').map((digit,index)=><span key={index} className="rh-digit" style={{'--digit':Number(digit)+10,'--n':index}}><span>{Array.from({length:20},(_,value)=><b key={value}>{value%10}</b>)}</span></span>)}</span><div><span>WHERE OUR STORY<br/>BECOMES YOURS.</span><a href="#history-thread" aria-label="Discover how Romina began"><MenuIcon name="arrow" size={24}/></a></div></div>
        <span className="rh-opening-caption">ROMINA, TODAY · A STORY THAT CONTINUES</span>
        <span className="rh-opening-scroll" aria-hidden="true">SCROLL BACK TO THE BEGINNING <i/></span>
      </div>
    </section>

    <RominaThread/>

    <section id="history-family" className="rh-family" data-history-scene="family" aria-labelledby="history-family-title">
      <div className="rh-family-pin">
        <div className="rh-family-top"><Chapter number="02">THE FAMILY IN THE NAME</Chapter><span className="rh-edition">THREE SONS.<br/>ONE CONTINUING STORY.</span></div>
        <div className="rh-family-heading"><span className="rh-kicker">SAY OUR NAME. YOU’RE SAYING THEIRS.</span><h2 id="history-family-title">A name that keeps<br/><em>family close.</em></h2></div>
        <div className="rh-family-name">
          <div className="rh-name-pieces" aria-hidden="true">{[['RO','Robel'],['MI','Michael'],['NA','Naod']].map(([letters,name],index)=><div key={name} style={{'--name-index':index}}><span>{letters}</span></div>)}</div>
          <Image className="rh-family-wordmark" src="/brand/romina-wordmark.svg" alt="Romina Restaurants" width={580} height={139} unoptimized/>
          <div className="rh-family-sons">{['Robel','Michael','Naod'].map(name=><div key={name}><i/><span>{name}</span></div>)}</div>
        </div>
        <p className="rh-family-note">Robel, Michael and Naod. Their names inspired Romina.<br/>After studying abroad, Girma Taye’s sons returned home<br className="rh-desktop-break"/> to help carry the family business forward.</p>
        <span className="rh-family-rule" aria-hidden="true"/>
      </div>
    </section>

    <section className="rh-growth" aria-labelledby="history-growth-title">
      <div className="rh-growth-heading" data-history-reveal><span className="rh-kicker">FROM ONE RESTAURANT, NEW POSSIBILITIES.</span><h2 id="history-growth-title">The family<br/><em>grew.</em></h2><p>New names. New chapters.<br/>The same roots.</p></div>
      <ol className="rh-timeline">{milestones.map(([year,name,description],index)=><li key={year} data-history-reveal style={{'--history-delay':`${index*65}ms`}}><span className="rh-milestone-year">{year}</span><i aria-hidden="true"/><h3>{name}</h3><p>{description}</p></li>)}</ol>
    </section>

    <section id="history-homecoming" className="rh-homecoming" data-history-scene="homecoming" aria-labelledby="history-homecoming-title">
      <div className="rh-home-photo"><Image src={`${MEDIA}arrival-poster.webp`} alt="A present-day Romina restaurant entrance" fill unoptimized sizes="100vw"/></div>
      <div className="rh-home-shade" aria-hidden="true"/>
      <div className="rh-home-door rh-home-door-left" aria-hidden="true"/><div className="rh-home-door rh-home-door-right" aria-hidden="true"/>
      <div className="rh-home-top"><Chapter number="03" light>THE NEXT CHAPTER</Chapter><span className="rh-edition">4 KILO<br/>OPEN AGAIN.</span></div>
      <div className="rh-home-copy"><span className="rh-kicker">NEARLY TWO YEARS OF RENOVATION.</span><h2 id="history-homecoming-title">We’re<br/><em>open again.</em></h2><p>After nearly two years of renovation, Romina 4 Kilo is open again in its original location. A renewed space, familiar flavours, and the same warm welcome.</p><div className="rh-home-actions"><a href="#visit" className="rh-action">Your table is waiting<MenuIcon name="arrow" size={21}/></a><a href="#our-menu" className="rh-text-link">See what’s cooking<MenuIcon name="arrow" size={19}/></a></div></div>
      <div className="rh-home-bottom"><span>OUR ORIGINAL HOME.<br/>READY FOR NEW MEMORIES.</span><span className="rh-home-signature">Good food.<br/>Great company.</span></div>
      <span className="rh-home-color-cue" data-home-color-cue aria-hidden="true"/>
    </section>
  </HistoryMotion>;
}

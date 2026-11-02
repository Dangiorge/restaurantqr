import Image from 'next/image';
import HistoryMotion from './history-motion';
import MenuIcon from './menu-icons';
import RominaNewspaper from './romina-newspaper';
import AgedFilm from './aged-film';

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
        </div>
        <div className="rh-opening-shade" aria-hidden="true"/>
        <div className="rh-opening-top"><Chapter number="01" light>THE BEGINNING</Chapter><span className="rh-edition">THE ROMINA STORY<br/>ADDIS ABABA, ETHIOPIA</span></div>
        <div className="rh-opening-copy"><span className="rh-kicker">SOME PLACES BECOME PART OF YOU.</span><h2 id="history-opening-title">One small place.<br/><em>A lifetime of stories.</em></h2><p>A mother’s snack shop. A son who chose to begin again.<br/>And a city that made room at the table.</p></div>
        <div className="rh-year" aria-label="Since 1973"><span aria-hidden="true">1973</span><div><span>WHERE OUR STORY<br/>BECOMES YOURS.</span><a href="#history-roots" aria-label="Discover how Romina began"><MenuIcon name="arrow" size={24}/></a></div></div>
        <span className="rh-opening-caption">ROMINA, TODAY · A STORY THAT CONTINUES</span>
        <span className="rh-opening-scroll" aria-hidden="true">SCROLL BACK TO THE BEGINNING <i/></span>
      </div>
    </section>

    <section id="history-roots" className="rh-roots rh-film-scene" aria-labelledby="history-roots-title">
      <AgedFilm/>
      <div className="rh-roots-intro" data-history-reveal><span className="rh-kicker">BEFORE THE FIRST PLATE</span><h2 id="history-roots-title">A teacher.<br/>A mother.<br/><em>A new beginning.</em></h2><span className="rh-side-note">FAMILY IS WHERE<br/>THIS STORY STARTS.</span></div>
      <div className="rh-roots-stories">
        <article className="rh-root-story" data-history-reveal><span className="rh-root-index">I.</span><div><span className="rh-kicker">THE MAN WHO KEPT GOING</span><h3>Girma Taye.</h3><p>Teaching was his first calling. After years in education, he founded Atse Naod School. When the school passed into government hands, he found a new direction in business, including the coffee trade.</p><p className="rh-root-pull">A different path.<br/>The same determination.</p></div></article>
        <article className="rh-root-story" data-history-reveal><span className="rh-root-index">II.</span><div><span className="rh-kicker">THE PLACE SHE BEGAN</span><h3>Shewaye Snack.</h3><p>On the ground where Romina stands today, his mother, Shewaye, ran a small snack shop. When she could no longer carry on, she handed it to her son.</p><p>He took over a struggling business and began building something that would belong to generations.</p></div></article>
      </div>
      <div className="rh-roots-thread" aria-hidden="true"><span>SHEWAYE</span><i/><span>GIRMA TAYE</span><i/><span>GENERATIONS OF YOU</span></div>
    </section>

    <RominaNewspaper/>

    <section id="history-second-home" className="rh-memories" data-history-scene="memories" aria-labelledby="history-memories-title">
      <div className="rh-memories-top"><Chapter number="02" light>A SECOND HOME</Chapter><span className="rh-edition">4 KILO<br/>FOR GENERATIONS</span></div>
      <figure className="rh-memory rh-memory-one"><Image src={`${MEDIA}dining-room.webp`} alt="A familiar corner of a Romina dining room today" fill unoptimized sizes="(max-width:760px) 42vw, 28vw"/><figcaption>A FAMILIAR TABLE.</figcaption></figure>
      <figure className="rh-memory rh-memory-two"><Image src={`${MEDIA}coffee-ritual-poster.webp`} alt="Coffee being made at Romina today" fill unoptimized sizes="(max-width:760px) 36vw, 22vw"/><figcaption>ONE MORE CONVERSATION.</figcaption></figure>
      <figure className="rh-memory rh-memory-three"><Image src={`${MEDIA}kitchen-team.webp`} alt="The Romina kitchen team presenting a pizza today" fill unoptimized sizes="(max-width:760px) 42vw, 24vw"/><figcaption>THE CARE BEHIND EVERY PLATE.</figcaption></figure>
      <div className="rh-memories-copy"><span className="rh-kicker">MORE THAN A RESTAURANT.</span><h2 id="history-memories-title">For many,<br/><em>a second home.</em></h2><p>Friends who became regulars.<br/>Students, teachers, families.<br/>Conversations that outlasted the coffee.</p><span className="rh-memory-signoff">IF THESE TABLES COULD TALK.</span></div>
      <div className="rh-memories-foot"><span>LIFE AT ROMINA, TODAY.</span><p>The faces change.<br/><em>The feeling stays.</em></p><a href="#history-family" aria-label="Meet the family behind the Romina name"><MenuIcon name="arrow" size={23}/></a></div>
    </section>

    <section id="history-family" className="rh-family" data-history-scene="family" aria-labelledby="history-family-title">
      <div className="rh-family-pin">
        <div className="rh-family-top"><Chapter number="03">THE FAMILY IN THE NAME</Chapter><span className="rh-edition">THREE SONS.<br/>ONE CONTINUING STORY.</span></div>
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
      <div className="rh-kazanchis" data-history-reveal><span className="rh-kicker">AND THE RESTAURANT STORY KEPT GROWING.</span><p>Beyond 4 Kilo, the Kazanchis branch brought guests closer to the kitchen, with food prepared in view.</p></div>
    </section>

    <section id="history-homecoming" className="rh-homecoming" data-history-scene="homecoming" aria-labelledby="history-homecoming-title">
      <div className="rh-home-photo"><Image src={`${MEDIA}arrival-poster.webp`} alt="A present-day Romina restaurant entrance" fill unoptimized sizes="100vw"/></div>
      <div className="rh-home-shade" aria-hidden="true"/>
      <div className="rh-home-door rh-home-door-left" aria-hidden="true"/><div className="rh-home-door rh-home-door-right" aria-hidden="true"/>
      <div className="rh-home-top"><Chapter number="04" light>THE NEXT CHAPTER</Chapter><span className="rh-edition">4 KILO<br/>OPEN AGAIN.</span></div>
      <div className="rh-home-copy"><span className="rh-kicker">NEARLY TWO YEARS OF RENOVATION.</span><h2 id="history-homecoming-title">We’re<br/><em>open again.</em></h2><p>After nearly two years of renovation, Romina 4 Kilo is open again in its original location. A renewed space, familiar flavours, and the same warm welcome.</p><div className="rh-home-actions"><a href="#visit" className="rh-action">Your table is waiting<MenuIcon name="arrow" size={21}/></a><a href="#our-menu" className="rh-text-link">See what’s cooking<MenuIcon name="arrow" size={19}/></a></div></div>
      <div className="rh-home-bottom"><span>OUR ORIGINAL HOME.<br/>READY FOR NEW MEMORIES.</span><span className="rh-home-signature">Good food.<br/>Great company.</span></div>
      <span className="rh-home-color-cue" data-home-color-cue aria-hidden="true"/>
    </section>
  </HistoryMotion>;
}

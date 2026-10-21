import Image from 'next/image';
import Link from 'next/link';
import SiteHeader from './site-header';
import SiteMotion from './site-motion';
import BeerPour from './beer-pour';
import CuisineJourney from './cuisine-journey';
import RestaurantFilm from './restaurant-film';
import MenuIcon from './menu-icons';
import {websiteContent} from '@/modules/menus/website.mjs';

const MEDIA='/media/romina/';
const days=[['mon','Monday'],['tue','Tuesday'],['wed','Wednesday'],['thu','Thursday'],['fri','Friday'],['sat','Saturday'],['sun','Sunday']];
const phoneHref=phone=>`tel:${phone.replace(/[^+\d]/g,'')}`;
const money=value=>Number(value).toLocaleString('en-ET',{minimumFractionDigits:2,maximumFractionDigits:2});
const dishLink=id=>`/menu?dish=${encodeURIComponent(id)}`;
function Arrow({size=19}){return <MenuIcon name="arrow" size={size}/>;}

export default function RestaurantWebsite({restaurant,staticPreview=false}){
  const {now,featured,categories,events}=websiteContent(restaurant,staticPreview?0:undefined);
  const branches=restaurant?.branches||[];
  const contactPhone=restaurant?.phone||branches.find(branch=>branch.phone)?.phone;
  const cateringBranch=branches.find(branch=>/balder|embassy/i.test(branch.name));
  const cateringPhone=cateringBranch?.phone||contactPhone;
  const seenPhotos=new Set();

  return <SiteMotion>
    <a className="rs-skip" href="#main-content">Skip to content</a>
    <SiteHeader/>
    <main id="main-content">
      <section className="rs-hero" aria-labelledby="site-hero-title">
        <div className="rs-hero-photo"><Image src={`${MEDIA}sharing-platter.webp`} alt="A colourful traditional platter served on injera at Romina" fill priority unoptimized sizes="100vw"/></div>
        <div className="rs-hero-shade"/>
        <div className="rs-hero-content" data-site-reveal="up">
          <span className="rs-eyebrow rs-light"><i/> ADDIS ABABA · SINCE 1973</span>
          <h1 id="site-hero-title">Come hungry.<br/><em>Leave happy.</em></h1>
          <p>Good food. Great company. Always Romina.</p>
          <div className="rs-hero-actions"><Link href="/menu?view=menu" className="rs-button">Explore the menu<Arrow/></Link><a href="#visit" className="rs-link rs-link-light">Find your table<Arrow size={17}/></a></div>
        </div>
        <div className="rs-hero-caption"><span>MADE FOR SHARING</span><span>Made for you.</span></div>
        <a href="#our-menu" className="rs-scroll-cue"><span/>FOLLOW YOUR APPETITE</a>
      </section>

      <div className="rs-marquee" aria-label="Good food. Great company. Since 1973."><div aria-hidden="true">{[0,1,2,3].map(copy=><span key={copy}>GOOD FOOD <i>✳</i> GREAT COMPANY <i>✳</i> SINCE 1973 <i>✳</i></span>)}</div></div>

      <section id="our-menu" className="rs-menu-section rs-section">
        <div className="rs-section-heading" data-site-reveal="up"><div><span className="rs-eyebrow">FROM OUR KITCHEN TO YOUR TABLE</span><h2>Your next<br/><em>craving.</em></h2></div><div><p>The dishes. The details. The first bite.</p><Link href="/menu?view=menu" className="rs-link">See the full menu<Arrow size={17}/></Link></div></div>
        <div className="rs-dish-grid" data-count={featured.length}>{featured.map((dish,index)=>{
          const showPhoto=dish.photoUrl&&!seenPhotos.has(dish.photoUrl);
          if(showPhoto)seenPhotos.add(dish.photoUrl);
          return <Link key={dish.id} href={dishLink(dish.id)} className="rs-food-card" data-site-reveal="up" style={{'--rs-delay':`${Math.min(index*85,425)}ms`}}>
            <div className="rs-food-card-image">{showPhoto?<Image src={dish.photoUrl} alt={dish.name} fill unoptimized sizes="(max-width:600px) 90vw, (max-width:1000px) 45vw, 420px"/>:<span className="rs-food-fallback"><MenuIcon name="cutlery" size={35}/></span>}<span className="rs-food-number">{String(index+1).padStart(2,'0')}</span><span className="rs-food-open"><Arrow/></span>{dish.dietaryType==='VEGAN'&&<span className="rs-food-vegan">Vegan</span>}</div>
            <div className="rs-food-card-copy"><span className="rs-eyebrow">{dish.categoryName}</span><h3>{dish.name}</h3><strong>{money(dish.basePrice)} <small>ETB</small></strong></div>
          </Link>;
        })}</div>
        {!featured.length&&<div className="rs-menu-empty"><h3>A delicious discovery awaits.</h3><p>{staticPreview?'Explore our menu to find your next favourite.':'Ask our team for today’s dishes while the digital menu is being prepared.'}</p><Link href="/menu?view=menu" className="rs-button">Explore the menu<Arrow/></Link></div>}
        {categories.length>0&&<div className="rs-categories" data-site-reveal="up"><span className="rs-eyebrow">FOLLOW YOUR APPETITE</span><div>{categories.map(category=><Link key={category.id} href={`/menu?category=${encodeURIComponent(category.id)}`}><span>{category.name}<small>{category.count} {category.count===1?'dish':'dishes'}</small></span><Arrow size={18}/></Link>)}</div></div>}
      </section>

      <CuisineJourney restaurant={restaurant}/>

      <section id="from-kitchen" className="rs-kitchen">
        <div className="rs-section-heading rs-section" data-site-reveal="up"><div><span className="rs-eyebrow">THE PEOPLE. THE CRAFT. THE CARE.</span><h2>Made by hand.<br/><em>Served with heart.</em></h2></div><p>From a dusting of flour to that first slice. Step into the Romina kitchen.</p></div>
        <div className="rs-kitchen-reel" data-site-parallax>
          <RestaurantFilm src={`${MEDIA}pizza-kitchen.mp4`} poster={`${MEDIA}kitchen-team.webp`} alt="Romina chefs presenting a freshly prepared pizza" title="From our kitchen"/>
          <span className="rs-kitchen-caption" aria-hidden="true">FRESH FROM THE OVEN.</span>
        </div>
      </section>

      <section id="experience" className="rs-tastes rs-section" aria-labelledby="tastes-title">
        <div className="rs-section-heading" data-site-reveal="up"><div><span className="rs-eyebrow">A TABLE FOR EVERY APPETITE</span><h2 id="tastes-title">More to<br/><em>fall for.</em></h2></div><p>Something comforting. Something sizzling. Something you’ll come back for.</p></div>
        <div className="rs-taste-grid">{[
          ['fish-cream','Fish with creamy mushroom sauce and lime','Comfort, on a plate.','01'],
          ['pasta','Pasta served at Romina','One more forkful.','02'],
          ['grill','Grilled meat served with fries and vegetables','Straight to your favourites.','03'],
        ].map(([photo,alt,title,number],index)=><Link key={photo} href="/menu?view=menu" className="rs-taste" data-site-reveal="right" style={{'--rs-delay':`${index*100}ms`}}><div className="rs-taste-image" data-site-parallax><Image src={`${MEDIA}${photo}.webp`} alt={alt} fill unoptimized sizes="(max-width:760px) 90vw, 45vw"/><span>{number}</span></div><div><h3>{title}</h3><Arrow size={21}/></div></Link>)}</div>
      </section>

      <section id="our-table" className="rs-story">
        <div className="rs-story-photo" data-site-parallax><Image src={`${MEDIA}story-dining.webp`} alt="A Romina dining room with brick walls, pendant lighting, and tables for good company" fill unoptimized sizes="(max-width:760px) 100vw, 55vw"/><span className="rs-photo-caption">A ROMINA TABLE. A LIFETIME OF STORIES.</span></div>
        <div className="rs-story-copy" data-site-reveal="up"><span className="rs-eyebrow">IT STARTED IN 4 KILLO</span><h2>Full of food.<br/><em>Full of stories.</em></h2><p className="rs-lead">Students, teachers, old friends. Romina at 4 Killo has been part of the conversation since 1973.</p><p>Lunch between lectures. A familiar face. A favourite table. For generations, people have come for the food and stayed for the company.</p><div className="rs-history-mark"><strong>1973</strong><span>OUR STORY BEGAN IN ARAT KILO.<br/>YOUR NEXT CHAPTER STARTS AT THE TABLE.</span></div><a href="#visit" className="rs-link">Make yourself at home<Arrow size={17}/></a></div>
      </section>

      <section className="rs-coffee rs-section" aria-labelledby="coffee-title">
        <div className="rs-coffee-copy" data-site-reveal="left"><span className="rs-eyebrow">A LITTLE LONGER AT THE TABLE</span><h2 id="coffee-title">One more<br/><em>conversation.</em></h2><p>Fresh coffee. Familiar company.<br/>Some moments deserve another minute.</p><a href="#visit" className="rs-button">Find your Romina<Arrow/></a><span className="rs-coffee-signature">GOOD FOOD.<br/>GREAT COMPANY.</span></div>
        <div className="rs-coffee-film" data-site-reveal="right"><RestaurantFilm src={`${MEDIA}coffee-ritual.mp4`} poster={`${MEDIA}coffee-ritual-poster.webp`} alt="Coffee being prepared at the Romina espresso machine" title="The coffee ritual" portrait/></div>
      </section>

      <BeerPour dish={featured.find(dish=>/grill|tibs|steak|filet|fillet/i.test(dish.name))||featured[0]}/>

      <section id="catering" className="rs-gather rs-section">
        <div className="rs-gather-copy" data-site-reveal="left"><span className="rs-eyebrow">BALDERACE · NEAR THE BRITISH EMBASSY</span><h2>Big days.<br/><em>Beautiful food.</em></h2><p className="rs-lead">Weddings. Graduations. A table for everyone.</p><p>Our Balderace branch is known for bringing people together over food. Let Romina be part of your next celebration.</p><ul className="rs-occasion-tags" aria-label="Catering occasions"><li>Weddings</li><li>Graduations</li><li>Celebrations</li><li>Corporate events</li></ul><div className="rs-catering-actions"><a href={cateringPhone?phoneHref(cateringPhone):'#visit'} className="rs-button">Plan your catering<Arrow size={17}/></a><a href="https://www.google.com/maps/search/?api=1&query=Romina%20Balderace%20British%20Embassy%20Addis%20Ababa" className="rs-link" target="_blank" rel="noreferrer">Find Balderace<Arrow size={17}/></a></div></div>
        <div className="rs-gather-photo" data-site-parallax><Image src={`${MEDIA}terrace.webp`} alt="Outdoor tables under red Romina parasols" fill unoptimized sizes="(max-width:760px) 90vw, 50vw"/><span>SPACE FOR GOOD COMPANY.</span></div>
      </section>

      {events.length>0&&<section className="rs-events rs-section" aria-label="Events at Romina"><div className="rs-section-heading" data-site-reveal="up"><div><span className="rs-eyebrow">SAVE THE DATE</span><h2>Happening<br/><em>at Romina.</em></h2></div></div><div className="rs-event-grid">{events.map(event=><article key={event.id} data-site-reveal="up"><Image src={event.posterUrl} alt={`${event.title} poster`} width={1000} height={700} unoptimized/><div>{event.startsAt&&<span className="rs-eyebrow">{new Intl.DateTimeFormat('en',{dateStyle:'long',timeZone:'Africa/Addis_Ababa'}).format(new Date(event.startsAt))}</span>}<h3>{event.title}</h3><p>{event.description}</p><a href="#visit" className="rs-link">Join us<Arrow size={16}/></a></div></article>)}</div></section>}

      <section id="visit" className="rs-visit">
        <div className="rs-section"><div className="rs-section-heading" data-site-reveal="up"><div><span className="rs-eyebrow">YOUR NEXT FAVOURITE PLACE</span><h2>Meet us<br/><em>at Romina.</em></h2></div><p>A quick lunch. A long catch-up.<br/>There’s a table for that.</p></div>
          <div className="rs-visit-scenes"><RestaurantFilm src={`${MEDIA}arrival.mp4`} poster={`${MEDIA}arrival-poster.webp`} alt="The exterior of a Romina restaurant" title="Welcome to Romina"/><div className="rs-visit-interior" data-site-parallax><Image src={`${MEDIA}dining-room.webp`} alt="A welcoming Romina dining room with tables and a banquette" fill unoptimized sizes="(max-width:760px) 90vw, 420px"/><span>MAKE YOURSELF AT HOME.</span></div></div>
          <div className="rs-location-grid">{branches.map((branch,index)=><article key={branch.name} data-site-reveal="up"><span className="rs-location-number">{String(index+1).padStart(2,'0')}</span><MenuIcon name="pin" size={23}/><h3>{branch.name}</h3><p>{branch.address||'Please contact our team for directions.'}</p>{branch.phone&&<a className="rs-location-phone" href={phoneHref(branch.phone)}>{branch.phone}</a>}{branch.address&&<a className="rs-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${branch.name} ${branch.address}`)}`} target="_blank" rel="noreferrer">Get directions<Arrow size={16}/></a>}{Object.keys(branch.openingHours||{}).length>0&&<details><summary>Opening hours<MenuIcon name="plus" size={15}/></summary><dl>{days.map(([key,label])=><div key={key}><dt>{label}</dt><dd>{branch.openingHours[key]==='closed'?'Closed':branch.openingHours[key]?.replace('-', ' – ')||'Contact branch'}</dd></div>)}</dl><small>Times shown in {branch.timezone||'Africa/Addis_Ababa'}.</small></details>}</article>)}</div>
          {!branches.length&&<div className="rs-location-empty" data-site-reveal="up"><h3>Your table is waiting.</h3><p>{restaurant?.address||'Please contact our team for branch details and directions.'}</p>{contactPhone&&<a className="rs-link" href={phoneHref(contactPhone)}>Call Romina<Arrow size={17}/></a>}</div>}
        </div>
      </section>

      <section className="rs-last-invite" data-site-reveal="up"><span className="rs-eyebrow">GOOD FOOD. GREAT COMPANY.</span><h2>See you<br/><em>at the table.</em></h2><Link href="/menu?view=menu" className="rs-button rs-button-white">Let’s find your favourite<Arrow/></Link></section>
    </main>
    <footer className="rs-footer"><div className="rs-footer-top"><Link href="/" className="rs-footer-logo" aria-label="Romina Restaurants home"><Image src="/brand/romina-logo.svg" alt="Romina Restaurants" width={135} height={115}/></Link><div><span className="rs-eyebrow">ADDIS ABABA · SINCE 1973</span><p>A little history. A lot of heart.</p></div><a href="#main-content" className="rs-back-top" aria-label="Back to top"><Arrow size={22}/></a></div><div className="rs-footer-links"><nav aria-label="Footer navigation"><a href="#our-table">Our story</a><Link href="/menu?view=menu">Our menu</Link><a href="#catering">Catering</a><a href="#visit">Find us</a></nav><div>{contactPhone&&<a href={phoneHref(contactPhone)}>{contactPhone}</a>}<Link href="/workspace">Staff sign in</Link></div></div><div className="rs-footer-bottom"><span>© {now?new Date(now).getFullYear():''} Romina Restaurants</span><a href="https://rominaplc.com/businesses/romina-restaurants" target="_blank" rel="noreferrer">Part of Romina PLC<Arrow size={12}/></a><span>Addis Ababa, Ethiopia</span></div></footer>
  </SiteMotion>;
}

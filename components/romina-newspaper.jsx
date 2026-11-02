import Image from 'next/image';
import AgedFilm from './aged-film';

// Provisional copy from the supplied company history. Replace this edition
// when the family provides its final article and archival photographs.
const edition={
  headline:'Every Table Has a Story',
  featureTitle:'Girma Taye. A life of new beginnings.',
  standfirst:'A teacher. A mother’s small snack shop. The beginnings of a story shared by generations.',
  article:[
    'Before Romina, there was a teacher. Girma Taye spent years in education and founded Atse Naod School. When the school passed into government hands, he turned towards business, including the coffee trade.',
    'Another beginning was waiting closer to home. His mother, Shewaye, ran a snack shop on the ground where Romina stands today. When she could no longer continue, she entrusted the business to her son.',
    'In 1973, a restaurant story began. What followed would become part of the everyday life of 4 Kilo: a place to eat, to meet and to return to.',
  ],
  foundations:[
    ['01','A life in education','Teaching came first. Atse Naod School was one of Girma Taye’s early chapters.'],
    ['02','A mother’s beginning','Shewaye’s snack shop gave the next generation a place from which to begin.'],
    ['03','A place for generations','The small family business grew into a familiar meeting place at 4 Kilo.'],
  ],
};

export default function RominaNewspaper(){
  return <section id="history-chronicle" className="rh-press rh-film-scene" data-history-scene="newspaper" aria-labelledby="history-chronicle-title">
    <div className="rh-press-label"><span>THE ROMINA PAPERS</span><span>A FAMILY RETROSPECTIVE</span></div>
    <article className="rh-paper" aria-label="The Romina Papers, the foundations edition">
      <div className="rh-paper-fold rh-paper-fold-top">
        <div className="rh-paper-wear" aria-hidden="true"/><AgedFilm/>
        <header className="rh-paper-masthead">
          <div className="rh-paper-edition"><span lang="am">ልዩ እትም</span><i/><strong>SPECIAL EDITION</strong><em>VOL. I · NO. 1</em></div>
          <div className="rh-paper-brand"><Image src="/brand/romina-newspaper-wordmark.svg" alt="Romina" width={360} height={61} unoptimized/><p><i/>RESTAURANT + CAFÉ + BAR<i/></p></div>
          <div className="rh-paper-anniversary" aria-label="More than 50 years of stories, since 1973"><div>50<span>+</span></div><span>SINCE 1973<br/><strong>YEARS OF STORIES</strong></span><Image src="/brand/romina-emblem.svg" alt="" width={40} height={40} unoptimized/></div>
        </header>
        <div className="rh-paper-dateline"><span>SINCE 1973 · 4 KILO · GENERATIONS OF YOU</span><span>ADDIS ABABA · ETHIOPIA</span></div>
        <div className="rh-paper-lead"><span className="rh-paper-kicker">THE FOUNDATIONS · GIRMA TAYE &amp; SHEWAYE</span><h2 id="history-chronicle-title">{edition.headline}</h2><p>{edition.standfirst}</p></div>
        <figure className="rh-paper-photo">
          <div><Image src="/media/romina/terrace.webp" alt="Outdoor tables at a present-day Romina restaurant" fill unoptimized sizes="(max-width:760px) 90vw, 80vw"/></div>
          <figcaption><span>A FAMILIAR TABLE. A CONTINUING STORY.</span><span>ROMINA, TODAY</span></figcaption>
        </figure>
      </div>
      <div className="rh-paper-fold rh-paper-fold-bottom">
        <div className="rh-paper-wear" aria-hidden="true"/><AgedFilm/>
        <div className="rh-paper-feature-heading"><span>THE MAN BEHIND THE BEGINNING</span><h3>{edition.featureTitle}</h3></div>
        <div className="rh-paper-article"><span className="rh-paper-byline">FROM ONE GENERATION TO THE NEXT</span><div>{edition.article.map(paragraph=><p key={paragraph}>{paragraph}</p>)}</div></div>
        <div className="rh-paper-foundations" aria-label="Three foundations of the story">{edition.foundations.map(([number,title,body])=><div key={number}><span>{number}</span><div><h4>{title}</h4><p>{body}</p></div></div>)}</div>
        <footer className="rh-paper-footer"><span>THE ROMINA PAPERS</span><span>ROOTED IN FAMILY. SHARED WITH ADDIS.</span><span>01</span></footer>
      </div>
    </article>
    <div className="rh-press-end" aria-hidden="true"><i/><span>THE STORY CONTINUES</span><i/></div>
  </section>;
}

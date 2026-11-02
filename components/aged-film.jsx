// Decorative film damage, shared by the history and newspaper scenes.
// All animation is CSS; the history observer enables it only in view.
export default function AgedFilm(){
  return <div className="rh-aged-film" aria-hidden="true">
    <span className="rh-film-dust rh-film-dust-fine"/>
    <span className="rh-film-dust rh-film-dust-soft"/>
    {[0,1,2,3].map(index=><i className="rh-film-scratch" key={index}/>)}
    <span className="rh-film-veil"/>
  </div>;
}

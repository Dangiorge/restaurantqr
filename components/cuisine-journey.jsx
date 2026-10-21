import CuisineAtlas from './cuisine-atlas';
import world from '@/public/maps/cuisine-world.json';
import {cuisineJourney} from '@/modules/menus/cuisines.mjs';

export default function CuisineJourney({restaurant}){
  // Country geometry remains server-rendered markup, outside the client JS bundle.
  const map=<svg className="rs-atlas-map" data-atlas-map viewBox="0 0 1080 540" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <g className="rs-atlas-graticule">{[90,180,270,360,450].map(y=><path key={`h${y}`} d={`M0 ${y}H1080`}/>)}{[180,360,540,720,900].map(x=><path key={`v${x}`} d={`M${x} 0V540`}/>)}</g>
    <g>{world.countries.map(country=><path key={country.id} data-region={country.region} className="rs-atlas-country" d={country.path} vectorEffect="non-scaling-stroke"/>)}</g>
    <path className="rs-atlas-route" d="M656.25 242.91Q550 215 576 123.42Q690 65 844.41 176.31" vectorEffect="non-scaling-stroke"/>
  </svg>;
  return <CuisineAtlas stops={cuisineJourney(restaurant)} map={map}/>;
}

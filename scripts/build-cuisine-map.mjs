import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Source: Natural Earth 1:110m admin-0 countries. Public domain.
// Download the GeoJSON linked in public/maps/README.md, then pass its local path.
const input=process.argv[2];
if(!input)throw new Error('Usage: node scripts/build-cuisine-map.mjs path/to/countries.geojson');
const source=readFileSync(input,'utf8');
const collection=JSON.parse(source);
const project=([longitude,latitude])=>[(longitude+180)*3,(90-latitude)*3].map(value=>Number(value.toFixed(2)));
function ringPath(ring){
  const points=ring.map(project);
  return points.map(([x,y],index)=>`${index?'L':'M'}${x} ${y}`).join('')+'Z';
}
const countries=collection.features.filter(feature=>feature.properties.CONTINENT!=='Antarctica').map(feature=>{
  const {ADMIN:name,ADM0_A3:id,CONTINENT:continent}=feature.properties;
  const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;
  return {id,name,region:id==='ETH'?'ethiopia':continent==='Europe'?'europe':continent==='Asia'?'asia':'other',path:polygons.map(polygon=>polygon.map(ringPath).join('')).join('')};
});
if(!countries.some(country=>country.id==='ETH')||countries.length<170)throw new Error('Incomplete country data.');
mkdirSync('public/maps',{recursive:true});
writeFileSync('public/maps/cuisine-world.json',JSON.stringify({source:'Natural Earth 1:110m admin-0 countries',sha256:createHash('sha256').update(source).digest('hex'),countries})+'\n');
console.log(`Built ${countries.length} country outlines for the cuisine journey.`);

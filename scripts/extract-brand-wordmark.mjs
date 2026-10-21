import {readFileSync,writeFileSync} from 'node:fs';

// Reuse the outlined letters from the primary PDF artwork, without substituting a font.
const source=readFileSync(new URL('../public/brand/romina-logo.svg',import.meta.url),'utf8');
const paths=[...source.matchAll(/<path\b[^>]+\/>/g)].map(match=>match[0]).filter(path=>path.includes('fill="#000000"'));
if(paths.length!==17)throw new Error('Expected the 17 original wordmark paths.');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="605 470 360 86" role="img" aria-labelledby="title"><title id="title">Romina Restaurants</title><g transform="translate(0 841.89) scale(1 -1)">${paths.join('')}</g></svg>\n`;
writeFileSync(new URL('../public/brand/romina-wordmark.svg',import.meta.url),svg);
console.log('Saved the original ROMINA RESTAURANTS lettering as vector artwork.');

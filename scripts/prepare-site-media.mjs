// Curated from the owner's media after visual review. Originals stay untouched.
import sharp from 'sharp';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const selections=[
 ['sharing-platter','06-18-53',1920,'Traditional platter on a red-covered Romina table'],
 ['fish-cream','06-18-07',1400,'Fish with a creamy mushroom sauce and lime'],
 ['pasta','06-18-26',1400,'Pasta served on a white plate'],
 ['grill','06-18-58',1400,'Grilled meat with fries and vegetables'],
 ['kitchen-team','06-19-05',1400,'Romina chefs presenting a freshly prepared pizza'],
 ['story-dining','06-19-34',1400,'Romina dining room with brick walls and pendant lights'],
 ['terrace','06-19-20',1400,'Romina outdoor tables under red parasols'],
 ['dining-room','06-19-37',1400,'Romina dining room with tables arranged along a banquette'],
];
const target='public/media/romina';await mkdir(target,{recursive:true});
const photos=[];
for(const [name,time,width,alt] of selections){
 const source=`public/video/photo_2026-10-21_${time}.jpg`,input=await readFile(source);
 await sharp(input).rotate().resize({width,withoutEnlargement:true}).webp({quality:83,effort:5}).toFile(`${target}/${name}.webp`);
 photos.push({name,source,src:`/media/romina/${name}.webp`,alt,sha256:createHash('sha256').update(input).digest('hex')});
}
await writeFile(`${target}/photos.json`,JSON.stringify(photos,null,2)+'\n');
console.log(`Prepared ${photos.length} distinct, reviewed photographs. Duplicate 06-19-43 and promotional artwork excluded.`);

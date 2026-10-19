// Reproduce the outlined primary artwork from page 3 of the supplied guideline.
// Usage: node scripts/extract-brand-logo.mjs "path/to/brand-guideline.pdf"
import {readFileSync,writeFileSync} from 'node:fs';
import {getDocument,OPS} from 'pdfjs-dist/legacy/build/pdf.mjs';

if(!process.argv[2])throw new Error('Provide the original brand guideline PDF.');
const document=await getDocument({data:new Uint8Array(readFileSync(process.argv[2]))}).promise;
try{
  const page=await document.getPage(3);
  const operators=await page.getOperatorList();
  const paths=[];
  let state={matrix:[1,0,0,1,0,0],fill:'#000000'};
  const stack=[];
  const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
  const number=n=>Number(n.toFixed(4));
  for(let i=0;i<operators.fnArray.length;i++){
    const operation=operators.fnArray[i],args=operators.argsArray[i];
    if(operation===OPS.save)stack.push({...state,matrix:[...state.matrix]});
    else if(operation===OPS.restore)state=stack.pop()||state;
    else if(operation===OPS.transform)state.matrix=multiply(state.matrix,args);
    else if(operation===OPS.setFillRGBColor)state.fill=args[0];
    else if(operation===OPS.constructPath&&args[0]===OPS.fill){
      const [a,b,c,d,e,f]=state.matrix;
      const [x0,y0,x1,y1]=args[2];
      const corners=[[x0,y0],[x1,y1]].map(([x,y])=>[a*x+c*y+e,b*x+d*y+f]);
      // Isolate the complete primary logo, excluding page furniture and text.
      if(!corners.every(([x,y])=>x>=582&&x<=980&&y>=270&&y<=611))continue;
      let path='';
      for(const buffer of args[1]){
        for(let j=0;j<buffer.length;){
          const command=buffer[j++];
          const count=[2,2,6,0][command];
          if(count===undefined)throw new Error('Unexpected PDF path command.');
          path+=['M','L','C','Z'][command];
          for(let k=0;k<count;k++)path+=`${k?' ':''}${number(buffer[j++])}`;
        }
      }
      // Use the guideline's canonical digital red rather than CMYK rounding.
      const fill=state.fill==='#d42129'?'#D42028':state.fill;
      if(!['#D42028','#ffffff','#000000'].includes(fill))throw new Error('Unexpected logo color.');
      paths.push(`<path fill="${fill}" transform="matrix(${state.matrix.map(number).join(' ')})" d="${path}"/>`);
    }
  }
  if(paths.length!==22)throw new Error(`Unexpected primary artwork: ${paths.length} paths.`);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="582 231 398 338.3" role="img" aria-labelledby="title"><title id="title">Romina Restaurants</title><g transform="translate(0 841.89) scale(1 -1)">${paths.join('')}</g></svg>\n`;
  writeFileSync('public/brand/romina-logo.svg',svg);
  console.log(`Extracted ${paths.length} original vector paths; no fonts or embedded images.`);
}finally{await document.destroy();}

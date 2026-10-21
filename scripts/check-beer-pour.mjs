// Read-only production-browser verification; run after npm run build.
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
import sharp from 'sharp';

const base='http://localhost:3112';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3112'],{env:{...process.env,BETTER_AUTH_URL:base},windowsHide:true,stdio:'ignore'});
let browser;
try{
  for(let i=0;i<90;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,300));}
  const manifest=JSON.parse(await readFile('public/animations/beer-pour/manifest.json','utf8'));
  for(const file of ['000.webp','030.webp','060.webp','poster.webp']){
    const {data,info}=await sharp(`public/animations/beer-pour/${file}`).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.equal(info.channels,4);assert.equal(data[3],0,'Background is actually transparent');
    assert.ok(data.some((value,index)=>index%4===3&&value===255),'Opaque beer/hand remains');
  }
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[],frames=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(/beer-pour\/\d{3}\.webp/.test(request.url()))frames.push(request.url());});
  await page.goto(base);await page.locator('.rs-food-card').first().waitFor();
  await page.waitForFunction(()=>!document.querySelector('.romina-intro')?.dataset.play);
  assert.equal(frames.length,0,'Animation frames stay deferred above the section');
  const pour=page.locator('.rs-pour');await pour.waitFor();
  await page.waitForFunction(()=>document.querySelector('.rs-pour')?.dataset.mode==='scroll');
  const jump=async progress=>{
    await pour.evaluate((node,value)=>{const start=node.getBoundingClientRect().top+window.scrollY;scrollTo({top:start+(node.offsetHeight-innerHeight)*value,behavior:'instant'});},progress);
    const expected=Math.round(progress*(manifest.frames-1));
    await page.waitForFunction(value=>Number(document.querySelector('.rs-pour')?.dataset.frame)===value,expected);
    const pin=await page.locator('.rs-pour-pin').boundingBox();assert.ok(Math.abs(pin.y)<2,'Pour section stays pinned');
    return expected;
  };
  await jump(.1);const first=await page.locator('.rs-pour canvas').evaluate(node=>node.toDataURL());
  await jump(.8);const next=await page.locator('.rs-pour canvas').evaluate(node=>node.toDataURL());assert.notEqual(first,next,'Canvas pixels follow scroll');
  await jump(.2);await jump(.55);
  await mkdir('.local/previews',{recursive:true});
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:'.local/previews/beer-pour-desktop.png'});
  await page.getByRole('button',{name:'Pause website animations'}).click();
  const held=await pour.getAttribute('data-frame');
  await pour.evaluate(node=>{const start=node.getBoundingClientRect().top+scrollY;scrollTo({top:start+(node.offsetHeight-innerHeight)*.7,behavior:'instant'});});
  await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  assert.equal(await pour.getAttribute('data-frame'),held,'Global pause freezes the pour');
  await page.getByRole('button',{name:'Resume website animations'}).click();await jump(.7);
  for(const width of [320,390,768,1440,1920]){
    const height=width<600?844:width>1600?868:1000;
    await page.setViewportSize({width,height});await jump(.7);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`No overflow at ${width}px`);
    const pairing=await page.locator('.rs-pour-pairing').boundingBox();assert.ok(pairing.y>=0&&pairing.y+pairing.height<=height,'Pairing stays visible');
    if(width>600){const copy=await page.locator('.rs-pour-copy').boundingBox();assert.ok(copy.y+copy.height<pairing.y,'Pairing does not overlap the introduction');}
    if(width===390)await page.screenshot({path:'.local/previews/beer-pour-mobile.png'});
    if(width===1920)await page.screenshot({path:'.local/previews/beer-pour-wide.png'});
  }
  await page.setViewportSize({width:375,height:667});await jump(.7);
  const compact=await page.locator('.rs-pour-pairing').boundingBox();assert.ok(compact.y>=0&&compact.y+compact.height<=667,'Pairing fits a short phone');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('.rs-pour')?.dataset.mode==='still');
  await page.emulateMedia({reducedMotion:'no-preference'});await jump(.7);
  const href=await page.locator('.rs-pour-pairing').getAttribute('href');
  const dishName=await page.locator('.rs-pour-pairing strong').textContent();
  await page.goto(base+href);await page.getByRole('dialog',{name:dishName,exact:true}).waitFor();
  const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});
  const still=await reduced.newPage();let reducedFrames=0;
  still.on('request',request=>{if(/beer-pour\/\d{3}\.webp/.test(request.url()))reducedFrames++;});
  await still.goto(base);await still.locator('.rs-food-card').first().waitFor();await still.locator('.rs-pour').scrollIntoViewIfNeeded();
  assert.equal(await still.locator('.rs-pour').getAttribute('data-mode'),'still');assert.equal(reducedFrames,0);
  assert.equal(await still.locator('.rs-pour-pin').evaluate(node=>getComputedStyle(node).position),'relative');
  const saver=await browser.newContext();await saver.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,addEventListener(){},removeEventListener(){}}}));
  const economical=await saver.newPage();let saverFrames=0;economical.on('request',request=>{if(/beer-pour\/\d{3}\.webp/.test(request.url()))saverFrames++;});
  await economical.goto(base);await economical.locator('.rs-food-card').first().waitFor();await economical.locator('.rs-pour').scrollIntoViewIfNeeded();
  assert.equal(await economical.locator('.rs-pour').getAttribute('data-mode'),'still');assert.equal(saverFrames,0,'Save-Data avoids animation downloads');
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const plain=await noJs.newPage();await plain.goto(base);await plain.locator('.rs-pour:visible').scrollIntoViewIfNeeded();
  await plain.locator('.rs-pour:visible .rs-pour-glass img').evaluate(image=>image.decode());
  assert.equal(await plain.locator('.rs-pour:visible').getAttribute('data-mode'),'still');
  const failure=await browser.newPage();await failure.route('**/beer-pour/0*.webp',route=>route.abort());
  await failure.goto(base);await failure.locator('.rs-food-card').first().waitFor();await failure.locator('.rs-pour').scrollIntoViewIfNeeded();
  await failure.waitForFunction(()=>document.querySelector('.rs-pour')?.dataset.mode==='still');
  await failure.locator('.rs-pour-glass img').evaluate(image=>image.decode());
  assert.deepEqual(errors,[]);
  console.log('PASS: true alpha, deferred loading, forward/reverse scroll frames, pinning, global pause, 320–1920px layouts without copy overlap, live dish link, reduced motion, no JavaScript, and failed-frame poster fallback. No database writes.');
}finally{await browser?.close();server.kill();}

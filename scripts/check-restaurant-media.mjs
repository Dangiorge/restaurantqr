// Read-only UI verification of the curated restaurant homepage. Build first.
import {chromium} from 'playwright-core';
import {spawn} from 'node:child_process';
import {readFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base='http://localhost:3114';
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3114'],{env:{...process.env,BETTER_AUTH_URL:base},windowsHide:true,stdio:'ignore'});
let browser;
try{
  for(const file of ['app/restaurant-site.css','app/beer-pour.css']){
    const css=await readFile(file,'utf8');
    for(const token of css.match(/#[\da-f]{3,8}\b/gi)||[]){
      const raw=token.slice(1).toLowerCase();
      const color=raw.length<=4?raw.slice(0,3).split('').map(c=>c+c).join(''):raw.slice(0,6);
      assert.ok(['d42028','000000','ffffff'].includes(color),`${file}: UI colour ${token} must be in the primary brand palette`);
    }
  }
  const photos=JSON.parse(await readFile('public/media/romina/photos.json','utf8'));
  assert.equal(new Set(photos.map(photo=>photo.sha256)).size,photos.length,'Curated photos have distinct sources');
  assert.ok(!photos.some(photo=>/06-19-43|06-19-24/.test(photo.source)),'Duplicate and promotional poster are excluded');
  for(let i=0;i<90;i++){try{if((await fetch(base)).ok)break;}catch{}await new Promise(resolve=>setTimeout(resolve,300));}
  browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const movieRequests=[];page.on('request',request=>{if(/\/media\/romina\/.*\.mp4/.test(request.url()))movieRequests.push(request.url());});
  await page.goto(base);await page.locator('.rs-food-card').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.locator('.rs-hero-photo img').evaluate(image=>image.decode());
  await page.waitForFunction(()=>!document.querySelector('.romina-intro')?.dataset.play);
  assert.equal(movieRequests.length,0,'No film downloads during initial hero view');
  const images=await page.locator('.rs-site:visible main img').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('src')));
  assert.equal(new Set(images).size,images.length,'Homepage does not repeat a photograph');
  await page.screenshot({path:'.local/previews/romina-curated-hero.png'});
  const kitchen=page.locator('#from-kitchen .rs-film');await kitchen.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const video=document.querySelector('#from-kitchen video');return video.currentTime>.1&&!video.paused;});
  await kitchen.locator('button').hover();await page.waitForFunction(()=>getComputedStyle(document.querySelector('#from-kitchen button')).backgroundColor==='rgb(212, 32, 40)');
  await page.getByRole('button',{name:'Pause from our kitchen film'}).click();assert.equal(await kitchen.locator('video').evaluate(video=>video.paused),true);
  await page.getByRole('button',{name:'Play from our kitchen film'}).click();await page.waitForFunction(()=>!document.querySelector('#from-kitchen video').paused);
  await page.getByRole('button',{name:'Pause website animations'}).click();assert.equal(await kitchen.locator('video').evaluate(video=>video.paused),true,'Global pause stops actual footage');
  assert.match(await page.locator('.rs-motion-toggle').evaluate(node=>getComputedStyle(node).backgroundColor),/^rgba?\(0, 0, 0[,)]/,'Motion-control hover overrides workspace colours');
  await page.getByRole('button',{name:'Resume website animations'}).click();
  const coffee=page.locator('.rs-coffee .rs-film');await coffee.scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('.rs-coffee video').currentTime>.1&&!document.querySelector('.rs-coffee video').paused);
  assert.equal(await kitchen.locator('video').evaluate(video=>video.paused),true,'Offscreen footage pauses');
  await page.locator('#visit .rs-film').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#visit video').currentTime>.1);
  assert.equal(new Set(movieRequests).size,3,'Each reviewed non-beer video has its own section');
  await page.locator('#our-table').scrollIntoViewIfNeeded();await page.getByText('Students, teachers, old friends.',{exact:false}).waitFor();
  await page.getByRole('button',{name:'Pause website animations'}).click();
  await page.screenshot({path:'.local/previews/romina-curated-story.png'});
  // Expand the sticky scene only for the static full-page capture: otherwise
  // browser screenshots show its scroll runway as a misleading empty rectangle.
  const desktopCapture=await page.addStyleTag({content:'.rs-pour[data-mode=scroll]{height:auto!important}.rs-pour[data-mode=scroll] .rs-pour-pin{position:relative!important}'});
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:'.local/previews/romina-curated-desktop.png',fullPage:true});await desktopCapture.evaluate(node=>node.remove());
  for(const width of [320,390,768,1440,1920]){
    await page.setViewportSize({width,height:width<600?844:1000});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Page fits ${width}px`);
  }
  await page.setViewportSize({width:390,height:844});await page.goto(base);await page.locator('.rs-food-card').first().waitFor();await page.evaluate(()=>document.fonts.ready);
  await page.getByRole('button',{name:'Open navigation',exact:true}).click();await page.getByRole('button',{name:'Close navigation',exact:true}).waitFor();await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Pause website animations'}).click();await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  const mobileCapture=await page.addStyleTag({content:'.rs-pour[data-mode=scroll]{height:auto!important}.rs-pour[data-mode=scroll] .rs-pour-pin{position:relative!important}'});
  await page.screenshot({path:'.local/previews/romina-curated-mobile.png',fullPage:true});await mobileCapture.evaluate(node=>node.remove());
  const reduced=await browser.newContext({reducedMotion:'reduce',viewport:{width:390,height:844}});const still=await reduced.newPage();let reducedVideos=0;
  still.on('request',request=>{if(/\/media\/romina\/.*\.mp4/.test(request.url()))reducedVideos++;});await still.goto(base);await still.locator('.rs-food-card').first().waitFor();await still.locator('#from-kitchen').scrollIntoViewIfNeeded();
  assert.equal(await still.locator('#from-kitchen video').getAttribute('src'),null);assert.equal(reducedVideos,0,'Reduced motion uses real posters without movie downloads');
  const saver=await browser.newContext();await saver.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,addEventListener(){},removeEventListener(){}}}));const economical=await saver.newPage();await economical.goto(base);await economical.locator('.rs-food-card').first().waitFor();await economical.locator('.rs-coffee').scrollIntoViewIfNeeded();assert.equal(await economical.locator('.rs-coffee video').getAttribute('src'),null);
  const noJs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const plain=await noJs.newPage();await plain.goto(base);await plain.locator('.rs-site:visible #our-table').scrollIntoViewIfNeeded();assert.equal(await plain.locator('.rs-site:visible .rs-story-copy').evaluate(node=>getComputedStyle(node).opacity),'1');
  for(const image of await plain.locator('.rs-site:visible .rs-film>img').all())await image.evaluate(node=>node.decode());
  const failed=await browser.newPage();await failed.route('**/media/romina/*.mp4',route=>route.abort());await failed.goto(base);await failed.locator('.rs-food-card').first().waitFor();await failed.locator('#from-kitchen').scrollIntoViewIfNeeded();
  await failed.waitForFunction(()=>document.querySelector('#from-kitchen video')?.error);await failed.locator('#from-kitchen .rs-film>img').evaluate(node=>node.decode());assert.equal(await failed.locator('#from-kitchen .rs-film').getAttribute('data-playing'),'false','A failed film keeps its poster');
  assert.deepEqual(errors,[]);
  console.log('PASS: primary brand colours only, distinct curated images, deferred video loading, actual playback and pause, offscreen pause, 320–1920px layouts, mobile navigation, reduced motion, Save-Data, no-JavaScript posters, and no browser errors. No database writes.');
}finally{await browser?.close();server.kill();}

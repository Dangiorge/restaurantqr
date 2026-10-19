import { chromium } from 'playwright-core';
import pg from 'pg';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import {cloudinaryConfiguration} from '../modules/media/cloudinary.mjs';

// Full browser flow, isolated from the user's development records.
const target = new URL(process.env.DATABASE_URL);
const fingerprint = createHash('sha256').update(`${target.hostname}:${target.port || '5432'}${target.pathname}`).digest('hex');
assert.equal(fingerprint, JSON.parse(readFileSync('.local/database-verification.json')).fingerprint);
const schema = `qrmenu_test_${randomUUID().replaceAll('-','')}`;
const base = 'http://localhost:3107';
const connection = new pg.Client({ connectionString: process.env.DATABASE_URL });
async function fixtureQuery(sql,values){
  const client=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000,keepAlive:true});
  await client.connect();
  try{return await client.query(sql,values);}finally{await client.end();}
}
async function openActions(page){const toggle=page.getByRole('button',{name:'More',exact:true});if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();}
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
assert.ok(existsSync(chrome), 'Install Chrome or set CHROME_PATH.');
let server, browser;
const uploadedAssets=[];
// Focused guest-menu checks can use local image fixtures instead of depending
// on the external storage provider. The normal run still tests real uploads.
const guestOnly=process.env.GUEST_ONLY_BROWSER==='1';
const errors = [];
await connection.connect();
try {
  await connection.query(`CREATE SCHEMA "${schema}"`);
  await connection.query(`SET search_path TO "${schema}"`);
  await connection.query((readFileSync('prisma/migrations/20261019090000_phase_one/migration.sql','utf8')+'\n'+readFileSync('prisma/migrations/20261019110000_menu_document/migration.sql','utf8')+'\n'+readFileSync('prisma/migrations/20261019140000_guest_ordering/migration.sql','utf8')+'\n'+readFileSync('prisma/migrations/20261019170000_menu_taxonomy/migration.sql','utf8')+'\n'+readFileSync('prisma/migrations/20261019190000_guest_discovery/migration.sql','utf8')).replace('CREATE SCHEMA IF NOT EXISTS "public";',''));
  // Do not leave an unused admin connection open while the browser works;
  // managed database proxies may close an idle connection between steps.
  await connection.end();
  server = spawn(process.execPath, ['node_modules/next/dist/bin/next','start','-p','3107'], { env: { ...process.env, DATABASE_SCHEMA: schema, BETTER_AUTH_URL: base, ROMINA_RESTAURANT_SLUG:'romina-browser-test' }, windowsHide: true, stdio: 'ignore' });
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(base)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  assert.ok(ready, 'Isolated application server must start');
  browser = await chromium.launch({ executablePath: chrome, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.route('https://images.example.test/**',route=>route.fulfill({path:'public/brand/romina-kitchen.webp',contentType:'image/webp'}));
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  page.setDefaultTimeout(45000);
  mkdirSync('.local/previews',{recursive:true});
  async function uploadInput(label,file){
    const pending=page.waitForResponse(r=>r.url().includes('/uploads?kind=')&&r.request().method()==='POST');
    await page.getByLabel(label,{exact:true}).setInputFiles(file);
    const response=await pending;
    assert.equal(response.status(),200,'Cloudinary upload must succeed');
    const result=await response.json();uploadedAssets.push(result);
    return result;
  }
  await page.goto(`${base}/workspace`);
  await page.getByRole('button',{name:'New here? Create an account'}).click();
  await page.getByLabel('Your name').fill('Browser test owner');
  await page.getByLabel('Email address').fill('browser@example.test');
  await page.getByLabel('Password',{exact:true}).fill(randomUUID()+randomUUID());
  await page.getByRole('button',{name:'Create account',exact:true}).click();
  await page.getByRole('button',{name:'Create restaurant',exact:true}).click();
  await page.getByLabel('Restaurant name',{exact:true}).fill('Romina Browser Test');
  await page.getByLabel('Public slug (lowercase, hyphen-separated)').fill('romina-browser-test');
  await page.getByLabel('Brand profile').selectOption('romina');
  await page.getByRole('button',{name:'Save changes'}).click();
  await page.getByRole('heading',{name:'A little more connected.'}).waitFor();
  await page.getByRole('button',{name:'Branches',exact:true}).click();
  await page.getByRole('button',{name:'+ Add branch'}).click();
  await page.getByLabel('Branch name').fill('Bole');
  await page.getByLabel('Address',{exact:true}).fill('Addis Ababa');
  await page.getByRole('button',{name:'Save changes'}).click();
  await page.getByRole('heading',{name:'Bole',exact:true}).waitFor();
  await page.getByRole('button',{name:'Menus',exact:true}).click();
  await page.getByRole('button',{name:'+ Category'}).click();
  await page.getByLabel('Category name').fill('Mains');
  await page.locator('select[name="menuId"]').selectOption({label:'Main menu'});
  await page.getByRole('button',{name:'Save changes'}).click();
  await page.getByRole('dialog').waitFor({state:'hidden'});
  await page.getByRole('button',{name:'+ Category'}).click();
  await page.getByLabel('Category name').fill('Stews');
  await page.locator('select[name="menuId"]').selectOption({label:'Main menu'});
  await page.getByLabel('Parent category').selectOption({label:'Mains'});
  await page.getByRole('button',{name:'Save changes'}).click();
  await page.getByRole('dialog').waitFor({state:'hidden'});
  let uploadedMenu;
  if(!guestOnly){
    await page.getByRole('button',{name:'Edit menu',exact:true}).click();
    uploadedMenu=await uploadInput('Upload menu file','public/brand/romina-table.webp');
    await page.getByRole('button',{name:'Save changes'}).click();
    await page.getByRole('dialog').waitFor({state:'hidden'});
  }else{
    await fixtureQuery(`UPDATE "${schema}"."Menu" SET "documentUrl"=$1`,['/brand/romina-table.webp']);
    uploadedMenu={url:`${base}/brand/romina-table.webp`};
  }
  await page.getByRole('button',{name:'+ Add dish'}).click();
  await page.getByLabel('Dish name').fill('Test pasta');
  await page.locator('select[name="categoryId"]').selectOption({label:'Mains / Stews'});
  await page.locator('select[name="dietaryType"]').selectOption('VEGAN');
  await page.getByLabel('Base price (ETB)').fill('350.50');
  await page.getByLabel('Description',{exact:true}).fill('A browser test dish.');
  if(!guestOnly)await uploadInput('Upload dish photo','public/brand/romina-kitchen.webp');
  await page.getByRole('button',{name:'Save changes'}).click();
  await page.getByRole('cell',{name:'350.50 ETB'}).waitFor();
  await page.getByRole('combobox',{name:'Filter dishes by dietary type'}).selectOption('NON_VEGAN');
  await page.getByText('No dishes match this dietary type.').waitFor();
  await page.getByRole('combobox',{name:'Filter dishes by dietary type'}).selectOption('VEGAN');
  await page.getByRole('cell',{name:'350.50 ETB'}).waitFor();
  await page.getByRole('combobox',{name:'Filter dishes by dietary type'}).selectOption('all');
  if(guestOnly)await fixtureQuery(`UPDATE "${schema}"."MenuItem" SET "photoUrl"=$1`,['/brand/romina-kitchen.webp']);
  await page.locator('select[name="recommendedItemIds"]').selectOption({label:'Test pasta'});
  await page.getByRole('button',{name:'Save guest experience',exact:true}).click();
  await page.getByText('Guest experience saved.',{exact:true}).waitFor();
  const discoveryAccount=await (await context.request.get(`${base}/api/restaurants`)).json();
  const discoveryRestaurant=discoveryAccount.restaurants[0].id;
  const discoveryOverview=await (await context.request.get(`${base}/api/workspace/${discoveryRestaurant}/overview`)).json();
  const discoveryDish=discoveryOverview.menus.flatMap(menu=>menu.categories.flatMap(category=>category.items))[0];
  const eventResult=await context.request.post(`${base}/api/workspace/${discoveryRestaurant}/guest-content`,{headers:{origin:base},data:{heroUrl:'',recommendedItemIds:[discoveryDish.id],events:[{id:randomUUID(),title:'Live music evening',description:'Join us for music and good food.',posterUrl:'https://images.example.test/event.webp',active:true,startsAt:'',endsAt:''},{id:randomUUID(),title:'Expired event',description:'Hidden',posterUrl:'https://images.example.test/event.webp',active:true,startsAt:'',endsAt:'2020-01-01T00:00:00Z'}]}});
  assert.equal(eventResult.status(),200);
  await page.getByRole('button',{name:'Tables & QR',exact:true}).click();
  await page.getByRole('button',{name:'+ Add table'}).click();
  await page.getByLabel('Table number or name').fill('12');
  await page.locator('select[name="branchId"]').selectOption({label:'Bole'});
  await page.getByRole('button',{name:'Save changes'}).click();
  await page.getByRole('button',{name:'Create QR',exact:true}).click();
  const menuUrl = await page.getByRole('link',{name:'Open menu'}).getAttribute('href');
  const guestContext=await browser.newContext();
  await guestContext.route('https://images.example.test/**',route=>route.fulfill({path:'public/brand/romina-kitchen.webp',contentType:'image/webp'}));
  const menuPage = await guestContext.newPage();
  menuPage.on('pageerror',error=>errors.push(error.message));
  await menuPage.setViewportSize({width:390,height:844});
  await menuPage.goto(`${base}${menuUrl}`);
  await menuPage.screenshot({path:'.local/previews/guest-welcome-mobile.png'});
  await openActions(menuPage);
  await menuPage.getByRole('navigation',{name:'Table actions'}).getByRole('button',{name:'Call waiter',exact:true}).waitFor();
  await menuPage.getByRole('button',{name:'View Menu',exact:true}).click();
  await menuPage.getByRole('heading',{name:'Daily recommendations',exact:true}).waitFor();
  await menuPage.getByRole('heading',{name:'Live music evening',exact:true}).waitFor();
  assert.equal(await menuPage.getByText('Expired event',{exact:true}).count(),0);
  await menuPage.screenshot({path:'.local/previews/guest-discovery-mobile.png',fullPage:true});
  await menuPage.locator('.rg-parent-card').filter({hasText:'Mains'}).click();
  await menuPage.getByRole('heading',{name:'Test pasta'}).waitFor();
  await menuPage.getByRole('navigation',{name:'Menu categories'}).getByRole('button',{name:'Mains',exact:true}).click();
  await menuPage.getByRole('navigation',{name:'Child categories'}).getByRole('button',{name:'Stews',exact:true}).click();
  const diets=menuPage.getByRole('group',{name:'Dietary filters'});
  await diets.getByRole('button',{name:'Non-vegan',exact:true}).click();
  await menuPage.getByRole('heading',{name:'No matching dishes.'}).waitFor();
  await diets.getByRole('button',{name:'Vegan',exact:true}).click();
  await menuPage.getByRole('heading',{name:'Test pasta',exact:true}).waitFor();
  assert.equal(await diets.getByRole('button',{name:'Vegan',exact:true}).getAttribute('aria-pressed'),'true');
  await menuPage.screenshot({path:'.local/previews/guest-dietary-categories.png',fullPage:true});
  await diets.getByRole('button',{name:'All',exact:true}).click();
  await menuPage.getByText('Prefer our printed menu?').click();
  await menuPage.getByRole('link',{name:/View Main menu/}).waitFor();
  await menuPage.locator('.rm-dish-photo').scrollIntoViewIfNeeded();
  assert.equal(await menuPage.locator('.rm-dish-photo').evaluate(async image=>{await image.decode();return image.naturalWidth>0;}),true);
  await context.request.post(`${base}/api/workspace/${discoveryRestaurant}/guest-content`,{headers:{origin:base},data:{heroUrl:'',recommendedItemIds:[discoveryDish.id],events:[]}});
  const guestPage=await guestContext.newPage();await guestPage.goto(`${base}/menu`);
  await guestPage.getByRole('button',{name:'View Menu',exact:true}).click();
  assert.equal(await guestPage.getByRole('region',{name:'Events',exact:true}).count(),0);
  assert.equal(await guestPage.getByRole('navigation',{name:'Table actions'}).getByRole('button',{name:'Call waiter',exact:true}).count(),0);
  await guestPage.getByRole('heading',{name:'Test pasta'}).waitFor();
  await guestPage.getByRole('searchbox',{name:'Search the menu'}).fill('missing dish');
  await guestPage.getByRole('heading',{name:'No matching dishes.'}).waitFor();
  await openActions(guestPage);
  await guestPage.getByRole('navigation',{name:'Table actions'}).getByRole('button',{name:'More help',exact:true}).click();
  await guestPage.getByRole('button',{name:/Ask for bill/}).click();
  await guestPage.getByRole('heading',{name:'Join us at the table',exact:true}).waitFor();
  await guestPage.getByRole('button',{name:'Close',exact:true}).click();
  const home=await context.newPage();await home.goto(base);await home.getByRole('heading',{name:/There’s always/}).waitFor();
  await home.screenshot({path:'.local/previews/romina-home-desktop.png',fullPage:true});
  await home.setViewportSize({width:390,height:844});await home.screenshot({path:'.local/previews/romina-home-mobile.png',fullPage:true});
  assert.equal(await home.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
  const delivery=await context.request.get(uploadedMenu.url);
  assert.equal(delivery.status(),200,'Image menu delivery must work');

  assert.equal(await menuPage.locator('.dish-price').textContent(),'350.50 ETB');
  assert.equal(await menuPage.locator('.rm-brand-logo').evaluate(image => image.complete && image.naturalWidth > 0),true);
  assert.equal(await menuPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),true,'Mobile menu must not overflow');
  mkdirSync('.local/previews',{recursive:true});
  await menuPage.evaluate(()=>window.scrollTo(0,0));
  await menuPage.screenshot({path:'.local/previews/menu-mobile.png',fullPage:true});
  const download = await context.request.get(`${base}${await page.getByRole('link',{name:'Download QR'}).getAttribute('href')}`);
  assert.equal(download.status(),200);
  assert.match(download.headers()['content-type'],/image\/svg\+xml/);
  const printPage = await context.newPage();
  await printPage.goto(`${base}${await page.getByRole('link',{name:'Print card'}).getAttribute('href')}`);
  await printPage.getByRole('heading',{name:'Table 12',exact:true}).waitFor();
  await printPage.screenshot({path:'.local/previews/qr-print.png',fullPage:true});
  await menuPage.getByRole('button',{name:'View Test pasta',exact:true}).click();
  await menuPage.getByRole('button',{name:'Increase dish quantity'}).click();
  await menuPage.getByRole('button',{name:'Decrease dish quantity'}).click();
  await menuPage.getByLabel('Special instructions').fill('Less salt.');
  await menuPage.screenshot({path:'.local/previews/guest-detail-mobile.png'});
  await menuPage.getByRole('button',{name:/Add to cart/}).click();
  await menuPage.getByRole('button',{name:/View your order/}).click();
  await menuPage.getByRole('button',{name:'Place order',exact:true}).waitFor({state:'visible'});
  await menuPage.getByRole('textbox').fill('No chilli, please.');
  await menuPage.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.trim()==='Place order'&&!b.disabled));
  const restaurants=await (await context.request.get(`${base}/api/restaurants`)).json();
  const restaurantId=restaurants.restaurants[0].id;
  // Change only the price in this isolated fixture while the guest holds an
  // older quote. Staff authorization is covered by the database service tests.
  await fixtureQuery(`UPDATE "${schema}"."MenuItem" SET "basePrice"=$1 WHERE name=$2`,['375.00','Test pasta']);
  await menuPage.getByRole('button',{name:'Place order',exact:true}).click();
  await menuPage.getByRole('alert').filter({hasText:'Menu prices changed'}).waitFor();
  await menuPage.waitForFunction(()=>document.querySelector('.rm-total dd')?.textContent.includes('375.00'));
  await menuPage.getByRole('button',{name:'Place order',exact:true}).click();
  await menuPage.getByRole('heading',{name:'Sent to the restaurant',exact:true}).waitFor();
  await menuPage.screenshot({path:'.local/previews/guest-order-confirmation.png',fullPage:true});
  await menuPage.getByRole('button',{name:'Close',exact:true}).click();
  await openActions(menuPage);
  await menuPage.getByRole('navigation',{name:'Table actions'}).getByRole('button',{name:'Call waiter',exact:true}).click();
  await menuPage.getByRole('heading',{name:'Request sent',exact:true}).waitFor();
  await menuPage.getByRole('button',{name:'Close',exact:true}).click();
  await openActions(menuPage);
  await menuPage.getByRole('navigation',{name:'Table actions'}).getByRole('button',{name:'Ask for bill',exact:true}).click();
  await menuPage.getByRole('heading',{name:'Request sent',exact:true}).waitFor();
  await menuPage.getByRole('button',{name:'Close',exact:true}).click();
  const queue=await (await context.request.get(`${base}/api/workspace/${restaurantId}/operations`)).json();
  assert.equal(queue.orders.length,1);assert.equal(Number(queue.orders[0].total),375.00);
  assert.equal(queue.orders[0].notes,'No chilli, please.\nTest pasta: Less salt.');
  assert.ok(queue.requests.some(r=>r.type==='WAITER'));assert.ok(queue.requests.some(r=>r.type==='BILL'));
  const accepted=await context.request.patch(`${base}/api/workspace/${restaurantId}/operations`,{headers:{origin:base},data:{kind:'order',id:queue.orders[0].id,status:'ACCEPTED'}});
  assert.equal(accepted.status(),200);
  await menuPage.reload();
  await menuPage.getByRole('button',{name:'View Menu',exact:true}).click();
  await menuPage.getByText('Your order is accepted',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Live service',exact:true}).click();
  await page.getByRole('heading',{name:'Incoming orders',exact:false}).waitFor();
  await page.screenshot({path:'.local/previews/live-service-desktop.png',fullPage:true});
  await page.getByRole('button',{name:'Tables & QR',exact:true}).click();
  await page.getByRole('button',{name:'Revoke QR',exact:true}).click();
  await page.getByRole('link',{name:'Download QR'}).waitFor({state:'hidden'});
  await menuPage.reload();
  await menuPage.getByRole('heading',{name:'This menu link is unavailable.'}).waitFor();
  await page.getByRole('button',{name:'Overview',exact:true}).click();
  await page.screenshot({path:'.local/previews/workspace-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:'.local/previews/workspace-mobile.png',fullPage:true});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),true,'Mobile workspace must not overflow');
  assert.equal((await context.request.get(`${base}/api/platform`)).status(),403);
  assert.equal((await context.request.post(`${base}/api/workspace/not-your-tenant/uploads?kind=menu`,{headers:{origin:base}})).status(),403);
  const guest = await browser.newContext();
  assert.equal((await guest.request.get(`${base}/api/restaurants`)).status(),401);
  assert.equal((await guest.request.post(`${base}/api/workspace/not-your-tenant/uploads?kind=menu`,{headers:{origin:base}})).status(),401);
  assert.deepEqual(errors,[],'No browser runtime errors');
  console.log('Browser flow passed: redesigned guest menu, cart, changed-price review, anonymous dine-in order, waiter/bill requests, staff acceptance and guest tracking, public-menu table restrictions, mobile layouts, image uploads and QR revocation.');
  if(guestOnly)console.log('Image uploads used local isolated test fixtures; Cloudinary was not called in this focused run.');
} finally {
  if (browser) await browser.close();
  if (server && server.exitCode === null) { server.kill(); await new Promise(resolve => server.once('exit',resolve)); }
  assert.match(schema,/^qrmenu_test_[a-f0-9]{32}$/);
  await connection.end().catch(()=>{});
  await fixtureQuery(`DROP SCHEMA "${schema}" CASCADE`);
  if(uploadedAssets.length){
    const config=cloudinaryConfiguration();
    for(const asset of uploadedAssets){
      const type=asset.type==='application/pdf'?'raw':'image';
      const response=await fetch(`https://api.cloudinary.com/v1_1/${config.cloud}/${type}/destroy`,{method:'POST',headers:{Authorization:`Basic ${Buffer.from(`${config.key}:${config.secret}`).toString('base64')}`,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({public_id:asset.publicId,invalidate:'true'}),signal:AbortSignal.timeout(20000)});
      if(!response.ok)console.log('A Cloudinary test asset needs manual cleanup.');
    }
  }
}

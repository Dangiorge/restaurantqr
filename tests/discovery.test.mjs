import test from 'node:test';
import assert from 'node:assert/strict';
import {guestDiscovery,orderInstructions,nextDiscoveryChange} from '../modules/menus/discovery.mjs';
import {guestContentInput,appearanceInput} from '../modules/validation.mjs';
import {menuAppearance,menuBackground} from '../modules/menus/appearance.mjs';
import {websiteContent,menuDestination} from '../modules/menus/website.mjs';
import {mutate} from '../modules/workspace/service.mjs';

test('discovery skips unavailable recommendations and draft, future or expired events',()=>{
  const dishes=[{id:'a',available:true},{id:'b',available:false},{id:'c',available:true}];
  const now=Date.parse('2026-10-19T10:00:00Z');
  const event={id:'event',active:true,posterUrl:'https://example.test/poster.jpg'};
  const result=guestDiscovery({recommendedItemIds:['b','c','missing'],events:[event,{...event,id:'draft',active:false},{...event,id:'expired',endsAt:'2026-10-18T10:00:00Z'},{...event,id:'future',startsAt:'2026-10-20T10:00:00Z'}]},dishes,now);
  assert.deepEqual(result.recommendations.map(item=>item.id),['c']);assert.deepEqual(result.events.map(item=>item.id),['event']);
  assert.deepEqual(guestDiscovery({},dishes,now).slides.map(item=>item.id),['a','c']);
  assert.equal(guestDiscovery({},dishes,now).events.length,0);
});
test('dish instructions are included only for dishes in the submitted cart',()=>{
  assert.equal(orderInstructions([{itemId:'a',quantity:2}],[{id:'a',name:'Shiro'}],' No cutlery ',{a:' Less spicy ',removed:'Do not include'}),'No cutlery\nShiro: Less spicy');
});

test('website uses current published menu data and deep links only to dishes in that menu',()=>{
  const menus=[{categories:[{id:'parent',name:'Traditional',parentId:null,items:[]},{id:'child',name:'Stews',parentId:'parent',items:[{id:'dish',name:'Shiro',photoUrl:'https://example.test/shiro.webp',available:true,basePrice:'300.50'},{id:'sold',name:'Sold out',available:false}]}]}];
  const data=websiteContent({menus,settings:{guestContent:{recommendedItemIds:['sold','dish','foreign']}}});
  assert.deepEqual(data.featured.map(item=>item.id),['dish']);assert.equal(data.featured[0].basePrice,'300.50');assert.equal(data.categories.length,1);assert.equal(data.categories[0].count,2);
  assert.equal(data.hero,'https://example.test/shiro.webp');
  assert.equal(menuDestination(menus,{dish:'dish'}).dish.categoryName,'Stews');assert.equal(menuDestination(menus,{dish:'dish'}).category,'child');
  assert.equal(menuDestination(menus,{category:'parent'}).screen,'items');assert.equal(menuDestination(menus,{view:'menu'}).screen,'menu');
  assert.equal(menuDestination(menus,{dish:'foreign'}).dish,null);assert.equal(menuDestination(menus,{category:['parent']}).screen,'welcome');
  menus[0].categories[0].items.push({id:'extra',name:'Another available dish',available:true,basePrice:'250.00'});
  assert.deepEqual(websiteContent({menus,settings:{guestContent:{recommendedItemIds:['dish']}}}).featured.map(item=>item.id),['dish','extra']);
  assert.equal(websiteContent(null).featured.length,0);assert.equal(menuDestination([],{}).screen,'welcome');
});
test('guest-content input rejects invalid event schedules, unsafe posters and duplicate recommendations',()=>{
  assert.deepEqual(guestContentInput.parse({}),{heroUrl:'',backgrounds:[],recommendedItemIds:[],events:[]});
  const event={id:crypto.randomUUID(),title:'Music evening',posterUrl:'https://example.test/poster.jpg'};
  assert.equal(guestContentInput.safeParse({events:[{...event,startsAt:'2026-10-20T10:00:00Z',endsAt:'2026-10-19T10:00:00Z'}]}).success,false);
  assert.equal(guestContentInput.safeParse({events:[{...event,posterUrl:'javascript:alert(1)'}]}).success,false);
  assert.equal(guestContentInput.safeParse({recommendedItemIds:['a','a']}).success,false);
});

test('scheduled backgrounds honor priority, event publication, boundaries and legacy fallback',()=>{
  const now=Date.parse('2026-10-19T10:00:00Z');
  const base={id:'base',url:'https://example.test/base.webp',label:'Everyday',active:true,priority:0,startsAt:'',endsAt:'',eventId:null};
  const event={id:'concert',active:true,posterUrl:'https://example.test/event.webp'};
  const content={heroUrl:'https://example.test/fallback.webp',events:[event],backgrounds:[base,{...base,id:'event',url:'https://example.test/concert.webp',eventId:'concert'},{...base,id:'future',priority:100,startsAt:'2026-10-19T10:00:10Z'}]};
  assert.equal(guestDiscovery(content,[],now).backgroundId,'event');
  assert.equal(guestDiscovery(content,[],now+10000).backgroundId,'future');
  assert.equal(nextDiscoveryChange(content,now),10001);
  assert.equal(guestDiscovery({...content,events:[{...event,active:false}]},[],now).backgroundId,'base');
  assert.equal(guestDiscovery({heroUrl:content.heroUrl,backgrounds:[{...base,endsAt:'2026-10-19T10:00:00Z'}]},[],now).heroUrl,content.heroUrl);
  assert.equal(guestDiscovery({heroUrl:content.heroUrl,backgrounds:[{...base,active:false}]},[],now).heroUrl,content.heroUrl);
  assert.equal(nextDiscoveryChange({},now),30000);
});

test('background validation rejects reversed schedules, unlinked events and duplicate IDs',()=>{
  const image={id:crypto.randomUUID(),label:'Dinner',url:'https://example.test/dinner.webp'};
  assert.equal(guestContentInput.safeParse({backgrounds:[{...image,startsAt:'2026-10-20T10:00:00Z',endsAt:'2026-10-19T10:00:00Z'}]}).success,false);
  assert.equal(guestContentInput.safeParse({backgrounds:[{...image,eventId:crypto.randomUUID()}]}).success,false);
  assert.equal(guestContentInput.safeParse({backgrounds:[image,image]}).success,false);
  assert.equal(guestContentInput.safeParse({backgrounds:[{...image,url:'javascript:alert(1)'}]}).success,false);
  assert.equal(guestContentInput.safeParse({backgrounds:[image]}).success,true);
});
test('publishing discovery content requires restaurant-wide edit permission and rejects foreign dishes',async()=>{
  const user={id:'user',status:'ACTIVE'};
  let saved=false;
  const tx={$executeRaw:async()=>{},membership:{findUnique:async()=>({status:'ACTIVE',restaurant:{status:'ACTIVE'},allBranches:true,branches:[],role:{permissions:[{permissionKey:'menu.edit'}]}})},menuItem:{count:async()=>0},restaurantSettings:{findUnique:async()=>({guestContent:{}}),update:async()=>{saved=true;}},auditLog:{create:async()=>({})}};
  const db={$transaction:callback=>callback(tx)};
  await assert.rejects(mutate(db,user,'restaurant','guest-content',{recommendedItemIds:['foreign']}),error=>error.status===400);assert.equal(saved,false);
  await mutate(db,user,'restaurant','guest-content',{});assert.equal(saved,true);
  tx.membership.findUnique=async()=>null;
  await assert.rejects(mutate(db,user,'other','guest-content',{}),error=>error.status===403);
});

test('appearance rejects unsafe backgrounds and unreadable glass settings; chooses scheduled or separate images',()=>{
  for(const input of [{backgroundUrl:'javascript:alert(1)'},{panelOpacity:1},{overlay:99},{blur:100},{motion:'yes'},{style:'unknown'}])assert.equal(appearanceInput.safeParse(input).success,false);
  assert.equal(menuAppearance().style,'glass');
  assert.equal(menuBackground(menuAppearance(),'scheduled','fallback'),'scheduled');
  assert.equal(menuBackground(menuAppearance({useWelcomeBackground:false,backgroundUrl:'custom'}),'scheduled','fallback'),'custom');
  assert.equal(menuBackground(menuAppearance({useWelcomeBackground:false}),'scheduled','fallback'),'fallback');
});

test('appearance and content saves preserve each other, and reject branch-limited or unauthorized edits',async()=>{
  const user={id:'user',status:'ACTIVE'};
  let limited=false,allowed=true;
  let content={heroUrl:'https://example.test/welcome.webp',events:[],backgrounds:[],recommendedItemIds:[]};
  const tx={$executeRaw:async()=>{},membership:{findUnique:async()=>allowed?{status:'ACTIVE',restaurant:{status:'ACTIVE'},allBranches:!limited,branches:[],role:{permissions:[{permissionKey:'menu.edit'}]}}:null},menuItem:{count:async()=>0},restaurantSettings:{findUnique:async()=>({guestContent:content}),update:async({data})=>{content=data.guestContent;}},auditLog:{create:async()=>({})}};
  const db={$transaction:callback=>callback(tx)};
  await mutate(db,user,'restaurant','appearance',{style:'classic',backgroundUrl:'https://example.test/menu.webp'});
  assert.equal(content.heroUrl,'https://example.test/welcome.webp');assert.equal(content.appearance.style,'classic');
  await mutate(db,user,'restaurant','guest-content',{heroUrl:'https://example.test/new.webp'});
  assert.equal(content.appearance.style,'classic');assert.equal(content.appearance.backgroundUrl,'https://example.test/menu.webp');
  limited=true;await assert.rejects(mutate(db,user,'restaurant','appearance',{}),error=>error.status===403);
  allowed=false;await assert.rejects(mutate(db,user,'other','appearance',{}),error=>error.status===403);
});

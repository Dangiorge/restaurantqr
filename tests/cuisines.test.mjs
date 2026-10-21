import test from 'node:test';
import assert from 'node:assert/strict';
import {cuisineJourney} from '../modules/menus/cuisines.mjs';

const dish=(id,extra={})=>({id,name:id,available:true,basePrice:'350.50',photoUrl:`https://example.test/${id}.webp`,...extra});
test('cuisine journey inherits parent cuisine and links only available published menu dishes',()=>{
  const restaurant={menus:[{categories:[
    {id:'eth',name:'Traditional Food',items:[dish('shiro')]},
    {id:'europe',name:'European cuisine',items:[]},
    {id:'pasta',name:'Pasta',parentId:'europe',items:[dish('pasta'),dish('sold',{available:false}),dish('hidden',{active:false})]},
    {id:'asia',name:'Asian cuisine',items:[dish('rice')]},
    {id:'drinks',name:'Drinks',items:[dish('coffee')]},
    {id:'draft',name:'Ethiopian',active:false,items:[dish('draft')]},
    {id:'draft-child',name:'Stews',parentId:'draft',items:[dish('draft-child')]},
  ]},{active:false,categories:[{id:'unpublished',name:'Asian',items:[dish('unpublished')]}]}]};
  const [ethiopia,europe,asia]=cuisineJourney(restaurant);
  assert.deepEqual(ethiopia.dishes.map(item=>item.id),['shiro']);
  assert.equal(ethiopia.categoryId,'eth');
  assert.deepEqual(europe.dishes.map(item=>item.id),['pasta']);
  assert.equal(europe.categoryId,'europe');assert.equal(europe.dishes[0].basePrice,'350.50');
  assert.deepEqual(asia.dishes.map(item=>item.id),['rice']);
});

test('cuisine journey handles specific child categories, missing menus and photograph-first bounded cards',()=>{
  const result=cuisineJourney({menus:[{categories:[
    {id:'food',name:'Food',items:[]},
    {id:'italian',name:'Italian',parentId:'food',items:[dish('no-photo',{photoUrl:''}),dish('one'),dish('two'),dish('three'),dish('four'),dish('four')]},
    {id:'japanese',name:'Japanese',parentId:'food',items:[dish('japanese')]},
    {id:'cycle',name:'Other',parentId:'cycle',items:[dish('ignored')]},
  ]}]});
  assert.equal(result[1].count,5);assert.equal(result[1].dishes.length,3);
  assert.deepEqual(result[1].dishes.map(item=>item.id),['one','two','three']);
  assert.equal(result[1].categoryId,'italian');assert.equal(result[2].categoryId,'japanese');
  assert.deepEqual(cuisineJourney(null).map(stop=>[stop.id,stop.dishes.length,stop.categoryId]),[['ethiopia',0,null],['europe',0,null],['asia',0,null]]);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {categoryRows,filterMenuCategories} from '../modules/menus/taxonomy.mjs';
import {itemInput,categoryInput} from '../modules/validation.mjs';

const categories=[
  {id:'child',name:'Stews',parentId:'root',displayOrder:0,items:[{id:'vegan',name:'Shiro',description:'Chickpea stew',dietaryType:'VEGAN'},{id:'meat',name:'Doro',description:'Chicken stew',dietaryType:'NON_VEGAN'}]},
  {id:'root',name:'Traditional',parentId:null,displayOrder:10,items:[{id:'unknown',name:'Daily special',dietaryType:'UNSPECIFIED'}]},
  {id:'drinks',name:'Drinks',parentId:null,displayOrder:20,items:[{id:'juice',name:'Juice',dietaryType:'VEGAN'}]},
];
test('parent categories include their children and combine dietary and search filters',()=>{
  assert.deepEqual(categoryRows(categories).map(c=>c.path),['Traditional','Traditional / Stews','Drinks']);
  assert.deepEqual(filterMenuCategories(categories,{category:'root',diet:'VEGAN',search:'chickpea'}).flatMap(c=>c.items.map(i=>i.id)),['vegan']);
  assert.deepEqual(filterMenuCategories(categories,{category:'child',diet:'NON_VEGAN'}).flatMap(c=>c.items.map(i=>i.id)),['meat']);
  assert.equal(filterMenuCategories(categories,{category:'drinks',diet:'NON_VEGAN'}).length,0);
  assert.deepEqual(filterMenuCategories(categories,{diet:'VEGAN'}).flatMap(c=>c.items.map(i=>i.id)),['vegan','juice']);
  assert.equal(filterMenuCategories(categories).flatMap(c=>c.items).length,4);
});
test('new dietary input remains unclassified by default and rejects unsupported values',()=>{
  assert.equal(itemInput.parse({name:'Dish',categoryId:'category',basePrice:'100'}).dietaryType,'UNSPECIFIED');
  assert.equal(itemInput.safeParse({name:'Dish',categoryId:'category',basePrice:'100',dietaryType:'VEGETARIAN'}).success,false);
  assert.equal(categoryInput.parse({name:'Root',menuId:'menu',parentId:''}).parentId,null);
});

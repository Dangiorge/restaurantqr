import test from 'node:test';
import assert from 'node:assert/strict';
import { itemInput, settingsInput, branchInput } from '../modules/validation.mjs';
test('money rejects negative, non-finite, excess precision and overflow values', () => {
  for (const basePrice of ['-1','NaN','Infinity','1.234','10000000000']) assert.equal(itemInput.safeParse({ name:'Dish', categoryId:'category', basePrice }).success, false);
});
test('executable URLs are rejected', () => {
  assert.equal(itemInput.safeParse({ name:'Dish', categoryId:'category', basePrice:'10', photoUrl:'javascript:alert(1)' }).success, false);
  for(const photoUrl of ['/unknown/image.png','not a url','https://']){
    assert.equal(itemInput.safeParse({name:'Dish',categoryId:'category',basePrice:'10',photoUrl}).success,false,'Malformed URLs must fail validation without throwing an unrelated TypeError');
  }
});
test('invalid time zones, hours and tax rates are rejected', () => {
  assert.equal(branchInput.safeParse({ name:'Branch', timezone:'Unknown/Zone' }).success, false);
  assert.equal(branchInput.safeParse({ name:'Branch', openingHours:{mon:'25:00-26:00'} }).success, false);
  assert.equal(settingsInput.safeParse({ name:'Restaurant', primaryColor:'#D42028', currency:'ETB', timezone:'Africa/Addis_Ababa', taxRate:101, serviceChargeRate:0 }).success, false);
});

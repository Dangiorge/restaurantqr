import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateTotals,cartInput,orderInput,serviceInput} from '../modules/ordering/service.mjs';
import {HttpError,respond} from '../lib/http.mjs';
test('order math uses exact cents and independently rounds subtotal taxes and service',()=>{
  assert.deepEqual(calculateTotals([{unitPrice:'250.25',quantity:2}],'15','10'),{subtotal:'500.50',taxAmount:'75.08',serviceAmount:'50.05',total:'625.63'});
  assert.deepEqual(calculateTotals([{unitPrice:'0.10',quantity:3}],'0','0'),{subtotal:'0.30',taxAmount:'0.00',serviceAmount:'0.00',total:'0.30'});
});
test('guest payloads reject browser prices and preserve actionable price-conflict messages',async()=>{
  assert.equal(cartInput.safeParse({items:[{itemId:'item',quantity:1,price:'0.01'}]}).success,false);
  assert.equal(cartInput.safeParse({items:[{itemId:'item',quantity:21}]}).success,false);
  assert.equal(orderInput.safeParse({items:[{itemId:'item',quantity:1}],requestKey:crypto.randomUUID()}).success,false);
  assert.equal(serviceInput.safeParse({type:'PAYMENT',requestKey:crypto.randomUUID()}).success,false);
  const conflict=await respond(async()=>{throw new HttpError(409,'Menu prices changed. Review the updated totals.');});
  assert.equal(conflict.status,409);
  assert.equal((await conflict.json()).error,'Menu prices changed. Review the updated totals.');
  const duplicate=await respond(async()=>{throw Object.assign(new Error('internal unique constraint detail'),{code:'P2002'});});
  assert.equal((await duplicate.json()).error,'That record already exists.');
});

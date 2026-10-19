import test from 'node:test';
import assert from 'node:assert/strict';
import {createAuthClient} from 'better-auth/react';
import {appOrigin} from '../lib/app-origin.mjs';
import {sameOrigin} from '../lib/http.mjs';

test('deployment hostnames become HTTPS origins and initialize the auth client during SSR',()=>{
  const origin=appOrigin(' restaurantqr-zeta.vercel.app ');
  assert.equal(origin,'https://restaurantqr-zeta.vercel.app');
  assert.doesNotThrow(()=>createAuthClient({baseURL:origin}));
  assert.equal(appOrigin('https://example.com/'),'https://example.com');
  assert.equal(appOrigin('http://localhost:3107/'),'http://localhost:3107');
});

test('auth origins reject credentials, paths, query strings, fragments and executable schemes',()=>{
  for(const value of [null,'','   ','https://user:password@example.com','https://example.com/api/auth','https://example.com?redirect=elsewhere','https://example.com/#section','javascript:alert(1)','file:///tmp','https://','example.com:99999']){
    assert.throws(()=>appOrigin(value),/Configure BETTER_AUTH_URL/);
  }
});

test('request origin checks accept the normalized host and continue rejecting other origins',()=>{
  const previous=process.env.BETTER_AUTH_URL;
  process.env.BETTER_AUTH_URL='restaurantqr-zeta.vercel.app';
  try{
    assert.doesNotThrow(()=>sameOrigin(new Request('https://restaurantqr-zeta.vercel.app/api/restaurants',{headers:{origin:'https://restaurantqr-zeta.vercel.app'}})));
    for(const origin of ['https://other.vercel.app','http://restaurantqr-zeta.vercel.app','null']){
      assert.throws(()=>sameOrigin(new Request('https://restaurantqr-zeta.vercel.app/api/restaurants',{headers:{origin}})),error=>error.status===403);
    }
  }finally{
    if(previous===undefined)delete process.env.BETTER_AUTH_URL;
    else process.env.BETTER_AUTH_URL=previous;
  }
});

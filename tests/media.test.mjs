import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {prepareFile,uploadFile,cloudinaryConfiguration,MAX_UPLOAD} from '../modules/media/cloudinary.mjs';

test('uploads validate contents and re-encode actual images',async()=>{
  const bytes=await sharp({create:{width:8,height:8,channels:3,background:'#d42028'}}).png().toBuffer();
  const prepared=await prepareFile(new File([bytes],'photo.png',{type:'image/png'}),'dish');
  assert.equal(prepared.contentType,'image/webp');
  assert.equal((await sharp(prepared.bytes).metadata()).format,'webp');
  await assert.rejects(prepareFile(new File(['not a photo'],'fake.png',{type:'image/png'}),'dish'),e=>e.status===400);
  await assert.rejects(prepareFile(new File(['<svg/>'],'logo.svg',{type:'image/svg+xml'}),'logo'),e=>e.status===400);
});
test('PDFs are limited to menus and file size is bounded',async()=>{
  const file=new File(['%PDF-1.7\n%%EOF'],'menu.pdf',{type:'application/pdf'});
  assert.equal((await prepareFile(file,'menu')).resourceType,'raw');
  await assert.rejects(prepareFile(file,'dish'),e=>e.status===400);
  await assert.rejects(prepareFile({size:MAX_UPLOAD+1,arrayBuffer:async()=>new ArrayBuffer(0)},'menu'),e=>e.status===400);
});
test('Cloudinary uses only server credentials and a server-chosen tenant namespace',async()=>{
  const previous=process.env.CLOUDINARY_URL;
  process.env.CLOUDINARY_URL='cloudinary://test-key:test-secret@test-cloud';
  try{
    const result=await uploadFile({bytes:Buffer.from('test'),resourceType:'raw',extension:'pdf',contentType:'application/pdf',filename:'menu.pdf'},'tenant-a','menu',async(url,options)=>{
      assert.equal(url,'https://api.cloudinary.com/v1_1/test-cloud/raw/upload');
      assert.match(options.body.get('public_id'),/^qrmenu\/tenant-a\/menu\/[a-f0-9-]+\.pdf$/);
      assert.equal(options.body.get('overwrite'),'false');
      assert.ok(options.headers.Authorization.startsWith('Basic '));
      const id=options.body.get('public_id');
      return Response.json({secure_url:`https://res.cloudinary.com/test-cloud/raw/upload/v1/${id}`,public_id:id});
    });
    assert.equal('secret' in result,false);
    assert.equal('key' in result,false);
    assert.equal(result.type,'application/pdf');
    await assert.rejects(uploadFile({bytes:Buffer.from('x'),resourceType:'image',extension:'webp',contentType:'image/webp'},'tenant-a','dish',async()=>Response.json({error:'test-secret'},{status:401})),e=>!e.message.includes('test-secret')&&e.status===502);
    process.env.CLOUDINARY_URL='invalid';
    assert.throws(cloudinaryConfiguration,e=>e.status===503&&!e.message.includes('invalid'));
  }finally{if(previous===undefined)delete process.env.CLOUDINARY_URL;else process.env.CLOUDINARY_URL=previous;}
});

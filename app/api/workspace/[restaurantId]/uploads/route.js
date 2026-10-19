import { database } from '@/lib/db.mjs';
import { currentUser, HttpError, respond, sameOrigin } from '@/lib/http.mjs';
import { context, tenantWide } from '@/modules/identity/context.mjs';
import { MAX_UPLOAD, prepareFile, uploadFile } from '@/modules/media/cloudinary.mjs';

export function POST(request,{params}) {
  return respond(async () => {
    sameOrigin(request);
    const user = await currentUser(request);
    const {restaurantId} = await params;
    const kind = new URL(request.url).searchParams.get('kind');
    if (!['logo','dish','menu'].includes(kind)) throw new HttpError(400,'Choose an upload destination.');
    const db=database();
    const ctx=await context(db,user,restaurantId,kind === 'logo' ? 'restaurant.manage' : 'menu.edit');
    tenantWide(ctx);
    const recent = await db.auditLog.count({where:{restaurantId,actorId:user.id,action:'media.uploaded',createdAt:{gte:new Date(Date.now()-3600000)}}});
    if (recent >= 60) throw new HttpError(429,'Upload limit reached. Please try again later.');
    const reader=request.body?.getReader();
    if (!reader) throw new HttpError(400,'Choose a file.');
    const chunks=[]; let size=0;
    try {
      while(true) {
        const {done,value}=await reader.read();
        if(done) break;
        size+=value.byteLength;
        if(size>MAX_UPLOAD+65536) { await reader.cancel(); throw new HttpError(413,'Choose a file smaller than 12 MB.'); }
        chunks.push(Buffer.from(value));
      }
    } finally { reader.releaseLock(); }
    let form;
    try { form=await new Response(Buffer.concat(chunks),{headers:{'Content-Type':request.headers.get('content-type') || ''}}).formData(); }
    catch { throw new HttpError(400,'Invalid file upload.'); }
    if ([...form.keys()].length !== 1 || !form.has('file')) throw new HttpError(400,'Upload one file at a time.');
    const prepared=await prepareFile(form.get('file'),kind);
    const result=await uploadFile(prepared,restaurantId,kind);
    if(result.type==='application/pdf'){
      try{
        const delivery=await fetch(result.url,{method:'HEAD',signal:AbortSignal.timeout(10000)});
        if(!delivery.ok)result.warning='PDF uploaded, but Cloudinary is blocking public PDF delivery. Enable “Allow delivery of PDF and ZIP files” in Cloudinary Settings → Security before publishing this menu, or use an image menu.';
      }catch{result.warning='PDF uploaded, but public delivery could not be verified. Open the uploaded file to check it before publishing.';}
    }
    await db.auditLog.create({data:{restaurantId,actorId:user.id,action:'media.uploaded',entityId:result.publicId,details:{kind,type:result.type}}});
    return result;
  });
}

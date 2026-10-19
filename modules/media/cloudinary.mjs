import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { HttpError } from '../../lib/http.mjs';

export const MAX_UPLOAD = 12 * 1024 * 1024;
export function cloudinaryConfiguration() {
  try {
    const url = new URL(process.env.CLOUDINARY_URL);
    if (url.protocol !== 'cloudinary:' || !/^[a-zA-Z0-9_-]+$/.test(url.hostname) || !url.username || !url.password) throw new Error();
    return { cloud: url.hostname, key: decodeURIComponent(url.username), secret: decodeURIComponent(url.password) };
  } catch { throw new HttpError(503, 'Image storage is not configured correctly.'); }
}

export async function prepareFile(file, kind) {
  if (!file || typeof file.arrayBuffer !== 'function' || !file.size || file.size > MAX_UPLOAD) throw new HttpError(400, 'Choose a file smaller than 12 MB.');
  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = String(file.name || 'menu').replace(/[\x00-\x1f<>"/\\]/g, '').slice(0,120);
  if (bytes.subarray(0,5).toString() === '%PDF-') {
    if (kind !== 'menu' || file.type !== 'application/pdf') throw new HttpError(400, 'PDF files are allowed only for uploaded menus.');
    return { bytes, resourceType:'raw', extension:'pdf', contentType:'application/pdf', filename };
  }
  const accepted = ['image/jpeg','image/png','image/webp'];
  if (!accepted.includes(file.type)) throw new HttpError(400, 'Choose a JPG, PNG, WebP image, or a PDF menu.');
  try {
    const image = sharp(bytes,{limitInputPixels:40000000,animated:false});
    const metadata = await image.metadata();
    if (!['jpeg','png','webp'].includes(metadata.format)) throw new Error();
    const output = await image.rotate().resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer();
    return { bytes:output, resourceType:'image', extension:'webp', contentType:'image/webp', filename };
  } catch { throw new HttpError(400, 'This image cannot be read. Use a valid JPG, PNG, or WebP image under 40 megapixels.'); }
}

export async function uploadFile(prepared, restaurantId, kind, fetcher = fetch) {
  const config = cloudinaryConfiguration();
  const publicId = `qrmenu/${restaurantId}/${kind}/${randomUUID()}${prepared.resourceType === 'raw' ? '.pdf' : ''}`;
  const form = new FormData();
  form.set('file',new Blob([prepared.bytes],{type:prepared.contentType}),`upload.${prepared.extension}`);
  form.set('public_id',publicId);
  form.set('overwrite','false');
  let response;
  try {
    response = await fetcher(`https://api.cloudinary.com/v1_1/${config.cloud}/${prepared.resourceType}/upload`, {
      method:'POST', headers:{Authorization:`Basic ${Buffer.from(`${config.key}:${config.secret}`).toString('base64')}`},
      body:form, signal:AbortSignal.timeout(45000),
    });
  } catch { throw new HttpError(502,'Image storage could not be reached. Please try again.'); }
  if (!response.ok) throw new HttpError(502,'Cloudinary rejected the upload. Check your storage credentials, file limits, and PDF delivery settings.');
  const result = await response.json();
  let url;
  try { url = new URL(result.secure_url); } catch { throw new HttpError(502,'Image storage returned an invalid file link.'); }
  if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com' || !url.pathname.startsWith(`/${config.cloud}/`) || result.public_id !== publicId) throw new HttpError(502,'Image storage returned an unexpected file link.');
  return {url:url.href,publicId,filename:prepared.filename,type:prepared.contentType};
}

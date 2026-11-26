import { z } from 'zod';
import { revalidateTag } from 'next/cache';
import { PUBLIC_SITE_TAG } from '@/modules/menus/public-cache.mjs';
import { database } from '@/lib/db.mjs';
import { body, currentUser, HttpError, respond, sameOrigin } from '@/lib/http.mjs';
import { mutate, overview } from '@/modules/workspace/service.mjs';

export function GET(request, { params }) {
  return respond(async () => {
    const { restaurantId, resource } = await params;
    if (resource !== 'overview') throw new HttpError(404, 'Unknown resource.');
    return overview(database(), await currentUser(request), restaurantId);
  });
}
async function write(request, { params }) {
  return respond(async () => {
    sameOrigin(request);
    const { restaurantId, resource } = await params;
    const id = new URL(request.url).searchParams.get('id');
    if (request.method === 'PATCH' && !id) throw new HttpError(400, 'Record ID required.');
    const result = await mutate(database(), await currentUser(request), restaurantId, resource, await body(request, z.record(z.string(), z.unknown())), id);
    revalidateTag(PUBLIC_SITE_TAG, { expire: 0 });
    return result;
  });
}
export const POST = write;
export const PATCH = write;

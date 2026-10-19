import { z } from 'zod';
import { database } from '@/lib/db.mjs';
import { body, currentUser, HttpError, respond, sameOrigin } from '@/lib/http.mjs';

export function GET(request) {
  return respond(async () => {
    const user = await currentUser(request);
    if (!user.platformAdmin) throw new HttpError(403, 'Platform access required.');
    return { restaurants: await database().restaurant.findMany({ select: { id: true, name: true, slug: true, status: true, createdAt: true }, orderBy: { createdAt: 'desc' } }) };
  });
}
export function PATCH(request) {
  return respond(async () => {
    sameOrigin(request);
    const user = await currentUser(request);
    if (!user.platformAdmin) throw new HttpError(403, 'Platform access required.');
    const data = await body(request, z.object({ id: z.string(), status: z.enum(['ACTIVE','SUSPENDED']) }).strict());
    await database().$transaction(async tx => {
      await tx.restaurant.update({ where: { id: data.id }, data: { status: data.status } });
      await tx.auditLog.create({ data: { restaurantId: data.id, actorId: user.id, action: `platform.restaurant.${data.status.toLowerCase()}`, entityId: data.id } });
    });
    return { ok: true };
  });
}

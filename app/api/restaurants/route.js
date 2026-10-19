import { database } from '@/lib/db.mjs';
import { body, currentUser, respond, sameOrigin } from '@/lib/http.mjs';
import { restaurantInput } from '@/modules/validation.mjs';
import { onboard } from '@/modules/workspace/service.mjs';

export function GET(request) {
  return respond(async () => {
    const user = await currentUser(request);
    const memberships = await database().membership.findMany({ where: { userId: user.id, status: 'ACTIVE', restaurant: { status: 'ACTIVE' } }, select: { restaurant: { select: { id: true, name: true, slug: true } } } });
    return { user: { id: user.id, name: user.name, email: user.email, platformAdmin: user.platformAdmin }, restaurants: memberships.map(m => m.restaurant) };
  });
}
export function POST(request) {
  return respond(async () => {
    sameOrigin(request);
    const user = await currentUser(request);
    return onboard(database(), user, await body(request, restaurantInput));
  });
}

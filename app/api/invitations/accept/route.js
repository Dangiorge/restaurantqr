import { z } from 'zod';
import { database } from '@/lib/db.mjs';
import { body, currentUser, respond, sameOrigin } from '@/lib/http.mjs';
import { acceptInvitation } from '@/modules/workspace/service.mjs';

export function POST(request) {
  return respond(async () => {
    sameOrigin(request);
    const user = await currentUser(request);
    const { token } = await body(request, z.object({ token: z.string().max(100) }).strict());
    return acceptInvitation(database(), user, token);
  });
}

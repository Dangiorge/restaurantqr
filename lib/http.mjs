import { z } from 'zod';
import { authentication } from './auth.mjs';
import { database } from './db.mjs';

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export async function currentUser(request) {
  const session = await authentication().api.getSession({ headers: request.headers });
  if (!session) throw new HttpError(401, 'Please sign in.');
  const user = await database().user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, name: true, status: true, platformAdmin: true } });
  if (user?.status !== 'ACTIVE') throw new HttpError(403, 'Account unavailable.');
  return user;
}
export function sameOrigin(request) {
  const expected = new URL(process.env.BETTER_AUTH_URL).origin;
  if (request.headers.get('origin') !== expected) throw new HttpError(403, 'Invalid request origin.');
}
export async function body(request, schema) {
  const text = await request.text();
  if (text.length > 32000) throw new HttpError(413, 'Request too large.');
  let value;
  try { value = JSON.parse(text); } catch { throw new HttpError(400, 'Invalid JSON.'); }
  return schema.parse(value);
}
export async function respond(operation) {
  try { return Response.json(await operation(), { headers: { 'Cache-Control': 'no-store' } }); }
  catch (error) {
    if (error instanceof z.ZodError) return Response.json({ error: 'Check your form values.', fields: error.issues.map(i => ({ field: i.path.join('.'), message: i.message })) }, { status: 400 });
    const status = error.status || (error.message === 'FORBIDDEN' ? 403 : error.code === 'P2002' ? 409 : error.code === 'P2025' ? 404 : 500);
    return Response.json({ error: status === 500 ? 'Unable to complete the request.' : error.code === 'P2002' ? 'That record already exists.' : error.code === 'P2025' ? 'Record unavailable.' : error.message }, { status });
  }
}

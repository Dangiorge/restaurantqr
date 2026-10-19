import { authentication } from '@/lib/auth.mjs';

async function handler(request) {
  try { return await authentication().handler(request); }
  catch { return Response.json({ error: 'Authentication is unavailable. Check server configuration.' }, { status: 503 }); }
}
export const GET = handler;
export const POST = handler;

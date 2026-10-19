import QRCode from 'qrcode';
import { database } from '@/lib/db.mjs';
import { currentUser, HttpError, respond } from '@/lib/http.mjs';
import { context } from '@/modules/identity/context.mjs';

export async function GET(request, { params }) {
  let svg;
  const result = await respond(async () => {
    const user = await currentUser(request);
    const { id } = await params;
    const restaurantId = new URL(request.url).searchParams.get('restaurantId');
    if (!restaurantId) throw new HttpError(400, 'Restaurant required.');
    const ctx = await context(database(), user, restaurantId, 'qr.manage');
    const qr = await database().qrCode.findFirst({ where: { id, restaurantId, ...(ctx.branchIds !== null ? { table: { branchId: { in: ctx.branchIds } } } : {}), revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }, include: { table: true } });
    if (!qr) throw new HttpError(404, 'QR code unavailable.');
    svg = await QRCode.toString(`${new URL(process.env.BETTER_AUTH_URL).origin}/q/${qr.token}`, { type: 'svg', errorCorrectionLevel: 'M', margin: 4, width: 512 });
    return { ok: true };
  });
  return svg ? new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Content-Disposition': 'attachment; filename="table-qr.svg"', 'Cache-Control': 'private, no-store' } }) : result;
}

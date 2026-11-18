import { HttpError } from '../../lib/http.mjs';

export async function submitCateringInquiry(db, data, ip) {
  const { restaurantSlug, eventDate, ...fields } = data;
  const restaurant = await db.restaurant.findFirst({ where: { slug: restaurantSlug, status: 'ACTIVE' }, select: { id: true } });
  if (!restaurant) throw new HttpError(404, 'Restaurant unavailable.');
  if (ip) {
    const recent = await db.cateringInquiry.count({ where: { restaurantId: restaurant.id, ip, createdAt: { gte: new Date(Date.now() - 3600000) } } });
    if (recent >= 3) throw new HttpError(429, 'Please wait a little before sending another inquiry.');
  }
  const record = await db.cateringInquiry.create({ data: { ...fields, eventDate: eventDate ? new Date(eventDate) : null, restaurantId: restaurant.id, ip: ip || '' } });
  return { id: record.id };
}

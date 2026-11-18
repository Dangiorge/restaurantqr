import { database } from '@/lib/db.mjs';
import { body, respond, sameOrigin } from '@/lib/http.mjs';
import { cateringInquiryInput } from '@/modules/validation.mjs';
import { submitCateringInquiry } from '@/modules/catering/service.mjs';

export function POST(request) {
  return respond(async () => {
    sameOrigin(request);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
    return submitCateringInquiry(database(), await body(request, cateringInquiryInput), ip);
  });
}

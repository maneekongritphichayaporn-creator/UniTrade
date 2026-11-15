import { ApiError, ok } from '@/lib/http.js';
import { requireAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { isUuid } from '@/lib/products.js';
import { CONTACT_SELECT, toContact } from '@/lib/contact.js';

// GET /products/:id/contact — ช่องทางติดต่อผู้ขาย เฉพาะสมาชิกที่ล็อกอิน (FR-06, Spec §8.1)
// ตัดสินโดย @wz: ดูได้ทุกสถานะ (หน้าสินค้าแสดงปุ่มทุกสถานะ) และเจ้าของดูของตัวเองได้
// ไม่พบ หรือ id ไม่ใช่ UUID -> 404 PRODUCT_NOT_FOUND เหมือน route อื่นที่ต้องล็อกอิน
const notFound = () => new ApiError(404, 'PRODUCT_NOT_FOUND', 'ไม่พบสินค้านี้ อาจถูกลบไปแล้ว');

export const GET = requireAuth(async (_request, { params }) => {
  const { id } = await params;
  if (!isUuid(id)) throw notFound();

  const { data, error } = await db().from('products')
    .select(CONTACT_SELECT).eq('product_id', id).maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();

  return ok(toContact(data));
});

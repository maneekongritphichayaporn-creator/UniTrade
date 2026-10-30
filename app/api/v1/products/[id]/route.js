import { ok } from '@/lib/http.js';
import { optionalAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { isUuid, fetchProductDetail } from '@/lib/products.js';

// GET /products/:id — รายละเอียดสินค้า 1 ชิ้น พร้อมรูปทั้งหมดและข้อมูลผู้ขายเบื้องต้น
// ไม่ส่งข้อมูลติดต่อผู้ขายเด็ดขาด (FR-06) — ต้องเรียก /products/:id/contact แยกต่างหาก

// ไม่พบสินค้า (หรือ id ไม่ใช่ UUID): ตอบ 200 + { data: [] } ห้ามส่ง 404 (ยืนยันโดย wz ตอนรีวิว TASK-09)
const notFound = () => ok({ data: [] });

export const GET = optionalAuth(async (request, { params, user }) => {
  const { id } = await params; // Next.js 15: params เป็น Promise
  if (!isUuid(id)) return notFound();

  const detail = await fetchProductDetail(db(), id, user);
  return detail ? ok(detail) : notFound();
});
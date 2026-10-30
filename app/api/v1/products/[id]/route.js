import { ok, noContent, readJson, ApiError } from '@/lib/http.js';
import { optionalAuth, requireAuth } from '@/lib/auth.js';
import { db, PRODUCT_IMAGES_BUCKET } from '@/lib/supabase.js';
import { isUuid, fetchProductDetail, validateProductInput, requireOwnedProduct } from '@/lib/products.js';
import { removeProductFolder } from '@/lib/product-images.js';

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

// PATCH /products/:id — แก้ไขประกาศ เฉพาะเจ้าของ (Spec §8.2)
// แก้ได้ 6 ช่อง ช่องอื่นรวมถึง status และ seller_id ถูกข้าม รูปแก้ไม่ได้ ส่ง {} ได้รายละเอียดเดิมกลับไป
export const PATCH = requireAuth(async (request, { params, user }) => {
  const { id } = await params;
  const supabase = db();
  await requireOwnedProduct(supabase, id, user); // 404 → 403 ก่อนอ่าน body

  const patch = validateProductInput(await readJson(request), { partial: true });
  if (Object.keys(patch).length > 0) {
    const { error } = await supabase.from('products').update(patch).eq('product_id', id);
    if (error) {
      if (error.code === '23503') {
        throw new ApiError(422, 'VALIDATION_ERROR', 'กรุณาเลือกหมวดหมู่ที่มีอยู่จริง', 'category_id');
      }
      throw error;
    }
  }
  return ok(await fetchProductDetail(supabase, id, user));
});

// DELETE /products/:id — ลบประกาศ เฉพาะเจ้าของ (Spec §8.4)
// ลบแถวก่อน (รูปและรายการโปรดถูกลบตาม) แล้วจึงลบไฟล์ใน Storage
export const DELETE = requireAuth(async (_request, { params, user }) => {
  const { id } = await params;
  const supabase = db();
  await requireOwnedProduct(supabase, id, user);

  const { error } = await supabase.from('products').delete().eq('product_id', id);
  if (error) throw error;

  await removeProductFolder(supabase.storage.from(PRODUCT_IMAGES_BUCKET), id);
  return noContent();
});
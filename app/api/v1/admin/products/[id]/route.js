import { noContent, ApiError } from '@/lib/http.js';
import { requireAdmin } from '@/lib/admin.js';
import { db, PRODUCT_IMAGES_BUCKET } from '@/lib/supabase.js';
import { isUuid } from '@/lib/products.js';
import { removeProductFolder } from '@/lib/product-images.js';

// DELETE /admin/products/:id — admin ลบประกาศของใครก็ได้แบบ hard delete (SRS FR-08, TASK-19)
// 1. db().rpc('admin_delete_product') — ใน transaction เดียว (spec §11.2, migration 0005):
//    รายงาน pending ของประกาศนี้เป็น actioned → ลบแถว products (รูปใน DB และ wishlists ถูกลบตาม)
//    → บันทึก moderation_logs (ชื่อประกาศ, ผู้ขาย, จำนวนรายงานที่ปิด)
// 2. หลัง rpc สำเร็จ ลบไฟล์รูปใน bucket product-images (Postgres ลบไฟล์ใน Storage ไม่ได้)
//    ถ้าลบไฟล์ไม่สำเร็จ removeProductFolder จะ console.error แล้วยังตอบ 204 เหมือน TASK-12

const notFound = () => new ApiError(404, 'PRODUCT_NOT_FOUND', 'ไม่พบสินค้านี้ อาจถูกลบไปแล้ว');

export const DELETE = requireAdmin(async (_request, { params, user }) => {
  const { id } = await params;
  if (!isUuid(id)) throw notFound();

  const supabase = db();
  const { data: result, error } = await supabase.rpc('admin_delete_product', {
    p_product_id: id,
    p_admin_id: user.user_id,
  });
  if (error) throw error;
  if (result.result === 'not_found') throw notFound();

  await removeProductFolder(supabase.storage.from(PRODUCT_IMAGES_BUCKET), id);
  return noContent();
});

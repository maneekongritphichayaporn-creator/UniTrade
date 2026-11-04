import { noContent, ApiError } from '@/lib/http.js';
import { requireAdmin } from '@/lib/admin.js';
import { db, PRODUCT_IMAGES_BUCKET } from '@/lib/supabase.js';
import { isUuid } from '@/lib/products.js';
import { removeProductFolder } from '@/lib/product-images.js';

// DELETE /admin/products/:id — admin ลบประกาศของใครก็ได้แบบ hard delete (SRS FR-08, TASK-19)
// TODO(TASK-19 ขั้น 8): เปลี่ยนส่วนฐานข้อมูลเป็น db().rpc('admin_delete_product') หลัง wz รัน migration 0005
//   spec §11.2: อัปเดต reports เป็น actioned + ลบประกาศ + บันทึก log ต้องอยู่ใน transaction เดียว
//   ส่วนการลบไฟล์ใน Storage ยังทำหลังฐานข้อมูลสำเร็จเหมือนเดิม

const notFound = () => new ApiError(404, 'PRODUCT_NOT_FOUND', 'ไม่พบสินค้านี้ อาจถูกลบไปแล้ว');

export const DELETE = requireAdmin(async (_request, { params }) => {
  const { id } = await params;
  if (!isUuid(id)) throw notFound();

  const supabase = db();
  const { data: product, error } = await supabase
    .from('products')
    .select('product_id')
    .eq('product_id', id)
    .maybeSingle();
  if (error) throw error;
  if (!product) throw notFound();

  // จำ report_id ที่ยัง pending ไว้ก่อน เพราะหลังลบ reports.product_id จะเป็น NULL หาไม่เจอแล้ว
  const { data: pending, error: pendingError } = await supabase
    .from('reports')
    .select('report_id')
    .eq('product_id', id)
    .eq('status', 'pending');
  if (pendingError) throw pendingError;

  const { error: deleteError } = await supabase.from('products').delete().eq('product_id', id);
  if (deleteError) throw deleteError;

  if (pending.length > 0) {
    const { error: actionError } = await supabase
      .from('reports')
      .update({ status: 'actioned' })
      .in('report_id', pending.map((row) => row.report_id));
    if (actionError) console.error(`[DELETE /admin/products/${id}] mark reports actioned`, actionError);
  }

  await removeProductFolder(supabase.storage.from(PRODUCT_IMAGES_BUCKET), id);
  return noContent();
});

import { noContent, ApiError } from '@/lib/http.js';
import { verifyAdminRole, logModeration } from '@/lib/admin.js';
import { db, PRODUCT_IMAGES_BUCKET } from '@/lib/supabase.js';
import { isUuid } from '@/lib/products.js';
import { removeProductFolder } from '@/lib/product-images.js';

// DELETE /admin/products/:id — admin ลบประกาศของใครก็ได้แบบ hard delete (SRS FR-08, TASK-19)
// ขั้นตอน:
//   1. จำ report_id ที่ยัง pending ของประกาศนี้ไว้ (หลังลบ product_id ในรายงานจะกลายเป็น NULL หาไม่เจอแล้ว)
//   2. ลบแถว products — product_images และ wishlists ถูกลบตาม (cascade), reports.product_id เป็น NULL
//   3. เปลี่ยนรายงานที่จำไว้เป็น actioned ตามมติทีม 13 ก.ย. 2569
//   4. ลบไฟล์รูปใน bucket product-images (Supabase ไม่มี cascade ข้าม DB กับ Storage)
//   5. บันทึก Log delete_product
// ลบก่อนแล้วค่อยเปลี่ยนสถานะ: ถ้าลบไม่สำเร็จ รายงานจะไม่ถูกตีว่าจัดการแล้วทั้งที่ประกาศยังอยู่

const notFound = () => new ApiError(404, 'PRODUCT_NOT_FOUND', 'ไม่พบสินค้านี้ อาจถูกลบไปแล้ว');

export const DELETE = verifyAdminRole(async (_request, { params, user }) => {
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

  const { data: pending, error: pendingError } = await supabase
    .from('reports')
    .select('report_id')
    .eq('product_id', id)
    .eq('status', 'pending');
  if (pendingError) throw pendingError;
  const reportIds = pending.map((row) => row.report_id);

  const { error: deleteError } = await supabase.from('products').delete().eq('product_id', id);
  if (deleteError) throw deleteError;

  if (reportIds.length > 0) {
    const { error: actionError } = await supabase
      .from('reports')
      .update({ status: 'actioned' })
      .in('report_id', reportIds);
    // ประกาศถูกลบไปแล้ว ตอบสำเร็จต่อ แต่ต้องเห็นใน log ว่ารายงานยังค้าง pending
    if (actionError) console.error(`[DELETE /admin/products/${id}] mark reports actioned`, actionError);
  }

  await removeProductFolder(supabase.storage.from(PRODUCT_IMAGES_BUCKET), id);

  await logModeration({ adminId: user.user_id, action: 'delete_product', productId: id, reportIds });

  return noContent();
});

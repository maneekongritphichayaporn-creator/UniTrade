import { ok, readJson, ApiError } from '@/lib/http.js';
import { requireAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { isUuid } from '@/lib/products.js';
import { validateReportInput } from '@/lib/reports.js';

// POST /products/:id/reports — สมาชิกรายงานประกาศที่น่าสงสัย (SRS FR-08, TASK-19)
// ลำดับตรวจ: ไม่ใช่ UUID หรือไม่พบ → 404, ประกาศของตัวเอง → 422 SELF_REPORT,
//            reason ผิด → 422 INVALID_REPORT_REASON, เคยรายงานแล้ว → 409 DUPLICATE_REPORT

const notFound = () => new ApiError(404, 'PRODUCT_NOT_FOUND', 'ไม่พบสินค้านี้ อาจถูกลบไปแล้ว');
const selfReport = () => new ApiError(422, 'SELF_REPORT', 'ไม่สามารถรายงานประกาศของตนเองได้');
const duplicate = () =>
  new ApiError(409, 'DUPLICATE_REPORT', 'คุณรายงานประกาศนี้ไปแล้ว ผู้ดูแลระบบกำลังตรวจสอบ');

export const POST = requireAuth(async (request, { params, user }) => {
  const { id } = await params;
  if (!isUuid(id)) throw notFound();

  const supabase = db();
  const { data: product, error } = await supabase
    .from('products')
    .select('product_id, seller_id')
    .eq('product_id', id)
    .maybeSingle();
  if (error) throw error;
  if (!product) throw notFound();
  // ต้องเช็กในโค้ดก่อน insert: trigger guard_self_report raise เป็น P0001 ถ้าหลุดถึง DB จะกลายเป็น 500
  if (product.seller_id === user.user_id) throw selfReport();

  const { reason } = validateReportInput(await readJson(request));

  const { data: existing, error: existingError } = await supabase
    .from('reports')
    .select('report_id')
    .eq('product_id', id)
    .eq('reporter_id', user.user_id)
    .maybeSingle();
  if (existingError) throw existingError;
  if (existing) throw duplicate();

  const { data: report, error: insertError } = await supabase
    .from('reports')
    .insert({ product_id: id, reporter_id: user.user_id, reason })
    .select('report_id, product_id, reason, status, created_at')
    .single();
  if (insertError) {
    // unique (product_id, reporter_id) — กดส่งซ้ำเร็ว ๆ จนสองคำขอผ่านการเช็กข้างบนพร้อมกัน
    if (insertError.code === '23505') throw duplicate();
    // ประกาศถูกลบไประหว่างที่เช็กข้างบนกับตอน insert
    if (insertError.code === '23503') throw notFound();
    throw insertError;
  }

  return ok({ ...report, message: 'ส่งรายงานเรียบร้อยแล้ว ผู้ดูแลระบบจะตรวจสอบโดยเร็ว' }, 201);
});

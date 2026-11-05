import { ok, readJson, ApiError } from '@/lib/http.js';
import { requireAdmin } from '@/lib/admin.js';
import { db } from '@/lib/supabase.js';
import { isUuid } from '@/lib/products.js';
import { validateReportStatusInput } from '@/lib/reports.js';

// PATCH /admin/reports/:id — admin ยกเลิกคำร้องโดยไม่ลบสินค้า { "status": "dismissed" } (TASK-19)
// ลำดับตรวจ: ไม่ใช่ admin → 403, ไม่ใช่ UUID หรือไม่พบรายงาน → 404, body ผิด → 422, ไม่ใช่ pending แล้ว → 409
// การเปลี่ยนสถานะกับการบันทึก moderation_logs อยู่ใน function admin_dismiss_report (migration 0005)
// จึงสำเร็จหรือพังไปพร้อมกัน และอัปเดตแบบมีเงื่อนไข status = 'pending' ใน function

const notFound = () => new ApiError(404, 'REPORT_NOT_FOUND', 'ไม่พบรายงานนี้');
const alreadyResolved = () =>
  new ApiError(409, 'REPORT_ALREADY_RESOLVED', 'รายงานนี้ได้รับการจัดการไปแล้ว');

export const PATCH = requireAdmin(async (request, { params, user }) => {
  const { id } = await params;
  if (!isUuid(id)) throw notFound();

  const supabase = db();
  // เช็กว่ามีรายงานก่อนอ่าน body เพื่อให้ลำดับ 404 → 422 เหมือน route เขียนอื่น ๆ
  const { data: report, error } = await supabase.from('reports').select('report_id').eq('report_id', id).maybeSingle();
  if (error) throw error;
  if (!report) throw notFound();

  validateReportStatusInput(await readJson(request));

  const { data: result, error: rpcError } = await supabase.rpc('admin_dismiss_report', {
    p_report_id: id,
    p_admin_id: user.user_id,
  });
  if (rpcError) throw rpcError;
  if (result.result === 'not_found') throw notFound(); // ถูกลบไประหว่างเช็กข้างบนกับตอน rpc
  if (result.result === 'already_resolved') throw alreadyResolved();

  return ok({
    report_id: result.report_id,
    product_id: result.product_id,
    status: result.status,
    message: 'ยกเลิกคำร้องแล้ว ประกาศยังคงอยู่ในระบบ',
  });
});

import { ok, readJson, ApiError } from '@/lib/http.js';
import { requireAdmin } from '@/lib/admin.js';
import { db } from '@/lib/supabase.js';
import { isUuid } from '@/lib/products.js';
import { validateReportStatusInput } from '@/lib/reports.js';

// PATCH /admin/reports/:id — admin ยกเลิกคำร้องโดยไม่ลบสินค้า { "status": "dismissed" } (TASK-19)
// ลำดับตรวจ: ไม่ใช่ admin → 403, ไม่ใช่ UUID หรือไม่พบรายงาน → 404, body ผิด → 422, ไม่ใช่ pending แล้ว → 409
// TODO(TASK-19 ขั้น 8): เปลี่ยนเป็น db().rpc('admin_dismiss_report') หลัง wz รัน migration 0005
//   เพื่อให้อัปเดตสถานะกับบันทึก moderation_logs สำเร็จหรือพังไปพร้อมกัน

const notFound = () => new ApiError(404, 'REPORT_NOT_FOUND', 'ไม่พบรายงานนี้');
const alreadyResolved = () =>
  new ApiError(409, 'REPORT_ALREADY_RESOLVED', 'รายงานนี้ได้รับการจัดการไปแล้ว');

export const PATCH = requireAdmin(async (request, { params }) => {
  const { id } = await params;
  if (!isUuid(id)) throw notFound();

  const supabase = db();
  const { data: report, error } = await supabase.from('reports').select('report_id').eq('report_id', id).maybeSingle();
  if (error) throw error;
  if (!report) throw notFound();

  const { status } = validateReportStatusInput(await readJson(request));

  // อัปเดตแบบมีเงื่อนไข status = 'pending' ไม่อ่านสถานะก่อนแล้วค่อยเขียน (ยืนยันโดย wz)
  // ถ้าไม่ได้แถวกลับมา แปลว่าไม่ใช่ pending แล้ว (รวมกรณีกด dismissed ซ้ำ หรือ admin สองคนกดพร้อมกัน)
  const { data: updated, error: updateError } = await supabase
    .from('reports')
    .update({ status })
    .eq('report_id', id)
    .eq('status', 'pending')
    .select('report_id, product_id, status')
    .maybeSingle();
  if (updateError) throw updateError;
  if (!updated) throw alreadyResolved();

  return ok({ ...updated, message: 'ยกเลิกคำร้องแล้ว ประกาศยังคงอยู่ในระบบ' });
});

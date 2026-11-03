import { ok, readJson, ApiError } from '@/lib/http.js';
import { verifyAdminRole, logModeration } from '@/lib/admin.js';
import { db } from '@/lib/supabase.js';
import { isUuid } from '@/lib/products.js';
import { validateReportStatusInput } from '@/lib/reports.js';

// PATCH /admin/reports/:id — admin ยกเลิกคำร้องโดยไม่ลบสินค้า { "status": "dismissed" } (TASK-19)
// ลำดับตรวจ: ไม่ใช่ admin → 403, ไม่พบรายงาน → 404, body ผิด → 422, ไม่ใช่ pending แล้ว → 409

const notFound = () => new ApiError(404, 'REPORT_NOT_FOUND', 'ไม่พบรายงานนี้');
const alreadyResolved = () =>
  new ApiError(409, 'REPORT_ALREADY_RESOLVED', 'รายงานนี้ได้รับการจัดการไปแล้ว');

export const PATCH = verifyAdminRole(async (request, { params, user }) => {
  const { id } = await params;
  if (!isUuid(id)) throw notFound();

  const supabase = db();
  const { data: report, error } = await supabase
    .from('reports')
    .select('report_id, product_id, status')
    .eq('report_id', id)
    .maybeSingle();
  if (error) throw error;
  if (!report) throw notFound();

  const { status } = validateReportStatusInput(await readJson(request));
  if (report.status !== 'pending') throw alreadyResolved();

  // .eq('status', 'pending') กันกรณี admin สองคนกดพร้อมกัน คนที่สองจะไม่เจอแถวให้อัปเดต
  const { data: updated, error: updateError } = await supabase
    .from('reports')
    .update({ status })
    .eq('report_id', id)
    .eq('status', 'pending')
    .select('report_id, product_id, status')
    .maybeSingle();
  if (updateError) throw updateError;
  if (!updated) throw alreadyResolved();

  await logModeration({
    adminId: user.user_id,
    action: 'dismiss_report',
    productId: updated.product_id,
    reportIds: [updated.report_id],
  });

  return ok({ ...updated, message: 'ยกเลิกคำร้องแล้ว ประกาศยังคงอยู่ในระบบ' });
});

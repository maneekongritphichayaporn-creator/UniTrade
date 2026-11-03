import { ok } from '@/lib/http.js';
import { verifyAdminRole } from '@/lib/admin.js';
import { db } from '@/lib/supabase.js';
import { ADMIN_REPORT_SELECT, toAdminReport } from '@/lib/reports.js';

// GET /admin/reports — รายงานที่ค้างตรวจสอบ (status = pending) ใหม่สุดก่อน (SRS FR-08, TASK-19)
// แต่ละแถวมี ผู้รายงาน, เหตุผล, โพสต์ที่ถูกรายงาน และผู้ขาย ตามข้อมูลการรายงานใน SRS 2.3
export const GET = verifyAdminRole(async () => {
  const { data, error, count } = await db()
    .from('reports')
    .select(ADMIN_REPORT_SELECT, { count: 'exact' })
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;

  return ok({ data: data.map(toAdminReport), total: count ?? data.length });
});

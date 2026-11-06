import { ok } from '@/lib/http.js';
import { requireAdmin } from '@/lib/admin.js';
import { db } from '@/lib/supabase.js';
import { buildPagination } from '@/lib/products.js';
import { ADMIN_REPORT_SELECT, parseAdminReportQuery, toAdminReport } from '@/lib/reports.js';

// GET /admin/reports?status=pending&page=1&per_page=20 — รายการรายงานสำหรับ Admin Dashboard (SRS FR-08, TASK-19)
// ค่าเริ่มต้นคือรายงานที่ค้างตรวจสอบ (pending) ใหม่สุดก่อน · query ผิด → 422 VALIDATION_ERROR
// แต่ละแถวมี ผู้รายงาน, เหตุผล, โพสต์ที่ถูกรายงาน และผู้ขาย ตามข้อมูลการรายงานใน SRS 2.3
function reportQuery(supabase, status, columns, options) {
  const query = supabase.from('reports').select(columns, options);
  return status === 'all' ? query : query.eq('status', status);
}

export const GET = requireAdmin(async (request) => {
  const { status, page, perPage } = parseAdminReportQuery(new URL(request.url).searchParams);
  const from = (page - 1) * perPage;
  const supabase = db();

  const { data, count, error } = await reportQuery(supabase, status, ADMIN_REPORT_SELECT, { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('report_id', { ascending: true }) // กันลำดับสลับเมื่อเวลาเท่ากัน
    .range(from, from + perPage - 1);

  let rows = data ?? [];
  let total = count ?? 0;

  // ขอหน้าเกินจำนวนที่มี Supabase ตอบ PGRST103 → หน้าว่าง ไม่ใช่ error (AGENTS.md หัวข้อ 10 ข้อ 1)
  if (error) {
    if (error.code !== 'PGRST103') throw error;
    rows = [];
    const { count: realTotal, error: countError } = await reportQuery(supabase, status, 'report_id', {
      count: 'exact',
      head: true,
    });
    if (countError) throw countError;
    total = realTotal ?? 0;
  }

  return ok({ data: rows.map(toAdminReport), pagination: buildPagination(page, perPage, total) });
});

import { ok } from '@/lib/http.js';
import { requireAdmin } from '@/lib/admin.js';
import { db } from '@/lib/supabase.js';
import { PRODUCT_STATUSES, REPORT_REASONS, REPORT_STATUSES } from '@/lib/constants.js';
import { buildAdminStats, daysAgo, STATS_RECENT_DAYS } from '@/lib/admin-stats.js';

// GET /admin/stats — สถิติภาพรวมของเว็บสำหรับ Admin Dashboard (เฉพาะ admin)
// นับด้วย count แบบ head (ไม่ดึงแถวมาจริง) ทีละเงื่อนไขแล้วยิงพร้อมกัน
// ไม่ select แถวมานับเอง เพราะ Supabase ตอบได้สูงสุด 1000 แถวต่อครั้ง ตัวเลขจะผิดเมื่อข้อมูลเยอะ
// ไม่มีข้อมูลส่วนตัวของผู้ใช้ใน response มีแค่ตัวเลข และชื่อหมวดหมู่

async function countRows(query) {
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export const GET = requireAdmin(async () => {
  const supabase = db();
  const head = (table, column) => supabase.from(table).select(column, { count: 'exact', head: true });
  const now = new Date();

  async function categoryCounts() {
    const { data, error } = await supabase
      .from('categories')
      .select('category_id, name')
      .order('category_id', { ascending: true });
    if (error) throw error;
    return Promise.all(
      (data ?? []).map(async (category) => ({
        ...category,
        product_count: await countRows(head('products', 'product_id').eq('category_id', category.category_id)),
      })),
    );
  }

  const [
    productStatusCounts,
    freeProducts,
    removedByAdmin,
    categories,
    reportStatusCounts,
    reportReasonCounts,
    totalUsers,
    newUsers,
  ] = await Promise.all([
    Promise.all(PRODUCT_STATUSES.map((status) => countRows(head('products', 'product_id').eq('status', status)))),
    countRows(head('products', 'product_id').eq('price', 0)),
    countRows(head('moderation_logs', 'log_id').eq('action', 'delete_product')),
    categoryCounts(),
    Promise.all(REPORT_STATUSES.map((status) => countRows(head('reports', 'report_id').eq('status', status)))),
    Promise.all(REPORT_REASONS.map((reason) => countRows(head('reports', 'report_id').eq('reason', reason)))),
    countRows(head('users', 'user_id')),
    countRows(head('users', 'user_id').gte('created_at', daysAgo(now, STATS_RECENT_DAYS).toISOString())),
  ]);

  return ok(
    buildAdminStats({
      productStatusCounts,
      freeProducts,
      removedByAdmin,
      categories,
      reportStatusCounts,
      reportReasonCounts,
      totalUsers,
      newUsers,
      now,
    }),
  );
});

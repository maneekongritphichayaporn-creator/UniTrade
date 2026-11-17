import { PRODUCT_STATUSES, REPORT_REASONS, REPORT_STATUSES } from './constants.js';

// ตัวช่วยของ GET /admin/stats (สถิติภาพรวมในหน้า Admin Dashboard)
// route นับจำนวนแถวด้วย count แบบ head ทีละเงื่อนไข แล้วส่งตัวเลขมาประกอบเป็น response ที่นี่
// ไฟล์นี้ต้องไม่ import lib/supabase.js เพื่อให้ npm test (node --test) โหลดได้

/** ช่วงเวลาของ "ผู้ใช้สมัครใหม่" (วัน) */
export const STATS_RECENT_DAYS = 7;

const DAY_MS = 24 * 60 * 60 * 1000;

/** เวลาย้อนหลังไป days วันจาก now */
export function daysAgo(now, days) {
  return new Date(now.getTime() - days * DAY_MS);
}

const sum = (values) => values.reduce((total, value) => total + value, 0);

// จับคู่ key กับจำนวนตามลำดับ ค่าที่ไม่มีให้เป็น 0
function countsByKey(keys, counts) {
  return Object.fromEntries(keys.map((key, index) => [key, counts[index] ?? 0]));
}

/**
 * ประกอบ response ของ GET /admin/stats
 * จำนวนใน array ต้องเรียงตาม PRODUCT_STATUSES, REPORT_STATUSES, REPORT_REASONS
 *
 * - products.total คือผลรวมทุกสถานะ (status เป็น enum ที่ห้ามเป็น null)
 * - products.removed_by_admin นับจาก moderation_logs action = delete_product
 *   ประกาศที่ผู้ขายลบเองถูกลบทิ้งจริงและไม่มีบันทึก จึงนับไม่ได้
 * - categories[].product_count นับทุกสถานะ (ต่างจาก GET /categories ที่นับเฉพาะ available)
 * - reports นับจำนวนรายงาน ไม่ใช่จำนวนประกาศ (ประกาศเดียวอาจถูกรายงานหลายครั้ง)
 */
export function buildAdminStats({
  productStatusCounts,
  freeProducts,
  removedByAdmin,
  categories,
  reportStatusCounts,
  reportReasonCounts,
  totalUsers,
  newUsers,
  now,
}) {
  return {
    products: {
      total: sum(productStatusCounts),
      ...countsByKey(PRODUCT_STATUSES, productStatusCounts),
      free: freeProducts,
      removed_by_admin: removedByAdmin,
    },
    categories: categories.map(({ category_id, name, product_count }) => ({
      category_id,
      name,
      product_count,
    })),
    reports: {
      total: sum(reportStatusCounts),
      by_status: countsByKey(REPORT_STATUSES, reportStatusCounts),
      by_reason: countsByKey(REPORT_REASONS, reportReasonCounts),
    },
    users: {
      total: totalUsers,
      new_last_7_days: newUsers,
    },
    generated_at: now.toISOString(),
  };
}

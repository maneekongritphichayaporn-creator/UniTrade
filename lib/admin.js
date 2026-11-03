import { ApiError } from './http.js';
import { requireAuth } from './auth.js';
import { db } from './supabase.js';

// verifyAdminRole (TASK-19, SRS FR-08 Role-Based Access Control)
// ห่อ route ที่ให้เฉพาะ admin: ไม่มี token → 401 (requireAuth), ไม่ใช่ admin → 403 ADMIN_REQUIRED
// อ่าน role จากตาราง users ทุกครั้ง ไม่เชื่อ role ใน token อย่างเดียว
// เพราะ token อายุ 24 ชม. ถ้าถอดสิทธิ์ admin แล้ว token เก่าต้องใช้ไม่ได้ทันที
export function verifyAdminRole(handler) {
  return requireAuth(async (request, context) => {
    const { data, error } = await db()
      .from('users')
      .select('role')
      .eq('user_id', context.user.user_id)
      .maybeSingle();
    if (error) throw error;
    if (data?.role !== 'admin') {
      throw new ApiError(403, 'ADMIN_REQUIRED', 'ส่วนนี้สำหรับผู้ดูแลระบบเท่านั้น');
    }
    return handler(request, { ...context, user: { ...context.user, role: 'admin' } });
  });
}

// บันทึก Log การจัดการของ admin (SRS FR-08 "ลบสินค้าและบันทึก Log")
// ตอนนี้เขียนลง console (ดูได้ใน terminal ตอน dev และใน Vercel Logs บน production)
// ถ้า wz เพิ่มตาราง moderation_logs ใน migration 0005 ให้แก้แค่ฟังก์ชันนี้ให้ insert ลงตาราง
// action: 'dismiss_report' | 'delete_product'
export async function logModeration({ adminId, action, productId = null, reportIds = [] }) {
  console.info(
    '[moderation]',
    JSON.stringify({
      admin_id: adminId,
      action,
      product_id: productId,
      report_ids: reportIds,
      at: new Date().toISOString(),
    }),
  );
}

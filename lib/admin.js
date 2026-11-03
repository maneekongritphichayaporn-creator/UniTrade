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

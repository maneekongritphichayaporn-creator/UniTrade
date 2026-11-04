import { ApiError } from './http.js';
import { requireAuth } from './auth.js';
import { db } from './supabase.js';

// requireAdmin (TASK-19, SRS FR-08 Role-Based Access Control) — ตัวที่ใบงานเรียกว่า verifyAdminRole
// เป็น wrapper ครอบ requireAuth แบบเดียวกับ requireAuth/optionalAuth จะได้ลืมเรียกไม่ได้ (AGENTS.md 4.2.3)
//   ไม่มี token / token เสีย      → 401 (requireAuth)
//   token ใช้ได้แต่ไม่พบบัญชีแล้ว  → 401 UNAUTHORIZED (แบบเดียวกับ getUserRow)
//   role ไม่ใช่ admin             → 403 ADMIN_REQUIRED
// อ่าน role จากตาราง users ทุกครั้ง ไม่เชื่อ role ใน token เพื่อให้ถอดสิทธิ์แล้วมีผลทันที
// ไฟล์นี้ import supabase จึงทดสอบด้วย Bruno แทน unit test
export function requireAdmin(handler) {
  return requireAuth(async (request, context) => {
    const { data, error } = await db()
      .from('users')
      .select('role')
      .eq('user_id', context.user.user_id)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new ApiError(401, 'UNAUTHORIZED', 'ไม่พบบัญชีผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
    if (data.role !== 'admin') {
      throw new ApiError(403, 'ADMIN_REQUIRED', 'หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ');
    }
    return handler(request, { ...context, user: { ...context.user, role: 'admin' } });
  });
}

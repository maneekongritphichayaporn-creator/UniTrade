import { ApiError } from './http.js';
import { REPORT_REASONS } from './constants.js';

// ตัวช่วยของ report และ admin (TASK-19)
// ไฟล์นี้ต้องไม่ import lib/supabase.js เพื่อให้ npm test (node --test) โหลดได้

// ---------- POST /products/:id/reports ----------
export function validateReportInput(body) {
  const reason = body?.reason;
  if (!REPORT_REASONS.includes(reason)) {
    throw new ApiError(422, 'INVALID_REASON', 'กรุณาเลือกเหตุผลการรายงานจากรายการที่กำหนด', 'reason');
  }
  return { reason };
}

// ---------- PATCH /admin/reports/:id ----------
// admin ส่งได้แค่ dismissed ส่วน actioned เกิดจาก DELETE /admin/products/:id เท่านั้น
export function validateReportStatusInput(body) {
  if (body?.status !== 'dismissed') {
    throw new ApiError(422, 'INVALID_STATUS', 'สถานะรายงานที่เปลี่ยนได้คือ dismissed เท่านั้น', 'status');
  }
  return { status: 'dismissed' };
}
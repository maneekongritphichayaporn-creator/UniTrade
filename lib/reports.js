import { ApiError } from './http.js';
import { REPORT_REASONS, REPORT_STATUSES } from './constants.js';

// ตัวช่วยของ report และ admin (TASK-19)
// ไฟล์นี้ต้องไม่ import lib/supabase.js เพื่อให้ npm test (node --test) โหลดได้

const invalid = (field, message) => new ApiError(422, 'VALIDATION_ERROR', message, field);

// ---------- POST /products/:id/reports ----------
export function validateReportInput(body) {
  const reason = body?.reason;
  if (!REPORT_REASONS.includes(reason)) {
    throw new ApiError(422, 'INVALID_REPORT_REASON', 'กรุณาเลือกเหตุผลในการรายงาน', 'reason');
  }
  return { reason };
}

// ---------- PATCH /admin/reports/:id ----------
// admin ส่งได้แค่ dismissed ส่วน actioned เกิดจาก DELETE /admin/products/:id เท่านั้น
// ไม่ใช้ INVALID_STATUS เพราะ code นั้นผูกกับสถานะสินค้า (ยืนยันโดย wz)
export function validateReportStatusInput(body) {
  if (body?.status !== 'dismissed') {
    throw invalid('status', 'สถานะรายงานที่เปลี่ยนได้คือ dismissed เท่านั้น');
  }
  return { status: 'dismissed' };
}

// ---------- GET /admin/reports ?status=&page=&per_page= ----------
export const REPORT_LIST_FILTERS = Object.freeze([...REPORT_STATUSES, 'all']);
export const ADMIN_REPORTS_PER_PAGE = 20;
export const ADMIN_REPORTS_MAX_PER_PAGE = 50;

function positiveInt(raw, field, fallback) {
  if (raw === null || raw.trim() === '') return fallback;
  const value = Number(raw.trim());
  if (!/^\d+$/.test(raw.trim()) || !Number.isSafeInteger(value) || value < 1) {
    throw invalid(field, `${field} ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป`);
  }
  return value;
}

export function parseAdminReportQuery(params) {
  const status = params.get('status') || 'pending';
  if (!REPORT_LIST_FILTERS.includes(status)) {
    throw invalid('status', 'status ต้องเป็น pending, actioned, dismissed หรือ all');
  }
  const page = positiveInt(params.get('page'), 'page', 1);
  const perPage = Math.min(
    positiveInt(params.get('per_page'), 'per_page', ADMIN_REPORTS_PER_PAGE),
    ADMIN_REPORTS_MAX_PER_PAGE,
  );
  return { status, page, perPage };
}

// ระบุคอลัมน์ users เอง ห้าม users(*) และห้ามส่ง email, phone_number, line_id, password_hash
export const ADMIN_REPORT_SELECT =
  'report_id, reason, status, created_at,' +
  ' reporter:users(user_id, full_name, faculty),' +
  ' product:products(product_id, title, price, status, created_at,' +
  ' seller:users(user_id, full_name, faculty),' +
  ' images:product_images(image_url, is_primary))';

// แปลงแถวจาก Supabase เป็นรูปที่หน้า Admin Dashboard ใช้
// product เป็น null เมื่อประกาศถูกลบไปแล้ว (reports.product_id ON DELETE SET NULL)
export function toAdminReport(row) {
  const product = row.product
    ? {
        product_id: row.product.product_id,
        title: row.product.title,
        price: row.product.price === null ? null : Number(row.product.price),
        status: row.product.status,
        created_at: row.product.created_at,
        primary_image_url:
          (row.product.images ?? []).find((img) => img.is_primary)?.image_url ??
          row.product.images?.[0]?.image_url ??
          null,
        seller: row.product.seller ?? null,
      }
    : null;
  return {
    report_id: row.report_id,
    reason: row.reason,
    status: row.status,
    created_at: row.created_at,
    reporter: row.reporter ?? null,
    product,
  };
}

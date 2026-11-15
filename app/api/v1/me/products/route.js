import { ok } from '@/lib/http.js';
import { requireAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { buildPagination } from '@/lib/products.js';
import {
  MY_PRODUCT_SELECT,
  parseMyProductsQuery,
  summarizeStatuses,
  toMyProductCard,
} from '@/lib/my-products.js';

// GET /me/products — ประกาศของผู้ใช้ที่ล็อกอิน ทุกสถานะ ล่าสุดก่อน (UC-03, Spec §7.1)
export const GET = requireAuth(async (request, { user }) => {
  const { page, perPage } = parseMyProductsQuery(new URL(request.url).searchParams);
  const from = (page - 1) * perPage;
  const supabase = db();

  // 1) นับแต่ละสถานะ -> summary และ total (ผู้ขายหนึ่งคนมีประกาศไม่มาก ดึงแค่คอลัมน์ status)
  const { data: statuses, error: statusError } = await supabase.from('products')
    .select('status').eq('seller_id', user.user_id);
  if (statusError) throw statusError;
  const summary = summarizeStatuses(statuses.map((row) => row.status));
  const total = statuses.length;

  // 2) หน้าที่ขอ (ขอเกินหน้าสุดท้าย -> ไม่ต้อง query คืน data ว่าง)
  let rows = [];
  if (from < total) {
    const { data, error } = await supabase.from('products')
      .select(MY_PRODUCT_SELECT)
      .eq('seller_id', user.user_id)
      .order('created_at', { ascending: false })
      .order('product_id', { ascending: true })
      .range(from, from + perPage - 1);
    if (error) throw error;
    rows = data;
  }

  // 3) is_wishlisted ของการ์ด (บันทึกประกาศตัวเองได้)
  let wished = new Set();
  if (rows.length > 0) {
    const { data: saved, error: wishError } = await supabase.from('wishlists')
      .select('product_id')
      .eq('user_id', user.user_id)
      .in('product_id', rows.map((row) => row.product_id));
    if (wishError) throw wishError;
    wished = new Set(saved.map((row) => row.product_id));
  }

  return ok({
    data: rows.map((row) => toMyProductCard(row, wished.has(row.product_id))),
    pagination: buildPagination(page, perPage, total),
    summary,
  });
});

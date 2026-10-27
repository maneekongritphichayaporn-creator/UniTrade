import { ok } from '@/lib/http.js';
import { optionalAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import {
  PRODUCT_SELECT,
  EMPTY_LIST_MESSAGE,
  parseProductQuery,
  applyProductFilters,
  buildPagination,
  toCard,
} from '@/lib/products.js';

// GET /products — ค้นหา กรอง เรียงลำดับ แบ่งหน้า (Spec §4.1)
// สาธารณะ: ไม่ล็อกอินก็เรียกได้ ถ้าล็อกอินจะได้ is_wishlisted ที่ถูกต้อง

export const GET = optionalAuth(async (request, { user }) => {
  const filters = parseProductQuery(new URL(request.url).searchParams);
  const from = (filters.page - 1) * filters.perPage;
  const supabase = db();

  // 1) ดึงสินค้าหน้าที่ขอ พร้อมนับจำนวนทั้งหมดที่ตรงเงื่อนไข
  const { data: rows, count, error } = await applyProductFilters(
    supabase.from('products').select(PRODUCT_SELECT, { count: 'exact' }),
    filters,
  )
    .order(filters.sort.column, { ascending: filters.sort.ascending })
    .order('product_id', { ascending: true }) // กันลำดับสลับเมื่อค่าที่เรียงเท่ากัน
    .range(from, from + filters.perPage - 1);

  let items = rows ?? [];
  let total = count ?? 0;

  // 2) ขอหน้าเกินจำนวนที่มี Supabase จะตอบ PGRST103 → ถือเป็นหน้าว่าง ไม่ใช่ error
  if (error) {
    if (error.code !== 'PGRST103') throw error;
    items = [];
    const { count: realTotal, error: countError } = await applyProductFilters(
      supabase.from('products').select('product_id', { count: 'exact', head: true }),
      filters,
    );
    if (countError) throw countError;
    total = realTotal ?? 0;
  }

  // 3) ถ้าล็อกอินอยู่ หาว่าชิ้นไหนในหน้านี้ถูกบันทึกเป็นรายการโปรด (query เดียว)
  let wished = new Set();
  if (user && items.length > 0) {
    const { data: saved, error: wishError } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.user_id)
      .in('product_id', items.map((row) => row.product_id));
    if (wishError) throw wishError;
    wished = new Set(saved.map((w) => w.product_id));
  }

  const body = {
    data: items.map((row) => toCard(row, wished.has(row.product_id))),
    pagination: buildPagination(filters.page, filters.perPage, total),
  };
  if (items.length === 0) body.message = EMPTY_LIST_MESSAGE;

  return ok(body);
});
// ประกาศของฉัน — GET /me/products (UC-03, Spec §7.1)
// ไฟล์นี้ต้องไม่ import lib/supabase.js เพื่อให้ npm test (node --test) โหลดได้

import { PRODUCT_STATUSES } from './constants.js';
import { DEFAULT_PER_PAGE, MAX_PER_PAGE, PRODUCT_SELECT, parsePositiveInt, toCard } from './products.js';

// การ์ดปกติ + จำนวนคนที่บันทึกเป็นรายการโปรด
export const MY_PRODUCT_SELECT = `${PRODUCT_SELECT}, wishlists(count)`;

export function parseMyProductsQuery(params) {
  const page = parsePositiveInt(params.get('page'), 'page', 1);
  const perPage = Math.min(
    parsePositiveInt(params.get('per_page'), 'per_page', DEFAULT_PER_PAGE),
    MAX_PER_PAGE,
  );
  return { page, perPage };
}

// ['available', 'sold', …] -> { available, reserved, sold }
export function summarizeStatuses(statuses) {
  const summary = Object.fromEntries(PRODUCT_STATUSES.map((status) => [status, 0]));
  for (const status of statuses) {
    if (status in summary) summary[status] += 1;
  }
  return summary;
}

// Spec §7.1 มี wishlist_count แต่ไม่มี is_free/category ซึ่งหน้า My Listings ใช้ จึงส่งการ์ดเต็ม + wishlist_count
export function toMyProductCard(row, isWishlisted = false) {
  const { wishlists, ...product } = row;
  return { ...toCard(product, isWishlisted), wishlist_count: Number(wishlists?.[0]?.count ?? 0) };
}

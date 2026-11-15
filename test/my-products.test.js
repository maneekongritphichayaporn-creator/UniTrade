import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../lib/http.js';
import {
  MY_PRODUCT_SELECT,
  parseMyProductsQuery,
  summarizeStatuses,
  toMyProductCard,
} from '../lib/my-products.js';

const params = (query) => new URLSearchParams(query);

test('parseMyProductsQuery: ค่าเริ่มต้น page 1, per_page 20 และ per_page สูงสุด 50', () => {
  assert.deepEqual(parseMyProductsQuery(params('')), { page: 1, perPage: 20 });
  assert.deepEqual(parseMyProductsQuery(params('page=3&per_page=10')), { page: 3, perPage: 10 });
  assert.deepEqual(parseMyProductsQuery(params('per_page=500')), { page: 1, perPage: 50 });
});

test('parseMyProductsQuery: page/per_page ไม่ใช่จำนวนเต็มบวก -> 422 VALIDATION_ERROR', () => {
  for (const [query, field] of [['page=0', 'page'], ['page=abc', 'page'], ['per_page=-1', 'per_page']]) {
    assert.throws(() => parseMyProductsQuery(params(query)), (error) => {
      assert.ok(error instanceof ApiError);
      assert.equal(error.status, 422);
      assert.equal(error.code, 'VALIDATION_ERROR');
      assert.equal(error.field, field);
      return true;
    });
  }
});

test('summarizeStatuses: นับครบ 3 สถานะ แม้บางสถานะเป็น 0', () => {
  assert.deepEqual(summarizeStatuses([]), { available: 0, reserved: 0, sold: 0 });
  assert.deepEqual(
    summarizeStatuses(['available', 'sold', 'available', 'reserved', 'sold', 'sold']),
    { available: 2, reserved: 1, sold: 3 },
  );
});

test('toMyProductCard: การ์ดปกติ + wishlist_count และไม่มี wishlists ดิบ', () => {
  const row = {
    product_id: 'p1',
    seller_id: 'u1',
    title: 'CALCULUS I',
    description: 'ไม่ควรอยู่ในการ์ด',
    price: '0.00',
    item_condition: 'good',
    status: 'sold',
    pickup_location: 'ศาลาพระเกี้ยว',
    created_at: '2026-11-15T00:00:00+00:00',
    category: { category_id: 'c1', name: 'Textbooks' },
    seller: { user_id: 'u1', full_name: 'กันตภณ ชัยรุ่งปัญญา', faculty: 'คณะวิศวกรรมศาสตร์' },
    images: [{ image_id: 'i1', image_url: 'https://x/p1/i1.jpg', is_primary: true }],
    wishlists: [{ count: 3 }],
  };
  const card = toMyProductCard(row, true);
  assert.equal(card.wishlist_count, 3);
  assert.equal(card.is_free, true);
  assert.equal(card.is_wishlisted, true);
  assert.deepEqual(card.category, { category_id: 'c1', name: 'Textbooks' });
  assert.equal(card.primary_image_url, 'https://x/p1/i1.jpg');
  assert.equal(card.seller.full_name, 'กันตภณ ช.');
  assert.ok(!('wishlists' in card));
  assert.ok(!('description' in card));
  assert.equal(toMyProductCard({ ...row, wishlists: [] }).wishlist_count, 0);
  assert.equal(toMyProductCard({ ...row, wishlists: undefined }).wishlist_count, 0);
});

test('MY_PRODUCT_SELECT: นับ wishlists และไม่ดึงข้อมูลติดต่อผู้ขาย', () => {
  assert.ok(MY_PRODUCT_SELECT.includes('wishlists(count)'));
  assert.ok(!/phone_number|line_id|email|password_hash/.test(MY_PRODUCT_SELECT));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../lib/http.js';
import {
  publicName,
  isUuid,
  parseProductQuery,
  ilikeContains,
  buildPagination,
  toCard,
  toDetail,
} from '../lib/products.js';

const parse = (qs) => parseProductQuery(new URLSearchParams(qs));
const rejects = (qs, field, code = 'VALIDATION_ERROR') =>
  assert.throws(
    () => parse(qs),
    (e) => e instanceof ApiError && e.status === 422 && e.code === code && e.field === field,
  );

test('publicName keeps first name and first letter of surname', () => {
  assert.equal(publicName('กันตภณ ชัยรุ่งปัญญา'), 'กันตภณ ช.');
});

test('publicName keeps a leading vowel together with the next character', () => {
  assert.equal(publicName('สมชาย เจริญ'), 'สมชาย เจ.');
});

test('publicName returns single words and blanks as they are', () => {
  assert.equal(publicName('สมชาย'), 'สมชาย');
  assert.equal(publicName('  สมชาย   ใจดี  '), 'สมชาย ใ' + 'จ.');
  assert.equal(publicName(null), '');
});

test('isUuid accepts the fixed category ids and rejects junk', () => {
  assert.equal(isUuid('00000000-0000-4000-8000-000000000001'), true);
  assert.equal(isUuid('not-a-uuid'), false);
  assert.equal(isUuid(''), false);
  assert.equal(isUuid(undefined), false);
});

test('parseProductQuery gives the documented defaults', () => {
  const q = parse('');
  assert.equal(q.page, 1);
  assert.equal(q.perPage, 20);
  assert.equal(q.status, 'available');
  assert.deepEqual(q.sort, { column: 'created_at', ascending: false });
  assert.equal(q.keyword, null);
  assert.equal(q.categoryIds, null);
  assert.equal(q.freeOnly, false);
});

test('per_page above 50 is capped at 50', () => {
  assert.equal(parse('per_page=999').perPage, 50);
});

test('page and per_page must be positive integers', () => {
  rejects('page=0', 'page');
  rejects('page=abc', 'page');
  rejects('page=-1', 'page');
  rejects('per_page=0', 'per_page');
  rejects('per_page=1.5', 'per_page');
});

test('category_id accepts comma separated UUIDs and rejects anything else', () => {
  const a = '00000000-0000-4000-8000-000000000001';
  const b = '00000000-0000-4000-8000-000000000002';
  assert.deepEqual(parse(`category_id=${a},${b}`).categoryIds, [a, b]);
  rejects('category_id=abc', 'category_id');
  rejects(`category_id=${a},oops`, 'category_id');
});

test('price range rules', () => {
  const q = parse('min_price=0&max_price=300');
  assert.equal(q.minPrice, 0);
  assert.equal(q.maxPrice, 300);
  rejects('min_price=500&max_price=100', 'min_price');
  rejects('min_price=-5', 'min_price');
  rejects('max_price=abc', 'max_price');
});

test('unknown status, sort and item_condition are rejected', () => {
  rejects('status=deleted', 'status');
  rejects('sort=abc', 'sort');
  rejects('sort=constructor', 'sort');
  rejects('item_condition=broken', 'item_condition');
  assert.equal(parse('status=all').status, 'all');
  assert.equal(parse('item_condition=like_new').itemCondition, 'like_new');
});

test('pickup_location must be one of the fixed list', () => {
  rejects('pickup_location=ที่ไหนสักแห่ง', 'pickup_location', 'INVALID_PICKUP_LOCATION');
  assert.equal(parse('pickup_location=ศาลาพระเกี้ยว').pickupLocation, 'ศาลาพระเกี้ยว');
});

test('keyword is trimmed, blank is ignored, over 100 characters is rejected', () => {
  assert.equal(parse('keyword=%20%20แคลคูลัส%20').keyword, 'แคลคูลัส');
  assert.equal(parse('keyword=%20%20').keyword, null);
  rejects(`keyword=${'a'.repeat(101)}`, 'keyword');
});

test('free_only accepts true and 1 only', () => {
  assert.equal(parse('free_only=true').freeOnly, true);
  assert.equal(parse('free_only=1').freeOnly, true);
  assert.equal(parse('free_only=false').freeOnly, false);
});

test('ilikeContains quotes the keyword so commas and brackets are safe', () => {
  assert.equal(ilikeContains('a,b(c)'), '"%a,b(c)%"');
});

test('buildPagination counts pages and gives 0 when empty', () => {
  assert.deepEqual(buildPagination(1, 20, 47), { page: 1, per_page: 20, total: 47, total_pages: 3 });
  assert.equal(buildPagination(1, 20, 0).total_pages, 0);
});

const row = {
  product_id: 'c0ffee00-1111-4222-8333-444444444444',
  seller_id: '9f1c8b1e-4c1a-4f27-9d0b-6f8a52d2c111',
  title: 'CALCULUS I',
  description: 'รายละเอียด',
  price: '250.00',
  item_condition: 'like_new',
  status: 'available',
  pickup_location: 'ศาลาพระเกี้ยว',
  created_at: '2026-09-08T09:12:00+00:00',
  category: { category_id: '00000000-0000-4000-8000-000000000001', name: 'Textbooks' },
  seller: {
    user_id: '9f1c8b1e-4c1a-4f27-9d0b-6f8a52d2c111',
    full_name: 'กันตภณ ชัยรุ่งปัญญา',
    faculty: 'คณะวิศวกรรมศาสตร์',
    created_at: '2026-06-01T00:00:00+00:00',
  },
  images: [
    { image_id: 'i2', image_url: 'https://x/2.jpg', is_primary: false },
    { image_id: 'i1', image_url: 'https://x/1.jpg', is_primary: true },
  ],
};

test('toCard computes is_free, picks the primary image and hides private fields', () => {
  const card = toCard(row);
  assert.equal(card.price, 250);
  assert.equal(card.is_free, false);
  assert.equal(card.primary_image_url, 'https://x/1.jpg');
  assert.equal(card.seller.full_name, 'กันตภณ ช.');
  assert.equal(card.is_wishlisted, false);
  assert.equal('description' in card, false);
  assert.equal('seller_id' in card, false);
  assert.equal('images' in card, false);
  assert.equal(toCard({ ...row, price: '0.00', images: [] }).is_free, true);
  assert.equal(toCard({ ...row, images: [] }).primary_image_url, null);
});

test('toDetail puts the primary image first and never exposes contact details', () => {
  const detail = toDetail(row, { activeListings: 4, isWishlisted: true, isOwner: false });
  assert.equal(detail.images[0].image_id, 'i1');
  assert.equal(detail.description, 'รายละเอียด');
  assert.equal(detail.is_wishlisted, true);
  assert.equal(detail.is_owner, false);
  assert.deepEqual(Object.keys(detail.seller), [
    'user_id',
    'full_name',
    'faculty',
    'created_at',
    'active_listings',
  ]);
  assert.equal(detail.seller.active_listings, 4);
  assert.equal(/phone|line_id|email|password/.test(JSON.stringify(detail)), false);
  assert.equal(toDetail({ ...row, description: undefined }).description, null);
});
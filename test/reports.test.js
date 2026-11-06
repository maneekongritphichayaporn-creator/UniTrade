import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateReportInput,
  validateReportStatusInput,
  parseAdminReportQuery,
  toAdminReport,
  ADMIN_REPORTS_PER_PAGE,
  ADMIN_REPORTS_MAX_PER_PAGE,
} from '../lib/reports.js';
import { REPORT_REASONS } from '../lib/constants.js';

const errorCode = (fn) => {
  try {
    fn();
  } catch (err) {
    return { status: err.status, code: err.code, field: err.field };
  }
  return null;
};

test('validateReportInput accepts all 7 reasons', () => {
  assert.equal(REPORT_REASONS.length, 7);
  for (const reason of REPORT_REASONS) {
    assert.deepEqual(validateReportInput({ reason }), { reason });
  }
});

test('validateReportInput drops extra fields', () => {
  assert.deepEqual(validateReportInput({ reason: 'spam', reporter_id: 'x', status: 'actioned' }), { reason: 'spam' });
});

test('validateReportInput rejects unknown, missing, wrong case and non-string reasons', () => {
  for (const body of [{ reason: 'fraud' }, {}, { reason: 'SCAM' }, { reason: ' scam' }, { reason: 1 }, { reason: null }]) {
    assert.deepEqual(errorCode(() => validateReportInput(body)), {
      status: 422,
      code: 'INVALID_REPORT_REASON',
      field: 'reason',
    });
  }
});

test('validateReportStatusInput accepts only dismissed, otherwise VALIDATION_ERROR', () => {
  assert.deepEqual(validateReportStatusInput({ status: 'dismissed' }), { status: 'dismissed' });
  for (const status of ['actioned', 'pending', 'Dismissed', undefined, 3]) {
    assert.deepEqual(errorCode(() => validateReportStatusInput({ status })), {
      status: 422,
      code: 'VALIDATION_ERROR',
      field: 'status',
    });
  }
});

const q = (s) => parseAdminReportQuery(new URLSearchParams(s));

test('parseAdminReportQuery defaults to pending, page 1', () => {
  assert.deepEqual(q(''), { status: 'pending', page: 1, perPage: ADMIN_REPORTS_PER_PAGE });
  assert.deepEqual(q('status=all&page=3&per_page=5'), { status: 'all', page: 3, perPage: 5 });
  assert.equal(q('per_page=999').perPage, ADMIN_REPORTS_MAX_PER_PAGE);
});

test('parseAdminReportQuery rejects bad status and page with VALIDATION_ERROR', () => {
  for (const [s, field] of [
    ['status=open', 'status'],
    ['status=PENDING', 'status'],
    ['page=0', 'page'],
    ['page=-1', 'page'],
    ['page=1.5', 'page'],
    ['page=abc', 'page'],
    ['per_page=0', 'per_page'],
  ]) {
    assert.deepEqual(errorCode(() => q(s)), { status: 422, code: 'VALIDATION_ERROR', field });
  }
});

const seller = { user_id: 's1', full_name: 'ผู้ขาย ทดสอบ', faculty: 'คณะวิศวกรรมศาสตร์' };
const reporter = { user_id: 'r1', full_name: 'ผู้รายงาน ทดสอบ', faculty: 'คณะวิทยาศาสตร์' };
const baseRow = { report_id: 'rep1', reason: 'scam', status: 'pending', created_at: '2026-11-03T00:00:00Z', reporter };

test('toAdminReport picks the primary image and converts price to a number', () => {
  const out = toAdminReport({
    ...baseRow,
    product: {
      product_id: 'p1',
      title: 'หนังสือ',
      price: '250.00',
      status: 'available',
      created_at: '2026-11-01T00:00:00Z',
      seller,
      images: [
        { image_url: 'https://x/2.png', is_primary: false },
        { image_url: 'https://x/1.jpg', is_primary: true },
      ],
    },
  });
  assert.equal(out.product.primary_image_url, 'https://x/1.jpg');
  assert.equal(out.product.price, 250);
  assert.deepEqual(out.product.seller, seller);
  assert.deepEqual(out.reporter, reporter);
  assert.equal('images' in out.product, false);
});

test('toAdminReport keeps reports whose product was deleted, with product null', () => {
  const out = toAdminReport({ ...baseRow, product: null });
  assert.equal(out.product, null);
  assert.equal(out.reason, 'scam');
});

test('toAdminReport never adds contact fields', () => {
  const out = toAdminReport({ ...baseRow, product: { product_id: 'p1', title: 't', price: 1, status: 'sold', seller, images: [] } });
  for (const person of [out.reporter, out.product.seller]) {
    for (const key of ['email', 'phone_number', 'line_id', 'password_hash']) assert.equal(key in person, false);
  }
  assert.equal(out.product.primary_image_url, null);
});

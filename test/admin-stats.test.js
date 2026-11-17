import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildAdminStats, daysAgo, STATS_RECENT_DAYS } from '../lib/admin-stats.js';
import { PRODUCT_STATUSES, REPORT_REASONS, REPORT_STATUSES } from '../lib/constants.js';

const NOW = new Date('2026-11-17T10:00:00.000Z');

const input = (overrides = {}) => ({
  productStatusCounts: [20, 3, 7],
  freeProducts: 4,
  removedByAdmin: 2,
  categories: [
    { category_id: '00000000-0000-4000-8000-000000000001', name: 'Textbooks', product_count: 12 },
    { category_id: '00000000-0000-4000-8000-000000000002', name: 'Stationery', product_count: 18 },
  ],
  reportStatusCounts: [3, 5, 4],
  reportReasonCounts: [4, 0, 2, 1, 0, 3, 2],
  totalUsers: 50,
  newUsers: 6,
  now: NOW,
  ...overrides,
});

test('buildAdminStats maps product counts by status and sums the total', () => {
  const { products } = buildAdminStats(input());
  assert.deepEqual(products, { total: 30, available: 20, reserved: 3, sold: 7, free: 4, removed_by_admin: 2 });
});

test('buildAdminStats keys reports by every status and reason', () => {
  const { reports } = buildAdminStats(input());
  assert.equal(reports.total, 12);
  assert.deepEqual(Object.keys(reports.by_status), [...REPORT_STATUSES]);
  assert.deepEqual(Object.keys(reports.by_reason), [...REPORT_REASONS]);
  assert.deepEqual(reports.by_status, { pending: 3, actioned: 5, dismissed: 4 });
  assert.equal(reports.by_reason.scam, 4);
  assert.equal(reports.by_reason.other, 2);
});

test('buildAdminStats fills missing counts with 0', () => {
  const stats = buildAdminStats(input({ productStatusCounts: [], reportStatusCounts: [], reportReasonCounts: [] }));
  assert.equal(stats.products.total, 0);
  for (const status of PRODUCT_STATUSES) assert.equal(stats.products[status], 0);
  for (const reason of REPORT_REASONS) assert.equal(stats.reports.by_reason[reason], 0);
  assert.equal(stats.reports.total, 0);
});

test('buildAdminStats keeps only id, name and count for categories', () => {
  const stats = buildAdminStats(
    input({ categories: [{ category_id: 'c1', name: 'Other', product_count: 1, description: 'x' }] }),
  );
  assert.deepEqual(stats.categories, [{ category_id: 'c1', name: 'Other', product_count: 1 }]);
});

test('buildAdminStats returns users and generated_at', () => {
  const stats = buildAdminStats(input());
  assert.deepEqual(stats.users, { total: 50, new_last_7_days: 6 });
  assert.equal(stats.generated_at, '2026-11-17T10:00:00.000Z');
});

test('daysAgo goes back whole days', () => {
  assert.equal(STATS_RECENT_DAYS, 7);
  assert.equal(daysAgo(NOW, 7).toISOString(), '2026-11-10T10:00:00.000Z');
});

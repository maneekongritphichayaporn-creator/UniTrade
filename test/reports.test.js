import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateReportInput, validateReportStatusInput } from '../lib/reports.js';
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
    assert.deepEqual(errorCode(() => validateReportInput(body)), { status: 422, code: 'INVALID_REASON', field: 'reason' });
  }
});

test('validateReportStatusInput accepts only dismissed', () => {
  assert.deepEqual(validateReportStatusInput({ status: 'dismissed' }), { status: 'dismissed' });
  for (const status of ['actioned', 'pending', 'Dismissed', undefined, 3]) {
    assert.deepEqual(errorCode(() => validateReportStatusInput({ status })), {
      status: 422,
      code: 'INVALID_STATUS',
      field: 'status',
    });
  }
});
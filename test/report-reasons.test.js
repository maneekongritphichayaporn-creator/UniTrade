import test from 'node:test';
import assert from 'node:assert/strict';
import { REPORT_REASONS as API_REASONS } from '../lib/constants.js';
import {
  REPORT_REASONS as UI_REASONS,
  REPORT_REASON_HINTS,
  REPORT_REASON_LABELS,
} from '../lib/client/format.js';

// หน้าเว็บ import lib/constants.js ของ backend ไม่ได้ (AGENTS.md 4.4) จึงมีรายการซ้ำใน lib/client/format.js
// test นี้กันสองรายการเพี้ยนจากกัน (SRS FR-08 ข้อ 6)
test('report reasons in the UI match the API', () => {
  assert.deepEqual(UI_REASONS, [...API_REASONS]);
});

test('every report reason has a Thai label and hint', () => {
  for (const reason of UI_REASONS) {
    assert.ok(REPORT_REASON_LABELS[reason], `label for ${reason}`);
    assert.ok(REPORT_REASON_HINTS[reason], `hint for ${reason}`);
  }
});

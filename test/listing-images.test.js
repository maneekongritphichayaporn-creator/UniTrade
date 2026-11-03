import test from 'node:test';
import assert from 'node:assert/strict';
import { checkImageFiles } from '../lib/client/listing-images.js';

test('listing image limits match the upload contract', () => {
  const file = (size) => ({ size });
  assert.match(checkImageFiles([]), /อย่างน้อย 1/);
  assert.match(checkImageFiles(Array.from({ length: 6 }, () => file(1))), /ไม่เกิน 5/);
  assert.match(checkImageFiles([file(2 * 1024 * 1024 + 1)]), /2MB/);
  assert.match(checkImageFiles([file(2 * 1024 * 1024), file(2 * 1024 * 1024), file(1)]), /4MB/);
  assert.equal(checkImageFiles([file(1000), file(2000)]), null);
});

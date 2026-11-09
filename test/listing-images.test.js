import test from 'node:test';
import assert from 'node:assert/strict';
import { checkImageFiles, prepareImages } from '../lib/client/listing-images.js';

test('listing image limits match the upload contract', () => {
  const file = (size) => ({ size });
  assert.match(checkImageFiles([]), /อย่างน้อย 1/);
  assert.match(checkImageFiles(Array.from({ length: 6 }, () => file(1))), /ไม่เกิน 5/);
  assert.match(checkImageFiles([file(2 * 1024 * 1024 + 1)]), /2MB/);
  assert.match(checkImageFiles([file(2 * 1024 * 1024), file(2 * 1024 * 1024), file(1)]), /4MB/);
  assert.equal(checkImageFiles([file(1000), file(2000)]), null);
});

test('browser preparation compresses a set of individually valid images below 4 MB', async () => {
  const originalBitmap = globalThis.createImageBitmap;
  const originalDocument = globalThis.document;
  let encodes = 0;
  globalThis.createImageBitmap = async () => ({ width: 2000, height: 1500, close() {} });
  globalThis.document = {
    createElement: () => ({
      getContext: () => ({ fillRect() {}, drawImage() {}, set fillStyle(_) {} }),
      toBlob: (done) => { encodes += 1; done(new Blob([new Uint8Array(700_000)], { type: 'image/jpeg' })); },
    }),
  };
  try {
    const files = Array.from({ length: 5 }, (_, index) => {
      const bytes = new Uint8Array(1024 * 1024);
      bytes.set([0xff, 0xd8, 0xff]);
      return new File([bytes], `photo-${index}.jpg`, { type: 'image/jpeg' });
    });
    const prepared = await prepareImages(files);
    assert.equal(prepared.length, 5);
    assert.ok(encodes > 0);
    assert.equal(checkImageFiles(prepared), null);
    assert.ok(prepared.reduce((sum, file) => sum + file.size, 0) <= 4 * 1024 * 1024);
  } finally {
    globalThis.createImageBitmap = originalBitmap;
    globalThis.document = originalDocument;
  }
});

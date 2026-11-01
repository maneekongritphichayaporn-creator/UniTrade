import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError } from '../lib/http.js';
import {
  sniffImageType,
  validateImages,
  imagePath,
  MAX_FILE_BYTES,
  MAX_TOTAL_BYTES,
} from '../lib/product-images.js';

// สร้างไฟล์จำลอง: size คือขนาดที่ validateImages ใช้ตรวจ
// bytes จองอย่างน้อยเท่าลายเซ็น จึงสร้างไฟล์เล็กกว่าลายเซ็นได้โดยไม่พัง
const fake = (signature) => (size = 10) => {
  const bytes = new Uint8Array(Math.max(size, signature.length));
  bytes.set(signature);
  return { size, bytes };
};
const jpeg = fake([0xff, 0xd8, 0xff]);
const png = fake([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const text = fake([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"

const rejects = (files, code, status) =>
  assert.throws(
    () => validateImages(files),
    (e) => e instanceof ApiError && e.code === code && e.status === status && e.field === 'images',
  );

test('sniffImageType reads the first bytes, not the file name', () => {
  assert.deepEqual(sniffImageType(jpeg().bytes), { ext: 'jpg', contentType: 'image/jpeg' });
  assert.deepEqual(sniffImageType(png().bytes), { ext: 'png', contentType: 'image/png' });
  assert.equal(sniffImageType(text().bytes), null);
  assert.equal(sniffImageType(new Uint8Array([0xff, 0xd8])), null); // สั้นกว่าลายเซ็น
  assert.equal(sniffImageType(new Uint8Array()), null);
});

test('no file at all gives NO_IMAGE', () => {
  rejects([], 'NO_IMAGE', 422);
});

test('more than five files gives TOO_MANY_IMAGES', () => {
  rejects([jpeg(), jpeg(), jpeg(), jpeg(), jpeg(), jpeg()], 'TOO_MANY_IMAGES', 422);
});

test('a file over 2 MB gives FILE_TOO_LARGE', () => {
  rejects([jpeg(MAX_FILE_BYTES + 1)], 'FILE_TOO_LARGE', 413);
  assert.equal(validateImages([jpeg(MAX_FILE_BYTES)]).length, 1); // พอดี 2 MB ผ่าน
});

test('files over 4 MB together give FILE_TOO_LARGE', () => {
  const half = MAX_TOTAL_BYTES / 2;
  rejects([jpeg(half), jpeg(half), jpeg(1)], 'FILE_TOO_LARGE', 413);
  assert.equal(validateImages([jpeg(half), jpeg(half)]).length, 2); // พอดี 4 MB ผ่าน
});

test('a text file renamed .jpg gives UNSUPPORTED_FILE_TYPE', () => {
  rejects([text()], 'UNSUPPORTED_FILE_TYPE', 422);
  rejects([jpeg(), text()], 'UNSUPPORTED_FILE_TYPE', 422);
});

test('the first image is the primary one and order is kept', () => {
  const result = validateImages([png(), jpeg(), jpeg()]);
  assert.deepEqual(
    result.map((img) => [img.ext, img.is_primary]),
    [['png', true], ['jpg', false], ['jpg', false]],
  );
  assert.equal(result.filter((img) => img.is_primary).length, 1);
});

test('imagePath puts every file in the product folder', () => {
  assert.equal(
    imagePath('c0ffee00-1111-4222-8333-444444444444', 'a1b2', 'jpg'),
    'c0ffee00-1111-4222-8333-444444444444/a1b2.jpg',
  );
});
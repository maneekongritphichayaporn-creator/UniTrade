import { ApiError } from './http.js';

// ตรวจไฟล์รูปของ POST /products (Spec §8.1) — ฟังก์ชันล้วน ห้าม import lib/supabase.js

export const MAX_IMAGES = 5;
export const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB ต่อรูป
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024; // 4 MB รวมทุกรูป (Vercel ปฏิเสธ body เกิน 4.5 MB)

const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

const startsWith = (bytes, signature) =>
  signature.length <= bytes.length && signature.every((byte, i) => bytes[i] === byte);

// ดูชนิดไฟล์จากไบต์แรกเท่านั้น ไม่เชื่อนามสกุลหรือ file.type ที่ผู้ใช้ส่งมา
export function sniffImageType(bytes) {
  if (startsWith(bytes, JPEG)) return { ext: 'jpg', contentType: 'image/jpeg' };
  if (startsWith(bytes, PNG)) return { ext: 'png', contentType: 'image/png' };
  return null;
}

// files: [{ size, bytes }] โดย bytes เป็น Uint8Array ของไฟล์นั้น
// คืน [{ ext, contentType, bytes, is_primary }] เรียงตามลำดับที่ส่งมา (รูปแรกเป็นรูปหลัก)
export function validateImages(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw new ApiError(422, 'NO_IMAGE', 'ต้องแนบรูปสินค้าอย่างน้อย 1 รูป', 'images');
  }
  if (files.length > MAX_IMAGES) {
    throw new ApiError(422, 'TOO_MANY_IMAGES', `แนบรูปได้ไม่เกิน ${MAX_IMAGES} รูปต่อประกาศ`, 'images');
  }

  let total = 0;
  for (const file of files) {
    const size = file.size ?? file.bytes?.length ?? 0;
    if (size > MAX_FILE_BYTES) {
      throw new ApiError(413, 'FILE_TOO_LARGE', 'ไฟล์รูปต้องมีขนาดไม่เกิน 2MB ต่อรูป', 'images');
    }
    total += size;
  }
  if (total > MAX_TOTAL_BYTES) {
    throw new ApiError(413, 'FILE_TOO_LARGE', 'รูปทั้งหมดรวมกันต้องไม่เกิน 4MB', 'images');
  }

  return files.map((file, index) => {
    const type = sniffImageType(file.bytes);
    if (!type) {
      throw new ApiError(422, 'UNSUPPORTED_FILE_TYPE', 'รับเฉพาะไฟล์ .jpg .jpeg และ .png', 'images');
    }
    return { ...type, bytes: file.bytes, is_primary: index === 0 };
  });
}

// path ของไฟล์ใน bucket: <product_id>/<image_id>.<ext> — DELETE ใช้ list(product_id) หาไฟล์ทั้งโฟลเดอร์
export const imagePath = (productId, imageId, ext) => `${productId}/${imageId}.${ext}`;

// ลบไฟล์ทั้งโฟลเดอร์ของประกาศ (Spec §8.4) — ใช้ list() เพราะแถว product_images ถูกลบไปแล้วตอนเรียก
// ลบไม่สำเร็จให้บันทึกไว้เฉยๆ ฐานข้อมูลถูกต้องแล้ว ไฟล์ค้างเก็บกวาดทีหลังได้
export async function removeProductFolder(bucket, productId) {
  try {
    const { data: files, error } = await bucket.list(productId);
    if (error) throw error;
    if (files.length > 0) {
      const { error: removeError } = await bucket.remove(files.map((file) => `${productId}/${file.name}`));
      if (removeError) throw removeError;
    }
  } catch (err) {
    console.error(`[DELETE /products/${productId}] remove storage files`, err);
  }
}
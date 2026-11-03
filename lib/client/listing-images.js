const MAX_IMAGES = 5;
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

export function checkImageFiles(files) {
  if (!files.length) return 'ต้องแนบรูปสินค้าอย่างน้อย 1 รูป';
  if (files.length > MAX_IMAGES) return 'แนบรูปได้ไม่เกิน 5 รูป';
  if (files.some((file) => file.size > MAX_FILE_BYTES)) return 'ไฟล์รูปต้องมีขนาดไม่เกิน 2MB ต่อรูป';
  if (files.reduce((sum, file) => sum + file.size, 0) > MAX_TOTAL_BYTES) return 'รูปทั้งหมดรวมกันต้องไม่เกิน 4MB';
  return null;
}

export async function prepareImage(file) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (!jpeg && !png) throw new Error('รับเฉพาะไฟล์ JPEG หรือ PNG');
  if (file.size <= MAX_FILE_BYTES) return file;

  // ลดขนาดรูปในเบราว์เซอร์ก่อนส่ง (Vercel จำกัด request ทั้งก้อน)
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.82, 0.65, 0.45]) {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (blob && blob.size <= MAX_FILE_BYTES) return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
    }
    throw new Error('ย่อรูปนี้ให้ต่ำกว่า 2MB ไม่สำเร็จ กรุณาเลือกรูปอื่น');
  } finally { bitmap.close(); }
}

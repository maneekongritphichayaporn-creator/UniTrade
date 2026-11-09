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

export async function prepareImage(file, maxBytes = MAX_FILE_BYTES) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((value, index) => bytes[index] === value);
  if (!jpeg && !png) throw new Error('รับเฉพาะไฟล์ JPEG หรือ PNG');
  if (file.size <= maxBytes) return file;

  // ลดขนาดรูปในเบราว์เซอร์ก่อนส่ง (Vercel จำกัด request ทั้งก้อน)
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('เตรียมรูปไม่สำเร็จ กรุณาลองใหม่');
    for (const maxSide of [1600, 1200, 900, 700, 500, 320]) {
      const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      for (const quality of [0.82, 0.65, 0.45]) {
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
        if (blob && blob.size <= maxBytes) {
          return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
        }
      }
    }
    throw new Error('ย่อรูปให้มีขนาดตามที่กำหนดไม่สำเร็จ กรุณาเลือกรูปอื่น');
  } finally { bitmap.close(); }
}

export async function prepareImages(files) {
  if (files.length > MAX_IMAGES) throw new Error('แนบรูปได้ไม่เกิน 5 รูป');
  const total = files.reduce((sum, file) => sum + file.size, 0);
  const target = total > MAX_TOTAL_BYTES
    ? Math.min(MAX_FILE_BYTES, Math.floor(MAX_TOTAL_BYTES / files.length))
    : MAX_FILE_BYTES;
  const prepared = await Promise.all(files.map((file) => prepareImage(file, target)));
  const issue = checkImageFiles(prepared);
  if (issue) throw new Error(issue);
  return prepared;
}

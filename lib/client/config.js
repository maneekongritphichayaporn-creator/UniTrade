// ค่าตั้งต้นของฝั่งหน้าเว็บ (frontend เท่านั้น ห้าม import จาก lib/ ของ backend)

export const API_BASE_URL = '/api/v1';

// โหมดข้อมูลจำลอง: ใส่ NEXT_PUBLIC_USE_MOCK_API=true ใน .env.local
// เอาไว้พัฒนา/เดโมหน้าเว็บตอนที่ยังไม่มี Supabase หรือ TASK-09 ยังไม่ merge
// ค่านี้ถูกแทนตอน build ถ้าเป็น false โค้ด mock จะไม่ติดไปใน bundle
export const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

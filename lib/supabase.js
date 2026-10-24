import 'server-only';
import { createClient } from '@supabase/supabase-js';

// client ตัวเดียวของทั้ง backend ใช้ service_role ซึ่งข้าม RLS ทุกตาราง (migration 0002)
// จึงต้องเรียกจาก route ที่ผ่านการตรวจสิทธิ์แล้วเท่านั้น และห้าม import จากโค้ดฝั่งเบราว์เซอร์
// ('server-only' ทำให้ build พังทันทีถ้ามีใคร import ไฟล์นี้จาก client component)

let client;

export function db() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export const PRODUCT_IMAGES_BUCKET = 'product-images';

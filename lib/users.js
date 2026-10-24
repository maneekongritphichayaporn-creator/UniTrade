import { ApiError } from './http.js';
import { ACTIVE_STATUSES } from './constants.js';
import { db } from './supabase.js';

// ระบุคอลัมน์ทุกครั้ง ห้าม select('*') จากตาราง users — password_hash ต้องไม่ออกจาก backend
export const PROFILE_COLUMNS = 'user_id, email, full_name, phone_number, line_id, faculty, role, created_at';

export async function getUserRow(userId) {
  const { data, error } = await db().from('users').select(PROFILE_COLUMNS).eq('user_id', userId).maybeSingle();
  if (error) throw error;
  // token ยังไม่หมดอายุ แต่บัญชีถูกลบไปแล้ว
  if (!data) throw new ApiError(401, 'UNAUTHORIZED', 'ไม่พบบัญชีผู้ใช้ กรุณาเข้าสู่ระบบใหม่');
  return data;
}

async function count(query) {
  const { count: total, error } = await query;
  if (error) throw error;
  return total ?? 0;
}

// GET /auth/me (Spec §3.3)
export async function getProfile(userId) {
  const user = await getUserRow(userId);
  const countOf = (table) => db().from(table).select('*', { count: 'exact', head: true });

  const [active_listings, sold_items, wishlist_count] = await Promise.all([
    count(countOf('products').eq('seller_id', userId).in('status', ACTIVE_STATUSES)),
    count(countOf('products').eq('seller_id', userId).eq('status', 'sold')),
    count(countOf('wishlists').eq('user_id', userId)),
  ]);

  return { ...user, stats: { active_listings, sold_items, wishlist_count } };
}

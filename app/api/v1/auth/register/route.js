import bcrypt from 'bcryptjs';
import { ApiError, ok, readJson, route } from '@/lib/http.js';
import { db } from '@/lib/supabase.js';
import { PROFILE_COLUMNS } from '@/lib/users.js';
import { validateRegistration } from '@/lib/validation.js';

// UC-01 Submit Register → Validate Registration → INSERT User (Spec §3.1)
// NFR: bcrypt salt rounds >= 10 — ใช้ 12 ตาม Spec

const BCRYPT_COST = 12;

export const POST = route(async (request) => {
  const { password, ...profile } = validateRegistration(await readJson(request));
  const password_hash = await bcrypt.hash(password, BCRYPT_COST);

  const { data: user, error } = await db()
    .from('users')
    .insert({ ...profile, password_hash })
    .select(PROFILE_COLUMNS)
    .single();

  // ไม่เช็คอีเมลซ้ำก่อน INSERT — unique constraint จับได้แม้สองคำขอมาพร้อมกัน
  if (error?.code === '23505') {
    throw new ApiError(409, 'EMAIL_TAKEN', 'อีเมลนี้ถูกใช้สมัครแล้ว', 'email');
  }
  if (error) throw error;

  return ok({ user, message: 'ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ' }, 201);
});

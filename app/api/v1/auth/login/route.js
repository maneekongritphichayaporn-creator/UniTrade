import bcrypt from 'bcryptjs';
import { ApiError, ok, readJson, route } from '@/lib/http.js';
import { signToken, TOKEN_TTL_SECONDS } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { PROFILE_COLUMNS } from '@/lib/users.js';
import { normalizeEmail, passwordTooLong } from '@/lib/validation.js';

// UC-01 Click Sign In → Find User → Validate Credentials → Generate Token (Spec §3.2)

// hash ของข้อความสุ่ม ใช้เทียบเมื่อไม่พบอีเมล ให้เวลาตอบกลับเท่ากับกรณีรหัสผิด
// ไม่งั้นคนนอกจับเวลาแล้วรู้ได้ว่าอีเมลไหนสมัครไว้
const DUMMY_HASH = '$2b$12$KqEY9bELj0lPkcG73GDo5.nKDYAB0v1xYg2Yt2/gTABcouuXNKo3y';

const invalidCredentials = () =>
  new ApiError(401, 'INVALID_CREDENTIALS', 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');

export const POST = route(async (request) => {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'กรุณากรอกอีเมลและรหัสผ่าน', email ? 'password' : 'email');
  }
  if (passwordTooLong(password)) throw invalidCredentials();

  const { data: row, error } = await db()
    .from('users')
    .select(`${PROFILE_COLUMNS}, password_hash`)
    .eq('email', email)
    .maybeSingle();
  if (error) throw error;

  const matches = await bcrypt.compare(password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !matches) throw invalidCredentials();

  const { password_hash, created_at, ...user } = row;
  return ok({
    token: signToken(user),
    token_type: 'bearer',
    expires_in: TOKEN_TTL_SECONDS,
    user,
  });
});

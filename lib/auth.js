import jwt from 'jsonwebtoken';
import { ApiError, route } from './http.js';

// JWT ของเราเอง (Spec §3.2): HS256, payload { sub: user_id, role }, อายุ 24 ชม. ไม่มี refresh token

export const TOKEN_TTL_SECONDS = 24 * 60 * 60;

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) {
    throw new Error('JWT_SECRET is missing or shorter than 32 characters');
  }
  return value;
}

export function signToken(user) {
  return jwt.sign({ role: user.role }, secret(), {
    algorithm: 'HS256',
    subject: user.user_id,
    expiresIn: TOKEN_TTL_SECONDS,
  });
}

// คืน { user_id, role } เมื่อ token ใช้ได้ · null เมื่อไม่ได้ส่ง token มา · throw 401 เมื่อ token เสีย/หมดอายุ
export function readUser(request) {
  const header = request.headers.get('authorization');
  if (!header) return null;

  const [scheme, token, ...rest] = header.trim().split(/\s+/);
  if (scheme.toLowerCase() !== 'bearer' || !token || rest.length) {
    throw new ApiError(401, 'UNAUTHORIZED', 'รูปแบบ Authorization header ต้องเป็น "Bearer <token>"');
  }

  const key = secret();
  let payload;
  try {
    payload = jwt.verify(token, key, { algorithms: ['HS256'] });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'TOKEN_EXPIRED', 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    }
    throw new ApiError(401, 'UNAUTHORIZED', 'token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่');
  }
  if (typeof payload.sub !== 'string' || !payload.role) {
    throw new ApiError(401, 'UNAUTHORIZED', 'token ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่');
  }
  return { user_id: payload.sub, role: payload.role };
}

// route ที่ต้องล็อกอิน — handler ได้ context.user = { user_id, role }
export function requireAuth(handler) {
  return route(async (request, context) => {
    const user = readUser(request);
    if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'กรุณาเข้าสู่ระบบด้วยอีเมลจุฬาฯ');
    return handler(request, { ...context, user });
  });
}

// route สาธารณะที่แสดงผลต่างกันเมื่อล็อกอิน (is_wishlisted, is_owner)
// token เสียหรือหมดอายุให้ถือเป็นผู้เยี่ยมชม หน้าเว็บสาธารณะต้องเปิดได้เสมอ
export function optionalAuth(handler) {
  return route(async (request, context) => {
    let user = null;
    try {
      user = readUser(request);
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    }
    return handler(request, { ...context, user });
  });
}

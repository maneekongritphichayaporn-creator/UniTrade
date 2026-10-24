// รูปแบบ response และ error ตาม API Spec v2.2 §1.2–1.4
// ทุก route ห่อด้วย route() (หรือ requireAuth / optionalAuth ซึ่งห่อให้แล้ว)
// แล้ว throw new ApiError(...) เมื่อต้องการตอบ error — ไม่ต้องสร้าง Response เอง

export class ApiError extends Error {
  constructor(status, code, message, field) {
    super(message);
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

export function ok(body, status = 200) {
  return Response.json(body, { status });
}

export function noContent() {
  return new Response(null, { status: 204 });
}

export function fail(status, code, message, field) {
  const error = field ? { code, message, field } : { code, message };
  return Response.json({ error }, { status });
}

export function route(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context);
    } catch (err) {
      if (err instanceof ApiError) return fail(err.status, err.code, err.message, err.field);
      // CHECK constraint ในฐานข้อมูลเป็นด่านสุดท้าย ถ้าหลุดมาถึงตรงนี้แปลว่าตัว validate ฝั่ง API ตกหล่น
      if (err?.code === '23514') {
        return fail(422, 'VALIDATION_ERROR', 'ข้อมูลไม่ผ่านเงื่อนไขของระบบ');
      }
      console.error(`[${request.method} ${new URL(request.url).pathname}]`, err);
      return fail(500, 'INTERNAL_ERROR', 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง');
    }
  };
}

export async function readJson(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = undefined;
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'INVALID_PAYLOAD', 'รูปแบบข้อมูลไม่ถูกต้อง ต้องส่งเป็น JSON object');
  }
  return body;
}

// ตัวกลางเรียก REST API ของเรา (รูปแบบตาม API Spec v2.2 — ดู AGENTS.md ส่วน 6)
// สำเร็จแบบรายการ: { data: [...], pagination }  ·  สำเร็จแบบชิ้นเดียว: object ตรง ๆ
// ผิดพลาด: { error: { code, message, field? } } โดย message เป็นภาษาไทย แสดงให้ผู้ใช้ได้เลย

import { API_BASE_URL } from './config.js';
import { clearSession, getToken } from './session.js';

export class ApiError extends Error {
  constructor({ status, code, message, field }) {
    super(message || 'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง');
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.field = field;
  }
}

function buildQuery(query) {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '' || value === false) continue;
    // หลายค่าคั่นด้วยจุลภาค เช่น category_id=uuid1,uuid2 (ตาม spec 7.4)
    params.set(key, Array.isArray(value) ? value.join(',') : String(value));
  }
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * ยิงคำขอไปที่ /api/v1
 * @param {string} path เช่น '/products'
 * @param {{ method?: string, query?: object, body?: object|FormData, signal?: AbortSignal }} options
 */
export async function request(path, { method = 'GET', query, body, signal } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) {
    payload = body; // ปล่อยให้เบราว์เซอร์ใส่ boundary ของ multipart เอง
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}${buildQuery(query)}`, {
      method,
      headers,
      body: payload,
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') throw error; // ผู้เรียกยกเลิกเอง ไม่ใช่ปัญหาเครือข่าย
    throw new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่',
    });
  }

  if (response.status === 204) return undefined;

  let json;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    // token หมดอายุ/ถูกปฏิเสธ — ล้าง session ทิ้ง หน้าที่ต้องล็อกอินจะพาไปหน้าเข้าสู่ระบบเอง
    if (response.status === 401 && token) clearSession('expired');
    throw new ApiError({
      status: response.status,
      code: json?.error?.code ?? 'UNKNOWN_ERROR',
      message: json?.error?.message,
      field: json?.error?.field,
    });
  }

  return json;
}

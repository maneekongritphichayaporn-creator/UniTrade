// เข้าสู่ระบบ / ออกจากระบบ (TASK-06 ของ backend ทำเสร็จแล้ว)

import { request } from './api.js';
import { USE_MOCK_API } from './config.js';
import { clearSession, setSession } from './session.js';

/** ล็อกอินแล้วเก็บ token ลง localStorage */
export async function login(email, password) {
  const response = USE_MOCK_API
    ? await (await import('./mock/handlers.js')).mockLogin(email, password)
    : await request('/auth/login', { method: 'POST', body: { email, password } });

  setSession(response);
  return response.user;
}

export function logout() {
  clearSession('signed-out');
}

/** ข้อมูลผู้ใช้ที่ล็อกอินอยู่ พร้อม stats */
export async function getMe({ signal } = {}) {
  if (USE_MOCK_API) {
    const { mockGetMe } = await import('./mock/handlers.js');
    return mockGetMe();
  }
  return request('/auth/me', { signal });
}

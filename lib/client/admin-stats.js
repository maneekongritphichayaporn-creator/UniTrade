// สถิติภาพรวมของเว็บในหน้า Admin Dashboard — GET /admin/stats (เฉพาะ admin)
// แยกไฟล์จาก admin.js (TASK-20 ของ @warixm) เพื่อไม่แก้ไฟล์ของคนอื่น

import { request } from './api.js';
import { USE_MOCK_API } from './config.js';

/**
 * @returns {Promise<{
 *   products: { total: number, available: number, reserved: number, sold: number, free: number, removed_by_admin: number },
 *   categories: { category_id: string, name: string, product_count: number }[],
 *   reports: { total: number, by_status: Record<string, number>, by_reason: Record<string, number> },
 *   users: { total: number, new_last_7_days: number },
 *   generated_at: string,
 * }>}
 */
export async function getAdminStats({ signal } = {}) {
  if (USE_MOCK_API) {
    const { mockGetAdminStats } = await import('./mock/handlers.js');
    return mockGetAdminStats();
  }
  return request('/admin/stats', { signal });
}

// หมวดหมู่และจุดนัดรับ — ใช้ทำตัวกรองและ dropdown (ห้าม hardcode จุดนัดรับในฟอร์ม ตามมติทีม 11 ก.ย.)

import { request } from './api.js';
import { USE_MOCK_API } from './config.js';

/** @returns {Promise<{ data: { category_id: string, name: string, description: string, product_count: number }[] }>} */
export async function getCategories({ signal } = {}) {
  if (USE_MOCK_API) {
    const { mockGetCategories } = await import('./mock/handlers.js');
    return mockGetCategories();
  }
  return request('/categories', { signal });
}

/** @returns {Promise<{ data: string[] }>} จุดนัดรับเป็น string ตรง ๆ ไม่ใช่ object */
export async function getPickupLocations({ signal } = {}) {
  if (USE_MOCK_API) {
    const { mockGetPickupLocations } = await import('./mock/handlers.js');
    return mockGetPickupLocations();
  }
  return request('/pickup-locations', { signal });
}

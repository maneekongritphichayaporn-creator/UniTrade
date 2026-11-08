// สินค้า — GET /products, GET /products/:id, GET /products/:id/contact (TASK-09, TASK-18)

import { ApiError, request } from './api.js';
import { USE_MOCK_API } from './config.js';

/**
 * รายการสินค้า
 * @param {object} query page, per_page, keyword, category_id, min_price, max_price,
 *                       free_only, status, pickup_location, item_condition, sort
 * @returns {Promise<{ data: object[], pagination: object, message?: string }>}
 */
export async function listProducts(query = {}, { signal } = {}) {
  if (USE_MOCK_API) {
    const { mockListProducts } = await import('./mock/handlers.js');
    return mockListProducts(query);
  }
  return request('/products', { query, signal });
}

/**
 * รายละเอียดสินค้า 1 ชิ้น
 *
 * ไม่พบสินค้าฟังก์ชันนี้คืน null — รองรับทั้งสองแบบที่ API อาจตอบ
 * ตอนนี้ TASK-09 ตอบ 200 + { data: [] } (ยืนยันโดย @wz ตอนรีวิว และ @SArunPoB แจ้งในกลุ่ม 27 ต.ค.)
 * ส่วน AGENTS.md ส่วน 7.5 ยังเขียนว่า 404 PRODUCT_NOT_FOUND จึงเช็กไว้ทั้งคู่
 */
export async function getProduct(id, { signal } = {}) {
  let body;
  try {
    if (USE_MOCK_API) {
      const { mockGetProduct } = await import('./mock/handlers.js');
      body = await mockGetProduct(id);
    } else {
      body = await request(`/products/${encodeURIComponent(id)}`, { signal });
    }
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.code === 'PRODUCT_NOT_FOUND')) {
      return null;
    }
    throw error;
  }
  // { data: [] } หรือ body ที่ไม่มี product_id = ไม่พบสินค้า
  return body?.product_id ? body : null;
}

/**
 * ข้อมูลติดต่อผู้ขาย — เฉพาะสมาชิกที่ล็อกอินแล้ว (FR-06)
 * @returns {Promise<{ seller: object, channels: object[], pickup_location: string, safety_note?: string }>}
 */
export async function getProductContact(id, { signal } = {}) {
  if (USE_MOCK_API) {
    const { mockGetProductContact } = await import('./mock/handlers.js');
    return mockGetProductContact(id);
  }
  return request(`/products/${encodeURIComponent(id)}/contact`, { signal });
}

/** สร้างประกาศพร้อมรูป: request() แนบ Bearer token และปล่อย browser ตั้ง multipart boundary */
export function createProduct(formData) {
  return request('/products', { method: 'POST', body: formData });
}

/** แก้ข้อความประกาศเท่านั้น รูปเดิมแก้ผ่าน PATCH ไม่ได้ */
export function updateProduct(id, fields) {
  return request(`/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: fields });
}

/** ดึงรายการทุกหน้าแล้วเลือกเฉพาะประกาศของผู้ใช้ เพราะ API ยังไม่มี GET /me/products */
export async function listMyProducts(userId, { signal } = {}) {
  const first = await listProducts({ status: 'all', per_page: 50, page: 1 }, { signal });
  const mine = first.data.filter((item) => item.seller?.user_id === userId);
  for (let page = 2; page <= first.pagination.total_pages; page += 1) {
    const result = await listProducts({ status: 'all', per_page: 50, page }, { signal });
    mine.push(...result.data.filter((item) => item.seller?.user_id === userId));
  }
  return mine;
}

export async function updateProductStatus(id, status) {
  if (USE_MOCK_API) {
    const { mockUpdateProductStatus } = await import('./mock/handlers.js');
    return mockUpdateProductStatus(id, status);
  }
  return request(`/products/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status } });
}

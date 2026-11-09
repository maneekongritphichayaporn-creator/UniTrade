import { request } from './api.js';

export async function listAdminReports({ page = 1, signal } = {}) {
  return request('/admin/reports', { query: { status: 'pending', page }, signal });
}

export async function dismissAdminReport(id) {
  return request(`/admin/reports/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status: 'dismissed' },
  });
}

export async function deleteAdminProduct(id) {
  return request(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

import { request } from './api.js';
import { USE_MOCK_API } from './config.js';

export async function getFaculties({ signal } = {}) {
  if (USE_MOCK_API) return { data: ['คณะวิศวกรรมศาสตร์', 'คณะวิทยาศาสตร์', 'คณะอักษรศาสตร์'], allow_other: true, other_value: 'other' };
  return request('/faculties', { signal });
}

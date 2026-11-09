import { request } from './api.js';
import { USE_MOCK_API } from './config.js';

export async function toggleWishlist(productId) {
  if (USE_MOCK_API) {
    const { mockToggleWishlist } = await import('./mock/handlers.js');
    return mockToggleWishlist(productId);
  }
  return request(`/products/${encodeURIComponent(productId)}/wishlist`, { method: 'POST' });
}

export async function getWishlist({ signal } = {}) {
  if (USE_MOCK_API) {
    const { mockGetWishlist } = await import('./mock/handlers.js');
    return mockGetWishlist();
  }
  return request('/me/wishlist', { signal });
}

export async function removeWishlist(productId) {
  if (USE_MOCK_API) {
    const { mockRemoveWishlist } = await import('./mock/handlers.js');
    return mockRemoveWishlist(productId);
  }
  return request(`/me/wishlist/${encodeURIComponent(productId)}`, { method: 'DELETE' });
}

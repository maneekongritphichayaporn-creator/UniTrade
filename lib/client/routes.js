// path ของทุกหน้าในเว็บ รวมไว้ที่เดียวกันเพื่อไม่ให้พิมพ์ path ซ้ำกระจายในโค้ด
// หน้าที่ยังไม่มีคนทำจะตกไปที่ app/not-found.js (บอกว่าเป็นงานของใคร)

export const routes = {
  home: '/',
  product: (id) => `/products/${id}`,

  // TASK-08 @warixm
  login: (next) => (next ? `/login?next=${encodeURIComponent(next)}` : '/login'),
  register: '/register',
  profile: '/me/profile',

  // TASK-13 @warixm
  createProduct: '/products/create',
  editProduct: (id) => `/products/${id}/edit`,

  myProducts: '/me/products', // TASK-14 @warixm
  wishlist: '/me/wishlist', // TASK-17 @warixm
  admin: '/admin', // TASK-20 @warixm
};

/** รับเฉพาะ path ภายในเว็บ กัน open redirect จาก ?next= */
export function safeNextPath(next) {
  if (typeof next !== 'string') return null;
  if (!next.startsWith('/') || next.startsWith('//')) return null;
  return next;
}

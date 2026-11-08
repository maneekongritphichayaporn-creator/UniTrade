// เลียนแบบพฤติกรรมของ API จริงให้ครบ เพื่อให้หน้าเว็บที่เขียนบน mock ใช้กับของจริงได้ทันที
// อ้างจาก AGENTS.md ส่วน 6-7 และ lib/products.js ของ backend
// โหลดเฉพาะเมื่อ NEXT_PUBLIC_USE_MOCK_API=true (import แบบ dynamic ใน lib/client/*.js)

import { ApiError } from '../api.js';
import { getSession } from '../session.js';
import { ACCOUNTS, CATEGORIES, PICKUP_LOCATIONS, PRODUCTS, mockImageUrl } from './data.js';

const LATENCY_MS = 280;
const DEFAULT_PER_PAGE = 20;
const MAX_PER_PAGE = 50;
const EMPTY_LIST_MESSAGE = 'ไม่พบสินค้าที่ตรงกับเงื่อนไข ลองปรับตัวกรองหรือคำค้นหา';
const ACTIVE_STATUSES = ['available', 'reserved'];
const STATUS_KEY = 'unitrade.mock.product-statuses';
const WISHLIST_KEY = 'unitrade.mock.wishlists';

function savedIds(userId) {
  if (!userId || typeof window === 'undefined') return [];
  try { return JSON.parse(window.localStorage.getItem(`${WISHLIST_KEY}.${userId}`) || '[]'); }
  catch { return []; }
}

function setSavedIds(userId, ids) {
  window.localStorage.setItem(`${WISHLIST_KEY}.${userId}`, JSON.stringify(ids));
}

function requireMockUser() {
  const user = getSession()?.user;
  if (!user) throw new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' });
  return user;
}

function statusOverrides() {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(window.localStorage.getItem(STATUS_KEY) || '{}'); }
  catch { return {}; }
}

function currentStatus(product) {
  return statusOverrides()[product.product_id] ?? product.status;
}

const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));

const SORTS = {
  date_desc: (a, b) => b.created_at.localeCompare(a.created_at),
  date_asc: (a, b) => a.created_at.localeCompare(b.created_at),
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
};

// ชื่อผู้ขายที่แสดงต่อสาธารณะ — ลอกกฎจาก publicName() ใน lib/products.js
const LEADING_VOWELS = 'เแโใไ';

function publicName(fullName) {
  const parts = String(fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? '';
  const chars = Array.from(parts[parts.length - 1]);
  const initial = LEADING_VOWELS.includes(chars[0]) ? chars.slice(0, 2).join('') : chars[0];
  return `${parts[0]} ${initial}.`;
}

const findUser = (userId) => ACCOUNTS.find((a) => a.user.user_id === userId)?.user ?? null;
const findCategory = (categoryId) => CATEGORIES.find((c) => c.category_id === categoryId) ?? null;

function images(product) {
  return Array.from({ length: product.image_count }, (_, index) => ({
    image_id: `${product.product_id.slice(0, 28)}${String(index + 1).padStart(4, '0')}`,
    image_url: mockImageUrl(product.product_id, index),
    is_primary: index === 0,
  }));
}

function toCard(product) {
  const category = findCategory(product.category_id);
  const seller = findUser(product.seller_id);
  return {
    product_id: product.product_id,
    title: product.title,
    price: product.price,
    is_free: product.price === 0,
    item_condition: product.item_condition,
    status: currentStatus(product),
    pickup_location: product.pickup_location,
    primary_image_url: images(product)[0]?.image_url ?? null,
    category: category && { category_id: category.category_id, name: category.name },
    seller: {
      user_id: seller?.user_id,
      full_name: publicName(seller?.full_name),
      faculty: seller?.faculty ?? null,
    },
    is_wishlisted: savedIds(getSession()?.user?.user_id).includes(product.product_id),
    created_at: product.created_at,
  };
}

function toDetail(product) {
  const category = findCategory(product.category_id);
  const seller = findUser(product.seller_id);
  const session = getSession();
  return {
    product_id: product.product_id,
    title: product.title,
    description: product.description ?? null,
    price: product.price,
    is_free: product.price === 0,
    item_condition: product.item_condition,
    status: currentStatus(product),
    pickup_location: product.pickup_location,
    images: images(product),
    category: category && { category_id: category.category_id, name: category.name },
    seller: {
      user_id: seller?.user_id,
      full_name: publicName(seller?.full_name),
      faculty: seller?.faculty ?? null,
      created_at: seller?.created_at,
      active_listings: PRODUCTS.filter(
        (p) => p.seller_id === product.seller_id && ACTIVE_STATUSES.includes(currentStatus(p)),
      ).length,
    },
    is_wishlisted: savedIds(session?.user?.user_id).includes(product.product_id),
    is_owner: session?.user?.user_id === product.seller_id,
    created_at: product.created_at,
  };
}

function toNumber(value) {
  if (value === undefined || value === null || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** GET /products */
export async function mockListProducts(query = {}) {
  await delay();

  const page = Math.max(1, toNumber(query.page) ?? 1);
  const perPage = Math.min(MAX_PER_PAGE, Math.max(1, toNumber(query.per_page) ?? DEFAULT_PER_PAGE));
  const status = query.status || 'available';
  const keyword = String(query.keyword ?? '').trim().toLowerCase();
  const categoryIds = Array.isArray(query.category_id)
    ? query.category_id
    : String(query.category_id ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const minPrice = toNumber(query.min_price);
  const maxPrice = toNumber(query.max_price);
  const freeOnly = query.free_only === true || query.free_only === 'true' || query.free_only === '1';

  if (!['available', 'reserved', 'sold', 'all'].includes(status)) {
    throw new ApiError({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'status ต้องเป็น available, reserved, sold หรือ all',
      field: 'status',
    });
  }
  if (query.pickup_location && !PICKUP_LOCATIONS.includes(query.pickup_location)) {
    throw new ApiError({
      status: 422,
      code: 'INVALID_PICKUP_LOCATION',
      message: 'จุดนัดรับไม่อยู่ในรายการที่ระบบกำหนด',
      field: 'pickup_location',
    });
  }
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw new ApiError({
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'min_price ต้องไม่มากกว่า max_price',
      field: 'min_price',
    });
  }

  const matched = PRODUCTS.filter((product) => {
    if (status !== 'all' && currentStatus(product) !== status) return false;
    if (categoryIds.length && !categoryIds.includes(product.category_id)) return false;
    if (minPrice !== null && product.price < minPrice) return false;
    if (maxPrice !== null && product.price > maxPrice) return false;
    if (freeOnly && product.price !== 0) return false;
    if (query.pickup_location && product.pickup_location !== query.pickup_location) return false;
    if (query.item_condition && product.item_condition !== query.item_condition) return false;
    if (keyword) {
      const haystack = `${product.title} ${product.description}`.toLowerCase();
      if (!haystack.includes(keyword)) return false;
    }
    return true;
  });

  const sorted = [...matched].sort(SORTS[query.sort] ?? SORTS.date_desc);
  const from = (page - 1) * perPage;
  const items = sorted.slice(from, from + perPage);

  const body = {
    data: items.map(toCard),
    pagination: {
      page,
      per_page: perPage,
      total: matched.length,
      total_pages: Math.ceil(matched.length / perPage),
    },
  };
  // ไม่พบสินค้าไม่ใช่ error — ตอบ 200 พร้อม data ว่างและ message (spec 7.4)
  if (items.length === 0) body.message = EMPTY_LIST_MESSAGE;
  return body;
}

/** GET /products/:id — ไม่พบตอบ { data: [] } เหมือนของจริง */
export async function mockGetProduct(id) {
  await delay();
  const product = PRODUCTS.find((p) => p.product_id === id);
  if (!product) return { data: [] };
  return toDetail(product);
}

export async function mockToggleWishlist(id) {
  await delay();
  const user = requireMockUser();
  if (!PRODUCTS.some((item) => item.product_id === id)) {
    throw new ApiError({ status: 404, code: 'PRODUCT_NOT_FOUND', message: 'ไม่พบสินค้านี้' });
  }
  const ids = savedIds(user.user_id);
  const exists = ids.includes(id);
  setSavedIds(user.user_id, exists ? ids.filter((item) => item !== id) : [id, ...ids]);
  return { action: exists ? 'removed' : 'added' };
}

export async function mockGetWishlist() {
  await delay();
  const user = requireMockUser();
  const byId = new Map(PRODUCTS.map((item) => [item.product_id, item]));
  return { data: savedIds(user.user_id).filter((id) => byId.has(id)).map((id) => toCard(byId.get(id))) };
}

export async function mockRemoveWishlist(id) {
  await delay();
  const user = requireMockUser();
  setSavedIds(user.user_id, savedIds(user.user_id).filter((item) => item !== id));
}

/** PATCH /products/:id/status ในโหมดตัวอย่าง */
export async function mockUpdateProductStatus(id, status) {
  await delay();
  const session = getSession();
  if (!session) throw new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' });
  const product = PRODUCTS.find((item) => item.product_id === id);
  if (!product) throw new ApiError({ status: 404, code: 'PRODUCT_NOT_FOUND', message: 'ไม่พบสินค้านี้' });
  if (product.seller_id !== session.user.user_id) {
    throw new ApiError({ status: 403, code: 'NOT_OWNER', message: 'คุณไม่ใช่เจ้าของประกาศนี้' });
  }
  if (!['available', 'reserved', 'sold'].includes(status)) {
    throw new ApiError({ status: 422, code: 'INVALID_STATUS', message: 'สถานะไม่ถูกต้อง', field: 'status' });
  }
  window.localStorage.setItem(STATUS_KEY, JSON.stringify({ ...statusOverrides(), [id]: status }));
  return { product_id: id, status, message: `อัปเดตสถานะเป็น ${status} แล้ว` };
}

/** GET /products/:id/contact — เฉพาะสมาชิก (FR-06) */
export async function mockGetProductContact(id) {
  await delay();

  if (!getSession()) {
    throw new ApiError({
      status: 401,
      code: 'UNAUTHORIZED',
      message: 'กรุณาเข้าสู่ระบบด้วยอีเมลจุฬาฯ เพื่อดูข้อมูลติดต่อผู้ขาย',
    });
  }

  const product = PRODUCTS.find((p) => p.product_id === id);
  if (!product) {
    throw new ApiError({
      status: 404,
      code: 'PRODUCT_NOT_FOUND',
      message: 'ไม่พบสินค้านี้ อาจถูกลบไปแล้ว',
    });
  }

  const seller = findUser(product.seller_id);
  const channels = [];
  if (seller?.line_id) {
    channels.push({
      type: 'line',
      value: seller.line_id,
      deep_link: `https://line.me/ti/p/~${seller.line_id}`,
      is_primary: true,
    });
  }
  if (seller?.phone_number) {
    channels.push({
      type: 'phone',
      value: seller.phone_number,
      deep_link: `tel:${seller.phone_number}`,
      is_primary: channels.length === 0,
    });
  }

  return {
    seller: {
      user_id: seller?.user_id,
      full_name: seller?.full_name,
      faculty: seller?.faculty ?? null,
    },
    channels,
    pickup_location: product.pickup_location,
    safety_note:
      'นัดรับในพื้นที่จุฬาฯ ช่วงเวลากลางวัน และตรวจสอบสินค้าก่อนชำระเงินทุกครั้ง',
  };
}

/** GET /categories — product_count นับเฉพาะสินค้าที่ยัง available */
export async function mockGetCategories() {
  await delay();
  return {
    data: CATEGORIES.map((category) => ({
      ...category,
      product_count: PRODUCTS.filter(
        (p) => p.category_id === category.category_id && currentStatus(p) === 'available',
      ).length,
    })),
  };
}

/** GET /pickup-locations */
export async function mockGetPickupLocations() {
  await delay();
  return { data: [...PICKUP_LOCATIONS] };
}

/** POST /auth/login */
export async function mockLogin(email, password) {
  await delay();

  const normalized = String(email ?? '').trim().toLowerCase();
  if (!/@(student\.)?chula\.ac\.th$/.test(normalized)) {
    throw new ApiError({
      status: 422,
      code: 'NON_CU_EMAIL',
      message: 'ต้องใช้อีเมลจุฬาฯ (@student.chula.ac.th หรือ @chula.ac.th)',
      field: 'email',
    });
  }

  const account = ACCOUNTS.find((a) => a.user.email === normalized && a.password === password);
  if (!account) {
    throw new ApiError({
      status: 401,
      code: 'INVALID_CREDENTIALS',
      message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
    });
  }

  return {
    token: `mock.${account.user.user_id}`,
    token_type: 'bearer',
    expires_in: 86_400,
    user: account.user,
  };
}

/** GET /auth/me */
export async function mockGetMe() {
  await delay();

  const session = getSession();
  if (!session) {
    throw new ApiError({ status: 401, code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' });
  }

  const mine = PRODUCTS.filter((p) => p.seller_id === session.user.user_id);
  return {
    ...session.user,
    stats: {
      active_listings: mine.filter((p) => ACTIVE_STATUSES.includes(currentStatus(p))).length,
      sold_listings: mine.filter((p) => currentStatus(p) === 'sold').length,
      wishlist_count: savedIds(session.user.user_id).length,
    },
  };
}

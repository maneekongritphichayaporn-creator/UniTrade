import { ApiError } from './http.js';
import { ACTIVE_STATUSES, PICKUP_LOCATIONS, PRODUCT_STATUSES } from './constants.js';

// ตัวช่วยกลางของ GET /products และ GET /products/:id (TASK-09)
// ไฟล์นี้ต้องไม่ import lib/supabase.js เพื่อให้ npm test (node --test) โหลดได้

export const ITEM_CONDITIONS = Object.freeze(['new', 'like_new', 'good', 'fair']);
export const LIST_STATUS_FILTERS = Object.freeze(['available', 'reserved', 'sold', 'all']);
export const SORTS = Object.freeze({
  date_desc: { column: 'created_at', ascending: false },
  date_asc: { column: 'created_at', ascending: true },
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
});
export const DEFAULT_PER_PAGE = 20;
export const MAX_PER_PAGE = 50;
export const EMPTY_LIST_MESSAGE = 'ไม่พบสินค้าที่ตรงกับเงื่อนไข ลองปรับตัวกรองหรือคำค้นหา';

// select สำหรับ products + ตารางที่เกี่ยวข้อง (ระบุคอลัมน์ users เอง ห้าม users(*))
export const PRODUCT_SELECT =
  'product_id, seller_id, title, description, price, item_condition, status, pickup_location, created_at,' +
  ' category:categories(category_id, name),' +
  ' seller:users(user_id, full_name, faculty, created_at),' +
  ' images:product_images(image_id, image_url, is_primary)';

// ---------- UUID ----------
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);

// ---------- ชื่อผู้ขายที่แสดงสาธารณะ ----------
// "กันตภณ ชัยรุ่งปัญญา" -> "กันตภณ ช."  /  "สมชาย เจริญ" -> "สมชาย เจ." (สระหน้าเก็บคู่กับตัวถัดไป)
const LEADING_VOWELS = 'เแโใไ';

export function publicName(fullName) {
  const parts = String(fullName ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return parts[0] ?? '';
  const chars = Array.from(parts[parts.length - 1]);
  const initial = LEADING_VOWELS.includes(chars[0]) ? chars.slice(0, 2).join('') : chars[0];
  return `${parts[0]} ${initial}.`;
}

// ---------- อ่านและตรวจ query string ของ GET /products ----------
function bad(field, message) {
  return new ApiError(422, 'VALIDATION_ERROR', message, field);
}

function parsePositiveInt(raw, field, fallback) {
  if (raw === null || raw.trim() === '') return fallback;
  const value = Number(raw);
  if (!/^\d+$/.test(raw.trim()) || !Number.isSafeInteger(value) || value < 1) {
    throw bad(field, `${field} ต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป`);
  }
  return value;
}

function parsePrice(raw, field) {
  if (raw === null || raw.trim() === '') return null;
  if (!/^\d+(\.\d+)?$/.test(raw.trim())) throw bad(field, `${field} ต้องเป็นตัวเลขตั้งแต่ 0 ขึ้นไป`);
  return Number(raw);
}

export function parseProductQuery(params) {
  const page = parsePositiveInt(params.get('page'), 'page', 1);
  const perPage = Math.min(
    parsePositiveInt(params.get('per_page'), 'per_page', DEFAULT_PER_PAGE),
    MAX_PER_PAGE,
  );

  const keywordRaw = (params.get('keyword') ?? '').trim();
  if (Array.from(keywordRaw).length > 100) throw bad('keyword', 'คำค้นหายาวเกิน 100 ตัวอักษร');
  const keyword = keywordRaw || null;

  let categoryIds = null;
  const categoryRaw = params.get('category_id');
  if (categoryRaw !== null && categoryRaw.trim() !== '') {
    const ids = [...new Set(categoryRaw.split(',').map((s) => s.trim()).filter(Boolean))];
    if (!ids.every(isUuid)) {
      throw bad('category_id', 'category_id ต้องเป็น UUID (ถ้ามีหลายค่าให้คั่นด้วยเครื่องหมายจุลภาค)');
    }
    categoryIds = ids.length ? ids : null;
  }

  const minPrice = parsePrice(params.get('min_price'), 'min_price');
  const maxPrice = parsePrice(params.get('max_price'), 'max_price');
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    throw bad('min_price', 'min_price ต้องไม่มากกว่า max_price');
  }

  const freeRaw = (params.get('free_only') ?? '').trim().toLowerCase();
  const freeOnly = freeRaw === 'true' || freeRaw === '1';

  const status = params.get('status') ?? 'available';
  if (!LIST_STATUS_FILTERS.includes(status)) {
    throw bad('status', 'status ต้องเป็น available, reserved, sold หรือ all');
  }

  const pickupLocation = params.get('pickup_location') || null;
  if (pickupLocation && !PICKUP_LOCATIONS.includes(pickupLocation)) {
    throw new ApiError(
      422,
      'INVALID_PICKUP_LOCATION',
      'จุดนัดรับไม่อยู่ในรายการที่ระบบกำหนด',
      'pickup_location',
    );
  }

  const itemCondition = params.get('item_condition') || null;
  if (itemCondition && !ITEM_CONDITIONS.includes(itemCondition)) {
    throw bad('item_condition', 'item_condition ต้องเป็น new, like_new, good หรือ fair');
  }

  const sortKey = params.get('sort') || 'date_desc';
  if (!Object.hasOwn(SORTS, sortKey)) {
    throw bad('sort', 'sort ต้องเป็น date_desc, date_asc, price_asc หรือ price_desc');
  }

  return {
    page,
    perPage,
    keyword,
    categoryIds,
    minPrice,
    maxPrice,
    freeOnly,
    status,
    pickupLocation,
    itemCondition,
    sort: SORTS[sortKey],
  };
}

// ---------- ตัวกรอง (ใช้ร่วมกันระหว่าง query หลักกับ query นับจำนวน) ----------
// ทำให้คำค้นเป็น pattern ของ ILIKE ที่ปลอดภัยกับ PostgREST (โค้ดเดียวกับตัวอย่างใน AGENTS.md หัวข้อ 10 ข้อ 2)
export function ilikeContains(keyword) {
  const like = keyword.replace(/[\\%_]/g, (c) => '\\' + c);
  return `"%${like.replace(/["\\]/g, (c) => '\\' + c)}%"`;
}

export function applyProductFilters(query, f) {
  if (f.status !== 'all') query = query.eq('status', f.status);
  if (f.categoryIds) query = query.in('category_id', f.categoryIds);
  if (f.minPrice !== null) query = query.gte('price', f.minPrice);
  if (f.maxPrice !== null) query = query.lte('price', f.maxPrice);
  if (f.freeOnly) query = query.eq('price', 0);
  if (f.pickupLocation) query = query.eq('pickup_location', f.pickupLocation);
  if (f.itemCondition) query = query.eq('item_condition', f.itemCondition);
  if (f.keyword) {
    const pattern = ilikeContains(f.keyword);
    query = query.or(`title.ilike.${pattern},description.ilike.${pattern}`);
  }
  return query;
}

// ---------- ตัวแปลงผลลัพธ์ ----------
export function buildPagination(page, perPage, total) {
  return { page, per_page: perPage, total, total_pages: Math.ceil(total / perPage) };
}

// การ์ดสินค้าในรายการ (ไม่มี description, seller_id, images ทั้งชุด)
export function toCard(row, isWishlisted = false) {
  const price = Number(row.price);
  const primary = (row.images ?? []).find((img) => img.is_primary);
  return {
    product_id: row.product_id,
    title: row.title,
    price,
    is_free: price === 0,
    item_condition: row.item_condition,
    status: row.status,
    pickup_location: row.pickup_location,
    primary_image_url: primary?.image_url ?? null,
    category: row.category,
    seller: {
      user_id: row.seller?.user_id,
      full_name: publicName(row.seller?.full_name),
      faculty: row.seller?.faculty ?? null,
    },
    is_wishlisted: isWishlisted,
    created_at: row.created_at,
  };
}

// รายละเอียดสินค้า 1 ชิ้น (ไม่มีข้อมูลติดต่อผู้ขายเด็ดขาด — FR-06)
export function toDetail(row, { activeListings = 0, isWishlisted = false, isOwner = false } = {}) {
  const price = Number(row.price);
  // รูปหลักขึ้นก่อน ส่วนที่เหลือคงลำดับเดิม (sort ของ JS เสถียร)
  const images = [...(row.images ?? [])]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary))
    .map((img) => ({
      image_id: img.image_id,
      image_url: img.image_url,
      is_primary: img.is_primary,
    }));
  return {
    product_id: row.product_id,
    title: row.title,
    description: row.description ?? null,
    price,
    is_free: price === 0,
    item_condition: row.item_condition,
    status: row.status,
    pickup_location: row.pickup_location,
    images,
    category: row.category,
    seller: {
      user_id: row.seller?.user_id,
      full_name: publicName(row.seller?.full_name),
      faculty: row.seller?.faculty ?? null,
      created_at: row.seller?.created_at,
      active_listings: activeListings,
    },
    is_wishlisted: isWishlisted,
    is_owner: isOwner,
    created_at: row.created_at,
  };
}

// ---------- ตรวจข้อมูลประกาศ: POST (ครบทุกช่อง) และ PATCH (partial) — Spec §8.1, §8.2 ----------
const PRICE_RE = /^\d+(\.\d{1,2})?$/;
const charLength = (text) => Array.from(text).length;

export function validateProductInput(input, { partial = false } = {}) {
  const out = {};
  const has = (key) => Object.hasOwn(input, key) && input[key] !== undefined;
  const need = (key) => !partial || has(key);

  if (need('title')) {
    const title = typeof input.title === 'string' ? input.title.trim() : '';
    const length = charLength(title);
    if (length < 3 || length > 255) throw bad('title', 'ชื่อประกาศต้องยาว 3–255 ตัวอักษร');
    out.title = title;
  }

  if (has('description')) {
    const raw = input.description;
    if (raw === null || (typeof raw === 'string' && raw.trim() === '')) {
      out.description = null;
    } else if (typeof raw !== 'string') {
      throw bad('description', 'รายละเอียดต้องเป็นข้อความ');
    } else {
      const description = raw.trim();
      if (charLength(description) > 2000) throw bad('description', 'รายละเอียดต้องไม่เกิน 2000 ตัวอักษร');
      out.description = description;
    }
  } else if (!partial) {
    out.description = null;
  }

  if (need('category_id')) {
    if (!isUuid(input.category_id)) throw bad('category_id', 'กรุณาเลือกหมวดหมู่ที่มีอยู่จริง');
    out.category_id = input.category_id;
  }

  if (need('item_condition')) {
    if (!ITEM_CONDITIONS.includes(input.item_condition)) {
      throw bad('item_condition', 'สภาพสินค้าต้องเป็น new, like_new, good หรือ fair');
    }
    out.item_condition = input.item_condition;
  }

  if (need('price')) {
    const raw = input.price;
    const text = typeof raw === 'number' ? String(raw) : typeof raw === 'string' ? raw.trim() : '';
    const price = Number(text);
    if (!PRICE_RE.test(text) || !Number.isFinite(price) || price > 999999.99) {
      throw bad('price', 'ราคาต้องเป็นตัวเลข 0–999999.99 และมีทศนิยมไม่เกิน 2 ตำแหน่ง');
    }
    out.price = price;
  }

  if (need('pickup_location')) {
    if (!PICKUP_LOCATIONS.includes(input.pickup_location)) {
      throw new ApiError(
        422,
        'INVALID_PICKUP_LOCATION',
        'จุดนัดรับไม่อยู่ในรายการที่ระบบกำหนด',
        'pickup_location',
      );
    }
    out.pickup_location = input.pickup_location;
  }

  // ช่องอื่น เช่น status และ seller_id ถูกข้ามไปเพราะไม่ได้อ่านเลย
  return out;
}

// ---------- อ่านรายละเอียดสินค้า 1 ชิ้น (ใช้ร่วมกันระหว่าง GET, POST, PATCH) ----------
// รับ supabase client เป็นพารามิเตอร์ ไฟล์นี้จึงยังไม่ import lib/supabase.js และ npm test ยังโหลดได้
export async function fetchProductDetail(supabase, productId, user) {
  const { data: row, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('product_id', productId)
    .maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const { count, error: countError } = await supabase
    .from('products')
    .select('product_id', { count: 'exact', head: true })
    .eq('seller_id', row.seller_id)
    .in('status', ACTIVE_STATUSES);
  if (countError) throw countError;

  let isWishlisted = false;
  if (user) {
    const { data: saved, error: wishError } = await supabase
      .from('wishlists')
      .select('wishlist_id')
      .eq('user_id', user.user_id)
      .eq('product_id', productId)
      .maybeSingle();
    if (wishError) throw wishError;
    isWishlisted = Boolean(saved);
  }

  return toDetail(row, {
    activeListings: count ?? 0,
    isWishlisted,
    isOwner: user?.user_id === row.seller_id,
  });
}

// ---------- ลำดับตรวจของ route เขียน (Spec §8): ไม่ใช่ UUID หรือไม่พบ → 404, ไม่ใช่เจ้าของ → 403 ----------
export async function requireOwnedProduct(supabase, productId, user) {
  const notFound = () => new ApiError(404, 'PRODUCT_NOT_FOUND', 'ไม่พบสินค้านี้ อาจถูกลบไปแล้ว');
  if (!isUuid(productId)) throw notFound();

  const { data, error } = await supabase
    .from('products')
    .select('product_id, seller_id')
    .eq('product_id', productId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw notFound();
  if (data.seller_id !== user.user_id) {
    throw new ApiError(403, 'NOT_OWNER', 'คุณไม่ใช่เจ้าของประกาศนี้');
  }
  return data;
}

// ---------- PATCH /products/:id/status (Spec §8.3) ----------
export function validateStatusInput(body) {
  const status = body?.status;
  if (!PRODUCT_STATUSES.includes(status)) {
    throw new ApiError(422, 'INVALID_STATUS', 'สถานะต้องเป็น Available, Reserved หรือ Sold เท่านั้น', 'status');
  }
  return status;
}

// "reserved" → "Reserved" สำหรับข้อความ "อัปเดตสถานะเป็น Reserved แล้ว"
export const statusLabel = (status) => status.charAt(0).toUpperCase() + status.slice(1);
import { ok, ApiError } from '@/lib/http.js';
import { optionalAuth, requireAuth } from '@/lib/auth.js';
import { db, PRODUCT_IMAGES_BUCKET } from '@/lib/supabase.js';
import {
  PRODUCT_SELECT,
  EMPTY_LIST_MESSAGE,
  parseProductQuery,
  applyProductFilters,
  buildPagination,
  toCard,
  validateProductInput,
  fetchProductDetail,
} from '@/lib/products.js';
import { validateImages, imagePath } from '@/lib/product-images.js';

// GET /products — ค้นหา กรอง เรียงลำดับ แบ่งหน้า (Spec §4.1)
// สาธารณะ: ไม่ล็อกอินก็เรียกได้ ถ้าล็อกอินจะได้ is_wishlisted ที่ถูกต้อง

export const GET = optionalAuth(async (request, { user }) => {
  const filters = parseProductQuery(new URL(request.url).searchParams);
  const from = (filters.page - 1) * filters.perPage;
  const supabase = db();

  // 1) ดึงสินค้าหน้าที่ขอ พร้อมนับจำนวนทั้งหมดที่ตรงเงื่อนไข
  const { data: rows, count, error } = await applyProductFilters(
    supabase.from('products').select(PRODUCT_SELECT, { count: 'exact' }),
    filters,
  )
    .order(filters.sort.column, { ascending: filters.sort.ascending })
    .order('product_id', { ascending: true }) // กันลำดับสลับเมื่อค่าที่เรียงเท่ากัน
    .range(from, from + filters.perPage - 1);

  let items = rows ?? [];
  let total = count ?? 0;

  // 2) ขอหน้าเกินจำนวนที่มี Supabase จะตอบ PGRST103 → ถือเป็นหน้าว่าง ไม่ใช่ error
  if (error) {
    if (error.code !== 'PGRST103') throw error;
    items = [];
    const { count: realTotal, error: countError } = await applyProductFilters(
      supabase.from('products').select('product_id', { count: 'exact', head: true }),
      filters,
    );
    if (countError) throw countError;
    total = realTotal ?? 0;
  }

  // 3) ถ้าล็อกอินอยู่ หาว่าชิ้นไหนในหน้านี้ถูกบันทึกเป็นรายการโปรด (query เดียว)
  let wished = new Set();
  if (user && items.length > 0) {
    const { data: saved, error: wishError } = await supabase
      .from('wishlists')
      .select('product_id')
      .eq('user_id', user.user_id)
      .in('product_id', items.map((row) => row.product_id));
    if (wishError) throw wishError;
    wished = new Set(saved.map((w) => w.product_id));
  }

  const body = {
    data: items.map((row) => toCard(row, wished.has(row.product_id))),
    pagination: buildPagination(filters.page, filters.perPage, total),
  };
  if (items.length === 0) body.message = EMPTY_LIST_MESSAGE;

  return ok(body);
});

// POST /products — ลงประกาศพร้อมรูป 1–5 รูป (Spec §8.1)
const TEXT_FIELDS = ['title', 'description', 'category_id', 'item_condition', 'price', 'pickup_location'];

export const POST = requireAuth(async (request, { user }) => {
  let form;
  try {
    form = await request.formData();
  } catch {
    throw new ApiError(400, 'INVALID_PAYLOAD', 'รูปแบบข้อมูลไม่ถูกต้อง ต้องส่งเป็น multipart/form-data');
  }

  // 1) ตรวจข้อมูลและรูปทั้งหมดก่อนแตะฐานข้อมูล
  const input = {};
  for (const key of TEXT_FIELDS) {
    const value = form.get(key);
    if (value !== null) input[key] = value;
  }
  const fields = validateProductInput(input);

  const entries = [...form.getAll('images'), ...form.getAll('images[]')].filter(
    (entry) => typeof entry === 'object' && entry !== null && typeof entry.arrayBuffer === 'function' && entry.size > 0,
  );
  const files = await Promise.all(
    entries.map(async (entry) => ({ size: entry.size, bytes: new Uint8Array(await entry.arrayBuffer()) })),
  );
  const images = validateImages(files);

  const supabase = db();

  // 2) สร้างแถวประกาศ
  const { data: created, error } = await supabase
    .from('products')
    .insert({ ...fields, seller_id: user.user_id, status: 'available' })
    .select('product_id')
    .single();
  if (error) {
    if (error.code === '23503') {
      throw new ApiError(422, 'VALIDATION_ERROR', 'กรุณาเลือกหมวดหมู่ที่มีอยู่จริง', 'category_id');
    }
    throw error;
  }
  const productId = created.product_id;

  // 3) อัปโหลดรูปทีละไฟล์ แล้วบันทึกแถวรูปทั้งหมดในคำสั่งเดียว
  const bucket = supabase.storage.from(PRODUCT_IMAGES_BUCKET);
  const uploaded = [];
  try {
    const rows = [];
    for (const image of images) {
      const imageId = crypto.randomUUID();
      const path = imagePath(productId, imageId, image.ext);
      const { error: uploadError } = await bucket.upload(path, Buffer.from(image.bytes), {
        contentType: image.contentType,
        upsert: false,
      });
      if (uploadError) throw uploadError;
      uploaded.push(path);
      rows.push({
        image_id: imageId,
        product_id: productId,
        image_url: bucket.getPublicUrl(path).data.publicUrl,
        is_primary: image.is_primary,
      });
    }
    const { error: imagesError } = await supabase.from('product_images').insert(rows);
    if (imagesError) throw imagesError;
  } catch (err) {
    // 4) พังกลางทาง: ลบไฟล์ที่อัปแล้วและลบแถวประกาศ (ฐานข้อมูลกับ Storage ไม่มี transaction ร่วมกัน)
    await cleanupFailedCreate(supabase, bucket, productId, uploaded);
    throw err;
  }

  const detail = await fetchProductDetail(supabase, productId, user);
  return ok({ ...detail, message: 'ลงประกาศสำเร็จ' }, 201);
});

// ลบของที่สร้างไปแล้วเมื่อ POST พัง ข้อผิดพลาดในขั้นนี้ให้บันทึกไว้เฉยๆ เพื่อส่งข้อผิดพลาดต้นเหตุกลับไป
async function cleanupFailedCreate(supabase, bucket, productId, paths) {
  try {
    if (paths.length > 0) {
      const { error } = await bucket.remove(paths);
      if (error) console.error('[POST /products] remove uploaded files', error);
    }
  } catch (err) {
    console.error('[POST /products] remove uploaded files', err);
  }
  try {
    const { error } = await supabase.from('products').delete().eq('product_id', productId);
    if (error) console.error('[POST /products] delete product row', error);
  } catch (err) {
    console.error('[POST /products] delete product row', err);
  }
}
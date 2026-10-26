import { ok, ApiError } from '@/lib/http.js';
import { optionalAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { ACTIVE_STATUSES } from '@/lib/constants.js';
import { PRODUCT_SELECT, isUuid, toDetail } from '@/lib/products.js';

// GET /products/:id — รายละเอียดสินค้า 1 ชิ้น พร้อมรูปทั้งหมดและข้อมูลผู้ขายเบื้องต้น (Spec §4.4)
// ไม่ส่งข้อมูลติดต่อผู้ขายเด็ดขาด (FR-06) — ต้องเรียก /products/:id/contact แยกต่างหาก

const notFound = () => new ApiError(404, 'PRODUCT_NOT_FOUND', 'ไม่พบสินค้านี้ อาจถูกลบไปแล้ว');

export const GET = optionalAuth(async (request, { params, user }) => {
  const { id } = await params; // Next.js 15: params เป็น Promise
  if (!isUuid(id)) throw notFound();

  const supabase = db();

  const { data: row, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('product_id', id)
    .maybeSingle(); // ไม่พบจะได้ null ไม่ใช่ error
  if (error) throw error;
  if (!row) throw notFound();

  // จำนวนประกาศที่ผู้ขายยังขายอยู่ (available + reserved)
  const { count: activeListings, error: countError } = await supabase
    .from('products')
    .select('product_id', { count: 'exact', head: true })
    .eq('seller_id', row.seller_id)
    .in('status', ACTIVE_STATUSES);
  if (countError) throw countError;

  // ผู้ใช้ที่ล็อกอินบันทึกชิ้นนี้ไว้หรือไม่
  let isWishlisted = false;
  if (user) {
    const { data: saved, error: wishError } = await supabase
      .from('wishlists')
      .select('wishlist_id')
      .eq('user_id', user.user_id)
      .eq('product_id', id)
      .maybeSingle();
    if (wishError) throw wishError;
    isWishlisted = Boolean(saved);
  }

  return ok(
    toDetail(row, {
      activeListings: activeListings ?? 0,
      isWishlisted,
      isOwner: user?.user_id === row.seller_id,
    }),
  );
});
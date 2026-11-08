import { ok } from '@/lib/http.js';
import { requireAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { PRODUCT_SELECT, toCard } from '@/lib/products.js';

// GET /me/wishlist — คืนการ์ดตามเวลาที่บันทึก ล่าสุดก่อน
export const GET = requireAuth(async (_request, { user }) => {
  const supabase = db();
  const { data: saved, error: savedError } = await supabase.from('wishlists')
    .select('product_id').eq('user_id', user.user_id).order('created_at', { ascending: false });
  if (savedError) throw savedError;
  if (!saved.length) return ok({ data: [] });

  const ids = saved.map((item) => item.product_id);
  const { data: products, error: productError } = await supabase.from('products')
    .select(PRODUCT_SELECT).in('product_id', ids);
  if (productError) throw productError;
  const byId = new Map(products.map((row) => [row.product_id, row]));
  return ok({ data: ids.filter((id) => byId.has(id)).map((id) => toCard(byId.get(id), true)) });
});

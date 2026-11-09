import { ApiError, ok } from '@/lib/http.js';
import { requireAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { isUuid } from '@/lib/products.js';

// POST /products/:id/wishlist — มีอยู่แล้วให้ลบ ไม่มีก็เพิ่ม
export const POST = requireAuth(async (_request, { params, user }) => {
  const { id } = await params;
  if (!isUuid(id)) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'ไม่พบสินค้านี้');
  const supabase = db();
  const { data: product, error: productError } = await supabase.from('products')
    .select('product_id').eq('product_id', id).maybeSingle();
  if (productError) throw productError;
  if (!product) throw new ApiError(404, 'PRODUCT_NOT_FOUND', 'ไม่พบสินค้านี้');

  const { data: saved, error: lookupError } = await supabase.from('wishlists')
    .select('wishlist_id').eq('user_id', user.user_id).eq('product_id', id).maybeSingle();
  if (lookupError) throw lookupError;

  if (saved) {
    const { error } = await supabase.from('wishlists').delete().eq('wishlist_id', saved.wishlist_id);
    if (error) throw error;
    return ok({ action: 'removed' });
  }
  const { error } = await supabase.from('wishlists').insert({ user_id: user.user_id, product_id: id });
  if (error) throw error;
  return ok({ action: 'added' });
});

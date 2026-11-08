import { noContent } from '@/lib/http.js';
import { requireAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { isUuid } from '@/lib/products.js';

// DELETE /me/wishlist/:productId — ซ้ำได้โดยไม่เกิดข้อผิดพลาด
export const DELETE = requireAuth(async (_request, { params, user }) => {
  const { productId } = await params;
  if (!isUuid(productId)) return noContent();
  const { error } = await db().from('wishlists').delete()
    .eq('user_id', user.user_id).eq('product_id', productId);
  if (error) throw error;
  return noContent();
});

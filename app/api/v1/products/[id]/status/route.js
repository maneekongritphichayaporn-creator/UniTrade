import { ok, readJson } from '@/lib/http.js';
import { requireAuth } from '@/lib/auth.js';
import { db } from '@/lib/supabase.js';
import { requireOwnedProduct, validateStatusInput, statusLabel } from '@/lib/products.js';

// PATCH /products/:id/status — เปลี่ยนสถานะ เฉพาะเจ้าของ (Spec §8.3) เปลี่ยนไปมาระหว่าง 3 สถานะได้อิสระ
export const PATCH = requireAuth(async (request, { params, user }) => {
  const { id } = await params;
  const supabase = db();
  await requireOwnedProduct(supabase, id, user);

  const status = validateStatusInput(await readJson(request));
  const { error } = await supabase.from('products').update({ status }).eq('product_id', id);
  if (error) throw error;

  return ok({ product_id: id, status, message: `อัปเดตสถานะเป็น ${statusLabel(status)} แล้ว` });
});
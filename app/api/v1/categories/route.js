import { ok, route } from '@/lib/http.js';
import { db } from '@/lib/supabase.js';

// GET /categories — 6 หมวดคงที่ เรียงตาม category_id พร้อมจำนวนสินค้าที่ยัง available

export const GET = route(async () => {
  const supabase = db();

  const { data: categories, error } = await supabase
    .from('categories')
    .select('category_id, name, description')
    .order('category_id', { ascending: true });
  if (error) throw error; // ให้ route() แปลงเป็น 500 ห้ามส่งข้อความ error ของ Supabase ออกไป

  const data = await Promise.all(
    categories.map(async (category) => {
      const { count, error: countError } = await supabase
        .from('products')
        .select('product_id', { count: 'exact', head: true })
        .eq('category_id', category.category_id)
        .eq('status', 'available');
      if (countError) throw countError;
      return { ...category, product_count: count ?? 0 };
    }),
  );

  return ok({ data });
});
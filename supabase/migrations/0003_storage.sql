-- =====================================================================
-- UniTrade — Migration 0003: Supabase Storage สำหรับรูปสินค้า
--
-- ตาม UC-02: Backend/API เป็นฝ่ายอัปโหลดเข้า Storage แล้วรับ Image URLs
-- กลับมา ก่อนจะ INSERT Product Images ลงฐานข้อมูล
-- ผู้ใช้ไม่ได้ยิงเข้า Storage เอง จึงไม่ต้องมี policy รายผู้ใช้
--
-- NFR: ไฟล์ <= 2MB และเฉพาะ .jpg / .jpeg / .png
-- โครงสร้าง path: product-images/{product_id}/{image_id}.jpg
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images', 'product-images', true, 2097152,
  array['image/jpeg', 'image/png']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- อ่านได้สาธารณะ เพื่อให้ <img src="…"> บนหน้าเว็บโหลดรูปได้โดยไม่ต้องแนบ token
create policy "product images are publicly readable"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');

-- เขียน/ลบได้เฉพาะ backend ที่ถือ service_role (bypass RLS) — ไม่สร้าง policy ให้ anon/authenticated

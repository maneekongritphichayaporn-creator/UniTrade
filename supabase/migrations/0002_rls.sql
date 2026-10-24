-- =====================================================================
-- UniTrade — Migration 0002: ปิดตายฐานข้อมูลจากภายนอก
--
-- ตาม Sequence Diagram ทุกใบ ผู้ใช้คุยกับ Backend/API เท่านั้น
-- ไม่มีเส้นไหนที่ UI ยิงตรงเข้า Database และ UC-03 ระบุชัดว่า
-- "Validate Status & Ownership" เกิดที่ Backend/API
-- => การตรวจสิทธิ์ทั้งหมดอยู่ที่ชั้น API ไม่ใช่ RLS policy
--
-- สิ่งที่ไฟล์นี้ทำ: เปิด RLS ทุกตารางโดยไม่สร้าง policy ใด ๆ เลย
-- ผลคือ anon key และ authenticated key เข้าถึงข้อมูลไม่ได้แม้แต่แถวเดียว
-- เหลือทางเดียวคือ backend ที่ถือ service_role key (ซึ่ง bypass RLS)
-- ถ้าวันหนึ่ง anon key หลุดออกไป ข้อมูลก็ยังปลอดภัย
-- =====================================================================

alter table public.users          enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.product_images enable row level security;
alter table public.wishlists      enable row level security;
alter table public.reports        enable row level security;

-- ไม่มี policy = ปฏิเสธทุกคำขอจาก anon / authenticated (deny by default)

revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;

-- ตารางที่สร้างเพิ่มในอนาคตก็ถูกปิดไว้เหมือนกัน
alter default privileges in schema public revoke all on tables    from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;

-- backend (service_role) ต้องเข้าถึงได้เต็มที่ — ประกาศไว้ตรง ๆ ไม่พึ่งค่า default ของ project
-- service_role มีคุณสมบัติ BYPASSRLS อยู่แล้ว จึงข้าม RLS ข้างบนได้
grant usage on schema public to service_role;
grant all privileges on all tables    in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
alter default privileges in schema public grant all on tables    to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- หมายเหตุสำหรับทีม:
--   SUPABASE_SERVICE_ROLE_KEY ใช้ได้เฉพาะฝั่งเซิร์ฟเวอร์ (Next.js API route / Server Action)
--   ห้ามอยู่ในโค้ดที่ส่งไปถึงเบราว์เซอร์เด็ดขาด เพราะ key นี้ข้าม RLS ได้ทั้งหมด

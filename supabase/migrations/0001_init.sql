-- =====================================================================
-- UniTrade — TASK-04 Database Schema (PostgreSQL 15 บน Supabase)
-- Migration 0001: extensions, enums, tables, indexes, triggers
-- Author: วซ (Backend Lead) | Sprint 0
--
-- SOURCE OF TRUTH: ER Diagram + Sequence Diagram UC-01 … UC-07 ของทีม
-- 6 ตารางตาม ERD ชื่อคอลัมน์และลำดับคอลัมน์ตรงตามที่วาดไว้
-- Run order: 0001_init.sql -> 0002_rls.sql -> 0003_storage.sql -> seed.sql
-- =====================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "citext";     -- อีเมลเทียบแบบไม่สนตัวพิมพ์
create extension if not exists "pg_trgm";    -- keyword search (UC-04), รองรับภาษาไทย

-- ---------------------------------------------------------------------
-- 1. ENUM TYPES
-- ---------------------------------------------------------------------
create type user_role         as enum ('member', 'admin');
create type product_status    as enum ('available', 'reserved', 'sold');
create type product_condition as enum ('new', 'like_new', 'good', 'fair');
create type report_reason     as enum ('scam', 'prohibited_item', 'spam', 'wrong_category',
                                       'offensive_content', 'already_sold', 'other');
create type report_status     as enum ('pending', 'actioned', 'dismissed');

-- ---------------------------------------------------------------------
-- 2. CU EMAIL RULE (FR-01 / UC-01 "Validate Registration")
--    Backend ตรวจก่อนอยู่แล้ว อันนี้เป็นด่านสุดท้ายกันโค้ดพลาด
-- ---------------------------------------------------------------------
create or replace function public.is_cu_email(addr text)
returns boolean
language sql
immutable
as $$
  select addr ~* '^[A-Za-z0-9._%+-]+@(student\.chula\.ac\.th|chula\.ac\.th)$';
$$;

-- ---------------------------------------------------------------------
-- 3. Users  (ERD: user_id, email, password_hash, full_name,
--                 phone_number, line_id, faculty, role, created_at)
--    faculty เพิ่มตามมติทีม 13 ก.ย. 2569 ให้ตรงกับ SRS 2.3 (ข้อมูลผู้ใช้: ชื่อ อีเมล เบอร์ LINE คณะ)
-- ---------------------------------------------------------------------
create table public.users (
  user_id       uuid        primary key default gen_random_uuid(),
  email         citext      not null unique,
  password_hash text        not null,
  full_name     text        not null,
  phone_number  text,
  line_id       text,
  faculty       text        not null,
  role          user_role   not null default 'member',
  created_at    timestamptz not null default now(),

  constraint users_email_is_cu     check (public.is_cu_email(email::text)),
  constraint users_full_name_len   check (char_length(full_name) between 2 and 255),
  constraint users_phone_format    check (phone_number is null or phone_number ~ '^(0|\+66)[0-9]{8,9}$'),
  constraint users_line_format     check (line_id is null or line_id ~ '^[A-Za-z0-9._-]{2,100}$'),
  -- ค่ามาจากรายการใน GET /faculties หรือข้อความที่ผู้ใช้พิมพ์เองเมื่อเลือก "อื่น ๆ"
  -- จึงตรวจแค่ความยาวที่นี่ ส่วนการตรวจว่าอยู่ในรายการทำที่ API
  constraint users_faculty_len     check (char_length(faculty) between 2 and 100),
  -- UC-01 ระบุว่าฟอร์มสมัครต้องกรอก contact และ FR-06 ต้องมีช่องทางให้นัดรับ
  constraint users_has_contact     check (phone_number is not null or line_id is not null),
  -- NFR: ห้ามบันทึกรหัสผ่านเป็นข้อความธรรมดา ต้องเป็น bcrypt hash เท่านั้น
  constraint users_password_bcrypt check (password_hash ~ '^\$2[aby]\$[0-9]{2}\$.{53}$')
);

comment on column public.users.password_hash is
  'bcrypt hash (cost >= 10) ที่ backend สร้างตอน UC-01 Register — ห้ามเก็บ plaintext';

-- ---------------------------------------------------------------------
-- 4. Categories  (ERD: category_id, name, description)
-- ---------------------------------------------------------------------
create table public.categories (
  category_id uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text
);

-- seed.sql กำหนด UUID ของ 6 หมวดหมู่ไว้ตายตัว เพื่อให้ค่าเหมือนกันทุก environment
-- FE จึงอ้างอิง category_id ได้โดยไม่ต้องยิงถามก่อน

-- ---------------------------------------------------------------------
-- 5. Products  (ERD: product_id, seller_id, category_id, title, description,
--                    price, item_condition, status, pickup_location, created_at)
-- ---------------------------------------------------------------------
create table public.products (
  product_id      uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references public.users(user_id) on delete cascade,
  category_id     uuid not null references public.categories(category_id),
  title           text not null,
  description     text,
  price           numeric(10,2) not null default 0,
  item_condition  product_condition not null,
  status          product_status not null default 'available',
  pickup_location text not null,
  created_at      timestamptz not null default now(),

  constraint products_title_len   check (char_length(title) between 3 and 255),
  constraint products_desc_len    check (description is null or char_length(description) <= 2000),
  constraint products_price_range check (price >= 0 and price <= 999999.99),
  constraint products_pickup_len  check (char_length(pickup_location) between 2 and 255)
);

comment on column public.products.price is 'ราคา 0 = แจกฟรี — API แปลงเป็น is_free ตอนส่งออก';

-- ---------------------------------------------------------------------
-- 6. Product_Images  (ERD: image_id, product_id, image_url, is_primary)
-- ---------------------------------------------------------------------
create table public.product_images (
  image_id   uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(product_id) on delete cascade,
  image_url  text not null,
  is_primary boolean not null default false
);

-- รูปหลักได้โพสต์ละ 1 รูปเท่านั้น
create unique index product_images_one_primary_idx
  on public.product_images (product_id) where is_primary;

-- ---------------------------------------------------------------------
-- 7. Wishlists  (ERD: wishlist_id, user_id, product_id, created_at)
-- ---------------------------------------------------------------------
create table public.wishlists (
  wishlist_id uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(user_id) on delete cascade,
  product_id  uuid not null references public.products(product_id) on delete cascade,
  created_at  timestamptz not null default now(),
  -- UC-05 เช็คก่อนว่ามีอยู่ไหมแล้วค่อย INSERT/DELETE
  -- unique กันกรณีกดรัวจนสองคำขอวิ่งพร้อมกัน
  unique (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- 8. Reports  (ERD: report_id, reporter_id, product_id, reason, status, created_at)
--    product_id เป็น ON DELETE SET NULL ตามมติทีม 13 ก.ย. 2569:
--    ลบประกาศแบบ hard delete แล้วรายงานต้องยังอยู่ในสถานะ actioned
--    ถ้าเป็น CASCADE รายงานจะถูกลบไปพร้อมประกาศ จนไม่เหลือแถวให้อัปเดตสถานะ
-- ---------------------------------------------------------------------
create table public.reports (
  report_id   uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(user_id) on delete cascade,
  product_id  uuid references public.products(product_id) on delete set null,
  reason      report_reason not null,
  status      report_status not null default 'pending',
  created_at  timestamptz not null default now(),
  unique (product_id, reporter_id)     -- กันรายงานซ้ำจากคนเดิม
);

-- ---------------------------------------------------------------------
-- 9. INDEXES  (NFR: search API < 500ms ที่ 50 concurrent users)
-- ---------------------------------------------------------------------
create index products_feed_idx     on public.products (status, created_at desc);
create index products_category_idx on public.products (category_id);
create index products_seller_idx   on public.products (seller_id, created_at desc);
create index products_price_idx    on public.products (price);
create index products_pickup_idx   on public.products (pickup_location);

-- keyword search แบบ case-insensitive (UC-04) — trigram เพราะ Postgres ไม่มีตัวตัดคำไทย
create index products_title_trgm_idx on public.products using gin (title gin_trgm_ops);
create index products_desc_trgm_idx  on public.products using gin (description gin_trgm_ops);

create index product_images_product_idx on public.product_images (product_id);
create index wishlists_user_idx         on public.wishlists (user_id, created_at desc);
create index wishlists_product_idx      on public.wishlists (product_id);
create index reports_status_idx         on public.reports (status, created_at desc);
create index reports_product_idx        on public.reports (product_id);

-- ---------------------------------------------------------------------
-- 10. TRIGGERS — กติกาที่ไดอะแกรมระบุไว้ บังคับซ้ำที่ชั้นฐานข้อมูล
-- ---------------------------------------------------------------------

-- 10.1 UC-02 "Validate Product Data: Images 1-5" — กันรูปที่ 6
create or replace function public.enforce_max_product_images()
returns trigger language plpgsql as $$
declare
  img_count integer;
begin
  select count(*) into img_count from public.product_images where product_id = new.product_id;
  if img_count >= 5 then
    raise exception 'UNITRADE_TOO_MANY_IMAGES: maximum 5 images per product'
      using errcode = '23514';
  end if;
  return new;
end $$;

create trigger product_images_max_5 before insert on public.product_images
  for each row execute function public.enforce_max_product_images();

-- 10.2 UC-03 "Validate Status & Ownership" — เจ้าของโพสต์เปลี่ยนมือไม่ได้
create or replace function public.guard_product_owner()
returns trigger language plpgsql as $$
begin
  if new.seller_id <> old.seller_id then
    raise exception 'UNITRADE_IMMUTABLE_SELLER: seller_id cannot be changed';
  end if;
  return new;
end $$;

create trigger products_guard_owner before update on public.products
  for each row execute function public.guard_product_owner();

-- 10.3 UC-06 "Validate Report" — ห้ามรายงานโพสต์ตัวเอง
create or replace function public.guard_self_report()
returns trigger language plpgsql as $$
begin
  -- product_id เป็น null ได้เฉพาะหลังประกาศถูกลบ ห้ามสร้างรายงานใหม่โดยไม่ระบุประกาศ
  if new.product_id is null then
    raise exception 'UNITRADE_REPORT_NEEDS_PRODUCT: product_id is required when creating a report'
      using errcode = '23502';
  end if;
  if exists (select 1 from public.products p
              where p.product_id = new.product_id and p.seller_id = new.reporter_id) then
    raise exception 'UNITRADE_SELF_REPORT: cannot report your own listing';
  end if;
  return new;
end $$;

create trigger reports_guard_self before insert on public.reports
  for each row execute function public.guard_self_report();

-- =====================================================================
-- UniTrade — Migration 0004: ตามมติทีม 13 ก.ย. 2569 บนฐานข้อมูลที่รันไปก่อนวันนั้น
--
-- ฐานข้อมูลบน Supabase Cloud ถูกสร้างจาก 0001 รุ่นก่อน 13 ก.ย. ตรวจเมื่อ 16 ต.ค. 2569 พบว่า
--   - ตาราง users ยังไม่มีคอลัมน์ faculty
--   - reports.product_id ยังเป็น NOT NULL (ลบประกาศแล้วรายงานจะหายตาม หรือลบไม่ได้)
-- ไฟล์นี้ปรับให้ตรงกับ 0001_init.sql รุ่นปัจจุบัน รันซ้ำได้โดยไม่พัง
-- ฐานข้อมูลที่สร้างใหม่จาก 0001 รุ่นปัจจุบันอยู่แล้ว รันไฟล์นี้ก็ไม่เปลี่ยนอะไร
--
-- วิธีรัน: วางทั้งไฟล์ใน Supabase SQL Editor แล้วกด Run ครั้งเดียว
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. users.faculty (มติข้อ 1) — บังคับกรอก ตรวจความยาว 2–100
--    แถวที่มีอยู่ก่อนเป็นบัญชีทดสอบ ใส่ 'ไม่ระบุ' ไว้ให้ผ่าน NOT NULL
-- ---------------------------------------------------------------------
alter table public.users add column if not exists faculty text;

update public.users set faculty = 'ไม่ระบุ' where faculty is null;

alter table public.users alter column faculty set not null;

alter table public.users drop constraint if exists users_faculty_len;
alter table public.users add constraint users_faculty_len
  check (char_length(faculty) between 2 and 100);

-- ---------------------------------------------------------------------
-- 2. reports.product_id (มติข้อ 3) — nullable + ON DELETE SET NULL
--    ชื่อ FK เดิมอาจไม่ใช่ค่า default จึงหาจาก catalog แล้วลบทุกตัวที่ชี้ products
-- ---------------------------------------------------------------------
do $$
declare
  fk record;
begin
  for fk in
    select con.conname
      from pg_constraint con
      join pg_attribute att
        on att.attrelid = con.conrelid and att.attnum = any (con.conkey)
     where con.conrelid = 'public.reports'::regclass
       and con.contype = 'f'
       and att.attname = 'product_id'
  loop
    execute format('alter table public.reports drop constraint %I', fk.conname);
  end loop;
end $$;

alter table public.reports alter column product_id drop not null;

alter table public.reports add constraint reports_product_id_fkey
  foreign key (product_id) references public.products(product_id) on delete set null;

-- ---------------------------------------------------------------------
-- 3. UC-06 guard — ห้ามสร้างรายงานใหม่ที่ไม่มี product_id (เพิ่มพร้อมข้อ 2)
-- ---------------------------------------------------------------------
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

drop trigger if exists reports_guard_self on public.reports;
create trigger reports_guard_self before insert on public.reports
  for each row execute function public.guard_self_report();

commit;

-- ---------------------------------------------------------------------
-- ตรวจผล — ควรได้ faculty_nullable = NO, report_fk_nullable = YES, report_fk_rule = SET NULL
-- ---------------------------------------------------------------------
select
  (select is_nullable from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'faculty') as faculty_nullable,
  (select is_nullable from information_schema.columns
    where table_schema = 'public' and table_name = 'reports' and column_name = 'product_id') as report_fk_nullable,
  (select rc.delete_rule from information_schema.referential_constraints rc
    where rc.constraint_schema = 'public' and rc.constraint_name = 'reports_product_id_fkey') as report_fk_rule;

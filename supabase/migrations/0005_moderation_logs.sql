-- =====================================================================
-- UniTrade — Migration 0005: Log การจัดการของผู้ดูแลระบบ + function แบบ atomic (TASK-19)
--
-- SRS FR-08 Report & Moderation: "บันทึกคำร้องลงตาราง Reports -> Admin ตรวจสอบ
-- -> ลบสินค้าและบันทึก Log"
-- ตาราง reports อย่างเดียวไม่พอ: ไม่รู้ว่า admin คนไหนทำ, พอลบประกาศแล้ว reports.product_id
-- เป็น NULL จนไม่รู้ว่าลบประกาศอะไร, และลบประกาศที่ไม่มีรายงานก็ไม่เหลือร่องรอยเลย
--
-- spec §11.2: อัปเดต reports เป็น actioned + ลบประกาศ ต้องอยู่ใน transaction เดียว
-- supabase-js ทำ transaction ไม่ได้ จึงเขียนเป็น function แล้วเรียกด้วย db().rpc(...)
-- และ insert log ใน function เดียวกัน — log กับการเปลี่ยนแปลงสำเร็จหรือพังไปพร้อมกัน
--   admin_delete_product(p_product_id, p_admin_id) — DELETE /api/v1/admin/products/:id
--   admin_dismiss_report(p_report_id, p_admin_id)  — PATCH  /api/v1/admin/reports/:id
-- การลบไฟล์ใน Storage ยังทำที่ API หลัง rpc สำเร็จ (Postgres ลบไฟล์ใน bucket ไม่ได้)
--
-- function คืน jsonb ที่มี "result" เป็น 'ok' | 'not_found' | 'already_resolved'
-- แทนการ raise exception เพราะ exception จาก plpgsql เป็น P0001 ซึ่ง API จะแปลงเป็น 500
--
-- วิธีรัน: วางทั้งไฟล์ใน Supabase SQL Editor แล้วกด Run ครั้งเดียว (รันซ้ำได้โดยไม่พัง)
-- =====================================================================

begin;

-- ---------------------------------------------------------------------
-- 1. ตาราง moderation_logs
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
                  where t.typname = 'moderation_action' and n.nspname = 'public') then
    create type public.moderation_action as enum ('delete_product', 'dismiss_report');
  end if;
end $$;

create table if not exists public.moderation_logs (
  log_id           uuid primary key default gen_random_uuid(),
  -- ลบบัญชี admin ภายหลัง log ยังต้องอยู่
  admin_id         uuid references public.users(user_id) on delete set null,
  action           public.moderation_action not null,
  -- ไม่ใส่ FK: ประกาศหายไปหลังลบ แต่ต้องเก็บ id ไว้เป็นหลักฐาน
  product_id       uuid,
  -- snapshot ณ เวลาที่จัดการ เพื่อให้รู้ว่าเป็นประกาศอะไรของใคร หลังประกาศหายจากระบบแล้ว
  product_title    text,
  seller_id        uuid,
  -- ใช้กับ dismiss_report
  report_id        uuid references public.reports(report_id) on delete set null,
  -- ใช้กับ delete_product: จำนวนรายงาน pending ที่ถูกเปลี่ยนเป็น actioned
  reports_actioned int,
  created_at       timestamptz not null default now(),

  constraint moderation_logs_actioned_nonneg check (reports_actioned is null or reports_actioned >= 0)
);

create index if not exists moderation_logs_created_idx on public.moderation_logs (created_at desc);
create index if not exists moderation_logs_product_idx on public.moderation_logs (product_id);

-- ปิดจากภายนอกเหมือนทุกตารางใน 0002: เปิด RLS ไม่มี policy
alter table public.moderation_logs enable row level security;
revoke all on public.moderation_logs from anon, authenticated;
grant all privileges on public.moderation_logs to service_role;

-- ---------------------------------------------------------------------
-- 2. admin_delete_product — actioned + hard delete + log ใน transaction เดียว
-- ---------------------------------------------------------------------
create or replace function public.admin_delete_product(p_product_id uuid, p_admin_id uuid)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_title    text;
  v_seller   uuid;
  v_actioned int;
begin
  -- ด่านสำรอง: API ตรวจ role แล้ว ถ้าหลุดมาถึงตรงนี้แปลว่ามี bug
  if not exists (select 1 from public.users where user_id = p_admin_id and role = 'admin') then
    raise exception 'UNITRADE_ADMIN_REQUIRED: % is not an admin', p_admin_id;
  end if;

  -- for update: admin สองคนลบพร้อมกัน คนที่สองจะรอแล้วได้ not_found
  select title, seller_id into v_title, v_seller
    from public.products where product_id = p_product_id
    for update;
  if not found then
    return jsonb_build_object('result', 'not_found');
  end if;

  -- ต้องทำก่อนลบ: หลังลบ reports.product_id จะเป็น NULL (ON DELETE SET NULL) หารายงานไม่เจอแล้ว
  update public.reports set status = 'actioned'
    where product_id = p_product_id and status = 'pending';
  get diagnostics v_actioned = row_count;

  -- product_images และ wishlists ถูกลบตาม (cascade)
  delete from public.products where product_id = p_product_id;

  insert into public.moderation_logs (admin_id, action, product_id, product_title, seller_id, reports_actioned)
    values (p_admin_id, 'delete_product', p_product_id, v_title, v_seller, v_actioned);

  return jsonb_build_object('result', 'ok', 'product_id', p_product_id, 'reports_actioned', v_actioned);
end $$;

-- ---------------------------------------------------------------------
-- 3. admin_dismiss_report — dismissed (เฉพาะที่ยัง pending) + log ใน transaction เดียว
-- ---------------------------------------------------------------------
create or replace function public.admin_dismiss_report(p_report_id uuid, p_admin_id uuid)
returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_product_id uuid;
  v_title      text;
  v_seller     uuid;
begin
  if not exists (select 1 from public.users where user_id = p_admin_id and role = 'admin') then
    raise exception 'UNITRADE_ADMIN_REQUIRED: % is not an admin', p_admin_id;
  end if;

  -- อัปเดตแบบมีเงื่อนไข ไม่อ่านก่อนแล้วค่อยเขียน
  update public.reports set status = 'dismissed'
    where report_id = p_report_id and status = 'pending'
    returning product_id into v_product_id;
  if not found then
    if exists (select 1 from public.reports where report_id = p_report_id) then
      return jsonb_build_object('result', 'already_resolved');
    end if;
    return jsonb_build_object('result', 'not_found');
  end if;

  -- product_id อาจเป็น NULL ถ้าเจ้าของลบประกาศไปเองแล้ว
  select title, seller_id into v_title, v_seller
    from public.products where product_id = v_product_id;

  insert into public.moderation_logs (admin_id, action, product_id, product_title, seller_id, report_id)
    values (p_admin_id, 'dismiss_report', v_product_id, v_title, v_seller, p_report_id);

  return jsonb_build_object('result', 'ok', 'report_id', p_report_id, 'product_id', v_product_id,
                            'status', 'dismissed');
end $$;

-- ---------------------------------------------------------------------
-- 4. สิทธิ์ function — 0002 ตั้ง default privileges ไว้แค่ tables/sequences
--    ถ้าไม่ revoke จะเรียกผ่าน /rest/v1/rpc ด้วย anon key ได้
-- ---------------------------------------------------------------------
revoke execute on function public.admin_delete_product(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.admin_dismiss_report(uuid, uuid) from public, anon, authenticated;
grant  execute on function public.admin_delete_product(uuid, uuid) to service_role;
grant  execute on function public.admin_dismiss_report(uuid, uuid) to service_role;

commit;

-- ---------------------------------------------------------------------
-- ตรวจผล — ควรได้ true, true, false, false, false, true
-- ---------------------------------------------------------------------
select
  (to_regclass('public.moderation_logs') is not null)                                               as table_exists,
  (select relrowsecurity from pg_class where oid = 'public.moderation_logs'::regclass)              as rls_enabled,
  has_table_privilege('anon', 'public.moderation_logs', 'select')                                   as anon_can_read_logs,
  has_function_privilege('anon', 'public.admin_delete_product(uuid, uuid)', 'execute')              as anon_can_delete,
  has_function_privilege('authenticated', 'public.admin_dismiss_report(uuid, uuid)', 'execute')     as authenticated_can_dismiss,
  has_function_privilege('service_role', 'public.admin_delete_product(uuid, uuid)', 'execute')      as service_role_can_delete;

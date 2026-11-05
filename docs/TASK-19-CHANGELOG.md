# TASK-19: Report สินค้า & Admin ลบโพสต์ — สรุปการเปลี่ยนแปลงและสิ่งที่ต้องรู้

เอกสารนี้อธิบายว่า TASK-19 เพิ่มอะไรในโปรเจกต์ (เทียบกับ `main` หลัง merge PR #8) หน้าตาของ API ที่เพิ่มเข้ามา และสิ่งที่ทีมต้องรู้ก่อนใช้งานหรือทำงานต่อ โดยเฉพาะทีมหน้า Admin Dashboard (TASK-20)

| หัวข้อ | รายละเอียด |
|---|---|
| รหัสงาน | TASK-19 (Sprint 3) |
| branch | `feature/TASK-19-admin-reports` |
| Pull Request | #9 (รอ @wz รีวิว) |
| อ้างอิง | SRS FR-08 Report & Moderation, spec §1.5 (error catalog), §10.1, §11.2, `AGENTS.md` หัวข้อ 4–6 และ 9 |
| อัปเดตล่าสุด | 5 พฤศจิกายน 2569 |

---

## 1. ภาพรวม

| Endpoint | หน้าที่ | สิทธิ์ |
|---|---|---|
| `POST /api/v1/products/:id/reports` | สมาชิกรายงานประกาศที่น่าสงสัย | สมาชิกที่ล็อกอิน (ห้ามรายงานประกาศของตัวเอง) |
| `GET /api/v1/admin/reports` | รายการรายงาน พร้อมผู้รายงาน ประกาศ และผู้ขาย | admin |
| `PATCH /api/v1/admin/reports/:id` | ยกเลิกคำร้องโดยไม่ลบสินค้า (`dismissed`) | admin |
| `DELETE /api/v1/admin/products/:id` | ลบประกาศของใครก็ได้ (hard delete) และลบไฟล์รูปใน Storage | admin |

- ไม่มี token หรือ token เสีย → `401 UNAUTHORIZED`
- route ของ admin ใช้ `requireAdmin` (ตัวที่ใบงานเรียกว่า `verifyAdminRole`) ไม่ใช่ admin → `403 ADMIN_REQUIRED`
- การลบประกาศและการยกเลิกคำร้องบันทึก log ลงตาราง `moderation_logs` ตาม SRS FR-08 "ลบสินค้าและบันทึก Log"

---

## 2. การเปลี่ยนแปลงเทียบกับ `main`

### 2.1 สรุป

| ประเภท | จำนวน | รายละเอียด |
|---|---|---|
| **เพิ่ม** | 40 ไฟล์ | migration 0005, `lib/admin.js`, `lib/reports.js`, route 4 ไฟล์, `test/reports.test.js`, Bruno 28 ไฟล์ (42–52, 64–79, 99), `bruno/.env.example`, Postman 2 ไฟล์, เอกสารนี้ |
| **แก้** | 1 ไฟล์ | `lib/constants.js` (เพิ่ม export ตามที่ `AGENTS.md` 4.3 อนุญาต) |
| **ลบ** | 0 ไฟล์ | — |
| ไม่แตะ | — | `package.json`, `.env.example`, `lib/auth.js`, `lib/http.js`, `lib/supabase.js`, `lib/validation.js`, `lib/users.js`, migrations 0001–0004, Bruno 01–41 และ 53–63 |

ไม่ติดตั้งไลบรารีเพิ่ม

### 2.2 ไฟล์ที่เพิ่มหรือแก้

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `supabase/migrations/0005_moderation_logs.sql` (ใหม่) | ตาราง `moderation_logs`, enum `moderation_action`, function `admin_delete_product` และ `admin_dismiss_report` — **@wz รันบน Supabase แล้ว 5 พ.ย. 2569** |
| `lib/admin.js` (ใหม่) | `requireAdmin(handler)` wrapper ครอบ `requireAuth` อ่าน role จาก DB ทุกครั้ง |
| `lib/reports.js` (ใหม่) | `validateReportInput`, `validateReportStatusInput`, `parseAdminReportQuery`, `ADMIN_REPORT_SELECT`, `toAdminReport` (ไม่ import `lib/supabase.js` จึงเขียน unit test ได้) |
| `lib/constants.js` | เพิ่ม `REPORT_REASONS` (7 ค่า) และ `REPORT_STATUSES` ให้ตรงกับ enum ใน 0001 |
| `app/api/v1/products/[id]/reports/route.js` (ใหม่) | `POST` |
| `app/api/v1/admin/reports/route.js` (ใหม่) | `GET` |
| `app/api/v1/admin/reports/[id]/route.js` (ใหม่) | `PATCH` เรียก `db().rpc('admin_dismiss_report')` |
| `app/api/v1/admin/products/[id]/route.js` (ใหม่) | `DELETE` เรียก `db().rpc('admin_delete_product')` แล้วลบไฟล์ใน Storage |
| `test/reports.test.js` (ใหม่) | unit test 9 ข้อ |
| `bruno/42–52`, `bruno/64–79`, `bruno/99`, `bruno/.env.example` | ชุดทดสอบ API (หัวข้อ 5) |
| `docs/postman/` | Postman Collection และ environment สำหรับทีม Admin Dashboard |

### 2.3 ประวัติ commit

| Commit | เนื้อหา |
|---|---|
| `ceb9578` | `feat(api): add report reason and status validation with unit tests (TASK-19)` |
| `1e6da65` | `feat(api): add POST /products/:id/reports with self and duplicate report checks (TASK-19)` |
| `2c7d935` | `feat(api): add verifyAdminRole and GET /admin/reports for pending reports (TASK-19)` |
| `cd01c02` | `feat(api): add PATCH /admin/reports/:id to dismiss reports with moderation log (TASK-19)` |
| `3750cfd` | `feat(api): add DELETE /admin/products/:id with report actioning and storage cleanup (TASK-19)` |
| `2787caa` | `fix(api): align report error codes, requireAdmin and admin report query with spec (TASK-19)` |
| `c884744` | `feat(db): add moderation_logs and atomic admin delete/dismiss functions (TASK-19)` |
| `b885f6b` | `feat(api): use atomic rpc for admin dismiss and product delete (TASK-19)` |
| `25525a0` | `test(api): add admin Bruno requests and Postman collection for reports (TASK-19)` |
| `c8605d0` | `chore: merge main into feature/TASK-19-admin-reports (TASK-19)` |
| *(commit ถัดไป)* | `docs(api): add TASK-19 change notes (TASK-19)` เพิ่มเอกสารนี้ |

---

## 3. หน้าตาของ API

### 3.1 `POST /products/:id/reports`

```json
{ "reason": "scam" }
```

`reason` ต้องเป็นหนึ่งใน `scam`, `prohibited_item`, `spam`, `wrong_category`, `offensive_content`, `already_sold`, `other` ช่องอื่นที่ส่งมา (เช่น `status`, `reporter_id`) ถูกข้าม

**201**
```json
{
  "report_id": "uuid", "product_id": "uuid", "reason": "scam", "status": "pending",
  "created_at": "2026-11-05T07:00:00.000Z",
  "message": "ส่งรายงานเรียบร้อยแล้ว ผู้ดูแลระบบจะตรวจสอบโดยเร็ว"
}
```

### 3.2 `GET /admin/reports?status=pending&page=1&per_page=20`

| query | ค่าที่รับ | ค่าเริ่มต้น |
|---|---|---|
| `status` | `pending`, `actioned`, `dismissed`, `all` | `pending` |
| `page` | จำนวนเต็ม ≥ 1 | 1 |
| `per_page` | จำนวนเต็ม ≥ 1 (เกิน 50 ปัดเป็น 50) | 20 |

เรียงรายงานใหม่สุดก่อน ขอหน้าเกินจำนวนที่มีได้ `data: []` ไม่ใช่ error

**200**
```json
{
  "data": [
    {
      "report_id": "uuid", "reason": "scam", "status": "pending", "created_at": "…",
      "reporter": { "user_id": "uuid", "full_name": "…", "faculty": "…" },
      "product": {
        "product_id": "uuid", "title": "…", "price": 100, "status": "available", "created_at": "…",
        "primary_image_url": "https://…",
        "seller": { "user_id": "uuid", "full_name": "…", "faculty": "…" }
      }
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 1, "total_pages": 1 }
}
```

- `product` เป็น `null` เมื่อประกาศถูกลบไปแล้ว (โดย admin หรือโดยเจ้าของ) เพราะ `reports.product_id` เป็น `ON DELETE SET NULL`
- **ไม่มี** `email`, `phone_number`, `line_id`, `password_hash` ของใครเลย (`AGENTS.md` 4.2.4)

### 3.3 `PATCH /admin/reports/:id`

```json
{ "status": "dismissed" }
```

**200**
```json
{ "report_id": "uuid", "product_id": "uuid", "status": "dismissed", "message": "ยกเลิกคำร้องแล้ว ประกาศยังคงอยู่ในระบบ" }
```

ส่งได้แค่ `dismissed` ส่วนสถานะ `actioned` เกิดจาก `DELETE /admin/products/:id` เท่านั้น

### 3.4 `DELETE /admin/products/:id`

**204** ไม่มี body ผลที่เกิดขึ้น:
1. รายงาน `pending` ทั้งหมดของประกาศนี้ → `actioned`
2. ลบแถว `products` (`product_images`, `wishlists` ถูกลบตาม)
3. บันทึก `moderation_logs` (`delete_product`, ชื่อประกาศ, ผู้ขาย, จำนวนรายงานที่ปิด)
4. ลบไฟล์รูปในโฟลเดอร์ `<product_id>/` ของ bucket `product-images`

ข้อ 1–3 อยู่ใน transaction เดียว (function `admin_delete_product`) ข้อ 4 ทำหลังข้อ 1–3 สำเร็จ

### 3.5 รหัสข้อผิดพลาดที่ใช้

ยึด catalog ใน spec §1.5 ส่วนที่ไม่มีใน catalog @wz อนุมัติแล้ว

| HTTP | `code` | `field` | เมื่อไร |
|---|---|---|---|
| 400 | `INVALID_PAYLOAD` | — | body ไม่ใช่ JSON object |
| 401 | `UNAUTHORIZED` | — | ไม่มี token, token เสีย หรือไม่พบบัญชีแล้ว |
| 403 | `ADMIN_REQUIRED` | — | เรียก `/admin/*` ด้วยบัญชีที่ไม่ใช่ admin ("หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ") |
| 404 | `PRODUCT_NOT_FOUND` | — | ไม่พบประกาศ หรือ `:id` ไม่ใช่ UUID (POST reports, DELETE admin) |
| 404 | `REPORT_NOT_FOUND` | — | ไม่พบรายงาน หรือ `:id` ไม่ใช่ UUID — **code ใหม่** รอ @wz เพิ่มเข้า catalog |
| 409 | `DUPLICATE_REPORT` | — | ผู้ใช้คนเดิมรายงานประกาศเดิมซ้ำ |
| 409 | `REPORT_ALREADY_RESOLVED` | — | รายงานไม่ใช่ `pending` แล้ว (รวมกด dismissed ซ้ำ หรือประกาศถูกลบไปแล้ว) |
| 422 | `SELF_REPORT` | — | รายงานประกาศของตัวเอง |
| 422 | `INVALID_REPORT_REASON` | `reason` | `reason` ไม่อยู่ใน 7 ค่า ("กรุณาเลือกเหตุผลในการรายงาน") |
| 422 | `VALIDATION_ERROR` | `status` / `page` / `per_page` | body ของ PATCH ไม่ใช่ `dismissed` หรือ query ของ GET ผิด |

ไม่ใช้ `INVALID_STATUS` กับรายงาน เพราะ code นั้นผูกกับสถานะสินค้า

---

## 4. สิ่งที่ต้องรู้

### 4.1 ลำดับการตรวจ
- `POST /products/:id/reports`: 401 → 404 → 422 `SELF_REPORT` → 422 `INVALID_REPORT_REASON` → 409 `DUPLICATE_REPORT`
- `PATCH /admin/reports/:id`: 401 → 403 → 404 → 422 → 409
- `DELETE /admin/products/:id`: 401 → 403 → 404

### 4.2 การกันรายงานซ้ำและรายงานตัวเอง
- รายงานซ้ำ: เช็กก่อน insert และจับ Postgres `23505` จาก `unique (product_id, reporter_id)` เป็น 409 ด้วย กันกดส่งซ้ำเร็ว ๆ
- รายงานตัวเอง: เช็กในโค้ดก่อน insert เพราะ trigger `guard_self_report` raise เป็น `P0001` ถ้าหลุดถึงฐานข้อมูลจะกลายเป็น 500
- ผลข้างเคียงของ unique: รายงานที่ถูก `dismissed` แล้ว ผู้ใช้คนเดิมรายงานประกาศเดิมซ้ำไม่ได้

### 4.3 สิทธิ์ admin
- `requireAdmin` อ่าน `role` จากตาราง `users` ทุกคำขอ ไม่เชื่อ role ใน token จึงถอดสิทธิ์ได้ทันที ไม่ต้องรอ token 24 ชม. หมดอายุ
- function ใน 0005 เช็กซ้ำว่า `p_admin_id` เป็น admin เป็นด่านสำรอง และ `revoke execute` จาก `public`, `anon`, `authenticated` แล้ว เรียกผ่าน `/rest/v1/rpc` ด้วย anon key ไม่ได้
- `lib/admin.js` import `lib/supabase.js` จึงไม่มี unit test ทดสอบด้วย Bruno 49–52 (สมาชิกปกติได้ 403) และ 67–79

### 4.4 ทำไมต้องใช้ function (rpc)
supabase-js ทำ transaction ไม่ได้ ถ้าแยกคำสั่งกัน อาจเกิดรายงานที่เป็น `actioned` ทั้งที่ประกาศยังอยู่ หรือประกาศหายแต่ไม่มี log spec §11.2 จึงกำหนดให้รวมไว้ใน transaction เดียว function ใน 0005 ทำให้ "เปลี่ยนสถานะ + ลบ + บันทึก log" สำเร็จหรือพังไปพร้อมกัน (ทดสอบแล้วว่าถ้า insert log พัง ประกาศไม่ถูกลบและรายงานยังเป็น pending)

function คืน jsonb `{ "result": "ok" | "not_found" | "already_resolved", … }` แทนการ raise เพื่อให้ API ตอบ 404/409 ได้ถูกต้อง

### 4.5 ตาราง `moderation_logs`

| คอลัมน์ | ความหมาย |
|---|---|
| `admin_id` | admin ที่ทำ (FK → users, `on delete set null`) |
| `action` | `delete_product` หรือ `dismiss_report` |
| `product_id` | ประกาศที่เกี่ยวข้อง (ไม่มี FK เพราะประกาศหายไปหลังลบ) |
| `product_title`, `seller_id` | snapshot ณ เวลาที่ทำ |
| `report_id` | ใช้กับ `dismiss_report` (FK → reports, `on delete set null`) |
| `reports_actioned` | ใช้กับ `delete_product` จำนวนรายงานที่ถูกปิด |

เปิด RLS และไม่มี policy เหมือนทุกตารางใน 0002 ยังไม่มี endpoint สำหรับอ่าน log ดูได้จาก SQL Editor

### 4.6 รายงานที่ประกาศถูกเจ้าของลบไปเอง
`DELETE /products/:id` ของ TASK-12 (เจ้าของลบเอง) ไม่ได้เปลี่ยนรายงานเป็น `actioned` รายงานเหล่านั้นจะยังค้างเป็น `pending` โดยมี `product: null` admin เห็นใน Dashboard และกด dismissed ได้

---

## 5. การทดสอบ

| ชุดทดสอบ | ผล |
|---|---|
| `npm test` | 61/61 (ของ TASK-19 9 ข้อใน `test/reports.test.js`) |
| `npm run test:api` (มี `bruno/.env`) | 80 requests: 79 passed, 1 skipped (99), 81/81 tests |
| `npm run build` | ผ่าน มี route ใหม่ 4 ตัว |
| ตรวจในฐานข้อมูล | `moderation_logs` ได้ 2 แถวต่อรอบ (`dismiss_report`, `delete_product` ที่ `reports_actioned = 1`) และไม่มีไฟล์ค้างใน bucket |
| migration 0005 | ทดสอบกับ Postgres 16 ในเครื่อง (รันซ้ำได้, สิทธิ์, rollback) และ @wz รันบน Supabase ได้ผล `true, true, false, false, false, true` |

| Bruno | ทดสอบ |
|---|---|
| 42 | ผู้ใช้คนแรกลงประกาศเป้าหมาย (เก็บ `report_product_id`) |
| 43–48 | `SELF_REPORT`, `INVALID_REPORT_REASON`, `PRODUCT_NOT_FOUND`, 401, รายงานสำเร็จ 201 (เก็บ `report_id`), `DUPLICATE_REPORT` |
| 49–52 | สมาชิกปกติเรียก `/admin/*` → 403, ไม่มี token → 401 |
| 64–66 | ผู้ใช้คนที่สามรายงานประกาศเดียวกัน (เก็บ `report_id3`) |
| 67 | admin ล็อกอินจาก `bruno/.env` |
| 68–70 | รายการรายงาน, `?status=open` → 422, `?page=0` → 422 |
| 71–74 | PATCH body ผิด 422 → ไม่พบ 404 → dismissed 200 → ซ้ำ 409 |
| 75–77 | ลบประกาศที่ไม่มี 404 → admin ลบประกาศที่ Bruno สร้าง 204 → รายละเอียด `{ data: [] }` |
| 78–79 | รายงานของประกาศที่ถูกลบเป็น `actioned` ยกเลิกไม่ได้ (409) และอยู่ใน `?status=actioned` |
| 99 | เจ้าของลบประกาศเป้าหมาย (ข้ามถ้า admin ลบไปแล้ว) |

**บัญชี admin สำหรับทดสอบ:** `unitrade.admin.test@student.chula.ac.th` ใช้ร่วมกันทั้งทีม ห้ามแก้หรือลบ ขอรหัสผ่านจาก @SArunPoB หรือ @wz ทาง DM แล้วใส่ใน `bruno/.env` ตาม `bruno/.env.example` ไฟล์นี้ gitignore ไว้แล้ว **ห้าม commit และห้ามใส่รหัสผ่านในไฟล์ `.bru`** ถ้าไม่มี `bruno/.env` request 67–79 จะถูกข้าม ส่วนที่เหลือรันได้ปกติ

**ล้างข้อมูลหลังรัน** (ตาม README หัวข้อ "ลบข้อมูลทดสอบ"):
```sql
select count(*) from public.products
where seller_id in (select user_id from public.users where email like 'bruno.%@student.chula.ac.th');  -- ต้องได้ 0

delete from public.moderation_logs
where seller_id in (select user_id from public.users where email like 'bruno.%@student.chula.ac.th');
delete from public.users where email like 'bruno.%@student.chula.ac.th';
```
ต้องลบ log ก่อน users ไม่อย่างนั้นจะหา log ของประกาศทดสอบไม่เจอ ลบตาม `seller_id` ไม่ใช่ตามชื่อประกาศ เผื่อมีประกาศจริงชื่อซ้ำ

---

## 6. ประเด็นที่ยังเปิดอยู่

- [ ] **`REPORT_NOT_FOUND`** รอ @wz เพิ่มเข้า catalog spec §1.5
- [ ] **ค่าของ `?status=` ใน `GET /admin/reports`** ใช้ `pending`, `actioned`, `dismissed`, `all` ยังไม่ได้เทียบกับหัวข้อนี้ใน spec ทีละคำ
- [ ] **รายงานที่ค้างเมื่อเจ้าของลบประกาศเอง** (หัวข้อ 4.6) ถ้าทีมอยากให้ปิดอัตโนมัติ ต้องแก้ `DELETE /products/:id` ของ TASK-12
- [ ] **Bruno 53–63 (TASK-15)** รันระหว่าง 42 กับ 99 ขณะที่ประกาศเป้าหมายของ TASK-19 ยังอยู่ ตอนนี้ผ่านทั้งหมด แต่ถ้า TASK-15 เพิ่ม test ที่นับจำนวนสินค้า ต้องระวังประกาศนี้

---

## 7. สำหรับคนที่ทำงานต่อ

**ทีมหน้าเว็บ (TASK-20 Admin Dashboard)**
- นำเข้า `docs/postman/UniTrade-TASK-19.postman_collection.json` และ `UniTrade-local.postman_environment.json` ใน Postman แล้วใส่ `ADMIN_EMAIL` / `ADMIN_PASSWORD` ใน environment (ห้ามใส่ใน collection) ส่วน request 42 ต้องเลือกไฟล์รูปเองในช่อง `images`
- ซ่อนหน้า Dashboard จากคนที่ไม่ใช่ admin ได้ด้วย `role` จาก `GET /auth/me` แต่**ด่านจริงอยู่ที่ API** เรียก `/admin/*` แล้วได้ 403 `ADMIN_REQUIRED` ให้พาออกจากหน้า
- หน้ารายการใช้ `GET /admin/reports` และ `pagination` แบบเดียวกับ `GET /products` แสดง `product === null` เป็น "ประกาศถูกลบแล้ว"
- ปุ่ม "ยกเลิกคำร้อง" → `PATCH /admin/reports/:id` `{ "status": "dismissed" }` ปุ่ม "ลบโพสต์" → `DELETE /admin/products/:id` (ได้ 204) หลังลบแล้วรายงานทุกอันของประกาศนั้นจะเป็น `actioned` ให้โหลดรายการใหม่
- ได้ 409 `REPORT_ALREADY_RESOLVED` แปลว่า admin อีกคนจัดการไปแล้ว ให้โหลดรายการใหม่ ไม่ต้องแสดงเป็น error ร้ายแรง
- ฟอร์มรายงานฝั่งสมาชิกใช้ `POST /products/:id/reports` ใช้ `error.code` ตัดสินใจ (`SELF_REPORT` ซ่อนปุ่มรายงานในประกาศของตัวเองได้ด้วย `is_owner` ของ `GET /products/:id`)

**Backend**
- route ใหม่ของ admin ห่อด้วย `requireAdmin` เสมอ
- การเปลี่ยนแปลงหลายตารางที่ต้องสำเร็จพร้อมกัน เขียนเป็น function ใน migration ใหม่ (`0006_…`) แล้ว `revoke execute … from public, anon, authenticated` ทุกครั้ง

# TASK-09: Product Read API — สรุปการเปลี่ยนแปลงและสิ่งที่ต้องรู้

เอกสารนี้อธิบายว่า TASK-09 เปลี่ยนอะไรในโปรเจกต์บ้าง (เทียบกับโค้ดเดิมใน `main`) หน้าตาของ API ที่เพิ่มเข้ามา และสิ่งที่ทีมต้องรู้ก่อนนำไปใช้หรือทำงานต่อ

| หัวข้อ | รายละเอียด |
|---|---|
| รหัสงาน | TASK-09 (Backend: API ดึงข้อมูลสินค้า) |
| branch | `task-09-product-read` |
| ผู้รับผิดชอบ | ภพ -- Backend Dev |
| ผู้รีวิว | วซ -- Backend Lead |
| อ้างอิง | `AGENTS.md` หัวข้อ 7 (สเปก v2.2), TASK-04 (ฐานข้อมูล), TASK-05 (API Spec) |
| อัปเดตล่าสุด | 27 ตุลาคม 2569 |

---

## 1. ภาพรวม

TASK-09 เพิ่ม API แบบอ่านอย่างเดียว (GET) 4 เส้นสำหรับหน้า Home และหน้ารายละเอียดสินค้า

| Endpoint | หน้าที่ | สิทธิ์ |
|---|---|---|
| `GET /api/v1/categories` | หมวดหมู่ 6 หมวดคงที่ พร้อมจำนวนสินค้าที่ยัง `available` | สาธารณะ |
| `GET /api/v1/pickup-locations` | รายการจุดนัดรับคงที่ในจุฬาฯ (ไว้ทำ dropdown) | สาธารณะ |
| `GET /api/v1/products` | ค้นหา กรอง เรียงลำดับ แบ่งหน้า | สาธารณะ (`optionalAuth`) |
| `GET /api/v1/products/:id` | รายละเอียดสินค้า 1 ชิ้น พร้อมรูปทั้งหมดและข้อมูลผู้ขายเบื้องต้น | สาธารณะ (`optionalAuth`) |

`optionalAuth` หมายถึง ไม่ล็อกอินก็เรียกได้ แต่ถ้าส่ง `Authorization: Bearer <token>` มาด้วย ระบบจะคำนวณ `is_wishlisted` และ `is_owner` ให้ถูกต้อง ถ้า token เสียหรือหมดอายุจะถือว่าเป็นผู้เยี่ยมชม ไม่ตอบ 401

---

## 2. การเปลี่ยนแปลงเทียบกับ `main`

### 2.1 สรุปสั้น

| ประเภท | จำนวน | รายละเอียด |
|---|---|---|
| **เพิ่ม** | 22 ไฟล์ | route 4 ไฟล์, ตัวช่วยใน `lib/` 1 ไฟล์, unit test 1 ไฟล์, Bruno 15 ไฟล์ และเอกสารนี้ 1 ไฟล์ |
| **แก้** | 1 ไฟล์ | `AGENTS.md` 5 จุด (ปรับให้ตรงกับการตัดสินใจเรื่อง 404 ดูหัวข้อ 2.3) |
| **ลบ** | 0 ไฟล์ | ไม่มีโค้ดเดิมถูกลบ |

โค้ดเดิมของ @wz ทั้งหมด (auth, ตัวช่วยกลาง, ค่าคงที่, migration) **ไม่ถูกแก้แม้แต่บรรทัดเดียว** TASK-09 เพิ่มไฟล์ใหม่ที่เรียกใช้ของเดิมเท่านั้น

### 2.2 ไฟล์ที่เพิ่ม

| ไฟล์ | หน้าที่ |
|---|---|
| `app/api/v1/pickup-locations/route.js` | ส่ง `PICKUP_LOCATIONS` จาก `lib/constants.js` |
| `app/api/v1/categories/route.js` | อ่านตาราง `categories` เรียงตาม `category_id` และนับ `product_count` ของแต่ละหมวด |
| `app/api/v1/products/route.js` | `GET /products` (ค้นหา กรอง เรียง แบ่งหน้า รวมสถานะรายการโปรด) |
| `app/api/v1/products/[id]/route.js` | `GET /products/:id` |
| `lib/products.js` | ตัวช่วยกลางของ 2 route ข้างบน (ดูหัวข้อ 4.8) |
| `test/products.test.js` | unit test 17 ข้อของ `lib/products.js` |
| `bruno/14-...` ถึง `bruno/28-...` | Bruno 15 requests (ดูหัวข้อ 6) |

### 2.3 ไฟล์ที่แก้: `AGENTS.md` (5 จุด)

ทุกจุดเกี่ยวกับการตัดสินใจจากรีวิวว่า `GET /products/:id` **ไม่ใช้ 404** (ดูหัวข้อ 5) ส่วน route เขียน (`PATCH`/`DELETE /products/:id` ของ TASK-12) ยังคงอ้างอิง 404 ตามเดิม จนกว่า @wz จะยืนยัน (ดูหัวข้อ 7)

| # | ตำแหน่ง | ก่อนแก้ | หลังแก้ |
|---|---|---|---|
| 1 | ตารางรหัส error (แถว `PRODUCT_NOT_FOUND`) | `404 \| No product with that id, **or the id is not a valid UUID**` | `404 \| Write routes only (PATCH/DELETE /products/:id): no product with that id, **or the id is not a valid UUID**. GET /products/:id does **not** use it — it answers 200 + { "data": [] }` |
| 2 | หัวข้อ 7 `GET /products/:id` | `An invalid UUID or unknown id → 404 PRODUCT_NOT_FOUND with message "ไม่พบสินค้านี้ อาจถูกลบไปแล้ว"` | `An invalid UUID or unknown id → 200 with the body { "data": [] }. Never 404 (decided by wz in the TASK-09 review).` พร้อมวิธีที่ FE แยก "พบ/ไม่พบ" |
| 3 | เช็กลิสต์ Bruno ของ TASK-09 | `detail 404 with a random UUID, detail 404 with not-a-uuid` | `detail with a random UUID (200 + { data: [] }), detail with not-a-uuid (200 + { data: [] })` |
| 4 | เช็กลิสต์ Bruno ของ TASK-12 | `detail after delete (404)` | `detail after delete (200 + { data: [] })` |
| 5 | ข้อควรระวังหัวข้อ 10 ข้อ 3 | `answer 404 or 422 yourself` | `answer yourself (GET /products/:id → 200 + { data: [] }, category_id → 422)` |

### 2.4 ไฟล์ของเดิมที่ไม่ได้แตะ

`lib/http.js`, `lib/auth.js`, `lib/supabase.js`, `lib/constants.js`, `lib/validation.js`, `lib/users.js`, `app/api/v1/auth/*`, `app/api/v1/faculties/*`, `supabase/*` (migration), `package.json`, `package-lock.json`

### 2.5 ประวัติ commit

| Commit | เนื้อหา |
|---|---|
| `4b3b5c0` | เพิ่ม `GET /pickup-locations` และ `GET /categories` พร้อม Bruno 14, 15 |
| `616138d` | เพิ่ม `lib/products.js` และ `test/products.test.js` |
| `849143e` | เพิ่ม `GET /products` |
| `637c48e` | เพิ่ม `GET /products/:id` |
| `01bd469` | เพิ่ม Bruno 16–28 |
| `c916762` | แก้ตามรีวิว: `/products/:id` ไม่พบ ตอบ `200 + { data: [] }` (แก้ route และ Bruno 27, 28) |
| `3ab3098` | `docs:` เพิ่มเอกสารนี้ แก้ `AGENTS.md` ตามหัวข้อ 2.3 และปรับคอมเมนต์ของ `ilikeContains` ใน `lib/products.js` (ไม่กระทบการทำงาน) |เพิ่มเอกสารนี้และแก้ `AGENTS.md` ตามหัวข้อ 2.3 |

---

## 3. หน้าตาของ API

รูปแบบ error ทั้งหมดเป็นรูปแบบกลางของทีม: `{ "error": { "code": "...", "message": "ภาษาไทย", "field": "..." } }` (`field` มีเมื่อเกี่ยวกับฟิลด์ใดฟิลด์หนึ่ง)

### 3.1 `GET /pickup-locations`

```json
{ "data": ["ศาลาพระเกี้ยว", "อินทนิน ตึกมหามกุฎ", "หอสมุดกลาง"] }
```
(ตัวอย่างย่อ ค่าจริงมาจาก `PICKUP_LOCATIONS` ใน `lib/constants.js` ซึ่งเป็นแหล่งเดียว ห้ามประกาศซ้ำที่อื่น)

### 3.2 `GET /categories`

```json
{
  "data": [
    {
      "category_id": "00000000-0000-4000-8000-000000000001",
      "name": "Textbooks",
      "description": "หนังสือเรียน ชีทสรุป และเอกสารประกอบการเรียน",
      "product_count": 6
    }
  ]
}
```
- เรียงตาม `category_id` (หมวดที่ 1 ถึง 6 ตามไฟล์ seed)
- `product_count` นับเฉพาะสินค้า `status = available`
- ไม่มี `pagination` (มีแค่ 6 รายการคงที่)

### 3.3 `GET /products`

พารามิเตอร์ (ทุกตัวไม่บังคับ):

| พารามิเตอร์ | ค่าเริ่มต้น | กติกา |
|---|---|---|
| `page` | `1` | จำนวนเต็ม ≥ 1 |
| `per_page` | `20` | จำนวนเต็ม ≥ 1 ถ้าเกิน 50 จะถูกปัดเป็น **50** (ไม่ error) |
| `keyword` | - | ค้นใน `title` และ `description` ไม่แยกตัวพิมพ์เล็กใหญ่ รองรับภาษาไทย ยาวไม่เกิน 100 ตัวอักษร |
| `category_id` | - | UUID ใส่ได้หลายค่าคั่นด้วยจุลภาค |
| `min_price`, `max_price` | - | ตัวเลข ≥ 0 และ `min_price` ต้องไม่มากกว่า `max_price` |
| `free_only` | `false` | `true` หรือ `1` = เฉพาะ `price = 0` |
| `status` | `available` | `available`, `reserved`, `sold`, `all` |
| `pickup_location` | - | ต้องตรงกับค่าใน `PICKUP_LOCATIONS` เป๊ะ |
| `item_condition` | - | `new`, `like_new`, `good`, `fair` |
| `sort` | `date_desc` | `date_desc`, `date_asc`, `price_asc`, `price_desc` |

ตัวอย่างผลลัพธ์ `200`:

```json
{
  "data": [
    {
      "product_id": "c0ffee00-1111-4222-8333-444444444444",
      "title": "CALCULUS I (2110101) + ชีทสรุปครบเทอม",
      "price": 250,
      "is_free": false,
      "item_condition": "like_new",
      "status": "available",
      "pickup_location": "ศาลาพระเกี้ยว",
      "primary_image_url": "https://.../img-1.jpg",
      "category": { "name": "Textbooks", "category_id": "00000000-0000-4000-8000-000000000001" },
      "seller": { "user_id": "...", "full_name": "กันตภณ ช.", "faculty": "คณะวิศวกรรมศาสตร์" },
      "is_wishlisted": false,
      "created_at": "2026-09-08T09:12:00+00:00"
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 47, "total_pages": 3 }
}
```

ไม่พบสินค้า (หรือขอหน้าเกินจำนวนที่มี) ยังเป็น **`200`** ไม่ใช่ 404:

```json
{
  "data": [],
  "pagination": { "page": 1, "per_page": 20, "total": 0, "total_pages": 0 },
  "message": "ไม่พบสินค้าที่ตรงกับเงื่อนไข ลองปรับตัวกรองหรือคำค้นหา"
}
```

พารามิเตอร์ผิดรูปแบบ ตอบ `422`:

```json
{ "error": { "code": "VALIDATION_ERROR", "message": "sort ต้องเป็น date_desc, date_asc, price_asc หรือ price_desc", "field": "sort" } }
```
กรณี `pickup_location` ไม่อยู่ในรายการ ใช้ code `INVALID_PICKUP_LOCATION` (422 เช่นกัน)

### 3.4 `GET /products/:id`

พบสินค้า ส่ง **object ตรงๆ** (ไม่ห่อด้วย `data`):

```json
{
  "product_id": "c0ffee00-1111-4222-8333-444444444444",
  "title": "CALCULUS I (2110101) + ชีทสรุปครบเทอม",
  "description": "ใช้เทอมเดียว ไม่มีขีดเขียน",
  "price": 250,
  "is_free": false,
  "item_condition": "like_new",
  "status": "available",
  "pickup_location": "ศาลาพระเกี้ยว",
  "images": [
    { "image_id": "...", "image_url": "https://.../img-1.jpg", "is_primary": true },
    { "image_id": "...", "image_url": "https://.../img-2.jpg", "is_primary": false }
  ],
  "category": { "name": "Textbooks", "category_id": "00000000-0000-4000-8000-000000000001" },
  "seller": {
    "user_id": "...",
    "full_name": "กันตภณ ช.",
    "faculty": "คณะวิศวกรรมศาสตร์",
    "created_at": "2026-06-01T00:00:00+00:00",
    "active_listings": 4
  },
  "is_wishlisted": false,
  "is_owner": false,
  "created_at": "2026-09-08T09:12:00+00:00"
}
```

**ไม่พบสินค้า หรือ `id` ไม่ใช่ UUID** ตอบ `200` พร้อมเนื้อหา:

```json
{ "data": [] }
```

---

## 4. สิ่งที่ต้องรู้

### 4.1 ไม่พบสินค้า = `200` + `{ "data": [] }` (ห้ามส่ง 404)
ใช้กับ `GET /products/:id` ทั้งกรณีไม่พบและกรณี `id` ไม่ใช่ UUID ผลต่างกันตรงที่ **หน้ารายละเอียดต้องตรวจเอง** ว่าผลที่ได้เป็นสินค้าจริงหรือไม่ เช่น เช็กว่ามี `product_id` ในเนื้อหา ถ้ามีแค่ `data` ที่เป็น array ว่างให้แสดงหน้า "ไม่พบสินค้า" การตรวจแค่ HTTP status ไม่พอ เพราะเป็น `200` ทั้งคู่

### 4.2 ไม่มีข้อมูลติดต่อผู้ขายเด็ดขาด (FR-06)
`seller` ใน `GET /products/:id` มีเฉพาะ `user_id`, `full_name` (ย่อ), `faculty`, `created_at`, `active_listings` ไม่มี `phone_number`, `line_id`, `email`, `password_hash` มีทั้ง unit test และ Bruno คอยตรวจ ข้อมูลติดต่อต้องเรียกผ่าน `GET /products/:id/contact` ที่เป็นอีกงานหนึ่งเท่านั้น

### 4.3 ชื่อผู้ขายแสดงแบบย่อ
`"กันตภณ ชัยรุ่งปัญญา"` กลายเป็น `"กันตภณ ช."` ใช้ชื่อแรก บวกอักษรตัวแรกของคำสุดท้าย ถ้านามสกุลขึ้นต้นด้วยสระหน้า (เ แ โ ใ ไ) จะเก็บสระกับพยัญชนะถัดไปไว้ด้วย เช่น `"สมชาย เจริญ"` เป็น `"สมชาย เจ."` ชื่อคำเดียวส่งตามเดิม

### 4.4 `is_free` คำนวณในโค้ด
`is_free = (price === 0)` ตอนส่งข้อมูลออก ไม่มีคอลัมน์ในฐานข้อมูล `price` ส่งเป็นตัวเลข JSON (เช่น `250` ไม่ใช่ `"250.00"`)

### 4.5 `status` ของ `GET /products` ค่าเริ่มต้นคือ `available`
หน้ารายการจึงไม่แสดงของที่ `reserved` หรือ `sold` โดยอัตโนมัติ ต้องส่ง `status=all` หรือสถานะที่ต้องการเอง ส่วน `GET /products/:id` เปิดดูได้ทุกสถานะ (ลิงก์เก่าของสินค้าที่ขายแล้วยังใช้ได้)

### 4.6 `is_wishlisted` และ `is_owner`
- ผู้เยี่ยมชม (ไม่ล็อกอิน หรือ token เสีย) ได้ `false` ทั้งคู่
- ผู้ล็อกอิน: `is_owner` เป็น `true` เมื่อ `seller_id` ตรงกับ `user_id` ของ token, `is_wishlisted` ดูจากตาราง `wishlists`
- ใน `GET /products` ใช้ query เดียวสำหรับทั้งหน้า (ไม่ใช่ query ต่อสินค้าหนึ่งชิ้น)

### 4.7 `active_listings` ของผู้ขาย
นับสินค้าของผู้ขายที่ `status` เป็น `available` หรือ `reserved` (ค่า `ACTIVE_STATUSES` ใน `lib/constants.js`) นับแบบเดียวกับ `stats.active_listings` ของ `GET /auth/me`

### 4.8 `lib/products.js` ต้องไม่ import `lib/supabase.js`
`lib/supabase.js` มี `import 'server-only'` ซึ่งทำให้ `npm test` (node --test) โหลดไม่ได้ จึงแบ่งงานเป็นสองชั้น: `lib/products.js` เป็นฟังก์ชันล้วน (ทดสอบได้) ส่วนการ query ฐานข้อมูลอยู่ใน route ถ้าเพิ่มฟังก์ชันใหม่ในไฟล์นี้ ต้องรักษาข้อนี้ไว้

ฟังก์ชันที่ export: `PRODUCT_SELECT`, `isUuid`, `publicName`, `parseProductQuery`, `ilikeContains`, `applyProductFilters`, `buildPagination`, `toCard`, `toDetail` (และค่าคงที่ `ITEM_CONDITIONS`, `LIST_STATUS_FILTERS`, `SORTS`, `DEFAULT_PER_PAGE`, `MAX_PER_PAGE`, `EMPTY_LIST_MESSAGE`)

### 4.9 กับดักของ Supabase ที่จัดการแล้ว
| ปัญหา | วิธีจัดการ |
|---|---|
| ขอหน้าเกินจำนวนที่มี Supabase ตอบ error `PGRST103` | ดักไว้ ตอบ `data: []` และหา `total` จาก query ที่สองแบบ `head: true` |
| keyword ที่มี `, ( ) % _ "` ทำให้ `.or()` พัง (`PGRST100`) | ใช้ `ilikeContains` ครอบเครื่องหมายคำพูดและ escape ตัวอักษรพิเศษ ทดสอบกับข้อมูลจริงด้วยคำค้น `a,b(c) 50%_off` ได้ 1 รายการ (ไม่จับทุกแถว) |
| `id` ที่ไม่ใช่ UUID ทำ Postgres error `22P02` (กลายเป็น 500) | ตรวจด้วย regex ก่อน query |
| เรียงตามค่าที่เท่ากัน แล้วลำดับสลับระหว่างหน้า | เรียงต่อด้วย `product_id` เสมอ |

### 4.10 รูปแบบวันที่
`created_at` ส่งตามที่ Postgres คืนมา เช่น `2026-10-25T15:24:38.813034+00:00` (ไม่แปลงเป็นลงท้าย `Z`) เป็นเวลา UTC ตามเดิม ใช้ `new Date(value)` อ่านได้ปกติ

---

## 5. การตัดสินใจจากรีวิว

โจทย์ TASK-09 ระบุให้สินค้าไม่พบตอบ `200` พร้อม `data: []` ห้ามส่ง 404 ขณะที่ `AGENTS.md` (ก่อนแก้) กำหนดให้ `GET /products/:id` ตอบ `404 PRODUCT_NOT_FOUND` ฝั่งโค้ดแรกทำตาม `AGENTS.md` และแจ้งเป็นข้อสังเกตใน Pull Request

**ผลรีวิว (@wz):** ให้ใช้ `200 + { "data": [] }` และไม่ใช้ 404 จึงแก้ route กับ Bruno ใน commit `c916762` และแก้ `AGENTS.md` ตามหัวข้อ 2.3

---

## 6. การทดสอบ

| ชุดทดสอบ | คำสั่ง | ผล |
|---|---|---|
| Unit test | `npm test` | 34/34 (เดิม 17 + ใหม่ 17 ข้อใน `test/products.test.js`) |
| Bruno | `npm run test:api` | 28 requests, 29 tests ผ่านทั้งหมด (เดิม 13 + ใหม่ 15) |
| Build | `npm run build` | ผ่าน และทั้ง 4 route เป็น Dynamic (ƒ) |

Bruno ใหม่:

| ไฟล์ | ทดสอบอะไร |
|---|---|
| `14-pickup-locations` | 200 และมีรายการจุดนัดรับ |
| `15-categories` | 200, 6 หมวด, เรียงตาม seed |
| `16-products-list` | ค่าเริ่มต้น, รูปร่าง pagination, การ์ดไม่มีข้อมูลต้องห้าม (**บันทึก `productId` ไว้ให้ไฟล์ 25, 26 ใช้**) |
| `17-products-free-only` | `free_only=true` ได้เฉพาะของราคา 0 |
| `18-products-sort-and-cap` | `per_page=999` ถูกปัดเป็น 50, เรียงราคาน้อยไปมาก |
| `19-products-keyword-special-chars` | keyword ที่มีอักขระพิเศษไม่ทำให้ระบบ error |
| `20-products-empty` | ไม่พบ = 200 + `data: []` + `message` |
| `21-products-page-past-end` | หน้าเกินจำนวน = 200 + `data: []` |
| `22`, `23` | `sort` และ `page` ผิด = 422 + `field` |
| `24-products-logged-in` | ล็อกอินแล้ว `is_wishlisted` เป็น boolean |
| `25`, `26` | รายละเอียดสินค้า (ผู้เยี่ยมชม / ล็อกอิน) และตรวจว่า `seller` ไม่มีข้อมูลติดต่อ |
| `27`, `28` | UUID ที่ไม่มีในระบบ และ `not-a-uuid` = 200 + `{ data: [] }` |

ไฟล์ 25 และ 26 จะข้ามการตรวจเองถ้าฐานข้อมูลยังไม่มีสินค้า (ไม่ทำให้เทสต์ล้ม)

**ที่ทดสอบด้วยมือ (ยังไม่อยู่ใน Bruno):** กรณี `is_owner = true` และ `is_wishlisted = true` เพราะยังไม่มี API สร้างสินค้าหรือบันทึกรายการโปรด จึงสร้างข้อมูลผ่าน SQL แล้วตรวจผล เมื่อ TASK-12 และงานรายการโปรดเสร็จ ควรเพิ่ม Bruno สองกรณีนี้

วิธีรันซ้ำ: เปิด `npm run dev` ในหน้าต่างหนึ่ง แล้วรัน `npm test` และ `npm run test:api` ในอีกหน้าต่าง

---

## 7. ประเด็นที่ยังเปิดอยู่

- [ ] **route เขียนของ TASK-12:** `PATCH` และ `DELETE /products/:id` ใน `AGENTS.md` หัวข้อ 8 ยังระบุ `404 PRODUCT_NOT_FOUND` ตอนนี้แก้เฉพาะ `GET` ตามที่ได้รับการยืนยัน ขอให้ @wz ยืนยันว่า route เขียนจะใช้ 404 ตามเดิมหรือเปลี่ยนเป็นแบบเดียวกัน
- [ ] **TODO ใน `lib/constants.js`:** ชื่อ "โรงอาหารจุลจักร ชั้น 2 (Smo Cafe)" ยังไม่ตรงกับที่ SRS v2.0 เขียนไว้ ทีมต้องเลือกชื่อเดียวก่อนมีประกาศจริง (TASK-09 ไม่ได้แก้)
- [ ] **ช่องโหว่ของแพ็กเกจ:** `npm install` รายงาน 17 vulnerabilities (6 moderate, 11 high) ยังไม่มีใครตรวจรายละเอียด ไม่ควรรัน `npm audit fix --force` เพราะอาจทำให้เวอร์ชันแพ็กเกจเปลี่ยนและโปรเจกต์พัง
- [ ] **ข้อมูลทดสอบ:** มีสินค้า `[TEST-09] ...` 40 ชิ้น (และรูป/รายการโปรดที่ผูกอยู่) ในฐานข้อมูลกลาง ผูกกับผู้ใช้ `bruno.*` ต้องลบหลังรีวิวเสร็จ ด้วยคำสั่ง SQL `delete from public.products where title like '[TEST-09]%';` (รูปและรายการโปรดถูกลบตามด้วย cascade)

---

## 8. สำหรับคนที่ทำงานต่อ

**ทีมหน้าเว็บ (TASK-10 หน้า Home / หน้ารายละเอียด)**
- หน้ารายการใช้ `GET /products` ตามหัวข้อ 3.3 และใช้ `GET /categories` กับ `GET /pickup-locations` ทำตัวกรอง
- หน้ารายละเอียดต้องรองรับทั้งสองรูปแบบของผลลัพธ์ (ดูหัวข้อ 4.1)
- `primary_image_url` เป็น `null` ได้ (สินค้าที่ไม่มีรูป) และ `description` เป็น `null` ได้

**TASK-12 (สร้าง/แก้/ลบสินค้า)**
- นำ `PRODUCT_SELECT` และ `toDetail` จาก `lib/products.js` ไปใช้ซ้ำได้ ถ้าต้องส่งผลหลังสร้างหรือแก้
- เพิ่ม method `POST` ใน `app/api/v1/products/route.js` และ `PATCH`/`DELETE` ใน `app/api/v1/products/[id]/route.js` ร่วมกับ `GET` ที่มีอยู่ (ไม่สร้างไฟล์ใหม่ที่ชนกัน)
- ตรวจ `pickup_location` กับ `PICKUP_LOCATIONS` เหมือนที่ `GET /products` ทำ (code `INVALID_PICKUP_LOCATION`)
- เมื่อเพิ่มสินค้าได้แล้ว เพิ่ม Bruno กรณี `is_owner = true` และสร้างข้อมูลทดสอบผ่าน API แทนการใช้ SQL

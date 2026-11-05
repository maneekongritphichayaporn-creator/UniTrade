# TASK-15: Search & Filter — สรุปงานและหลักฐานการทดสอบ

เอกสารนี้ยืนยันว่า `GET /api/v1/products` ทำได้ครบตามใบงาน TASK-15 ชี้ว่าโค้ดแต่ละส่วนอยู่ที่ไหน ทดสอบด้วยอะไร และวัดเวลาตอบสนองได้เท่าไร

| หัวข้อ | รายละเอียด |
|---|---|
| รหัสงาน | TASK-15 (Search & Filter — Backend: Query Search ตามชื่อ & กรองหมวดหมู่) |
| Sprint | Sprint 2 (10–14 ตุลาคม 2569) |
| branch | `task-15-search-filter` |
| ผู้รับผิดชอบ | วซ -- Backend Lead |
| โค้ดค้นหาและตัวกรอง | เขียนโดย ภพ ใน TASK-09 (PR #1, merge 27 ตุลาคม 2569) |
| อ้างอิง | `AGENTS.md` หัวข้อ 7.4 และ 10, [`docs/TASK-09-CHANGELOG.md`](TASK-09-CHANGELOG.md) หัวข้อ 3.3, `supabase/migrations/0001_init.sql` |
| อัปเดตล่าสุด | 5 พฤศจิกายน 2569 |

---

## 1. ภาพรวม

`GET /api/v1/products` ที่ทำใน TASK-09 รองรับการค้นหาและตัวกรองครบตามใบงาน TASK-15 อยู่แล้ว งานนี้จึง **ไม่ได้เพิ่มหรือแก้โค้ดของ API** สิ่งที่เพิ่มคือ

- ตัวอย่าง query ใน Bruno 11 รายการ (`53`–`63`) ให้ครบทุกพารามิเตอร์ในใบงาน
- ผลวัดเวลาตอบสนองเทียบเกณฑ์ NFR 500 ms (หัวข้อ 4)
- เอกสารนี้ และแถว TASK-15 ใน `README.md`

---

## 2. เทียบกับเงื่อนไขในใบงาน

| เงื่อนไขในใบงาน | ทำอย่างไร (`lib/products.js`) | ทดสอบที่ |
|---|---|---|
| `keyword` ค้นจาก `title` และ `description` ไทย/อังกฤษ ไม่แยกตัวพิมพ์ | `ILIKE '%คำ%'` ทั้งสองคอลัมน์ใน `.or()` เดียว · `ilikeContains()` escape `% _ \` และครอบเครื่องหมายคำพูดกัน `, ( ) "` ทำ query พัง · ตัดช่องว่างหัวท้าย ยาวไม่เกิน 100 ตัวอักษร | unit test, Bruno 19, 20, 60, 61, 62 |
| ใช้ ILIKE ร่วมกับ Index | index `pg_trgm` แบบ GIN บน `title` และ `description` (หัวข้อ 3) | — |
| `category_id` หมวดเดียวหรือหลายหมวดคั่นด้วย `,` | `.in('category_id', ids)` · ทุกค่าต้องเป็น UUID ไม่งั้น 422 | unit test, Bruno 53, 54 |
| `min_price` / `max_price` | `.gte` / `.lte` · ต้องเป็นตัวเลข ≥ 0 และ min ≤ max ไม่งั้น 422 | unit test, Bruno 55, 56 |
| `status` ค่าเริ่มต้นเฉพาะ `available` | `available` (ค่าเริ่มต้น) · `reserved` · `sold` · `all` (ไม่กรอง) | unit test, Bruno 16, 59 |
| `pickup_location` | ต้องตรงกับ `PICKUP_LOCATIONS` ทุกตัวอักษร ไม่งั้น 422 `INVALID_PICKUP_LOCATION` | unit test, Bruno 57, 58 |
| `item_condition` | `new` · `like_new` · `good` · `fair` | unit test, Bruno 59 |
| `free_only` | `true` หรือ `1` → `price = 0` | unit test, Bruno 17 |
| เรียง `date_desc` · `date_asc` · `price_asc` · `price_desc` | ค่าเริ่มต้น `date_desc` · เรียงด้วย `product_id` ต่อท้ายเสมอ หน้าจึงไม่สลับเมื่อค่าเท่ากัน | unit test, Bruno 18, 22, 63 |
| ส่ง `total`, `total_pages` กลับมา | `count: 'exact'` ใน query เดียวกับ `.range()` · `total_pages = ceil(total / per_page)` (0 เมื่อไม่มีผล) · ขอหน้าเกินจำนวนได้ `data: []` ไม่ error | unit test, Bruno 16, 21, 23, 63 |

ตัวกรองทุกตัวสร้างในฟังก์ชันเดียว `applyProductFilters()` จึงใช้ร่วมกันได้ทั้ง query หลักและ query นับจำนวน

---

## 3. Index ที่ใช้

สร้างไว้แล้วใน `supabase/migrations/0001_init.sql` (บรรทัด 151–159) ไม่ต้องเพิ่ม migration

```sql
create index products_feed_idx     on public.products (status, created_at desc);
create index products_category_idx on public.products (category_id);
create index products_price_idx    on public.products (price);
create index products_pickup_idx   on public.products (pickup_location);

-- keyword search แบบ case-insensitive (UC-04) — trigram เพราะ Postgres ไม่มีตัวตัดคำไทย
create index products_title_trgm_idx on public.products using gin (title gin_trgm_ops);
create index products_desc_trgm_idx  on public.products using gin (description gin_trgm_ops);
```

เลือก trigram (`pg_trgm`) แทน Full-text Search เพราะ Full-text Search ของ Postgres ต้องตัดคำ และไม่มีตัวตัดคำภาษาไทย ส่วน trigram ใช้กับ `ILIKE '%คำ%'` ได้ทั้งไทยและอังกฤษ

ข้อจำกัด: คำค้นที่สั้นกว่า 3 ตัวอักษรใช้ trigram index ไม่ได้ Postgres จะอ่านทั้งตาราง ซึ่งไม่เป็นปัญหาที่ขนาดข้อมูลของโปรเจกต์นี้

---

## 4. เวลาตอบสนอง (เกณฑ์ NFR ≤ 500 ms)

วัดเมื่อ 5 พฤศจิกายน 2569 ด้วย `next start` (build แบบ production) บนเครื่องพัฒนา ต่อ Supabase ตัวจริงของทีม ยิงแต่ละ query 6 ครั้ง ไม่นับครั้งแรก

| Query | เฉลี่ย | ช้าสุด |
|---|---|---|
| ค่าเริ่มต้น (`/products`) | 193 ms | 250 ms |
| `keyword=calculus` | 188 ms | 248 ms |
| `keyword=หนังสือ` | 214 ms | 257 ms |
| keyword มีอักขระพิเศษ `,()%_"` | 209 ms | 296 ms |
| `category_id` 2 หมวด | 269 ms | 460 ms |
| ช่วงราคา + สภาพ + `sort=price_asc` | 208 ms | 281 ms |
| `free_only=true&status=all` | 314 ms | 476 ms |
| ทุกตัวกรองพร้อมกัน | 232 ms | 281 ms |
| ขอหน้าเกินจำนวน (`page=999`) | 481 ms | 513 ms |

ทุก query ผ่านเกณฑ์ ยกเว้นกรณีขอหน้าเกินจำนวนที่ช้าสุดเกิน 500 ms เล็กน้อย เพราะต้องยิง 2 query (Supabase ตอบ `PGRST103` แล้วต้องนับจำนวนใหม่ ดู `AGENTS.md` หัวข้อ 10 ข้อ 1) กรณีนี้หน้าเว็บไม่ได้ใช้ตามปกติ

**ข้อควรรู้:** ตอนวัด ฐานข้อมูลยังไม่มีสินค้า (0 รายการ) ตัวเลขข้างบนจึงส่วนใหญ่เป็นเวลาเดินทางระหว่างเครื่องพัฒนากับ Supabase ยังไม่ใช่ภาระของการค้นหาจริง ควรวัดซ้ำเมื่อมีสินค้าจริง หรือบน Vercel หลัง deploy (TASK-23)

---

## 5. ตัวอย่าง query (Bruno แทน Postman)

ทีมใช้ Bruno แทน Postman (`AGENTS.md` หัวข้อ 9.2) ตัวอย่างทั้งหมดอยู่ในโฟลเดอร์ `bruno/` รันด้วย `npm run test:api` หรือเปิดในแอป Bruno ถ้าต้องการไฟล์ Postman แอป Bruno export collection เป็นรูปแบบ Postman ได้

| ไฟล์ | ตัวอย่าง |
|---|---|
| `16-products-list` | ค่าเริ่มต้น: หน้า 1, 20 รายการ, เฉพาะ `available`, `total_pages` ถูกต้อง |
| `17-products-free-only` | `free_only=true` |
| `18-products-sort-and-cap` | `sort=price_asc` และ `per_page=999` ถูกจำกัดที่ 50 |
| `19-products-keyword-special-chars` | keyword มี `, ( ) % _ " \` ไม่ทำให้ระบบ error |
| `20-products-empty` | ไม่พบผล → `200` + `data: []` + ข้อความ |
| `21-products-page-past-end` | ขอหน้าเกินจำนวน → `data: []` |
| `22-products-invalid-sort` / `23-products-invalid-page` | ค่าผิด → 422 |
| `24-products-logged-in` | ล็อกอินแล้วได้ `is_wishlisted` |
| **`53-products-category-single`** | หมวดเดียว |
| **`54-products-category-multi`** | หลายหมวดคั่นด้วย `,` |
| **`55-products-price-range`** | `min_price=100&max_price=500` |
| **`56-products-price-min-over-max`** | min มากกว่า max → 422 field `min_price` |
| **`57-products-pickup-location`** | จุดนัดรับ `ศาลาพระเกี้ยว` |
| **`58-products-invalid-pickup-location`** | จุดนัดรับที่ไม่มีในรายการ → 422 `INVALID_PICKUP_LOCATION` |
| **`59-products-status-and-condition`** | `status=sold&item_condition=like_new` |
| **`60` / `61-products-keyword-…case`** | `calculus` กับ `CALCULUS` ต้องได้จำนวนเท่ากัน (ไม่แยกตัวพิมพ์) |
| **`62-products-keyword-thai`** | keyword ภาษาไทย `หนังสือ` |
| **`63-products-all-filters`** | ทุกตัวกรองพร้อมกัน + `sort=price_desc` + `per_page=10` |

ตัวหนา = เพิ่มใน TASK-15 · ทุกรายการเป็น GET อ่านอย่างเดียว ไม่สร้างข้อมูลในฐานข้อมูล

ผลรันรายการ 53–63 เมื่อ 5 พฤศจิกายน 2569: **11/11 requests, 12/12 tests ผ่าน** ตอนนั้นฐานข้อมูลยังไม่มีสินค้า การตรวจแบบ "ทุกรายการต้องตรงตัวกรอง" จึงยังไม่มีรายการให้ตรวจจริง จะมีผลเต็มที่เมื่อมีสินค้า

---

## 6. การเปลี่ยนแปลงเทียบกับ `main`

| ประเภท | จำนวน | รายละเอียด |
|---|---|---|
| **เพิ่ม** | 12 ไฟล์ | Bruno 11 ไฟล์ (`53`–`63`) และเอกสารนี้ |
| **แก้** | 1 ไฟล์ | `README.md` แถว TASK-15 (ผู้รับผิดชอบและสถานะ) |
| **โค้ด API** | ไม่แก้ | `lib/products.js` และ `app/api/v1/products/route.js` เหมือนเดิม |

---

## 7. ประเด็นที่ยังเปิดอยู่

- [ ] **วัดเวลาซ้ำเมื่อมีสินค้าจริง** หรือบน Vercel หลัง deploy (TASK-23) เพื่อยืนยันเกณฑ์ 500 ms กับข้อมูลจริง
- [ ] **ไฟล์ Postman:** ถ้าผู้ตรวจต้องการไฟล์ Postman จริง ให้ export จากแอป Bruno แล้วเก็บไว้ใน repo

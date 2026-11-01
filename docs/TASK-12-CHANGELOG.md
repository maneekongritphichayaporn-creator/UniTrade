# TASK-12: Product CRUD + Image Upload — สรุปการเปลี่ยนแปลงและสิ่งที่ต้องรู้

เอกสารนี้อธิบายว่า TASK-12 เพิ่มหรือเปลี่ยนอะไรในโปรเจกต์ (เทียบกับ `main` หลัง merge TASK-09) หน้าตาของ API ที่เพิ่มเข้ามา และสิ่งที่ทีมต้องรู้ก่อนใช้งานหรือทำงานต่อ

| หัวข้อ | รายละเอียด |
|---|---|
| รหัสงาน | TASK-12 (Sprint 1) |
| branch | `feature/TASK-12-product-crud` |
| Pull Request | #2 (รอ @wz รีวิว) |
| อ้างอิง | `AGENTS.md` หัวข้อ 8–10, TASK-04 (Storage bucket), TASK-05 (API Spec) |
| อัปเดตล่าสุด | 1 พฤศจิกายน 2569 |

---

## 1. ภาพรวม

| Endpoint | หน้าที่ | สิทธิ์ |
|---|---|---|
| `POST /api/v1/products` | ลงประกาศพร้อมรูป 1–5 รูป (`multipart/form-data`) | สมาชิกที่ล็อกอิน |
| `PATCH /api/v1/products/:id` | แก้ไขข้อมูลประกาศ (JSON) | เจ้าของประกาศ |
| `PATCH /api/v1/products/:id/status` | เปลี่ยนสถานะ available / reserved / sold | เจ้าของประกาศ |
| `DELETE /api/v1/products/:id` | ลบประกาศ และลบไฟล์รูปใน Storage | เจ้าของประกาศ |

ทุก endpoint ใช้ `requireAuth` ไม่มี token ได้ `401 UNAUTHORIZED`

---

## 2. การเปลี่ยนแปลงเทียบกับ `main`

### 2.1 สรุป

| ประเภท | จำนวน | รายละเอียด |
|---|---|---|
| **เพิ่ม** | 19 ไฟล์ | `lib/product-images.js`, `test/product-images.test.js`, `app/api/v1/products/[id]/status/route.js`, Bruno 13 ไฟล์ (29–41), รูปทดสอบ 3 ไฟล์ใน `bruno/fixtures/` |
| **แก้** | 4 ไฟล์ | `lib/products.js`, `test/products.test.js`, `app/api/v1/products/route.js`, `app/api/v1/products/[id]/route.js` |
| **ลบ** | 0 ไฟล์ | — |
| ไม่แตะ | — | `package.json`, `package-lock.json`, `.env.example`, `lib/http.js`, `lib/auth.js`, `lib/supabase.js`, `lib/validation.js`, `lib/users.js`, migrations |

ไม่ติดตั้งไลบรารีเพิ่ม (`@supabase/supabase-js` อัปโหลดไฟล์ได้อยู่แล้ว และ `crypto.randomUUID()` มีใน Node)

### 2.2 ไฟล์ที่เพิ่มหรือแก้

| ไฟล์ | การเปลี่ยนแปลง |
|---|---|
| `lib/product-images.js` (ใหม่) | `sniffImageType`, `validateImages`, `imagePath`, `removeProductFolder` และค่าคงที่ `MAX_IMAGES`, `MAX_FILE_BYTES`, `MAX_TOTAL_BYTES` |
| `lib/products.js` | เพิ่ม `validateProductInput`, `fetchProductDetail`, `requireOwnedProduct`, `validateStatusInput`, `statusLabel` |
| `app/api/v1/products/route.js` | เพิ่ม `POST` ข้าง `GET` ของ TASK-09 |
| `app/api/v1/products/[id]/route.js` | เพิ่ม `PATCH` และ `DELETE` และให้ `GET` ใช้ `fetchProductDetail` (**พฤติกรรมของ GET ไม่เปลี่ยน** Bruno 25–28 ยังผ่าน) |
| `app/api/v1/products/[id]/status/route.js` (ใหม่) | `PATCH` เปลี่ยนสถานะ |
| `test/product-images.test.js` (ใหม่), `test/products.test.js` | unit test 16 ข้อใหม่ |
| `bruno/29-…` ถึง `bruno/41-…`, `bruno/fixtures/` | ชุดทดสอบ API และรูปทดสอบ |

### 2.3 ประวัติ commit

| Commit | เนื้อหา |
|---|---|
| `3294731` | `feat(api): add image validation with byte sniffing and unit tests (TASK-12)` |
| `c446673` | `feat(api): add listing input validation and shared detail loader (TASK-12)` |
| `7da4a27` | `feat(api): add POST /products with image upload and cleanup (TASK-12)` |
| `d206c23` | `feat(api): add product edit, status change and delete with owner check (TASK-12)` |
| `cc9413e` | `test(api): add Bruno requests for product create, edit, status and delete (TASK-12)` |
| *(commit ถัดไป)* | `docs(api): add TASK-12 change notes (TASK-12)` เพิ่มเอกสารนี้ |

---

## 3. หน้าตาของ API

### 3.1 `POST /products`

ส่งแบบ `multipart/form-data` พร้อม `Authorization: Bearer <token>`

| ฟิลด์ | บังคับ | กติกา |
|---|---|---|
| `title` | ใช่ | 3–255 ตัวอักษร (ตัดช่องว่างหัวท้าย) |
| `description` | ไม่ | ไม่เกิน 2000 ตัวอักษร ค่าว่างเก็บเป็น `null` |
| `category_id` | ใช่ | UUID ของหมวดหมู่ที่มีอยู่จริง |
| `item_condition` | ใช่ | `new`, `like_new`, `good`, `fair` |
| `price` | ใช่ | 0–999999.99 ทศนิยมไม่เกิน 2 ตำแหน่ง (0 = แจกฟรี) |
| `pickup_location` | ใช่ | ต้องตรงกับ `PICKUP_LOCATIONS` |
| `images` (หรือ `images[]`) | ใช่ | ส่งซ้ำได้ 1–5 ไฟล์ ดูกติกาในหัวข้อ 4.2 |

ผลลัพธ์ **201**: รายละเอียดประกาศรูปแบบเดียวกับ `GET /products/:id` พร้อม `"message": "ลงประกาศสำเร็จ"` (`is_owner: true`, `status: "available"`, `images[0].is_primary: true`)

### 3.2 `PATCH /products/:id`

JSON แก้ได้ 6 ช่องเดียวกับ POST ยกเว้นรูป ตรวจเฉพาะช่องที่ส่งมา ช่องอื่นรวมถึง `status` และ `seller_id` **ถูกข้ามเงียบๆ** ส่ง `{}` ได้รายละเอียดเดิมกลับมา ผลลัพธ์ **200** เป็นรายละเอียดประกาศ

```json
{ "title": "CALCULUS I (edited)", "price": 199.5 }
```

### 3.3 `PATCH /products/:id/status`

```json
{ "status": "reserved" }
```
ผลลัพธ์ **200**:
```json
{ "product_id": "uuid", "status": "reserved", "message": "อัปเดตสถานะเป็น Reserved แล้ว" }
```
เปลี่ยนไปมาระหว่าง 3 สถานะได้อิสระ ค่าอื่นได้ `422 INVALID_STATUS` field `status`

### 3.4 `DELETE /products/:id`

ผลลัพธ์ **204** ไม่มีเนื้อหา หลังลบ `GET /products/:id` ได้ `200 + { "data": [] }` และลบซ้ำได้ `404 PRODUCT_NOT_FOUND`

### 3.5 รหัสข้อผิดพลาดที่ใช้

| code | status | เมื่อ |
|---|---|---|
| `INVALID_PAYLOAD` | 400 | POST ไม่ใช่ multipart / PATCH ไม่ใช่ JSON object |
| `UNAUTHORIZED`, `TOKEN_EXPIRED` | 401 | ไม่มี token หรือ token ใช้ไม่ได้ |
| `NOT_OWNER` | 403 | ไม่ใช่เจ้าของประกาศ |
| `PRODUCT_NOT_FOUND` | 404 | ไม่พบประกาศ หรือ `id` ไม่ใช่ UUID (**เฉพาะ route เขียน** ส่วน GET ยังตอบ `200 + { data: [] }`) |
| `FILE_TOO_LARGE` | 413 | รูปใดเกิน 2 MB หรือรวมเกิน 4 MB |
| `VALIDATION_ERROR` | 422 | ข้อมูลผิด พร้อม `field` |
| `NO_IMAGE`, `TOO_MANY_IMAGES` | 422 | ไม่มีรูป / เกิน 5 รูป |
| `UNSUPPORTED_FILE_TYPE` | 422 | ไฟล์ไม่ใช่ JPEG หรือ PNG จริง |
| `INVALID_PICKUP_LOCATION` | 422 | จุดนัดรับไม่อยู่ในรายการ |
| `INVALID_STATUS` | 422 | สถานะไม่ใช่ available / reserved / sold |

---

## 4. สิ่งที่ต้องรู้

### 4.1 ลำดับการตรวจของ route ที่มี `:id`
`id` ผิดรูปแบบหรือไม่พบ → **404** แล้วจึง ไม่ใช่เจ้าของ → **403** แล้วจึง body ผิด → **422** ดังนั้นคนที่ไม่ใช่เจ้าของจะได้ 403 เสมอ แม้ส่งข้อมูลผิดมาด้วย ทั้งหมดอยู่ใน `requireOwnedProduct` ใช้ร่วมกันทุก route

### 4.2 กติการูป
- 1–5 รูป, ไม่เกิน 2 MB ต่อรูป และ **รวมไม่เกิน 4 MB** (Vercel ปฏิเสธคำขอเกิน 4.5 MB)
- ชนิดไฟล์ **ดูจากไบต์แรก** (JPEG `FF D8 FF`, PNG `89 50 4E 47 0D 0A 1A 0A`) ไม่ดูนามสกุลหรือ `file.type` ไฟล์ข้อความที่ตั้งชื่อ `.jpg` จึงถูกปฏิเสธ
- **รูปแรกที่ส่ง (index 0) เป็นรูปหลัก** ไม่มีฟิลด์ `primary_image_index`
- ไฟล์ที่ขนาด 0 ถูกข้าม
- ตรวจครบทุกข้อ **ก่อนแตะฐานข้อมูล** คำขอที่ผิดจึงไม่ทิ้งแถวหรือไฟล์

### 4.3 ที่เก็บไฟล์
Bucket `product-images` (public, 2 MB, `image/jpeg` และ `image/png`) ตำแหน่งไฟล์คือ `<product_id>/<image_id>.<jpg|png>` หนึ่งโฟลเดอร์ต่อหนึ่งประกาศ และ `image_url` ที่บันทึกเป็น URL สาธารณะ เปิดจากหน้าเว็บได้โดยตรง

### 4.4 ไม่มี transaction ระหว่างฐานข้อมูลกับ Storage
- **POST:** สร้างแถวประกาศ → อัปรูปทีละไฟล์ → บันทึกแถวรูปในคำสั่งเดียว ถ้าขั้นอัปรูปหรือบันทึกแถวรูปพัง จะลบไฟล์ที่อัปแล้วและลบแถวประกาศ แล้วส่งข้อผิดพลาดต้นเหตุกลับ
- **DELETE:** ลบแถวก่อน (แถวรูปและรายการโปรดถูกลบตามด้วย cascade) แล้ว `list(product_id)` + `remove` ไฟล์ทั้งโฟลเดอร์ ถ้าลบไฟล์ไม่สำเร็จจะ `console.error` แล้วยังตอบ 204

### 4.5 สิ่งที่ผู้ส่งกำหนดเองไม่ได้
`seller_id` มาจาก token, `status` ตอนสร้างเป็น `available` เสมอ, PATCH เปลี่ยน `status` ไม่ได้ (ต้องใช้ `/status`), รูปของประกาศเดิมแก้ไม่ได้ (ลบแล้วลงใหม่)

### 4.6 ไฟล์ใน `lib/` ยังไม่ import `lib/supabase.js`
`fetchProductDetail`, `requireOwnedProduct` และ `removeProductFolder` รับ client หรือ bucket เป็นพารามิเตอร์ `npm test` จึงยังโหลดไฟล์ได้ (`server-only` ทำงานนอก Next.js ไม่ได้)

---

## 5. การทดสอบ

| ชุดทดสอบ | ผล |
|---|---|
| `npm test` | 50/50 (ใหม่ 16 ข้อ) |
| `npm run test:api` | 41/41 requests, 42/42 tests (ใหม่ 13 requests) |
| `npm run build` | ผ่าน มี route `/api/v1/products/[id]/status` |
| ทดสอบด้วยมือ | 20 กรณีผ่าน รวมเปิดรูปจาก URL และนับไฟล์ใน Storage หลังลบได้ 0 |

| Bruno | ทดสอบ |
|---|---|
| 29 | ลงประกาศ 2 รูป → 201 รูปแรกเป็นรูปหลัก (เก็บ `product_id`) |
| 30–32 | `NO_IMAGE`, `UNSUPPORTED_FILE_TYPE` (`fixtures/fake.jpg`), `INVALID_PICKUP_LOCATION` |
| 33–35 | แก้ไข (สถานะไม่เปลี่ยน), เปลี่ยนสถานะ, `INVALID_STATUS` |
| 36–37 | สมัครและล็อกอินผู้ใช้คนที่สอง (`bruno.*`, เก็บ `token2`) |
| 38–39 | ผู้ใช้คนที่สองแก้ไขและลบ → `403 NOT_OWNER` |
| 40–41 | เจ้าของลบ → 204 และรายละเอียดหลังลบ → `200 + { data: [] }` |

ชุดทดสอบจบด้วยการลบประกาศผ่าน API จึงลบไฟล์ใน Storage ทุกรอบ หลังรันแล้วใช้คำสั่งล้างของ README ได้:
```sql
delete from public.users where email like 'bruno.%@student.chula.ac.th';
```
**ถ้าการรันหยุดกลางทาง** ให้ตรวจ `select count(*) from public.products;` ก่อน ถ้าไม่ใช่ 0 ให้ลบประกาศผ่าน `DELETE /api/v1/products/:id` ก่อนลบผู้ใช้ เพราะการลบผู้ใช้ไม่ลบไฟล์ใน Storage

---

## 6. ประเด็นที่ยังเปิดอยู่

- [ ] **โครงโฟลเดอร์ Backend:** เอกสาร Git Workflow ให้ Backend อยู่ใน `backend/` (Express) แต่โค้ดจริงใช้ `app/api/v1` + `lib/` ตาม TASK-06/09 งานนี้ทำต่อในโครงเดิม รอ @wz ยืนยัน
- [ ] **ชื่อ branch:** `AGENTS.md` ยังเขียน `task-12-product-crud` ส่วน Git Workflow ใช้ `feature/TASK-12-…`
- [ ] **เส้นทางลบไฟล์เมื่อ POST ล้มเหลว** ยังไม่ได้ทดสอบ (ต้องทำให้ Storage ล้มเหลวจริง)
- [ ] **Bruno 16–18, 24–26 (TASK-09)** ตรวจได้น้อยเมื่อฐานข้อมูลไม่มีสินค้า เพราะไฟล์ 29 ที่สร้างสินค้ารันทีหลัง

---

## 7. สำหรับคนที่ทำงานต่อ

**ทีมหน้าเว็บ (TASK-13 ฟอร์มลงประกาศและแก้ไข)**
- ส่งรูปด้วยชื่อช่อง `images` ซ้ำได้หลายครั้ง ลำดับที่ส่งคือลำดับรูป รูปแรกเป็นรูปหลัก
- **ย่อรูปฝั่งเบราว์เซอร์ให้รวมไม่เกิน 4 MB** (แนะนำด้านยาว ~1600 px บันทึกเป็น JPEG) ไม่อย่างนั้นบน production จะถูกปฏิเสธ
- ใช้ `error.code` ตัดสินใจ และ `error.field` วางข้อความใต้ช่องที่ผิด
- ฟอร์มแก้ไขใช้ `PATCH /products/:id` แบบ JSON และแก้รูปไม่ได้ ส่วนปุ่มเปลี่ยนสถานะใช้ `/status`

**Backend (งานถัดไป เช่น admin ลบประกาศ)**
- ใช้ `removeProductFolder(supabase.storage.from(PRODUCT_IMAGES_BUCKET), id)` หลังลบแถว เพื่อไม่ทิ้งไฟล์ขยะ
- ใช้ `fetchProductDetail` เมื่อต้องส่งรายละเอียดประกาศกลับ

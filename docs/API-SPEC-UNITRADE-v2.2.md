# UniTrade — API Specification v2.2 (TASK-05)

| | |
|---|---|
| **Sprint** | 0 |
| **ผู้จัดทำ** | วซ — Backend Lead |
| **วันที่** | 10 กันยายน 2026 · ปรับปรุง 13 กันยายน 2026 |
| **เวอร์ชัน** | 2.2 — ตรงกับ ER Diagram, Sequence Diagram UC-01 … UC-07, Data Dictionary และมติทีม 13 ก.ย. 2026 |
| **สถานะ** | Draft for review — FE Lead (ยัต), FE Dev (มิก), BE Dev (ภพ) |
| **อ้างอิง** | ER Diagram + Sequence Diagram (ถือเป็นข้อกำหนดหลัก), SRS v1.0 §3.2–3.3 |

> **สิ่งที่เปลี่ยนจาก v1.0** — v1.0 ออกแบบให้ใช้ Supabase Auth จัดการรหัสผ่านและ token
> v2.0 ยึดตามไดอะแกรมของทีม คือ **backend ของเราเป็นคน hash รหัสผ่านและออก JWT เอง**
> ตามที่ ERD มีคอลัมน์ `password_hash` และ UC-01 มีขั้น "Generate Token" ที่ฝั่ง Backend/API
> ชื่อฟิลด์ทุกตัวใน response เปลี่ยนมาใช้ชื่อเดียวกับ ERD แล้ว

---

> **สิ่งที่เปลี่ยนใน v2.2 (มติทีม 13 ก.ย. 2026)** — เพิ่ม `GET /faculties` และฟิลด์ `faculty` ·
> ปฏิเสธจุดนัดรับที่ไม่อยู่ในรายการ · `DELETE /admin/products/:id` ปิดรายงานที่ค้างทั้งหมดเป็น `actioned` ก่อนลบประกาศ
> และระบุลำดับการลบไฟล์ใน Storage · รายละเอียดอยู่ในหัวข้อ 13

---

## สถานะการพัฒนาเทียบกับ spec (ตรวจกับโค้ดบน `main` 15 พ.ย. 2569)

พัฒนาแล้ว **20 จาก 22 endpoint** ในหัวข้อ 2 ส่วนที่ยังไม่มี API

| # | Endpoint | สถานะ |
|---|---|---|
| 14 | `GET /me/products` (UC-03) | **ยังไม่มี** — หน้า "ประกาศของฉัน" ดึง `GET /products?status=all` ทีละหน้าแล้วกรองตามผู้ขายในเบราว์เซอร์แทน |
| 15 | `GET /products/:id/contact` (FR-06) | **ยังไม่มี** — ปุ่มติดต่อผู้ขายทำงานได้เฉพาะโหมดข้อมูลจำลอง (mock) |

ส่วนที่โค้ดต่างจาก spec ฉบับนี้

| หัวข้อ | spec | โค้ดจริง |
|---|---|---|
| §1.5 รหัสข้อผิดพลาด | — | เพิ่ม `REPORT_NOT_FOUND` และ `REPORT_ALREADY_RESOLVED` ใน TASK-19 (อยู่ในตาราง §1.5 แล้ว) |
| §1.6 Rate limit | `429 RATE_LIMITED` | ยังไม่ได้ทำ |
| §5.2 `GET /products/:id` ไม่พบสินค้า | ไม่ได้ระบุ | `200` + `{ "data": [] }` (ตัดสินในรีวิว TASK-09) |
| §9.1 `POST /products/:id/wishlist` | `{ product_id, action, is_wishlisted, message }` | `{ action }` |
| §9.2 `GET /me/wishlist` | รายการพร้อม `wishlist_id`, `saved_at` และ `pagination` | การ์ดสินค้าแบบเดียวกับ `GET /products` ไม่มี `pagination` |
| §11.1 `GET /admin/reports` | มี `summary`, `product.total_reports`, `product.pickup_location` และ email ของผู้รายงาน/ผู้ขาย | ยังไม่มีฟิลด์เหล่านี้ |
| §11.2 `DELETE /admin/products/:id` | `200` พร้อม body | `204` ไม่มี body |

---

## 1. ข้อตกลงร่วม (Conventions)

| หัวข้อ | ค่าที่ใช้ |
|---|---|
| Base URL (dev) | `http://localhost:3000/api/v1` |
| Base URL (prod) | `https://unitrade.vercel.app/api/v1` |
| Protocol | HTTPS / TLS 1.3 บน production |
| Content-Type | `application/json; charset=utf-8` ยกเว้น `POST /products` ที่เป็น `multipart/form-data` |
| Auth header | `Authorization: Bearer <token>` |
| วันเวลา | ISO 8601 UTC เช่น `2026-09-10T14:32:00Z` |
| เงิน | ตัวเลข ไม่ใช่ string เช่น `250.00` |

### 1.1 สถาปัตยกรรมตามไดอะแกรม

ทุก Sequence Diagram วาดเส้นเหมือนกันหมด: **User → UI → Backend/API → Database**
ไม่มีเส้นไหนที่ UI ยิงตรงเข้า Database ดังนั้น

- ฐานข้อมูลถูกปิดตายจากภายนอก ทุกตารางเปิด RLS โดยไม่มี policy และถอนสิทธิ์ `anon` / `authenticated` ทิ้ง
- backend เข้าถึงฐานข้อมูลด้วย `service_role` key ฝั่งเซิร์ฟเวอร์เท่านั้น
- การตรวจสิทธิ์ทั้งหมด (เช่น "Validate Status & Ownership" ใน UC-03) อยู่ที่ชั้น API
- FE ห้ามสร้าง Supabase client ในเบราว์เซอร์ และตัวแปร Supabase ห้ามขึ้นต้นด้วย `NEXT_PUBLIC_` เพราะ Next.js จะฝังตัวแปรนั้นลงในโค้ดฝั่งเบราว์เซอร์
- ทุก route ต้องผ่านตัวตรวจ JWT ตัวเดียวกัน — `service_role` ข้ามทุกสิทธิ์ ถ้า route ไหนลืมตรวจ ข้อมูลทั้งฐานข้อมูลจะเปิด

### 1.2 Response สำเร็จ

```json
{
  "data": [ { "product_id": "…" } ],
  "pagination": { "page": 1, "per_page": 20, "total": 137, "total_pages": 7 }
}
```

รายการเดี่ยวคืน object ตรง ๆ ไม่ต้องห่อ

### 1.3 Response ผิดพลาด

```json
{
  "error": {
    "code": "NON_CU_EMAIL",
    "message": "อนุญาตเฉพาะอีเมล @student.chula.ac.th หรือ @chula.ac.th",
    "field": "email"
  }
}
```

### 1.4 HTTP Status

| Status | ใช้เมื่อ |
|---|---|
| 200 | สำเร็จ |
| 201 | สร้างข้อมูลใหม่สำเร็จ |
| 204 | สำเร็จ ไม่มี body |
| 400 | payload ผิดรูปแบบ |
| 401 | ไม่มี token / token หมดอายุ / รหัสผ่านผิด |
| 403 | login แล้วแต่ไม่มีสิทธิ์ |
| 404 | ไม่พบข้อมูล |
| 409 | ข้อมูลชนกัน |
| 413 | ไฟล์เกิน 2MB |
| 422 | ไม่ผ่าน validation |
| 429 | เกิน rate limit |
| 500 | ข้อผิดพลาดฝั่งเซิร์ฟเวอร์ |

### 1.5 Error Code Catalog

| code | status | ความหมาย | มาจาก |
|---|---|---|---|
| `NON_CU_EMAIL` | 422 | อีเมลไม่ใช่โดเมนจุฬาฯ | UC-01 |
| `WEAK_PASSWORD` | 422 | รหัสผ่านสั้นกว่า 8 ตัวอักษร | UC-01 |
| `MISSING_CONTACT` | 422 | ไม่กรอกทั้งเบอร์และ LINE ID | UC-01 |
| `INVALID_FACULTY` | 422 | ไม่เลือกคณะ คณะไม่อยู่ในรายการ หรือเลือก "อื่น ๆ" แต่ไม่ระบุ | UC-01 |
| `EMAIL_TAKEN` | 409 | อีเมลนี้สมัครแล้ว | UC-01 |
| `INVALID_CREDENTIALS` | 401 | อีเมลหรือรหัสผ่านไม่ถูกต้อง | UC-01 |
| `TOKEN_EXPIRED` | 401 | token หมดอายุ ให้ล็อกอินใหม่ | UC-01 |
| `NOT_OWNER` | 403 | ไม่ใช่เจ้าของประกาศ | UC-03 |
| `ADMIN_REQUIRED` | 403 | ต้องเป็นผู้ดูแลระบบ | UC-07 |
| `PRODUCT_NOT_FOUND` | 404 | ไม่พบสินค้า | UC-03 |
| `NO_IMAGE` | 422 | ไม่แนบรูปเลย (ต้องมี 1–5 รูป) | UC-02 |
| `TOO_MANY_IMAGES` | 422 | รูปเกิน 5 รูป | UC-02 |
| `FILE_TOO_LARGE` | 413 | ไฟล์เกิน 2MB | UC-02 |
| `UNSUPPORTED_FILE_TYPE` | 422 | ไม่ใช่ .jpg / .jpeg / .png | UC-02 |
| `INVALID_PICKUP_LOCATION` | 422 | จุดนัดรับไม่อยู่ในรายการ `GET /pickup-locations` | UC-02 |
| `INVALID_STATUS` | 422 | สถานะไม่ใช่ Available / Reserved / Sold | UC-03 |
| `INVALID_REPORT_REASON` | 422 | เหตุผลรายงานไม่ถูกต้องหรือไม่ได้เลือก | UC-06 |
| `SELF_REPORT` | 422 | รายงานประกาศของตัวเอง | UC-06 |
| `DUPLICATE_REPORT` | 409 | รายงานประกาศนี้ไปแล้ว | UC-06 |
| `REPORT_NOT_FOUND` | 404 | ไม่พบรายงาน หรือรหัสรายงานไม่ใช่ UUID | UC-07 |
| `REPORT_ALREADY_RESOLVED` | 409 | รายงานไม่ใช่ `pending` แล้ว (ยกเลิกหรือดำเนินการไปแล้ว) | UC-07 |
| `RATE_LIMITED` | 429 | ยิงถี่เกินเพดาน | NFR |

### 1.6 Rate Limit

| กลุ่ม endpoint | เพดาน |
|---|---|
| `POST /auth/register`, `POST /auth/login` | 5 ครั้ง / 15 นาที / IP |
| `POST /products` | 20 ครั้ง / ชั่วโมง / user |
| `POST /products/:id/reports` | 10 ครั้ง / วัน / user |
| อ่านข้อมูลทั่วไป | 120 ครั้ง / นาที / IP |

---

## 2. สรุป Endpoint ทั้งหมด

| # | Method | Path | สิทธิ์ | UC |
|---|---|---|---|---|
| 1 | POST | `/auth/register` | ทุกคน | UC-01 |
| 2 | POST | `/auth/login` | ทุกคน | UC-01 |
| 3 | GET | `/auth/me` | สมาชิก | UC-01 |
| 4 | PATCH | `/auth/me` | สมาชิก | — |
| 5 | GET | `/faculties` | ทุกคน | UC-01 |
| 6 | GET | `/categories` | ทุกคน | UC-04 |
| 7 | GET | `/pickup-locations` | ทุกคน | UC-02 |
| 8 | GET | `/products` | ทุกคน | UC-04 |
| 9 | GET | `/products/:id` | ทุกคน | UC-05 |
| 10 | POST | `/products` | สมาชิก | UC-02 |
| 11 | PATCH | `/products/:id` | เจ้าของ | — |
| 12 | PATCH | `/products/:id/status` | เจ้าของ | UC-03 |
| 13 | DELETE | `/products/:id` | เจ้าของ | — |
| 14 | GET | `/me/products` | สมาชิก | UC-03 |
| 15 | GET | `/products/:id/contact` | สมาชิก | FR-06 |
| 16 | POST | `/products/:id/wishlist` | สมาชิก | UC-05 |
| 17 | GET | `/me/wishlist` | สมาชิก | FR-07 |
| 18 | DELETE | `/me/wishlist/:productId` | สมาชิก | FR-07 |
| 19 | POST | `/products/:id/reports` | สมาชิก | UC-06 |
| 20 | GET | `/admin/reports` | Admin | UC-07 |
| 21 | PATCH | `/admin/reports/:id` | Admin | UC-07 |
| 22 | DELETE | `/admin/products/:id` | Admin | UC-07 |

---

## 3. UC-01 Register & Sign In

### 3.1 `POST /auth/register`

**Request**

```json
{
  "email": "nisit.k@student.chula.ac.th",
  "password": "UniTrade2026!",
  "full_name": "กันตภณ ชัยรุ่งปัญญา",
  "phone_number": "0812345678",
  "line_id": "kanta_ph",
  "faculty": "คณะวิศวกรรมศาสตร์"
}
```

**Validate Registration** (ขั้นตอนกล่องประในไดอะแกรม)

| field | กติกา |
|---|---|
| `email` | ต้องตรง `^[A-Za-z0-9._%+-]+@(student\.chula\.ac\.th\|chula\.ac\.th)$` และยังไม่มีในระบบ |
| `password` | ≥ 8 ตัวอักษร มีตัวอักษรและตัวเลขอย่างน้อยอย่างละ 1 |
| `full_name` | 2–255 ตัวอักษร |
| `phone_number` | `0XXXXXXXX(X)` หรือ `+66XXXXXXXXX` — จำเป็นถ้าไม่กรอก `line_id` |
| `line_id` | 2–100 ตัวอักษร `A-Z a-z 0-9 . _ -` — จำเป็นถ้าไม่กรอก `phone_number` |
| `faculty` | **บังคับ** · ชื่อจาก `GET /faculties` ตรงตัว หรือค่า `"other"` |
| `faculty_other` | บังคับเฉพาะเมื่อ `faculty` เป็น `"other"` · 2–100 ตัวอักษร · ถ้าข้อความตรงกับชื่อในรายการ ระบบบันทึกเป็นชื่อในรายการแทน |

**Process** — ผ่าน validate → `bcrypt.hash(password, 12)` → `INSERT User` → ตอบกลับ
รหัสผ่านดิบไม่ถูกบันทึกหรือ log ที่ใดทั้งสิ้น และฐานข้อมูลมี CHECK constraint ปฏิเสธค่าที่ไม่ใช่ bcrypt hash

**Response 201**

```json
{
  "user": {
    "user_id": "9f1c8b1e-4c1a-4f27-9d0b-6f8a52d2c111",
    "email": "nisit.k@student.chula.ac.th",
    "full_name": "กันตภณ ชัยรุ่งปัญญา",
    "phone_number": "0812345678",
    "line_id": "kanta_ph",
    "faculty": "คณะวิศวกรรมศาสตร์",
    "role": "member",
    "created_at": "2026-09-10T14:32:00Z"
  },
  "message": "ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ"
}
```

**Response 422 / 409**

```json
{ "error": { "code": "NON_CU_EMAIL", "message": "อนุญาตเฉพาะอีเมล @student.chula.ac.th หรือ @chula.ac.th", "field": "email" } }
```

```json
{ "error": { "code": "EMAIL_TAKEN", "message": "อีเมลนี้ถูกใช้สมัครแล้ว", "field": "email" } }
```

**ตัวอย่างผู้ใช้ที่เลือก "อื่น ๆ"** — บันทึก `faculty` เป็นข้อความที่ระบุ

```json
{
  "email": "somchai.s@chula.ac.th",
  "password": "UniTrade2026!",
  "full_name": "สมชาย สายสุข",
  "line_id": "somchai_s",
  "faculty": "other",
  "faculty_other": "สำนักงานมหาวิทยาลัย ฝ่ายเทคโนโลยีสารสนเทศ"
}
```

**Response 422 — ไม่เลือกคณะ หรือเลือก "อื่น ๆ" แต่ไม่ระบุ**

```json
{ "error": { "code": "INVALID_FACULTY", "message": "กรุณาเลือกคณะจากรายการ หรือเลือกอื่น ๆ แล้วระบุ", "field": "faculty" } }
```

### 3.2 `POST /auth/login`

**Request**

```json
{ "email": "nisit.k@student.chula.ac.th", "password": "UniTrade2026!" }
```

**Process** — `Find User` → `Validate Credentials` ด้วย `bcrypt.compare` → `Generate Token`
JWT ลงนามด้วย `JWT_SECRET` ฝั่งเซิร์ฟเวอร์ อัลกอริทึม HS256 payload คือ
`{ sub: user_id, role, iat, exp }` อายุ 24 ชั่วโมงตาม NFR

**Response 200**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5ZjFjOGIxZS00YzFhLTRmMjciLCJyb2xlIjoibWVtYmVyIiwiZXhwIjoxNzg5NDMyMDAwfQ.mock_signature",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "user_id": "9f1c8b1e-4c1a-4f27-9d0b-6f8a52d2c111",
    "email": "nisit.k@student.chula.ac.th",
    "full_name": "กันตภณ ชัยรุ่งปัญญา",
    "phone_number": "0812345678",
    "line_id": "kanta_ph",
    "faculty": "คณะวิศวกรรมศาสตร์",
    "role": "member"
  }
}
```

**Response 401 — Authentication Error ในไดอะแกรม**

```json
{ "error": { "code": "INVALID_CREDENTIALS", "message": "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } }
```

> token เป็นแบบ stateless ไม่มี refresh token และไม่มี endpoint logout
> การออกจากระบบคือ FE ลบ token ทิ้ง หมดอายุแล้วให้ล็อกอินใหม่ (ตรงตาม UC-01 ที่มี token ตัวเดียว)

### 3.3 `GET /auth/me`

```json
{
  "user_id": "9f1c8b1e-4c1a-4f27-9d0b-6f8a52d2c111",
  "email": "nisit.k@student.chula.ac.th",
  "full_name": "กันตภณ ชัยรุ่งปัญญา",
  "phone_number": "0812345678",
  "line_id": "kanta_ph",
  "faculty": "คณะวิศวกรรมศาสตร์",
  "role": "member",
  "created_at": "2026-06-01T00:00:00Z",
  "stats": { "active_listings": 4, "sold_items": 7, "wishlist_count": 12 }
}
```

### 3.4 `PATCH /auth/me`

Request `{ "full_name": "กันตภณ ชัยรุ่งปัญญา", "phone_number": "0899999999", "line_id": "kanta_new", "faculty": "คณะวิทยาศาสตร์" }`
→ Response 200 คืน object เดียวกับ 3.3 · `email` และ `role` แก้ทางนี้ไม่ได้

---

## 4. ข้อมูลอ้างอิง

### 4.1 `GET /categories`

```json
{
  "data": [
    { "category_id": "00000000-0000-4000-8000-000000000001", "name": "Textbooks",       "description": "หนังสือเรียน ชีทสรุป และเอกสารประกอบการเรียน", "product_count": 128 },
    { "category_id": "00000000-0000-4000-8000-000000000002", "name": "Study Equipment", "description": "อุปกรณ์การศึกษา เครื่องเขียน อุปกรณ์แล็บ", "product_count": 64 },
    { "category_id": "00000000-0000-4000-8000-000000000003", "name": "Apparel",         "description": "เครื่องแต่งกาย ชุดนิสิต เสื้อกาวน์ ชุดพละ", "product_count": 41 },
    { "category_id": "00000000-0000-4000-8000-000000000004", "name": "Dorm Essentials", "description": "ของใช้ในหอพัก เฟอร์นิเจอร์ เครื่องใช้ไฟฟ้าขนาดเล็ก", "product_count": 33 },
    { "category_id": "00000000-0000-4000-8000-000000000005", "name": "IT & Gadgets",    "description": "อุปกรณ์ไอที คอมพิวเตอร์ แท็บเล็ต อุปกรณ์เสริม", "product_count": 27 },
    { "category_id": "00000000-0000-4000-8000-000000000006", "name": "Other",           "description": "สินค้าอื่น ๆ ที่ไม่เข้าหมวดข้างต้น", "product_count": 9 }
  ]
}
```

### 4.2 `GET /pickup-locations`

ตาม ERD `pickup_location` เป็นคอลัมน์ข้อความใน Products ไม่ใช่ตารางแยก
endpoint นี้จึงคืน **ค่าคงที่ที่ประกาศไว้ฝั่งเซิร์ฟเวอร์** เพื่อให้ dropdown ตอนลงประกาศส่งข้อความชุดเดียวกันทุกครั้ง
ถ้าปล่อยให้ผู้ใช้พิมพ์เอง ตัวกรองตามจุดนัดรับจะจับคู่ไม่ตรง
ตามมติทีม FE ต้องใช้ dropdown จากรายการนี้ และ `POST /products` กับ `PATCH /products/:id` จะปฏิเสธค่าที่ไม่อยู่ในรายการด้วย `INVALID_PICKUP_LOCATION`
เพราะ dropdown ป้องกันได้แค่หน้าเว็บ ไม่ได้ป้องกันคำขอที่ส่งตรงเข้า API

```json
{
  "data": [
    "ศาลาพระเกี้ยว",
    "อินทนิน ตึกมหามกุฎ",
    "โรงอาหารจุลจักร ชั้น 2 (Smo Cafe)",
    "หอสมุดกลาง",
    "ใต้ตึกคณะวิศวกรรมศาสตร์",
    "ใต้ตึกคณะวิทยาศาสตร์",
    "ใต้ตึกคณะนิเทศศาสตร์",
    "หอพักนิสิตจุฬาฯ (U-Center)",
    "MRT สามย่าน ทางออก 2"
  ]
}
```


### 4.3 `GET /faculties`

รายการคณะสำหรับ dropdown ตอนลงทะเบียนและแก้ไขโปรไฟล์ ตามมติทีมให้เป็นรายการคงที่พร้อมตัวเลือก "อื่น ๆ"
สำหรับบุคลากรที่สังกัดสำนักงานหรือหน่วยงานที่ไม่อยู่ในรายการ หรือกรณีหน่วยงานเปลี่ยนชื่อ

**Response 200**

```json
{
  "data": [
    "คณะเกษตรศาสตร์บูรณาการ",
    "คณะครุศาสตร์",
    "คณะจิตวิทยา",
    "คณะทันตแพทยศาสตร์",
    "คณะนิติศาสตร์",
    "คณะนิเทศศาสตร์",
    "คณะพยาบาลศาสตร์",
    "คณะพาณิชยศาสตร์และการบัญชี",
    "คณะแพทยศาสตร์",
    "คณะเภสัชศาสตร์",
    "คณะรัฐศาสตร์",
    "คณะวิทยาศาสตร์",
    "คณะวิทยาศาสตร์การกีฬา",
    "คณะวิศวกรรมศาสตร์",
    "คณะศิลปกรรมศาสตร์",
    "คณะเศรษฐศาสตร์",
    "คณะสถาปัตยกรรมศาสตร์",
    "คณะสหเวชศาสตร์",
    "คณะสัตวแพทยศาสตร์",
    "คณะอักษรศาสตร์",
    "วิทยาลัยประชากรศาสตร์",
    "วิทยาลัยปิโตรเลียมและปิโตรเคมี",
    "วิทยาลัยวิทยาศาสตร์สาธารณสุข",
    "วิทยาลัยส่งเสริมการเรียนรู้ตลอดชีวิตเพื่อประชาชน",
    "วิทยาลัยสหศาสตร์บูรณาการ",
    "สถาบันนวัตกรรมบูรณาการแห่งจุฬาลงกรณ์มหาวิทยาลัย",
    "สถาบันบัณฑิตบริหารธุรกิจศศินทร์แห่งจุฬาลงกรณ์มหาวิทยาลัย"
  ],
  "allow_other": true,
  "other_value": "other"
}
```

FE แสดงทุกค่าใน `data` แล้วเพิ่มตัวเลือก "อื่น ๆ (โปรดระบุ)" ไว้ท้ายสุด
เมื่อผู้ใช้เลือก ให้ส่ง `faculty: "other"` พร้อม `faculty_other` เป็นข้อความที่พิมพ์

---

## 5. UC-04 Search & Filter Goods

### 5.1 `GET /products`

**Query parameters** — สี่ตัวแรกคือชุดที่ UC-04 ระบุไว้ตรง ๆ

| param | ชนิด | ค่าเริ่มต้น | คำอธิบาย |
|---|---|---|---|
| `keyword` | string | – | ค้นใน title + description แบบ case-insensitive รองรับภาษาไทย |
| `category_id` | uuid | – | ใส่หลายค่าคั่นด้วย comma · ค่าคงที่ดูจาก `GET /categories` |
| `min_price` / `max_price` | number | – | ช่วงราคา หน่วยบาท |
| `status` | enum | `available` | `available` \| `reserved` \| `sold` \| `all` |
| `sort` | enum | `date_desc` | `date_desc` \| `date_asc` \| `price_asc` \| `price_desc` |
| `pickup_location` | string | – | เพิ่มเติมจาก UC-04 — SRS FR-05 ระบุให้กรองตามจุดนัดรับได้ |
| `item_condition` | enum | – | เพิ่มเติมจาก UC-04 — SRS FR-05 ระบุให้กรองตามสภาพสินค้าได้ |
| `free_only` | boolean | false | เพิ่มเติมจาก UC-04 — SRS ระบุให้กรองของแจกฟรี (`price = 0`) |
| `page` / `per_page` | int | 1 / 20 | สูงสุด 50 |

ตัวอย่าง `GET /products?keyword=แคลคูลัส&category_id=00000000-0000-4000-8000-000000000001&max_price=300&sort=price_asc&page=1`

**Response 200**

```json
{
  "data": [
    {
      "product_id": "c0ffee00-1111-4222-8333-444444444444",
      "title": "CALCULUS I (2110101) + ชีทสรุปครบเทอม",
      "price": 250.00,
      "is_free": false,
      "item_condition": "like_new",
      "status": "available",
      "pickup_location": "ศาลาพระเกี้ยว",
      "primary_image_url": "https://xyzabc.supabase.co/storage/v1/object/public/product-images/c0ffee00/img-1.jpg",
      "category": { "category_id": "00000000-0000-4000-8000-000000000001", "name": "Textbooks" },
      "seller": { "user_id": "9f1c8b1e-4c1a-4f27-9d0b-6f8a52d2c111", "full_name": "กันตภณ ช.", "faculty": "คณะวิศวกรรมศาสตร์" },
      "is_wishlisted": true,
      "created_at": "2026-09-08T09:12:00Z"
    },
    {
      "product_id": "c0ffee00-2222-4333-8444-555555555555",
      "title": "เสื้อกาวน์แล็บ ไซส์ M แจกฟรี",
      "price": 0.00,
      "is_free": true,
      "item_condition": "good",
      "status": "reserved",
      "pickup_location": "ใต้ตึกคณะวิทยาศาสตร์",
      "primary_image_url": "https://xyzabc.supabase.co/storage/v1/object/public/product-images/c0ffee00/img-9.jpg",
      "category": { "category_id": "00000000-0000-4000-8000-000000000003", "name": "Apparel" },
      "seller": { "user_id": "7a2d3f90-8b11-4c55-9e77-1a2b3c4d5e6f", "full_name": "ปวีณา ส.", "faculty": "คณะวิทยาศาสตร์" },
      "is_wishlisted": false,
      "created_at": "2026-09-07T16:40:00Z"
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 47, "total_pages": 3 }
}
```

`is_free` คำนวณจาก `price = 0` ตอนส่งออก ไม่ได้เก็บเป็นคอลัมน์ ·
`is_wishlisted` เป็น `false` เสมอเมื่อเรียกแบบไม่ล็อกอิน

**Response 200 — ไม่พบสินค้า** (ไม่ใช่ 404 เพราะการค้นหาสำเร็จ)

```json
{
  "data": [],
  "pagination": { "page": 1, "per_page": 20, "total": 0, "total_pages": 0 },
  "message": "ไม่พบสินค้าที่ตรงกับเงื่อนไข ลองปรับตัวกรองหรือคำค้นหา"
}
```

### 5.2 `GET /products/:id`

```json
{
  "product_id": "c0ffee00-1111-4222-8333-444444444444",
  "title": "CALCULUS I (2110101) + ชีทสรุปครบเทอม",
  "description": "ใช้เทอมเดียว ไม่มีขีดเขียน แถมชีทสรุปของพี่ปี 3 นัดรับได้ทุกวันจันทร์-ศุกร์ 12:00-13:00",
  "price": 250.00,
  "is_free": false,
  "item_condition": "like_new",
  "status": "available",
  "pickup_location": "ศาลาพระเกี้ยว",
  "images": [
    { "image_id": "img-1", "image_url": "https://xyzabc.supabase.co/storage/v1/object/public/product-images/c0ffee00/img-1.jpg", "is_primary": true },
    { "image_id": "img-2", "image_url": "https://xyzabc.supabase.co/storage/v1/object/public/product-images/c0ffee00/img-2.jpg", "is_primary": false }
  ],
  "category": { "category_id": "00000000-0000-4000-8000-000000000001", "name": "Textbooks" },
  "seller": {
    "user_id": "9f1c8b1e-4c1a-4f27-9d0b-6f8a52d2c111",
    "full_name": "กันตภณ ช.",
    "faculty": "คณะวิศวกรรมศาสตร์",
    "created_at": "2026-06-01T00:00:00Z",
    "active_listings": 4
  },
  "is_wishlisted": true,
  "is_owner": false,
  "created_at": "2026-09-08T09:12:00Z"
}
```

ข้อมูลติดต่อผู้ขายไม่อยู่ใน response นี้ ต้องเรียก `/products/:id/contact` แยก (FR-06)

---

## 6. UC-02 Create Product Post

### 6.1 `POST /products`

ตามไดอะแกรม ผู้ใช้กด **Publish Listing ครั้งเดียว** แล้ว backend ทำครบทั้งชุดในคำขอเดียว:
`Validate Product Data` → `INSERT Product` → รับ `Product ID` → `Upload Images` เข้า Storage →
รับ `Image URLs` → `INSERT Product Images` → ตอบ `Create Success`

**Request** — `Content-Type: multipart/form-data`

| field | ชนิด | บังคับ |
|---|---|---|
| `title` | text | ✓ 3–255 ตัวอักษร |
| `description` | text | ≤ 2000 ตัวอักษร |
| `category_id` | uuid | ✓ |
| `item_condition` | enum | ✓ `new` \| `like_new` \| `good` \| `fair` |
| `price` | number | ✓ `0` = แจกฟรี |
| `pickup_location` | text | ✓ ต้องเป็นค่าจาก `GET /pickup-locations` ตรงตัว |
| `images[]` | file | ✓ 1–5 ไฟล์ แต่ละไฟล์ ≤ 2MB เฉพาะ .jpg / .jpeg / .png |
| `primary_image_index` | int | ค่าเริ่มต้น `0` |

**Validate Product Data** — ตรวจครบทุกข้อก่อนแตะฐานข้อมูล: required fields, `price >= 0`,
จำนวนรูป 1–5, ขนาดแต่ละไฟล์ ≤ 2MB, MIME type ถูกต้อง, `pickup_location` อยู่ในรายการ

**Response 201**

```json
{
  "product_id": "c0ffee00-1111-4222-8333-444444444444",
  "title": "CALCULUS I (2110101) + ชีทสรุปครบเทอม",
  "price": 250.00,
  "item_condition": "like_new",
  "status": "available",
  "pickup_location": "ศาลาพระเกี้ยว",
  "images": [
    { "image_id": "img-1", "image_url": "https://xyzabc.supabase.co/storage/v1/object/public/product-images/c0ffee00/img-1.jpg", "is_primary": true },
    { "image_id": "img-2", "image_url": "https://xyzabc.supabase.co/storage/v1/object/public/product-images/c0ffee00/img-2.jpg", "is_primary": false }
  ],
  "created_at": "2026-09-10T14:40:00Z",
  "message": "ลงประกาศสำเร็จ"
}
```

**Response 422 / 413 — เส้นทาง [Invalid Data] ในไดอะแกรม**

```json
{ "error": { "code": "NO_IMAGE", "message": "ต้องแนบรูปสินค้าอย่างน้อย 1 รูป", "field": "images" } }
```

```json
{ "error": { "code": "FILE_TOO_LARGE", "message": "ไฟล์รูปต้องมีขนาดไม่เกิน 2MB ต่อรูป", "field": "images" } }
```

```json
{ "error": { "code": "INVALID_PICKUP_LOCATION", "message": "กรุณาเลือกจุดนัดรับจากรายการ", "field": "pickup_location" } }
```

> **ข้อควรรู้ตอน implement** — ถ้า upload เข้า Storage สำเร็จบางรูปแล้วเกิด error ทีหลัง
> ให้ลบไฟล์ที่อัปไปแล้วออกก่อนตอบ error ไม่งั้นจะมีไฟล์ค้างใน bucket ที่ไม่มีแถวในฐานข้อมูลชี้ถึง
> และเนื่องจากรวมรูปสูงสุด 5 × 2MB = 10MB ต่อคำขอ ต้องตั้ง body size limit ของ API route ให้รองรับ

### 6.2 `PATCH /products/:id` — แก้ไขข้อมูลประกาศ

Request `{ "price": 200, "description": "ลดราคาช่วงสอบกลางภาค", "pickup_location": "หอสมุดกลาง" }`
→ Response 200 คืน object เดียวกับ 5.2 · แก้รูปให้ลบประกาศแล้วลงใหม่ · `pickup_location` ตรวจแบบเดียวกับ 6.1

**Response 403**

```json
{ "error": { "code": "NOT_OWNER", "message": "คุณไม่ใช่เจ้าของประกาศนี้" } }
```

### 6.3 `DELETE /products/:id` — เจ้าของลบประกาศตัวเอง → 204

ลบแถวใน Products จริง แถวรูปและรายการโปรดถูกลบตาม cascade แล้วลบไฟล์ใต้โฟลเดอร์ `{product_id}/` ใน Storage ตามลำดับเดียวกับ 11.2

รายงานที่มีอยู่ **ยังคงอยู่** ในสถานะเดิม เช่น `pending` โดย `product_id` กลายเป็น null
admin จึงยังเห็นว่ามีคนรายงาน แม้ผู้ขายจะลบประกาศทิ้งไปก่อน แต่จะไม่รู้ว่าเป็นประกาศใดหรือผู้ขายคนใด

---

## 7. UC-03 Update Post Status

### 7.1 `GET /me/products` — หน้า My Listings

```json
{
  "data": [
    {
      "product_id": "c0ffee00-1111-4222-8333-444444444444",
      "title": "CALCULUS I (2110101) + ชีทสรุปครบเทอม",
      "price": 250.00,
      "status": "available",
      "pickup_location": "ศาลาพระเกี้ยว",
      "primary_image_url": "https://xyzabc.supabase.co/storage/v1/object/public/product-images/c0ffee00/img-1.jpg",
      "wishlist_count": 6,
      "created_at": "2026-09-08T09:12:00Z"
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 4, "total_pages": 1 },
  "summary": { "available": 4, "reserved": 1, "sold": 7 }
}
```

### 7.2 `PATCH /products/:id/status`

**Request**

```json
{ "status": "reserved" }
```

**Validate Status & Ownership** — ตรวจสองอย่างก่อนอัปเดต: ค่าที่ส่งมาต้องเป็นหนึ่งใน
`available` / `reserved` / `sold` และ `seller_id` ของประกาศต้องตรงกับ `sub` ใน token

**Response 200**

```json
{
  "product_id": "c0ffee00-1111-4222-8333-444444444444",
  "status": "reserved",
  "message": "อัปเดตสถานะเป็น Reserved แล้ว"
}
```

**Response 422 / 403**

```json
{ "error": { "code": "INVALID_STATUS", "message": "สถานะต้องเป็น Available, Reserved หรือ Sold เท่านั้น", "field": "status" } }
```

```json
{ "error": { "code": "NOT_OWNER", "message": "คุณไม่ใช่เจ้าของประกาศนี้" } }
```

---

## 8. FR-06 ติดต่อผู้ขาย

### 8.1 `GET /products/:id/contact`

ต้องล็อกอิน — เป็นจุดที่ SRS ระบุว่าข้อมูลติดต่อต้องไม่หลุดถึงบุคคลภายนอก

```json
{
  "seller": { "user_id": "9f1c8b1e-4c1a-4f27-9d0b-6f8a52d2c111", "full_name": "กันตภณ ชัยรุ่งปัญญา", "faculty": "คณะวิศวกรรมศาสตร์" },
  "channels": [
    { "type": "line",  "value": "kanta_ph",   "deep_link": "https://line.me/ti/p/~kanta_ph", "is_primary": true },
    { "type": "phone", "value": "0812345678", "deep_link": "tel:+66812345678", "is_primary": false }
  ],
  "pickup_location": "ศาลาพระเกี้ยว",
  "safety_note": "นัดรับในพื้นที่จุฬาฯ ช่วงเวลากลางวัน และตรวจสอบสินค้าก่อนชำระเงินทุกครั้ง"
}
```

**Response 401**

```json
{ "error": { "code": "UNAUTHORIZED", "message": "กรุณาเข้าสู่ระบบด้วยอีเมลจุฬาฯ เพื่อดูช่องทางติดต่อผู้ขาย" } }
```

---

## 9. UC-05 Save to Wishlist

### 9.1 `POST /products/:id/wishlist` — ปุ่มหัวใจ

ตามไดอะแกรม ปุ่มเดียวส่งคำขอเดียว server เป็นฝ่าย `Check Wishlist` เองว่ามีอยู่หรือยัง
แล้วจึง `INSERT` (เส้น Not Saved) หรือ `DELETE` (เส้น Already Saved)
FE ไม่ต้องรู้สถานะปัจจุบันก่อนกด

**Response 200 — เส้นทาง [Not Saved]**

```json
{
  "product_id": "c0ffee00-2222-4333-8444-555555555555",
  "action": "added",
  "is_wishlisted": true,
  "message": "บันทึกลงรายการโปรดแล้ว"
}
```

**Response 200 — เส้นทาง [Already Saved]**

```json
{
  "product_id": "c0ffee00-2222-4333-8444-555555555555",
  "action": "removed",
  "is_wishlisted": false,
  "message": "เอาออกจากรายการโปรดแล้ว"
}
```

### 9.2 `GET /me/wishlist`

```json
{
  "data": [
    {
      "wishlist_id": "wl-1111-2222-3333-4444",
      "product_id": "c0ffee00-2222-4333-8444-555555555555",
      "title": "เสื้อกาวน์แล็บ ไซส์ M แจกฟรี",
      "price": 0.00,
      "is_free": true,
      "status": "reserved",
      "pickup_location": "ใต้ตึกคณะวิทยาศาสตร์",
      "primary_image_url": "https://xyzabc.supabase.co/storage/v1/object/public/product-images/c0ffee00/img-9.jpg",
      "saved_at": "2026-09-09T20:15:00Z"
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 12, "total_pages": 1 }
}
```

### 9.3 `DELETE /me/wishlist/:productId` → 204

ใช้กับปุ่ม "เอาออก" ในหน้า My Wishlist ที่ผู้ใช้สั่งลบตรง ๆ ไม่ toggle กลับ

---

## 10. UC-06 Report Post

### 10.1 `POST /products/:id/reports`

**Request**

```json
{ "reason": "scam" }
```

**Validate Report** — `reason` ต้องมีค่าและอยู่ในรายการนี้เท่านั้น
`scam` · `prohibited_item` · `spam` · `wrong_category` · `offensive_content` · `already_sold` · `other`

**Response 201**

```json
{
  "report_id": "rp-77771111-2222-3333-4444-555555555555",
  "product_id": "c0ffee00-2222-4333-8444-555555555555",
  "reason": "scam",
  "status": "pending",
  "created_at": "2026-09-10T15:20:00Z",
  "message": "ส่งรายงานเรียบร้อย ทีมผู้ดูแลจะตรวจสอบภายใน 24 ชั่วโมง"
}
```

**Response 422 / 409 — เส้นทาง [Invalid Report]**

```json
{ "error": { "code": "INVALID_REPORT_REASON", "message": "กรุณาเลือกเหตุผลในการรายงาน", "field": "reason" } }
```

```json
{ "error": { "code": "SELF_REPORT", "message": "ไม่สามารถรายงานประกาศของตนเองได้" } }
```

```json
{ "error": { "code": "DUPLICATE_REPORT", "message": "คุณรายงานประกาศนี้ไปแล้ว" } }
```

---

## 11. UC-07 Moderate Posts

### 11.1 `GET /admin/reports?status=pending&page=1` — Get Reported Posts

```json
{
  "data": [
    {
      "report_id": "rp-77771111-2222-3333-4444-555555555555",
      "reason": "scam",
      "status": "pending",
      "created_at": "2026-09-10T15:20:00Z",
      "reporter": { "user_id": "7a2d3f90-8b11-4c55-9e77-1a2b3c4d5e6f", "full_name": "ปวีณา ส.", "faculty": "คณะวิทยาศาสตร์", "email": "paweena.s@student.chula.ac.th" },
      "product": {
        "product_id": "c0ffee00-2222-4333-8444-555555555555",
        "title": "เสื้อกาวน์แล็บ ไซส์ M แจกฟรี",
        "status": "reserved",
        "pickup_location": "ใต้ตึกคณะวิทยาศาสตร์",
        "primary_image_url": "https://xyzabc.supabase.co/storage/v1/object/public/product-images/c0ffee00/img-9.jpg",
        "seller": { "user_id": "9f1c8b1e-4c1a-4f27-9d0b-6f8a52d2c111", "full_name": "กันตภณ ช.", "faculty": "คณะวิศวกรรมศาสตร์", "email": "nisit.k@student.chula.ac.th" },
        "total_reports": 3
      }
    }
  ],
  "pagination": { "page": 1, "per_page": 20, "total": 5, "total_pages": 1 },
  "summary": { "pending": 5, "actioned": 42, "dismissed": 11 }
}
```

**Response 403**

```json
{ "error": { "code": "ADMIN_REQUIRED", "message": "หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบ" } }
```

> `product` เป็น `null` เมื่อประกาศถูกลบไปแล้ว ทั้งกรณี admin ลบ และกรณีผู้ขายลบเองขณะที่รายงานยัง `pending` — FE ต้องรองรับค่า null นี้

### 11.2 `DELETE /admin/products/:id` — เส้นทาง [Inappropriate Post]

ตามมติทีม ลบประกาศแบบ hard delete และเปลี่ยนรายงานเป็น `actioned`
ไม่ต้องส่ง body — ระบบปิดรายงาน **ทุกรายการที่ยังเป็น `pending`** ของประกาศนี้ ไม่ใช่เฉพาะรายการที่ admin กดเข้ามาตรวจ

**ลำดับการทำงาน**

1. `BEGIN`
2. `UPDATE reports SET status = 'actioned' WHERE product_id = :id AND status = 'pending'`
3. `DELETE FROM products WHERE product_id = :id` — แถวรูปและรายการโปรดถูกลบตาม cascade ส่วนรายงานยังอยู่ โดย `product_id` กลายเป็น null
4. `COMMIT`
5. ลบไฟล์ทั้งหมดใต้โฟลเดอร์ `{product_id}/` ใน bucket `product-images`

ข้อ 2–3 ต้องอยู่ในทรานแซกชันเดียว ถ้าลบประกาศไม่สำเร็จ รายงานต้องไม่ถูกเปลี่ยนเป็น `actioned` ค้างไว้กับประกาศที่ยังเผยแพร่อยู่
ข้อ 5 ทำหลัง `COMMIT` เสมอ ถ้าลบไฟล์ไม่สำเร็จให้บันทึก log แล้วตอบ 200 ตามปกติ เพราะข้อมูลในฐานข้อมูลถูกต้องแล้ว เหลือเพียงไฟล์ค้างที่ตามลบภายหลังได้

**Response 200**

```json
{
  "product_id": "c0ffee00-2222-4333-8444-555555555555",
  "deleted": true,
  "reports_actioned": 3,
  "images_removed": 2,
  "message": "ลบประกาศและปิดรายงานที่เกี่ยวข้องเรียบร้อย"
}
```

**Response 404**

```json
{ "error": { "code": "PRODUCT_NOT_FOUND", "message": "ไม่พบสินค้านี้ อาจถูกลบไปแล้ว" } }
```

> **เรื่องการลบไฟล์** — `image_url` เก็บเป็น URL เต็ม แต่ `storage.from('product-images').remove()` ต้องการ path ของไฟล์
> ไม่ต้องแยก path ออกจาก URL ทีละรูป เพราะไฟล์ทุกรูปของประกาศอยู่ใต้โฟลเดอร์ `{product_id}/` อยู่แล้ว
> ให้ list ไฟล์ในโฟลเดอร์นั้นแล้วลบทั้งหมด วิธีนี้ใช้ได้แม้แถวใน `product_images` ถูก cascade ลบไปก่อนแล้ว

### 11.3 `PATCH /admin/reports/:id` — ตรวจแล้วไม่ผิด ปิดเรื่องโดยไม่ลบโพสต์

Request `{ "status": "dismissed" }` → Response 200 คืน report ที่อัปเดตแล้ว
(ไดอะแกรม UC-07 วาดเฉพาะเส้น Inappropriate Post แต่คอลัมน์ `status` ใน ERD มีค่า
`dismissed` อยู่แล้ว endpoint นี้จึงเป็นตัวเติมเส้นทางที่เหลือ)

---

## 12. ตารางเทียบ Sequence Diagram ↔ Endpoint (ใช้ตอน UAT)

| UC | ขั้นตอนในไดอะแกรม | Endpoint |
|---|---|---|
| UC-01 | Fill Registration Information → เลือกคณะจาก dropdown | `GET /faculties` |
| UC-01 | Submit Register → Validate → INSERT User | `POST /auth/register` |
| UC-01 | Click Sign In → Find User → Validate Credentials → Generate Token | `POST /auth/login` |
| UC-02 | Fill Product Information → เลือกจุดนัดรับจาก dropdown | `GET /pickup-locations` |
| UC-02 | Publish Listing → Validate → INSERT Product → Upload Images → INSERT Product Images | `POST /products` |
| UC-03 | Open My Listings | `GET /me/products` |
| UC-03 | Confirm Update → Validate Status & Ownership → UPDATE Product Status | `PATCH /products/:id/status` |
| UC-04 | Search → Validate Search Request → Search Products | `GET /products` |
| UC-05 | Click Wishlist → Check Wishlist → INSERT / DELETE Wishlist | `POST /products/:id/wishlist` |
| UC-06 | Submit Report → Validate Report → INSERT Report | `POST /products/:id/reports` |
| UC-07 | Open Moderation → Get Reported Posts → SELECT Reported Posts | `GET /admin/reports` |
| UC-07 | Confirm Delete → UPDATE Reports (actioned) → DELETE Product → ลบไฟล์ใน Storage | `DELETE /admin/products/:id` |

---

## 13. มติทีม 13 กันยายน 2026

| ข้อ | มติ | ผลต่อ API |
|---|---|---|
| 1 | เพิ่มคณะเป็นข้อมูลบังคับตาม SRS 2.3 เลือกจากรายการ หรือเลือก "อื่น ๆ" แล้วระบุเอง | เพิ่ม `GET /faculties` · `faculty` ใน register, login, `/auth/me` และข้อมูลผู้ขาย · error `INVALID_FACULTY` |
| 2 | จุดนัดรับใช้ dropdown จาก `GET /pickup-locations` | API ปฏิเสธค่าที่ไม่อยู่ในรายการ · error `INVALID_PICKUP_LOCATION` |
| 3 | ลบประกาศแบบ hard delete และเปลี่ยนรายงานเป็น `actioned` | `DELETE /admin/products/:id` ปิดรายงานที่ค้างทั้งหมดก่อนลบ · รายงานยังอยู่โดย `product_id` เป็น null |

### สิ่งที่ SA ต้องปรับในไดอะแกรม

- **ER Diagram** — เพิ่ม `faculty` ในตาราง Users
- **UC-01** — เพิ่ม `faculty` ในขั้น Fill Registration Information
- **UC-04** — เพิ่มพารามิเตอร์ `pickup_location`, `item_condition` และ `free_only` (`free_only` มาจาก SRS 2.3 "กรองเฉพาะของแจกฟรีได้" ถ้าไม่เติมในไดอะแกรม จะกลับมาไม่ตรงกันอีก)
- **UC-07** — เพิ่มขั้น `UPDATE Reports (actioned)` ก่อน `DELETE Product` และขั้นลบไฟล์ใน Storage หลังลบ

### ข้อควรระวังตอน implement

1. **ไฟล์ใน Storage** — CASCADE ลบได้แค่แถวในตาราง ต้องลบไฟล์ใต้ `{product_id}/` เองหลัง `COMMIT` ทั้งตอนเจ้าของลบและ admin ลบ (ดู 6.3 และ 11.2)
2. **ห้ามเรียก Supabase จากเบราว์เซอร์** — ทุกคำขอผ่าน Next.js API Routes · ตัวแปร Supabase ห้ามขึ้นต้นด้วย `NEXT_PUBLIC_`
3. **ทุก route ต้องผ่านตัวตรวจ JWT ตัวเดียวกัน** — backend ใช้ `service_role` ซึ่งข้ามทุกสิทธิ์ ถ้า route ไหนลืมตรวจ ข้อมูลทั้งฐานข้อมูลจะเปิด

---

*เอกสารนี้เป็นสัญญาระหว่าง FE กับ BE — ถ้าจะเปลี่ยนโครงสร้าง response ให้แจ้งในกลุ่มก่อนแก้โค้ด*

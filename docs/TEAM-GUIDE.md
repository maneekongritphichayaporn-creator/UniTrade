# UniTrade

ตลาดซื้อขาย/ส่งต่อของมือสองสำหรับนิสิตและบุคลากรจุฬาฯ — โปรเจกต์วิชา Software Engineering กลุ่ม VISIT CMU

Next.js 15 (App Router, JavaScript) · API อยู่ใต้ `/api/v1` · ฐานข้อมูลและรูปภาพอยู่บน Supabase
สัญญา API ฉบับเต็มคือ **API Specification v2.2** (ลิงก์อยู่ในตารางงาน TASK-05) — ถ้าโค้ดกับ spec ไม่ตรงกัน ให้ถือ spec แล้วแจ้งในกลุ่ม

> ปรับสถานะล่าสุด 13 พ.ย. 2569

---

## เริ่มต้นใช้งาน

ต้องใช้ **Node.js 22 ขึ้นไป** (`node -v`) — Supabase client รุ่นปัจจุบันไม่รองรับ Node 18/20 แล้ว

```bash
git clone https://github.com/maneekongritphichayaporn-creator/UniTrade.git
cd UniTrade
npm install
cp .env.example .env.local
```

แก้ `.env.local`:
- `SUPABASE_SERVICE_ROLE_KEY` — **ขอจาก @wz ทาง DM เท่านั้น** ห้ามส่งในกลุ่ม ห้าม commit (เฉพาะคนทำ backend)
- `JWT_SECRET` — สุ่มเองด้วย `openssl rand -base64 48`

| คำสั่ง | ใช้ทำอะไร |
|---|---|
| `npm run dev` | เปิดเซิร์ฟเวอร์ที่ http://localhost:3000 (API อยู่ที่ `/api/v1`) |
| `npm test` | unit test (ไม่ต้องต่อฐานข้อมูล) — ต้องผ่าน 17/17 |
| `npm run test:api` | รัน Bruno collection กับ `npm run dev` ที่เปิดอยู่ — ต้องผ่าน 13/13 |
| `npm run build` | ตรวจว่า build ผ่าน — รันก่อนเปิด PR ทุกครั้ง |

ถ้า `npm test` หรือ `npm run test:api` ไม่ผ่านตั้งแต่ยังไม่ได้แก้อะไร ทัก @wz ก่อนเริ่มงาน

---

## API ที่ใช้ได้แล้ว (TASK-06)

| Method | Path | ต้องล็อกอิน | ใช้ทำอะไร |
|---|---|---|---|
| GET | `/api/v1/faculties` | – | รายการคณะสำหรับ dropdown ตอนสมัคร |
| POST | `/api/v1/auth/register` | – | สมัครสมาชิก |
| POST | `/api/v1/auth/login` | – | เข้าสู่ระบบ ได้ token กลับมา |
| GET | `/api/v1/auth/me` | ✓ | ข้อมูลโปรไฟล์ + สถิติ |
| PATCH | `/api/v1/auth/me` | ✓ | แก้ชื่อ เบอร์ LINE ID คณะ (แก้อีเมลและ role ไม่ได้) |

**สมัครสมาชิก**
```json
POST /api/v1/auth/register
{
  "email": "nisit.k@student.chula.ac.th",
  "password": "UniTrade2026!",
  "full_name": "ชื่อ นามสกุล",
  "phone_number": "0812345678",
  "line_id": "my_line",
  "faculty": "คณะวิศวกรรมศาสตร์"
}
```
- อีเมลต้องเป็น `@student.chula.ac.th` หรือ `@chula.ac.th` · รหัสผ่าน ≥ 8 ตัว มีทั้งตัวอักษรและตัวเลข
- ต้องมีเบอร์โทรหรือ LINE ID อย่างน้อยหนึ่งอย่าง
- คณะต้องตรงกับค่าจาก `/faculties` — ถ้าผู้ใช้เลือก "อื่น ๆ" ให้ส่ง `"faculty": "other"` พร้อม `"faculty_other": "ข้อความที่พิมพ์"`
- สำเร็จได้ **201** — สมัครแล้ว **ยังไม่ได้ล็อกอิน** ต้องพาไปหน้า Login ต่อ

**เข้าสู่ระบบ** — `POST /api/v1/auth/login` ด้วย `{ "email", "password" }` ได้กลับมา
```json
{ "token": "eyJ…", "token_type": "bearer", "expires_in": 86400, "user": { "user_id": "…", "full_name": "…", "role": "member", … } }
```
FE เก็บ `token` ไว้ (localStorage หรือ cookie) แล้วแนบกับทุกคำขอที่ต้องล็อกอิน:
```
Authorization: Bearer <token>
```
token อายุ 24 ชั่วโมง ไม่มี refresh และไม่มี endpoint logout — ออกจากระบบคือลบ token ทิ้ง

**รูปแบบ error** — ทุก endpoint ตอบแบบเดียวกัน ให้ FE ดูที่ `error.code` ไม่ใช่ข้อความ
```json
{ "error": { "code": "NON_CU_EMAIL", "message": "อนุญาตเฉพาะอีเมล @student.chula.ac.th หรือ @chula.ac.th", "field": "email" } }
```
`field` บอกว่าช่องไหนผิด ใช้แสดงข้อความใต้ช่องกรอกได้เลย

| code | status | ความหมาย | FE ควรทำ |
|---|---|---|---|
| `NON_CU_EMAIL` | 422 | ไม่ใช่อีเมลจุฬาฯ | แสดงใต้ช่องอีเมล |
| `WEAK_PASSWORD` | 422 | รหัสผ่านไม่ผ่านเงื่อนไข | แสดงใต้ช่องรหัสผ่าน |
| `MISSING_CONTACT` | 422 | ไม่กรอกทั้งเบอร์และ LINE ID | แสดงใต้ช่องเบอร์/LINE |
| `INVALID_FACULTY` | 422 | ไม่เลือกคณะ หรือเลือก "อื่น ๆ" แต่ไม่ระบุ | แสดงใต้ dropdown คณะ |
| `VALIDATION_ERROR` | 422 | ข้อมูลผิดรูปแบบอื่น ๆ เช่น เบอร์ผิดรูปแบบ | แสดงใต้ช่องตาม `field` |
| `EMAIL_TAKEN` | 409 | อีเมลนี้สมัครแล้ว | เสนอให้ไปหน้า Login |
| `INVALID_CREDENTIALS` | 401 | อีเมลหรือรหัสผ่านผิด | แสดงข้อความรวมบนฟอร์ม |
| `UNAUTHORIZED` | 401 | ไม่ได้ล็อกอิน / token ใช้ไม่ได้ | ลบ token แล้วพาไปหน้า Login |
| `TOKEN_EXPIRED` | 401 | token หมดอายุ | ลบ token แล้วพาไปหน้า Login |
| `INVALID_PAYLOAD` | 400 | body ไม่ใช่ JSON | บั๊กฝั่ง FE |
| `INTERNAL_ERROR` | 500 | ระบบผิดพลาด | แสดง "ลองใหม่อีกครั้ง" |

`UNAUTHORIZED`, `VALIDATION_ERROR`, `INVALID_PAYLOAD`, `INTERNAL_ERROR` เป็น code ที่เพิ่มจาก spec §1.5

---

## กติกาที่ทุกคนต้องรู้

1. **ห้าม push ตรงเข้า `main`** — แตก branch ต่อ task (เช่น `task-09-product-read`) แล้วเปิด PR ให้ @wz รีวิวก่อน merge
2. **ห้าม commit `.env.local` หรือ key ใด ๆ** — repo นี้เป็น public ใครก็เปิดอ่านได้ ถ้าเผลอ push key ขึ้นไป บอก @wz ทันทีเพื่อยกเลิก key นั้น
3. **Supabase ใช้ร่วมกันทั้งทีม** — ลบได้เฉพาะข้อมูลทดสอบที่ตัวเองสร้าง ห้ามแก้ตารางผ่าน dashboard
4. **จะเปลี่ยนโครงสร้างฐานข้อมูล** — เขียนไฟล์ใหม่ `supabase/migrations/0005_….sql` แล้วให้ @wz รัน ห้ามแก้ไฟล์ 0001–0004
5. **จะเปลี่ยนรูปแบบ response ที่ FE ใช้อยู่** — แจ้งในกลุ่มก่อนแก้โค้ด (API spec คือสัญญาระหว่าง FE กับ BE)
6. **ห้ามเรียก Supabase จากเบราว์เซอร์** — ทุกอย่างผ่าน `/api/v1` และห้ามตั้งชื่อตัวแปร Supabase ขึ้นต้นด้วย `NEXT_PUBLIC_`

---

## โครงสร้างโปรเจกต์

```
app/api/v1/          API — หนึ่งโฟลเดอร์ต่อหนึ่ง path
app/                 หน้าเว็บ (FE) — ดูหัวข้อ "หน้าเว็บ (Frontend)"
components/          คอมโพเนนต์ของหน้าเว็บ
lib/                 โค้ดกลางของ backend: auth, รูปแบบ response, Supabase client, ค่าคงที่
lib/client/          โค้ดกลางของหน้าเว็บ: เรียก API, session, ตัวกรอง, ข้อความ
supabase/            migration + seed (รันบน Supabase แล้ว เก็บไว้เป็นหลักฐาน)
test/                unit test
bruno/               ชุดทดสอบ API — เปิดด้วยแอป Bruno หรือรัน npm run test:api
docs/                ไว้สำหรับเก็บเอกสารต่าง ๆ   
AGENTS.md            คู่มือละเอียดสำหรับคนทำ backend และ AI agent
```

**สำหรับคนเขียน backend** — ทุก route ต้องห่อด้วย `requireAuth` (ต้องล็อกอิน), `optionalAuth` (ไม่บังคับ) หรือ `route` (สาธารณะ)
เพราะ backend ต่อฐานข้อมูลด้วยสิทธิ์สูงสุด route ที่ลืมห่อคือข้อมูลรั่วทั้งฐาน ตัวอย่างโค้ดและกติกาทั้งหมดอยู่ใน `AGENTS.md` หัวข้อ 4–5

---

## หน้าเว็บ (Frontend)

> อัปเดต 3 พ.ย. 2569 โดย @yat (FE Lead) — TASK-07, 10, 16, 18
>
> เอกสารส่งงานฉบับเต็ม: [`docs/TASK-07-10-16-18-CHANGELOG.md`](docs/TASK-07-10-16-18-CHANGELOG.md)
> เนื้อหาสำหรับรายงาน (หัวข้อ 4.6, 5.1, 5.3 ส่วนหน้าเว็บ): [`docs/REPORT-FRONTEND.md`](docs/REPORT-FRONTEND.md)

| Path | หน้า | Task | เจ้าของ |
|---|---|---|---|
| `/` | หน้าแรก: แถบหมวดหมู่, การ์ดสินค้า, ตัวกรอง, แบ่งหน้า | TASK-10 + TASK-16 | @yat |
| `/products/[id]` | รายละเอียดสินค้า + ปุ่มติดต่อผู้ขาย | TASK-18 | @yat |
| `/login` | **ตัวชั่วคราว** — แทนที่ได้เลย | TASK-08 | @warixm |
| `/register`, `/me/profile` | สมัครสมาชิก, โปรไฟล์ | TASK-08 | @warixm |
| `/products/create`, `/products/[id]/edit` | ฟอร์มลงขาย/แก้ไข | TASK-13 | @warixm |
| `/me/products` | ประกาศของฉัน + เปลี่ยนสถานะ | TASK-14 | @warixm |
| `/me/wishlist` | รายการโปรด | TASK-17 | @warixm |
| `/admin` | จัดการรายงาน | TASK-20 | @warixm |

Path ที่ยังไม่มีไฟล์จะตกไปที่ `app/not-found.js` (หน้า 404) ไม่พัง — สร้าง `app/<path>/page.js` ทับได้เลย
ชื่อ path ทุกอันรวมอยู่ใน `lib/client/routes.js` ใช้ `routes.xxx` แทนการพิมพ์ path เองจะได้ไม่หลุดกัน

### โครงไฟล์ฝั่งหน้าเว็บ

```
app/globals.css              ธีม (สี ปุ่ม ป้าย ฟอร์ม) — แก้สีที่ :root ที่เดียว ทุกหน้าเปลี่ยนตาม
app/layout.js                ฟอนต์ไทย + Navbar + Footer
components/layout/           Navbar, SearchBar, ProfileMenu, Footer, Logo
components/products/         การ์ดสินค้า, แถบหมวดหมู่, ตัวกรอง, แบ่งหน้า, หน้ารายละเอียด, modal ติดต่อ
components/ui/               ไอคอน (inline SVG), Modal, ErrorState
lib/client/                  โค้ดฝั่งเบราว์เซอร์: เรียก API, session, ตัวกรองใน URL, ข้อความภาษาไทย
lib/client/mock/             ข้อมูลจำลอง (ดูหัวข้อถัดไป)
```

`lib/client/` เป็นของฝั่งหน้าเว็บล้วน **ไม่ import อะไรจาก `lib/` ของ backend** และไม่แตะไฟล์ใน `lib/` เลย
ไม่ได้ลงไลบรารีเพิ่มสักตัว (ไม่มี Tailwind/ไลบรารีไอคอน) `package.json` จึงไม่เปลี่ยน — ใช้ CSS Modules กับ inline SVG แทน

### เรียก API จากหน้าเว็บ

```js
import { listProducts } from '@/lib/client/products.js';
import { ApiError } from '@/lib/client/api.js';

try {
  const { data, pagination } = await listProducts({ keyword: 'calculus', sort: 'price_asc' });
} catch (error) {
  if (error instanceof ApiError) {
    // error.code เช่น 'VALIDATION_ERROR' · error.message เป็นภาษาไทย แสดงให้ผู้ใช้ได้เลย
    // error.field บอกว่าช่องไหนผิด ใช้กับฟอร์มได้
  }
}
```

- แนบ `Authorization: Bearer <token>` ให้อัตโนมัติ ถ้า API ตอบ 401 จะล้าง session ทิ้งให้เอง
- เช็กสถานะล็อกอินด้วย `useAuth()` → `{ status: 'loading' | 'guest' | 'authenticated', user, isAdmin }`
- ล็อกอิน/ออกจากระบบด้วย `login(email, password)` และ `logout()` จาก `lib/client/auth.js` (จัดการ token ให้แล้ว)
- เพิ่ม endpoint ใหม่: เพิ่มฟังก์ชันใน `lib/client/*.js` ที่เรียก `request()` แล้วเพิ่ม mock ใน `lib/client/mock/handlers.js`

### โหมดข้อมูลจำลอง (mock)

ใส่ `NEXT_PUBLIC_USE_MOCK_API=true` ใน `.env.local` แล้ว `npm run dev` — หน้าเว็บจะใช้ข้อมูลใน `lib/client/mock/`
แทนการยิง `/api/v1` ทำให้เปิดดู/เดโม/ทำ UI ได้โดยไม่ต้องมีคีย์ Supabase และไม่ต้องรอ TASK-09 merge

- สินค้าตัวอย่าง 22 ชิ้น หมวดหมู่และจุดนัดรับตรงกับ `supabase/seed.sql` และ `lib/constants.js`
- หน้า `/login` จะมีปุ่มล็อกอินด้วยบัญชีทดสอบให้กด (`nisit.k@student.chula.ac.th` / `UniTrade2026!` และ `admin@chula.ac.th` / `Admin2026!`)
- mock ลอกรูปแบบ response ของจริงมาทั้งหมด รวมถึง `{ data: [] }` ตอนไม่พบสินค้า — เปลี่ยนค่าเป็น `false` แล้วหน้าเว็บทำงานกับ API จริงได้ทันที
- **ค่าเริ่มต้นคือปิด** ถ้าไม่ใส่ตัวแปรนี้จะยิง API จริงเสมอ (บน Vercel ไม่ต้องตั้งค่าอะไร)

### เรื่องที่ฝาก BE / ทีม

1. `GET /products/:id/contact` ยังไม่มี (AGENTS.md §11 เขียนว่า out of scope) — หน้ารายละเอียดเรียก endpoint นี้ไว้แล้วและทำงานได้ในโหมด mock
   ขอให้ @wz บอกว่าจะทำใน task ไหน รูปแบบที่หน้าเว็บรออยู่คือ
   `{ seller: { full_name, faculty }, channels: [{ type: 'line'|'phone', value, deep_link, is_primary }], pickup_location, safety_note }`
   (ถ้าส่ง `phone_number` / `line_id` มาตรง ๆ หน้าเว็บก็สร้างลิงก์ LINE/โทรเองได้ รองรับไว้แล้ว)
2. `GET /categories` ส่ง `name` เป็นภาษาอังกฤษ (Textbooks, Apparel, …) หน้าเว็บแปลงเป็นภาษาไทยจาก `category_id`
   ที่ `lib/client/format.js` → `CATEGORY_LABELS_TH` ถ้าอยากให้ API ส่งชื่อไทยมาเลยค่อยคุยกัน
3. ตอนนี้รูปสินค้าใช้ `<img>` ธรรมดา ถ้าจะเปลี่ยนไปใช้ `next/image` ต้องเพิ่ม `images.remotePatterns` ของโดเมน Supabase ใน `next.config.mjs` — ขอ @wz ก่อน

---

## ลบข้อมูลทดสอบ

Bruno สมัครบัญชีใหม่ทุกครั้งที่รัน ด้วยอีเมล `bruno.<ตัวเลข>@student.chula.ac.th` ลบได้ใน Supabase SQL Editor:

```sql
-- log ของ admin ที่เกี่ยวกับประกาศทดสอบ (TASK-19) ต้องลบก่อนบรรทัดลบ users
delete from public.moderation_logs
where seller_id in (select user_id from public.users where email like 'bruno.%@student.chula.ac.th');
delete from public.users where email like 'bruno.%@student.chula.ac.th';
```

ถ้าทดสอบสร้างสินค้าด้วย ให้ลบสินค้าผ่าน `DELETE /api/v1/products/:id` ก่อน — การลบผู้ใช้ลบแถวสินค้าตามไปด้วย แต่ **ไม่ลบไฟล์รูปใน Storage**

## ติดปัญหา

ทักในกลุ่ม หรือ @wz โดยตรงสำหรับเรื่อง backend, key, ฐานข้อมูล

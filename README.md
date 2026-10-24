# UniTrade

ตลาดซื้อขาย/ส่งต่อของมือสองสำหรับนิสิตและบุคลากรจุฬาฯ — โปรเจกต์วิชา Software Engineering กลุ่ม VISIT CMU

Next.js 15 (App Router, JavaScript) · API อยู่ใต้ `/api/v1` · ฐานข้อมูลและรูปภาพอยู่บน Supabase
สัญญา API ฉบับเต็มคือ **API Specification v2.2** (ลิงก์อยู่ในตารางงาน TASK-05) — ถ้าโค้ดกับ spec ไม่ตรงกัน ให้ถือ spec แล้วแจ้งในกลุ่ม

> อัปเดตล่าสุด 24 ต.ค. 2569 โดย @wz (BE Lead)

---

## สถานะตอนนี้

| Task | งาน | ผู้รับผิดชอบ | สถานะ |
|---|---|---|---|
| TASK-01–05 | SRS, UI, ER/Sequence Diagram, Database, API Spec | ทุกคน | ✅ เสร็จ |
| **TASK-06** | Backend: Register, Login, Profile, JWT | @wz | ✅ **เสร็จ** — ทดสอบกับ Supabase จริงผ่าน 13/13 |
| TASK-07 | Frontend: Layout, Navbar, Routing, Theme | @yat | ⏳ ยังไม่มีโค้ดใน repo |
| TASK-08 | Frontend: หน้า Login, Register, Profile | @warixm | ⏳ ยังไม่มีโค้ดใน repo — **ต่อ API ได้แล้ว** |
| TASK-09 | Backend: API ดึงสินค้า, หมวดหมู่, จุดนัดรับ | @SArunPoB | 🔜 **เริ่มได้เลย** |
| TASK-10 | Frontend: หน้า Home + Product Grid | @yat | 🔜 รอ TASK-09 (ทำ UI ด้วยข้อมูลตัวอย่างจาก spec §5 ไปก่อนได้) |
| TASK-11 | Testing: Test Cases ระบบ Login และการแสดงสินค้า | @Aud | 🔜 ส่วน Login เริ่มได้เลย ใช้ `bruno/` เป็นตัวอย่าง |
| TASK-12 | Backend: API สร้าง/แก้ไข/ลบสินค้า + อัปโหลดรูป | @SArunPoB | 🔜 **เริ่มได้เลย** (`requireAuth` พร้อมแล้ว) |
| TASK-13 | Frontend: ฟอร์มลงประกาศ + แก้ไขสินค้า | @warixm | 🔜 รอ TASK-12 |

ฐานข้อมูลบน Supabase รัน migration ครบแล้ว (0001–0004) ไม่ต้องรันซ้ำ

## ต้องทำอะไรต่อ

**@SArunPoB** — ทำ TASK-09 แล้วต่อ TASK-12 รายละเอียดทุก endpoint (field, กติกา, error, รูปแบบ response) อยู่ใน [`AGENTS.md`](AGENTS.md) หัวข้อ 7–8
ถ้าใช้ AI agent ให้มันอ่าน `AGENTS.md` ก่อนเริ่ม ถ้าเขียนเอง อ่านหัวข้อ 4–10 ของไฟล์นั้นก็พอ

**@yat** — ตาม Spec §1.1 หน้าเว็บกับ API อยู่ในโปรเจกต์ Next.js เดียวกัน deploy ที่ Vercel ที่เดียว ไม่ต้องตั้ง CORS
วางหน้าใน `app/` ได้เลย (เช่น `app/login/page.js`) แทน `app/page.js` ที่เป็นหน้าชั่วคราว — ถ้ามีโปรเจกต์ FE แยกอยู่แล้ว บอก @wz ก่อน

**@warixm** — TASK-08 ต่อ API ได้แล้ว (ดูหัวข้อ "API ที่ใช้ได้แล้ว") · สำหรับ TASK-13: **ต้องย่อรูปฝั่งเบราว์เซอร์ก่อนส่ง** ให้รวมทุกรูปไม่เกิน 4MB
เพราะ Vercel รับ request ได้ไม่เกิน 4.5MB ทุกแพ็กเกจ (5 รูป × 2MB = 10MB จะโดนปฏิเสธบน production) แนะนำย่อด้านยาวเหลือ ~1600px แล้วบันทึกเป็น JPEG

**@Aud** — test case ฝั่ง Login/Register ดู request ใน `bruno/02–13` เป็นตัวอย่างได้ ทุก error code อยู่ในตารางด้านล่าง

**@wz** — รีวิว PR · ส่ง Supabase key ให้ BE ทาง DM · อัปเดต spec §1.5 (error code ใหม่ 4 ตัว) และ SRS §3.5 (Node 22)

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
app/                 หน้าเว็บ (FE) — ตอนนี้มีแค่หน้าชั่วคราว
lib/                 โค้ดกลางของ backend: auth, รูปแบบ response, Supabase client, ค่าคงที่
supabase/            migration + seed (รันบน Supabase แล้ว เก็บไว้เป็นหลักฐาน)
test/                unit test
bruno/               ชุดทดสอบ API — เปิดด้วยแอป Bruno หรือรัน npm run test:api
AGENTS.md            คู่มือละเอียดสำหรับคนทำ backend และ AI agent
```

**สำหรับคนเขียน backend** — ทุก route ต้องห่อด้วย `requireAuth` (ต้องล็อกอิน), `optionalAuth` (ไม่บังคับ) หรือ `route` (สาธารณะ)
เพราะ backend ต่อฐานข้อมูลด้วยสิทธิ์สูงสุด route ที่ลืมห่อคือข้อมูลรั่วทั้งฐาน ตัวอย่างโค้ดและกติกาทั้งหมดอยู่ใน `AGENTS.md` หัวข้อ 4–5

---

## ลบข้อมูลทดสอบ

Bruno สมัครบัญชีใหม่ทุกครั้งที่รัน ด้วยอีเมล `bruno.<ตัวเลข>@student.chula.ac.th` ลบได้ใน Supabase SQL Editor:

```sql
delete from public.users where email like 'bruno.%@student.chula.ac.th';
```

ถ้าทดสอบสร้างสินค้าด้วย ให้ลบสินค้าผ่าน `DELETE /api/v1/products/:id` ก่อน — การลบผู้ใช้ลบแถวสินค้าตามไปด้วย แต่ **ไม่ลบไฟล์รูปใน Storage**

## ติดปัญหา

ทักในกลุ่ม หรือ @wz โดยตรงสำหรับเรื่อง backend, key, ฐานข้อมูล

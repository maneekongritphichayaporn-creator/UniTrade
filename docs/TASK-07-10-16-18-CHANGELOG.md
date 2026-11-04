# TASK-07, 10, 16, 18: Frontend — สรุปการเปลี่ยนแปลงและสิ่งที่ต้องรู้

เอกสารนี้อธิบายว่างานฝั่งหน้าเว็บ 4 งานนี้เพิ่มอะไรเข้าโปรเจกต์บ้าง (เทียบกับโค้ดเดิมใน `main`) ไฟล์แต่ละอย่างอยู่ที่ไหนใน repo และสิ่งที่ทีมต้องรู้ก่อนทำงานต่อบนหน้าเว็บ

| หัวข้อ | รายละเอียด |
|---|---|
| รหัสงาน | TASK-07 (Layout/Theme) · TASK-10 (Home + Product Grid) · TASK-16 (Search + Filter) · TASK-18 (Product Detail + ข้อมูลติดต่อ) |
| branch | `feature/TASK-07-layout-theme` → `feature/TASK-10-16-home-search-filter` → `feature/TASK-18-product-contact` (ซ้อนกันตามลำดับ) |
| ผู้รับผิดชอบ | ยัต -- Frontend Lead |
| ผู้รีวิว | วซ -- Backend Lead |
| อ้างอิง | TASK-02 (UI/Figma ของ @film_), TASK-05 (API Spec v2.2), `AGENTS.md` หัวข้อ 6–7, `docs/TASK-09-CHANGELOG.md` |
| ฐานที่ rebase แล้ว | `main` @ `434a9c2` (หลัง merge PR #1 TASK-09 และ PR #2 TASK-12) |
| อัปเดตล่าสุด | 3 พฤศจิกายน 2569 |

**ช่องส่งงานใน sheet** — ชี้มาที่หัวข้อในเอกสารนี้ได้เลย: TASK-07 → หัวข้อ 3.1 · TASK-10 → 3.2 · TASK-16 → 3.3 · TASK-18 → 3.4

---

## 1. ภาพรวม

ก่อนงานชุดนี้ repo มีแต่ backend — `app/page.js` เป็นหน้าชั่วคราวที่เขียนว่า "UniTrade API" และไม่มีไฟล์หน้าเว็บเลย งานชุดนี้เพิ่มหน้าเว็บจริง 3 path พร้อมธีม ชั้นเรียก API และชั้นข้อมูลจำลองสำหรับทำ UI/เดโม

| Path | หน้า | Task | สถานะ |
|---|---|---|---|
| `/` | หน้าแรก: แถบหมวดหมู่, การ์ดสินค้า, ตัวกรอง, เรียงลำดับ, แบ่งหน้า | TASK-10 + TASK-16 | เสร็จ |
| `/products/[id]` | รายละเอียดสินค้า + ปุ่มดูข้อมูลติดต่อผู้ขาย | TASK-18 | เสร็จ (รอ endpoint ติดต่อจาก BE ดูหัวข้อ 7.1) |
| `/login` | **ตัวชั่วคราว** ไว้ให้ปุ่ม "เข้าสู่ระบบ" มีปลายทาง | TASK-08 @warixm | แทนที่ได้เลย |
| path อื่นที่ยังไม่มีคนทำ | ตกไปที่ `app/not-found.js` บอกว่าเป็นงานของใคร | — | ไม่พัง |

Navbar, Footer, ธีม, ชั้นเรียก API และ session ของ TASK-07 เป็นฐานที่ทุกหน้าที่เหลือ (TASK-08, 13, 14, 17, 20) ใช้ร่วมกัน

---

## 2. การเปลี่ยนแปลงเทียบกับ `main`

### 2.1 สรุปสั้น

| ประเภท | จำนวน | รายละเอียด |
|---|---|---|
| **เพิ่ม** | 54 ไฟล์ | หน้า 4 ไฟล์, component 28 ไฟล์ (JS + CSS Module), `lib/client/` 13 ไฟล์, ธีม 1 ไฟล์, รูป placeholder 1 ไฟล์, เอกสาร 2 ไฟล์ |
| **แก้** | 4 ไฟล์ | `app/layout.js`, `app/page.js`, `.env.example`, `README.md` (ดูหัวข้อ 2.3) |
| **ลบ** | 0 ไฟล์ | ไม่มีโค้ดเดิมถูกลบ |

รวม 58 ไฟล์ **+4,709 / -9** บรรทัด

**ไฟล์ของ backend ไม่ถูกแตะแม้แต่ไฟล์เดียว** — ไม่มีการแก้ `lib/*.js`, `app/api/`, `supabase/`, `test/`, `bruno/`, `AGENTS.md`, `package.json`, `package-lock.json` หรือ `next.config.mjs` ตรวจได้ด้วย

```bash
git diff --name-only main...feature/TASK-18-product-contact \
  | grep -E '^(lib/[^c]|app/api|supabase|test|bruno|package|next\.config|AGENTS)'
# ต้องไม่ได้ผลลัพธ์อะไรออกมา
```

### 2.2 ไฟล์ที่เพิ่ม

| ไฟล์ / โฟลเดอร์ | หน้าที่ |
|---|---|
| `app/globals.css` | ธีมทั้งเว็บ: ตัวแปรสี/ขนาด/เงาใน `:root` + คลาสกลาง (`.btn`, `.badge`, `.input`, `.card`, `.skeleton`) |
| `app/page.js` | หน้าแรก — ห่อ `HomeView` ด้วย `<Suspense>` (จำเป็นเพราะตัวกรองอ่าน `useSearchParams`) |
| `app/products/[id]/page.js` | หน้ารายละเอียด — `const { id } = await params;` ตามกติกา Next.js 15 |
| `app/login/page.js` | หน้าล็อกอินชั่วคราว (TASK-08 แทนที่ได้) |
| `app/not-found.js` | หน้า 404 กลาง ใช้กับ path ที่ยังไม่มีไฟล์ |
| `components/layout/` | `Navbar`, `SearchBar`, `ProfileMenu`, `Footer`, `Logo` + CSS Module ของแต่ละตัว |
| `components/products/` | `ProductCard`, `ProductGrid`, `StatusBadge`, `CategoryBar`, `FilterPanel`, `SortSelect`, `Pagination`, `EmptyState`, `HomeView`, `ProductDetailView`, `ContactSellerButton`, `SellerContactModal` |
| `components/ui/` | `icons.js` (inline SVG 16 ไอคอน), `Modal`, `ErrorState` |
| `components/auth/LoginPlaceholder.js` | เนื้อหาหน้าล็อกอินชั่วคราว |
| `lib/client/` | ชั้นเรียก API (`api.js`, `products.js`, `catalog.js`, `auth.js`), session (`session.js`, `useAuth.js`), ตัวกรองใน URL (`useProductQuery.js`), ข้อความไทย (`format.js`), path (`routes.js`), ค่าตั้งต้น (`config.js`) |
| `lib/client/mock/` | `data.js` + `handlers.js` — ข้อมูลจำลองที่ลอกรูปแบบ response ของจริงมา (ดูหัวข้อ 5.4) |
| `public/placeholder-product.svg` | รูปแทนเวลาสินค้าไม่มีรูปหรือรูปโหลดไม่ขึ้น |
| `docs/TASK-07-10-16-18-CHANGELOG.md` | เอกสารนี้ |
| `docs/REPORT-FRONTEND.md` | เนื้อหาสำหรับรายงานบทที่ 4.6 / 5.1 / 5.3 ฝั่งหน้าเว็บ (ไว้ให้ @Snow212 เอาไปรวมเล่ม) |

`lib/client/` แยกออกจาก `lib/` ของ backend ชัดเจน: **ไม่ import อะไรจาก `lib/` เลย** เพราะไฟล์ใน `lib/` ฝั่ง backend มี `server-only` และสร้าง Supabase client ด้วย `service_role` ซึ่งห้ามหลุดไปอยู่ใน bundle ของเบราว์เซอร์ (`AGENTS.md` หัวข้อ 4.2 ข้อ 5)

### 2.3 ไฟล์ที่แก้ (4 ไฟล์)

| ไฟล์ | แก้อะไร | เหตุผล |
|---|---|---|
| `app/layout.js` | ใส่ฟอนต์ Noto Sans Thai (`next/font/google`), `<html lang="th">`, metadata + themeColor, skip link, `<Navbar/>` / `<main>` / `<Footer/>` | เดิมเป็น layout เปล่าที่ @wz วางไว้เป็น skeleton |
| `app/page.js` | จากหน้าชั่วคราว "UniTrade API" เปลี่ยนเป็นหน้าแรกจริง | @wz เขียนไว้ใน README ว่าหน้านี้เป็นหน้าชั่วคราว ให้ FE ทับได้ |
| `.env.example` | **เพิ่ม** หัวข้อฝั่งหน้าเว็บ 1 ตัวแปร: `NEXT_PUBLIC_USE_MOCK_API=` (ค่าว่าง = ใช้ API จริง) | ไม่ได้แก้หรือลบตัวแปรเดิมของ backend แม้แต่บรรทัดเดียว |
| `README.md` | อัปเดตตารางสถานะ + เพิ่มหัวข้อ "หน้าเว็บ (Frontend)" | ตามที่ @Snow212 บอกว่าให้เขียนไว้ว่างานอยู่ส่วนไหนใน repo |

> ตัวแปร `NEXT_PUBLIC_USE_MOCK_API` ไม่ใช่ความลับและไม่เกี่ยวกับ Supabase — เป็นแค่สวิตช์ว่าจะใช้ข้อมูลจำลองหรือไม่ ไม่มีการตั้งชื่อ `NEXT_PUBLIC_*` ให้คีย์ใด ๆ ของ Supabase

---

## 3. งานแต่ละ task

### 3.1 TASK-07 — Layout, Navbar, Routing, Theme

ฐานของทุกหน้า ไม่มี UI ของตัวเองนอกจาก Navbar/Footer/404

**ธีม** — `app/globals.css` เก็บทุกค่าไว้ใน `:root` ที่เดียว แก้สีที่นี่ทุกหน้าเปลี่ยนตาม

| กลุ่ม | ตัวแปร |
|---|---|
| แบรนด์ | `--brand-50 … --brand-700` (ชมพู `#d6608a` เป็นสีหลัก) |
| ตัวอักษร/เส้น/พื้น | `--ink`, `--ink-soft`, `--muted`, `--line`, `--surface`, `--white` |
| สถานะสินค้า | `--available` เขียว · `--reserved` ส้ม · `--sold` เทา + คู่ `-soft` สำหรับพื้นป้าย |
| อื่น ๆ | `--radius-sm/–/‑lg/‑pill`, `--shadow-sm/–/‑lg`, `--container: 1200px`, `--navbar-height: 64px` |

สีชุดนี้ **ประมาณจาก Figma หน้า UI ของ @film_** ถ้า inspect ค่าจริงแล้วต่างให้แก้ที่ `:root` จุดเดียว

**Navbar** (`components/layout/Navbar.js`) — โลโก้, ช่องค้นหา, ปุ่ม "+ ลงขายสินค้า", ไอคอนรายการโปรด, แล้วฝั่งขวาเปลี่ยนตามสถานะล็อกอิน 3 แบบ: `loading` แสดง skeleton · `guest` แสดงปุ่มเข้าสู่ระบบ · `authenticated` แสดง `ProfileMenu` จอแคบยุบเป็นปุ่มแฮมเบอร์เกอร์

**Routing** — path ทุกอันรวมใน `lib/client/routes.js` ใช้ `routes.product(id)` แทนการพิมพ์ `/products/${id}` กระจายในโค้ด
**ไม่ได้สร้างไฟล์หน้าของคนอื่นดักไว้ล่วงหน้า** (เช่น `app/register/page.js`) เพื่อไม่ให้ชนกับ TASK-08/13/14/17/20 ตอน merge — path ที่ยังไม่มีไฟล์จะตกไปที่ `app/not-found.js` ซึ่งบอกว่าเป็นงานของ task ไหน สร้างไฟล์ทับได้เลย

**ชั้นเรียก API** (`lib/client/api.js`) — `request(path, { method, query, body, signal })` ตัวเดียวที่ทุกหน้าเรียกผ่าน

- แนบ `Authorization: Bearer <token>` ให้อัตโนมัติถ้ามี session
- แปลง error ของ API (`{ error: { code, message, field } }`) เป็น `ApiError` ที่มี `.status .code .message .field` — `message` เป็นภาษาไทยจาก backend อยู่แล้ว แสดงให้ผู้ใช้ได้ตรง ๆ
- 401 ขณะที่มี token = token หมดอายุ → ล้าง session ทิ้งเอง
- เน็ตหลุด / fetch พัง → `ApiError` code `NETWORK_ERROR` ไม่ปล่อยหน้าขาว
- query ที่เป็น array จะ join ด้วย comma ให้ตรงกับที่ `parseProductQuery` ฝั่ง backend รับ

**session** (`lib/client/session.js`) — เก็บ token + user ใน `localStorage` key `unitrade.session` อ่านผ่าน `useSyncExternalStore` ทำให้ทุก component เห็นค่าเดียวกันและอัปเดตพร้อมกัน รวมถึงเวลาเปลี่ยนใน tab อื่น (`storage` event) ตอน SSR `getServerSnapshot` คืน `undefined` จึงได้สถานะ `loading` ไม่กระพริบสลับหน้า ทุกการอ่าน/เขียนห่อ try/catch ไว้ (โหมดส่วนตัวของ Safari เขียน `localStorage` ไม่ได้)

### 3.2 TASK-10 — หน้าแรก + Product Card Grid

`components/products/HomeView.js` เป็นตัวคุม: โหลดหมวดหมู่กับจุดนัดรับครั้งเดียว แล้วโหลดสินค้าใหม่ทุกครั้งที่ตัวกรองเปลี่ยน (ยกเลิกคำขอเก่าด้วย `AbortController` กัน response เก่ามาทับของใหม่)

| ส่วน | ไฟล์ | รายละเอียด |
|---|---|---|
| การ์ดสินค้า | `ProductCard.js` | รูป (`loading="lazy"`), ชื่อตัดที่ 2 บรรทัด, ราคา, ป้ายสถานะ, จุดนัดรับ, เวลาแบบ "3 วันที่ผ่านมา" |
| ตาราง | `ProductGrid.js` | 2 คอลัมน์บนมือถือ → 3 ที่ ≥620px → 4 ที่ ≥1000px |
| ระหว่างโหลด | `ProductGridSkeleton` | การ์ดเปล่าจำนวนเท่าหน้าเดิม ความสูงไม่กระโดด |
| ป้ายสถานะ | `StatusBadge.js` | `พร้อมขาย` / `ติดจอง` / `ขายแล้ว` สีตาม token ของ TASK-07 |
| แถบหมวดหมู่ | `CategoryBar.js` | ปุ่มกลม เลือกหลายหมวดได้ + จำนวนสินค้าต่อหมวด + ปุ่ม "ทั้งหมด" |
| แบ่งหน้า | `Pagination.js` | ย่อเลขหน้าด้วย `…` เมื่อมีหลายหน้า |
| ไม่พบสินค้า | `EmptyState.js` | ใช้ `message` ที่ API ส่งมา (`"ไม่พบสินค้าที่ตรงกับเงื่อนไข ลองปรับตัวกรองหรือคำค้นหา"`) ไม่เขียนข้อความซ้ำในหน้าเว็บ |
| ยิง API พัง | `components/ui/ErrorState.js` | แสดง `error.message` + `error.code` และปุ่มลองใหม่ |

**ราคา 0 แสดงว่า "แจกฟรี"** ไม่ใช่ "0 บาท" — เช็กจาก `is_free` ที่ API คำนวณมาให้ ไม่คำนวณเองซ้ำ

**ชื่อหมวดหมู่** — `GET /categories` ส่ง `name` เป็นภาษาอังกฤษ (`Textbooks`, `Apparel`, …) หน้าเว็บจึงแปลงเป็นไทยที่ `lib/client/format.js` → `CATEGORY_LABELS_TH` โดยอิง `category_id` ที่ `AGENTS.md` หัวข้อ 7.2 ยืนยันว่าเป็น UUID คงที่ `…0001`–`…0006` ถ้าเจอ id ที่ไม่รู้จักจะ fallback ไปใช้ `name` จาก API

### 3.3 TASK-16 — Search Bar + Filter Sidebar

**หลักการ: URL เป็นแหล่งความจริงอันเดียว** ของตัวกรองทั้งหมด ไม่มี state ซ่อนอยู่ใน component

`lib/client/useProductQuery.js` อ่านตัวกรองจาก `useSearchParams` แล้วแปลงเป็น query ของ API ด้วย `toApiQuery()` ผลที่ได้:

- กดปุ่มย้อนกลับของเบราว์เซอร์แล้วตัวกรองย้อนตามจริง
- ก็อป URL ส่งให้เพื่อนแล้วเห็นผลลัพธ์เดียวกัน
- refresh แล้วตัวกรองไม่หาย
- ค่าที่เท่ากับค่าเริ่มต้นจะถูกถอดออกจาก URL ลิงก์ที่แชร์จึงสั้น (`/?keyword=calculus` ไม่ใช่ `/?keyword=calculus&page=1&sort=date_desc&status=available`)
- เปลี่ยนตัวกรองอื่นเมื่อไร `page` รีเซ็ตเป็น 1 ให้เอง (กันกรณีกรองแล้วเหลือ 2 หน้า แต่ยังค้างอยู่หน้า 5 แล้วเจอหน้าว่าง)

| ตัวกรอง | ไฟล์ | หมายเหตุ |
|---|---|---|
| คำค้นหา | `components/layout/SearchBar.js` | หน่วง 400 ms · `maxLength=100` ตรงกับกติกา `keyword` ของ API · อยู่บนหน้าแรกใช้ `router.replace` (ไม่ถมประวัติทุกตัวอักษร) อยู่หน้าอื่นใช้ `push` กลับมาที่ `/?keyword=` |
| หมวดหมู่ | `CategoryBar.js` + `FilterPanel.js` | เลือกหลายหมวด → ส่งเป็น `category_id` คั่น comma |
| ช่วงราคา | `FilterPanel.js` | หน่วง 500 ms · `sanitizePrice` ตัดอักขระที่ไม่ใช่ตัวเลขออกก่อนส่ง |
| แจกฟรีเท่านั้น | `FilterPanel.js` | `free_only=true` |
| จุดนัดรับ | `FilterPanel.js` | dropdown จาก `GET /pickup-locations` **ไม่ฮาร์ดโค้ดรายชื่อซ้ำ** ในหน้าเว็บ (ต้อง match แบบตรงตัวกับ `PICKUP_LOCATIONS` ไม่งั้น API ตอบ 422) |
| สภาพสินค้า | `FilterPanel.js` | radio `ใหม่ / เหมือนใหม่ / สภาพดี / พอใช้` |
| รวมของที่ขายแล้ว | `FilterPanel.js` | checkbox "แสดงของที่ติดจอง/ขายแล้วด้วย" → `status=all` (ค่าเริ่มต้นคือ `available`) |
| เรียงลำดับ | `SortSelect.js` | ใหม่สุด / เก่าสุด / ราคาน้อย→มาก / ราคามาก→น้อย |

จอ ≥1000px ตัวกรองเป็น sidebar ติดขอบซ้ายแบบ sticky · จอแคบกว่านั้นยุบเป็นปุ่ม "ตัวกรอง" ที่เปิดเป็นแผงเลื่อนขึ้นมา พร้อมตัวเลขบอกจำนวนตัวกรองที่เปิดอยู่

### 3.4 TASK-18 — หน้ารายละเอียดสินค้า + ข้อมูลติดต่อผู้ขาย

`components/products/ProductDetailView.js` — แกลเลอรีรูป (รูปหลักขึ้นก่อนตามที่ API เรียงมาให้) + thumbnail, ชื่อ, ป้ายสถานะ, ราคา, สภาพ, หมวด, จุดนัดรับ, คำบรรยาย และการ์ดผู้ขาย (ชื่อย่อ, คณะ, จำนวนประกาศที่ยังขายอยู่, เป็นสมาชิกตั้งแต่เมื่อไร)

สถานะ `reserved` / `sold` จะขึ้นข้อความกำกับไว้เหนือปุ่ม ว่าสินค้าติดจองหรือขายแล้ว

**ข้อมูลติดต่อ — ตาม FR-06 ไม่หลุดมาในหน้ารายละเอียด**

`GET /products/:id` **ไม่มี** เบอร์โทรหรือ LINE ID อยู่ใน response (ยืนยันแล้วใน `AGENTS.md` หัวข้อ 7.5 และ Bruno request 25) หน้าเว็บจึงไม่มีทางเผลอแสดงข้อมูลติดต่อให้คนที่ไม่ได้ล็อกอิน ปุ่มติดต่อ (`ContactSellerButton.js`) ทำงาน 2 ทาง:

| สถานะผู้ใช้ | พฤติกรรม |
|---|---|
| ยังไม่ล็อกอิน | ปุ่มพาไป `/login?next=/products/<id>` พร้อมข้อความ "เข้าสู่ระบบด้วยอีเมลจุฬาฯ เพื่อดูข้อมูลติดต่อ" ล็อกอินเสร็จเด้งกลับมาหน้าเดิม |
| ล็อกอินแล้ว | กดแล้วค่อยยิง `GET /products/:id/contact` **ตอนนั้น** แล้วเปิด modal — ไม่ได้โหลดข้อมูลติดต่อมารอไว้ล่วงหน้า |

`?next=` กรองด้วย `safeNextPath()` ใน `lib/client/routes.js` รับเฉพาะ path ที่เริ่มด้วย `/` และไม่ขึ้นต้นด้วย `//` กัน open redirect ไปเว็บนอก

`SellerContactModal.js` สร้างลิงก์ `https://line.me/ti/p/~<line_id>` และ `tel:<เบอร์>` ให้กดต่อได้ พร้อมคำเตือนความปลอดภัย ("นัดรับในพื้นที่จุฬาฯ ช่วงเวลากลางวัน และตรวจสอบสินค้าก่อนชำระเงินทุกครั้ง") ตาม SRS

**ไม่พบสินค้า** — `lib/client/products.js` → `getProduct()` ถือว่าไม่พบเมื่อ body ไม่มี `product_id` (คือ `200` + `{ "data": [] }` ตามที่ @wz ตัดสินใจในรีวิว TASK-09) **และ** เผื่อกรณี 404 `PRODUCT_NOT_FOUND` ไว้ด้วย เพื่อให้หน้าเว็บไม่พังถ้าวันหลัง BE เปลี่ยนไปใช้ 404 ทั้งสองกรณีขึ้นหน้า "ไม่พบสินค้าชิ้นนี้" เหมือนกัน

---

## 4. API ที่หน้าเว็บเรียก

| Endpoint | เรียกจาก | ฟังก์ชันใน `lib/client/` |
|---|---|---|
| `GET /products` | หน้าแรก (ทุกครั้งที่ตัวกรองเปลี่ยน) | `listProducts(filters)` |
| `GET /products/:id` | หน้ารายละเอียด | `getProduct(id)` |
| `GET /categories` | แถบหมวดหมู่ + ตัวกรอง (โหลดครั้งเดียว) | `getCategories()` |
| `GET /pickup-locations` | dropdown จุดนัดรับ (โหลดครั้งเดียว) | `getPickupLocations()` |
| `GET /products/:id/contact` | ปุ่มติดต่อผู้ขาย | `getProductContact(id)` — **endpoint ยังไม่มี ดูหัวข้อ 7.1** |
| `POST /auth/login` | หน้าล็อกอินชั่วคราว | `login(email, password)` |
| `GET /auth/me` | ตรวจ session | `getMe()` |

ยังไม่ได้เรียก `POST/PATCH/DELETE /products` ของ TASK-12 — นั่นเป็นงาน TASK-13/14 ของ @warixm

**ทุกคำขอวิ่งผ่าน `/api/v1` เท่านั้น** ไม่มีการสร้าง Supabase client ในโค้ดเบราว์เซอร์ และไม่มีตัวแปร `NEXT_PUBLIC_` ที่เป็นคีย์ Supabase ตามกฎข้อ 4.2 ของ `AGENTS.md`

---

## 5. การตัดสินใจทางเทคนิค

### 5.1 ไม่ลงไลบรารีเพิ่มเลย

`package.json` และ `package-lock.json` **ไม่เปลี่ยนแม้แต่บรรทัดเดียว** ตามกฎของ @Snow212 ที่ว่าห้ามแก้ไฟล์ตั้งค่ากลางตามใจ และต้องแจ้งทีมก่อนลง library

| อยากได้ | ปกติจะใช้ | ที่ใช้จริง |
|---|---|---|
| ระบบสไตล์ | Tailwind | CSS Modules (มีใน Next.js อยู่แล้ว) + ตัวแปร CSS ใน `app/globals.css` |
| ไอคอน | `lucide-react` | `components/ui/icons.js` — inline SVG 16 ตัว วาดจาก path ของ Lucide |
| ฟอนต์ไทย | ลงไฟล์ฟอนต์ | `next/font/google` → Noto Sans Thai (เป็นส่วนหนึ่งของ Next.js) |
| รูปภาพ | `next/image` | `<img loading="lazy">` เพราะ `next/image` ต้องเพิ่ม `images.remotePatterns` ของโดเมน Supabase ใน `next.config.mjs` ซึ่งเป็นไฟล์ตั้งค่ากลาง (ดูหัวข้อ 7.3) |

### 5.2 ไม่ใช้ TypeScript

repo นี้เป็น JavaScript ESM ล้วน (`"type": "module"`, ไม่มี `tsconfig.json`) ไฟล์หน้าเว็บทั้งหมดจึงเป็น `.js` ตามสไตล์เดิม ใช้ path alias `@/` ที่ `jsconfig.json` ตั้งไว้แล้ว

### 5.3 คอมเมนต์และข้อความเป็นภาษาไทย

ตาม `AGENTS.md` หัวข้อ 4.4 — คอมเมนต์ในโค้ดสั้น ๆ เป็นไทย และข้อความที่ผู้ใช้เห็นเป็นไทยทั้งหมด ข้อความ error ใช้ `message` ที่ backend ส่งมาเลย ไม่เขียนคำแปลของตัวเองซ้อนทับ (ถ้า BE แก้ข้อความ หน้าเว็บเปลี่ยนตามอัตโนมัติ)

### 5.4 โหมดข้อมูลจำลอง (mock)

ใส่ `NEXT_PUBLIC_USE_MOCK_API=true` ใน `.env.local` แล้ว `npm run dev` → หน้าเว็บใช้ข้อมูลใน `lib/client/mock/` แทนการยิง `/api/v1`

ทำไว้เพราะตอนเริ่ม TASK-10 นั้น TASK-09 ยังไม่ merge และคนที่ไม่มีคีย์ Supabase (เช่น @Aud ตอนทำ test case หรือเวลาเดโมหน้าห้อง) ก็ยังเปิดดูหน้าเว็บได้

- สินค้า 22 ชิ้น (18 ชิ้น `available`), 6 หมวดหมู่ **ตรงกับ `supabase/seed.sql`**, จุดนัดรับ 9 แห่ง **ตรงกับ `lib/constants.js` แบบตัวต่อตัว**
- `handlers.js` ลอกพฤติกรรมของจริงมาครบ: `publicName()` แบบย่อนามสกุล, รูปแบบ `{ data, pagination }`, `{ data: [] }` ตอนไม่พบสินค้า, 422 ตอนส่ง `status`/`pickup_location` ผิด, 401 ตอนขอข้อมูลติดต่อโดยไม่ล็อกอิน, หน่วงเวลา 280 ms ให้เห็น skeleton
- รูปสินค้าเป็น SVG data-URI สร้างจาก `product_id` **ไม่มีไฟล์รูปเข้า repo**
- **ค่าเริ่มต้นคือปิด** ไม่ใส่ตัวแปรนี้ = ยิง API จริงเสมอ บน Vercel ไม่ต้องตั้งค่าอะไรเพิ่ม

### 5.5 ไม่สร้างไฟล์หน้าของคนอื่นดักไว้

เลี่ยง merge conflict กับ TASK-08/13/14/17/20 — มีข้อยกเว้นเดียวคือ `app/login/page.js` ซึ่งจำเป็นเพราะปุ่มติดต่อผู้ขายของ TASK-18 ต้องมีปลายทาง ไฟล์นั้นเขียนกำกับไว้ชัดว่าเป็นตัวชั่วคราวของ TASK-08 และแทนที่ได้เลย

---

## 6. การทดสอบ

### 6.1 อัตโนมัติ

| คำสั่ง | ผล |
|---|---|
| `npm run build` | ผ่านทั้ง 3 branch แยกกัน (ทดสอบทีละ branch ไม่ใช่เฉพาะ branch ปลาย) |
| `npm test` | **50/50 ผ่าน** — unit test ของ backend ไม่ได้รับผลกระทบ (ไม่ได้แก้ `lib/` หรือ `test/`) |

ยังไม่มี unit test ของฝั่งหน้าเว็บ เพราะ repo ยังไม่มีตัวรัน test สำหรับ React component (ต้องลง library เพิ่ม ซึ่งต้องขอทีมก่อน) ฟังก์ชันที่ควรมี test มากที่สุดคือ `readFilters`/`toApiQuery` ใน `useProductQuery.js` และ `pageItems` ใน `Pagination.js` — ตอนนี้ตรวจด้วยมือด้วย node script แล้ว (กรณี 2 / 7 / 20 หน้า) ถ้าทีมตกลงจะลงตัวรัน test ฝั่ง FE เมื่อไร ผมเขียน test ให้ได้

### 6.2 ทดสอบด้วยมือ (โหมด mock, Chrome)

ผ่านทั้งหมด:

- หน้าแรกโหลดขึ้น เห็นการ์ดสินค้า 12 ชิ้นต่อหน้า
- ค้นหาคำไทยและคำอังกฤษ · ค้นแล้วไม่เจอ → ขึ้นข้อความจาก API ไม่ใช่หน้าว่าง
- กรองหมวดหมู่หลายหมวดพร้อมกัน · ช่วงราคา · แจกฟรีเท่านั้น · จุดนัดรับ · สภาพสินค้า · แสดงของที่ขายแล้ว
- เรียงลำดับ 4 แบบ · เปลี่ยนหน้า · กดย้อนกลับแล้วตัวกรองย้อนตาม · refresh แล้วตัวกรองไม่หาย
- ก็อป URL ที่มีตัวกรองไปเปิดใหม่ → ได้ผลเดียวกัน
- เข้าหน้ารายละเอียด · สลับรูป · เปิด `/products/<uuid มั่ว>` → ขึ้น "ไม่พบสินค้า" ไม่ขึ้นหน้าพัง
- ยังไม่ล็อกอินกดปุ่มติดต่อ → ไป `/login?next=…` · ล็อกอินแล้วเด้งกลับหน้าเดิม · กดอีกครั้ง → เปิด modal เห็นข้อมูลติดต่อ
- เปิด path ที่ยังไม่มีคนทำ (`/me/wishlist`) → หน้า 404 ที่เขียนไว้ ไม่ใช่หน้า error ของ Next.js
- จอ 390px: Navbar ยุบเป็นแฮมเบอร์เกอร์ · ตัวกรองเปิดเป็นแผงเลื่อน · การ์ด 2 คอลัมน์
- console ไม่มี error และไม่มี warning เรื่อง hydration

### 6.3 ที่ยังทดสอบไม่ได้

- **ยังไม่ได้ยิง API จริงบน Supabase** เพราะผมไม่มี `SUPABASE_SERVICE_ROLE_KEY` (และตามกฎไม่ควรมี) — mock ลอกรูปแบบ response มาจาก `lib/products.js` กับ `AGENTS.md` หัวข้อ 7 ตัวต่อตัว แต่ขอให้คนที่มีคีย์ (@wz / @SArunPoB) ลองเปิดหน้าเว็บโดยไม่ใส่ `NEXT_PUBLIC_USE_MOCK_API` ยืนยันอีกรอบ
- `GET /products/:id/contact` ทดสอบได้แค่ในโหมด mock เพราะ endpoint จริงยังไม่มี (หัวข้อ 7.1)

---

## 7. เรื่องที่ขอให้ทีมยืนยัน

### 7.1 `GET /products/:id/contact` ยังไม่มีใครทำ

`AGENTS.md` หัวข้อ 11 ระบุว่า endpoint นี้ out of scope ของฝั่ง backend แต่ TASK-18 ต้องใช้ หน้าเว็บเรียกไว้แล้วและทำงานได้ในโหมด mock **ขอ @wz บอกว่าจะทำใน task ไหน**

รูปแบบที่หน้าเว็บรออยู่ (ตาม TASK-05 Spec):

```json
{
  "seller": { "full_name": "กันตภณ ช.", "faculty": "คณะวิศวกรรมศาสตร์" },
  "channels": [
    { "type": "line", "value": "kantaphon_c", "deep_link": "https://line.me/ti/p/~kantaphon_c", "is_primary": true },
    { "type": "phone", "value": "0812345678", "deep_link": "tel:0812345678", "is_primary": false }
  ],
  "pickup_location": "ศาลาพระเกี้ยว",
  "safety_note": "…"
}
```

ถ้าทำง่ายกว่านี้ โดยส่ง `{ "phone_number": …, "line_id": … }` มาตรง ๆ ก็ได้ — `SellerContactModal.js` รองรับไว้ทั้งสองแบบ สร้างลิงก์ LINE/โทรเองได้ ขอแค่เป็น `requireAuth` และ **ไม่โผล่ใน `GET /products/:id`**

### 7.2 `AGENTS.md` หัวข้อ 11 เขียนว่า "any frontend page" เป็น out of scope

เข้าใจว่าประโยคนั้นเขียนไว้คุม AI agent ฝั่ง backend ไม่ให้ไปแตะหน้าเว็บ ซึ่งถูกต้อง แต่ตอนนี้หน้าเว็บอยู่ใน repo เดียวกันแล้ว ถ้า @wz จะเพิ่มประโยคกำกับว่า "หน้าเว็บอยู่ใน `app/` และ `components/` เป็นงานของ FE" จะช่วยไม่ให้ agent ของฝั่ง BE เผลอแก้ไฟล์ของ FE (และกลับกัน)

### 7.3 `next/image` ต้องแก้ `next.config.mjs`

รูปสินค้าตอนนี้ใช้ `<img loading="lazy">` ถ้าจะเปลี่ยนไปใช้ `next/image` (ได้ WebP + ย่อรูปอัตโนมัติ) ต้องเพิ่ม `images.remotePatterns` ของโดเมน Supabase Storage ใน `next.config.mjs` ซึ่งเป็นไฟล์ตั้งค่ากลาง — **ขอ @wz อนุมัติก่อน ผมไม่แก้เอง**

### 7.4 ชื่อหมวดหมู่เป็นภาษาอังกฤษ

`GET /categories` ส่ง `name` เป็น `Textbooks`, `Apparel`, … หน้าเว็บแปลงเป็นไทยเองจาก `category_id` (หัวข้อ 3.2) ใช้งานได้ปกติ แต่ถ้าอยากให้ API ส่งชื่อไทยมาเลย (เพิ่มคอลัมน์ `name_th` หรือเปลี่ยนค่าใน seed) ต้องเป็น migration ใหม่ ซึ่งเป็นงานของ @wz

### 7.5 ค่าสีประมาณจาก Figma

สีใน `:root` ของ `app/globals.css` ประมาณจากหน้า UI ของ @film_ **ฝาก @film_ ช่วย inspect ค่าจริงให้** ถ้าต่างแก้ที่ `:root` จุดเดียว ทุกหน้าเปลี่ยนตาม

---

## 8. สำหรับคนที่ทำหน้าเว็บต่อ (TASK-08, 13, 14, 17, 20)

สิ่งที่มีให้ใช้แล้ว ไม่ต้องเขียนใหม่:

```js
// path — อย่าพิมพ์ path เอง
import { routes } from '@/lib/client/routes.js';

// เรียก API — แนบ token ให้เอง แปลง error เป็น ApiError ให้เอง
import { request } from '@/lib/client/api.js';
import { ApiError } from '@/lib/client/api.js';

// สถานะล็อกอิน
import { useAuth } from '@/lib/client/useAuth.js';
const { status, user, isAdmin } = useAuth(); // 'loading' | 'guest' | 'authenticated'

// ข้อความไทย + รูปแบบราคา/วันที่
import { formatPrice, STATUS_LABELS, ITEM_CONDITION_LABELS, categoryLabel } from '@/lib/client/format.js';

// UI ที่ใช้ซ้ำได้
import { Modal } from '@/components/ui/Modal.js';
import { ErrorState } from '@/components/ui/ErrorState.js';
import { ProductGrid } from '@/components/products/ProductGrid.js';
import { StatusBadge } from '@/components/products/StatusBadge.js';
```

คลาส CSS กลางที่ใช้ได้ทุกหน้า: `.container` `.btn` (`--primary` `--outline` `--ghost` `--block` `--lg` `--sm`) `.badge` `.label` `.input` `.select` `.checkbox` `.card` `.muted` `.skeleton` `.sr-only`

เพิ่ม endpoint ใหม่: เขียนฟังก์ชันใน `lib/client/<area>.js` ที่เรียก `request()` แล้วเพิ่ม handler ตัวเดียวกันใน `lib/client/mock/handlers.js` เพื่อให้โหมด mock ยังใช้ได้

**สำหรับ TASK-13 (@warixm)** — `POST /products` เป็น `multipart/form-data` ส่งช่อง `images` ซ้ำได้หลายครั้ง รูปแรกเป็นรูปหลัก และ **ต้องย่อรูปฝั่งเบราว์เซอร์** ให้รวมไม่เกิน 4 MB (Vercel ปฏิเสธ request เกิน 4.5 MB) รายละเอียดอยู่ใน `docs/TASK-12-CHANGELOG.md` และ `AGENTS.md` หัวข้อ 8.1

# Contact API และ My Listings API — สรุปงานและหลักฐานการทดสอบ

เอกสารนี้สรุป 2 endpoint ที่อยู่ใน API Specification v2.2 แต่ไม่มีใบงานฝั่ง backend รองรับ จึงยังไม่ถูกสร้างจนถึง 15 พฤศจิกายน 2569

| หัวข้อ | รายละเอียด |
|---|---|
| Endpoint | `GET /api/v1/products/:id/contact` (FR-06, Spec §8.1) · `GET /api/v1/me/products` (UC-03, Spec §7.1) |
| หน้าเว็บที่ใช้ | ปุ่ม "ติดต่อผู้ขาย" ในหน้าสินค้า (TASK-18) · หน้า "ประกาศของฉัน" `/me/products` (TASK-14) |
| branch | `task-contact-me-products` |
| ผู้รับผิดชอบ | วซ -- Backend Lead |
| อัปเดตล่าสุด | 15 พฤศจิกายน 2569 |

---

## 1. ทำไมก่อนหน้านี้ยังไม่มี

ใบงานใน Kanban ครอบคลุม 20 จาก 22 endpoint ใน spec สอง endpoint นี้มีแต่ใบงานฝั่งหน้าเว็บ (TASK-14, TASK-18) ไม่มีใบงานฝั่ง backend
และ `AGENTS.md` เดิมระบุว่าเป็น out of scope จนกว่า @wz จะสั่ง หน้าเว็บจึงทำงานได้เฉพาะโหมดข้อมูลจำลอง (mock) สำหรับปุ่มติดต่อ
และหน้า "ประกาศของฉัน" ใช้วิธีดึงสินค้าทั้งหมดแล้วกรองในเบราว์เซอร์

## 2. `GET /products/:id/contact`

- ต้องล็อกอิน (`requireAuth`) ไม่มี token → `401 UNAUTHORIZED`
- รูปแบบตาม Spec §8.1: `seller` (`user_id`, `full_name` ชื่อเต็ม, `faculty`), `channels`, `pickup_location`, `safety_note`
- `channels` มีเฉพาะช่องทางที่ผู้ขายกรอกไว้ (FR-06 ข้อ 3): LINE เป็นช่องทางหลักถ้ามี ลิงก์ `https://line.me/ti/p/~<line_id>` · โทร `tel:+66…`
- ไม่ส่ง `email` หรือ `password_hash` และ select ระบุคอลัมน์ `users` เอง
- ไม่พบสินค้า หรือ id ไม่ใช่ UUID → `404 PRODUCT_NOT_FOUND`
- สิ่งที่ SRS FR-06 ข้อ 5 ให้ Backend Lead ตัดสิน: **ดูได้ทุกสถานะรวม Sold** และ **เจ้าของดูของตัวเองได้** เพราะหน้าสินค้าแสดงปุ่มนี้ทุกสถานะและแสดงกับเจ้าของด้วย ถ้าปฏิเสธ ผู้ใช้จะเห็นข้อผิดพลาดแทน
- หน้าเว็บไม่ต้องแก้: `getProductContact()` และ modal อ่านรูปแบบนี้อยู่แล้ว

โค้ด: `app/api/v1/products/[id]/contact/route.js`, `lib/contact.js`

## 3. `GET /me/products`

- ต้องล็อกอิน คืนประกาศของผู้ใช้เองทุกสถานะ เรียงล่าสุดก่อน
- query `page` (ค่าเริ่มต้น 1), `per_page` (ค่าเริ่มต้น 20 สูงสุด 50) ค่าไม่ถูกต้อง → `422 VALIDATION_ERROR`
- `data` เป็นการ์ดแบบเดียวกับ `GET /products` + `wishlist_count` เพราะหน้า My Listings ใช้ `is_free` และ `category` ซึ่ง Spec §7.1 ไม่มี
- มี `pagination` และ `summary` (`available`, `reserved`, `sold`) ตาม spec
- หน้าเว็บ: `listMyProducts()` ใน `lib/client/products.js` เรียก endpoint นี้ทีละ 50 จนครบ (โหมด mock ใช้วิธีเดิม) `MyProducts.js` ไม่ต้องแก้

โค้ด: `app/api/v1/me/products/route.js`, `lib/my-products.js`

## 4. การทดสอบ (15 พฤศจิกายน 2569)

| ชุดทดสอบ | ผล |
|---|---|
| `npm test` | 74/74 ผ่าน (เพิ่ม `test/contact.test.js`, `test/my-products.test.js` 11 เคส) |
| `npm run build` | ผ่าน |
| `npm run test:api` | Requests 95 (ผ่าน 82, ข้าม 13 คือ request ฝั่ง admin เมื่อไม่มี `bruno/.env`), Tests 89/89 |

Bruno ที่เพิ่ม (80–94) สร้างประกาศของตัวเองและลบทิ้งตอนจบ จึงรันได้ทั้งแบบมีและไม่มีบัญชี admin

| # | เคส | ผลที่คาด |
|---|---|---|
| 80 | สร้างประกาศสำหรับทดสอบ | 201 |
| 81 | ขอข้อมูลติดต่อโดยไม่ล็อกอิน | 401 ไม่มีข้อมูลติดต่อใน body |
| 82 | สมาชิกอื่นขอข้อมูลติดต่อ | 200 รูปแบบ §8.1 มีเฉพาะ LINE เพราะ request 12 ลบเบอร์โทรไว้ ไม่มี email |
| 83 | เจ้าของขอข้อมูลติดต่อของตัวเอง | 200 |
| 84–85 | สินค้าที่ไม่มีอยู่ / id ไม่ใช่ UUID | 404 `PRODUCT_NOT_FOUND` |
| 86–87 | เปลี่ยนเป็น Sold แล้วขอข้อมูลติดต่อ | 200 |
| 88 | ผู้ใช้อื่นกดบันทึกเป็นรายการโปรด | 200 `added` |
| 89 | `GET /me/products` โดยไม่ล็อกอิน | 401 |
| 90 | `GET /me/products` ของเจ้าของ | 200 เฉพาะประกาศของตัวเอง `summary` รวมเท่ากับ `total` ประกาศ Sold มี `wishlist_count` 1 ไม่มีข้อมูลติดต่อ |
| 91 | `GET /me/products` ของผู้ใช้อื่น | 200 ไม่มีประกาศของเจ้าของ |
| 92 | `page=0` | 422 `VALIDATION_ERROR` field `page` |
| 93 | ลบประกาศ | 204 |
| 94 | ขอข้อมูลติดต่อหลังลบ | 404 `PRODUCT_NOT_FOUND` |

หลังรัน ลบผู้ใช้ทดสอบ `bruno.*` ของรอบนั้นแล้ว (ประกาศถูกลบผ่าน API ไฟล์ใน Storage จึงไม่ค้าง)

## 5. ประเด็นที่ยังเปิดอยู่

- US-03 ข้อ 3 ในรายงานกำหนดให้ปุ่มติดต่อผู้ขาย **Disabled เมื่อสินค้าเป็น Sold** ตอนนี้หน้าสินค้ายังแสดงปุ่มทุกสถานะ เป็นงานฝั่งหน้าเว็บ API ไม่ต้องแก้
- Rate limit (Spec §1.6) ยังไม่ได้ทำ ดูเหตุผลในรายงานหัวข้อ "ฟีเจอร์ที่ยังไม่มี API"

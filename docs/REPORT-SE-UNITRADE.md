# รายงานโครงงานพัฒนาซอฟต์แวร์

## UniTrade — Campus Marketplace Platform

| รายการ | รายละเอียด |
|---|---|
| รายวิชา | 2301367 Software Engineering Methodology and development |
| ภาคการศึกษา / ปีการศึกษา | 2 / 2026 |
| อาจารย์ที่ปรึกษา | Pakawan Pugsee (ภควรรณ ปักษี) |
| คณะ / มหาวิทยาลัย | จุฬาลงกรณ์มหาวิทยาลัย |
| ทีม | VISIT CMU |
| วันที่จัดทำเอกสาร | 8 พฤศจิกายน 2569 |
| สถานะ | ฉบับร่างสำหรับตรวจทานและเติมข้อมูล |

> **ขอบเขตของฉบับนี้:** จัดเนื้อหาตามหัวข้อใน `ReportSE-1309` โดยรวบรวมข้อเท็จจริงจาก SRS, source code, migrations, tests และเอกสารใน repository เท่านั้น จุดที่ไม่มีหลักฐานหรือยังต้องให้ทีมตัดสินใจระบุเป็น **[เว้นไว้รอข้อมูล]** หรือ **[ต้องยืนยัน]** ไม่ถือว่าเป็นผลการทดสอบหรือการอนุมัติแล้ว

## สารบัญ

1. [บทที่ 1 บทนำ](#บทที่-1-บทนำ-introduction)
2. [บทที่ 2 การเก็บรวบรวมข้อมูล](#บทที่-2-การเก็บรวบรวมข้อมูล)
3. [บทที่ 3 การวิเคราะห์ระบบ](#บทที่-3-การวิเคราะห์ระบบ-system-analysis)
4. [บทที่ 4 การออกแบบระบบ](#บทที่-4-การออกแบบระบบ-system-design)
5. [บทที่ 5 การพัฒนาและการทดสอบระบบ](#บทที่-5-การพัฒนาและการทดสอบระบบ-system-implementation-and-testing)
6. [บทที่ 6 การประเมินผลและสรุปผล](#บทที่-6-การประเมินผลและสรุปผล-evaluation-and-conclusion)
7. [ภาคผนวก](#ภาคผนวก-appendices)
8. [รายการข้อมูลที่ยังขาด](#รายการข้อมูลที่ยังขาดเพื่อปิดเล่ม)

---

# บทที่ 1 บทนำ (Introduction)

## 1.1 ความเป็นมา เหตุผลและแรงจูงใจ

นิสิตและบุคลากรจุฬาลงกรณ์มหาวิทยาลัยมีหนังสือเรียน เอกสารประกอบการเรียน เครื่องแต่งกาย อุปกรณ์อิเล็กทรอนิกส์ และของใช้ในหอพักที่ไม่ได้ใช้งานแล้ว ขณะเดียวกันสมาชิกในมหาวิทยาลัยยังมีความต้องการสิ่งของเหล่านี้ในราคาที่เหมาะสม ปัจจุบันการประกาศซื้อขายหรือส่งต่อมักเกิดขึ้นในกลุ่มสื่อสังคมออนไลน์

การใช้โพสต์ในสื่อสังคมออนไลน์ทำให้ค้นหาประกาศย้อนหลังและกรองสินค้าตามประเภทได้ยาก โพสต์ใหม่อาจดันโพสต์เก่าให้เลื่อนหาย และผู้ซื้ออาจไม่ทราบว่าสินค้ายังพร้อมขายหรือขายไปแล้ว นอกจากนี้ผู้ใช้ยังมีความกังวลเกี่ยวกับตัวตนและความน่าเชื่อถือของคู่ซื้อขาย และการส่งพัสดุในระยะใกล้อาจเพิ่มทั้งค่าใช้จ่ายและความเสี่ยงต่อสินค้า

ทีมจึงพัฒนา UniTrade เป็นเว็บตลาดกลางสำหรับนิสิตและบุคลากรจุฬาฯ โดยจำกัดการสมัครด้วยอีเมลโดเมนของมหาวิทยาลัย จัดหมวดหมู่และสถานะสินค้าให้ค้นหาได้ และสนับสนุนการนัดรับภายในพื้นที่มหาวิทยาลัย ระบบช่วยประสานข้อมูลเท่านั้น ไม่รับชำระเงินและไม่รับผิดชอบการส่งมอบสินค้า

**ข้อมูลอ้างอิงการเก็บความต้องการ:** SRS ต้นฉบับระบุการสัมภาษณ์นิสิต 6 คน บุคลากร 4 คน และศึกษากลุ่มซื้อขายบนสื่อสังคมออนไลน์ รายละเอียดวัน เวลา สถานที่ แบบคำถาม และบันทึกผลยังไม่มีใน repository จึงเว้นไว้ในบทที่ 2

## 1.2 วัตถุประสงค์

1. พัฒนาเว็บแอปพลิเคชันสำหรับลงประกาศ ค้นหา และดูรายละเอียดสินค้ามือสองหรือสินค้าที่ให้ฟรีภายในชุมชนจุฬาฯ
2. จำกัดการสร้างบัญชีตามโดเมนอีเมลของนิสิตและบุคลากรจุฬาฯ
3. สนับสนุนการจัดการประกาศสินค้าและการแสดงสถานะ Available, Reserved และ Sold
4. สนับสนุนการนัดรับในมหาวิทยาลัยผ่านข้อมูลจุดนัดรับและช่องทางติดต่อที่ผู้ขายให้ไว้
5. จัดให้มีการรายงานประกาศและการตรวจสอบโดยผู้ดูแลระบบ
6. ฝึกกระบวนการเก็บความต้องการ วิเคราะห์ ออกแบบ พัฒนา และทดสอบซอฟต์แวร์เป็นทีม

## 1.3 ขอบเขตของงาน

### 1.3.1 ภายในขอบเขต

- เว็บแอปพลิเคชันสำหรับนิสิตและบุคลากรจุฬาฯ
- สมัครสมาชิก เข้าสู่ระบบ และจัดการข้อมูลโปรไฟล์
- ดูหมวดหมู่ จุดนัดรับ รายการสินค้า และรายละเอียดสินค้า
- ค้นหา กรอง เรียงลำดับ และแบ่งหน้ารายการสินค้า
- สร้าง แก้ไข เปลี่ยนสถานะ และลบประกาศของตนเอง พร้อมจัดเก็บรูปสินค้า
- รายงานประกาศ และเครื่องมือ API สำหรับผู้ดูแลตรวจสอบ/จัดการรายงาน
- ออกแบบ Wishlist และการเปิดเผยช่องทางติดต่อสำหรับผู้ใช้ที่ได้รับอนุญาต โดย API/หน้าจอบางส่วนยังรอพัฒนาและข้อสรุป
- ระบบหน้าเว็บและ API อยู่ในแอปพลิเคชัน Next.js เดียวกัน

### 1.3.2 นอกขอบเขต

- ระบบชำระเงินออนไลน์ บัตรเครดิต หรือ escrow
- การจัดส่งพัสดุ การคิดค่าส่ง หรือการติดตามพัสดุ
- ระบบแชตหรือข้อความสดภายในแอป
- การรับประกันสินค้า การรับรองตัวตนจากผู้ให้บริการยืนยันตัวตนภายนอก หรือการรับประกันการทำธุรกรรม
- แอปพลิเคชัน native สำหรับ iOS/Android

## 1.4 ประโยชน์ที่ได้รับ

- **นิสิตและบุคลากร:** ค้นหาสินค้าและของใช้ที่ต้องการได้เป็นระบบ ลดภาระค่าใช้จ่าย และส่งต่อของที่ไม่ได้ใช้
- **มหาวิทยาลัย:** สนับสนุนการใช้ทรัพยากรซ้ำและลดของเหลือทิ้งภายในชุมชน
- **ผู้พัฒนา:** ได้ฝึกการทำงานแบบแบ่งหน้าที่และใช้กระบวนการวิศวกรรมซอฟต์แวร์

## 1.5 คำศัพท์และคำย่อที่เกี่ยวข้อง

| คำศัพท์ | ความหมาย |
|---|---|
| CU | Chulalongkorn University — จุฬาลงกรณ์มหาวิทยาลัย |
| CRUD | Create, Read, Update, Delete |
| JWT | JSON Web Token ใช้ยืนยันคำขอที่ต้องล็อกอิน |
| RBAC | Role-Based Access Control การกำหนดสิทธิ์ตามบทบาท |
| Guest | ผู้เข้าชมที่ยังไม่ได้เข้าสู่ระบบ |
| Member | สมาชิกที่สมัครและเข้าสู่ระบบแล้ว |
| Admin | สมาชิกที่ได้รับบทบาทผู้ดูแลระบบ |
| Listing / Product | ประกาศสินค้าและข้อมูลประกอบ |
| On-campus pickup | การนัดส่งมอบสินค้าโดยตรงที่จุดนัดรับในมหาวิทยาลัย |
| SRS | Software Requirements Specification |

# บทที่ 2 การเก็บรวบรวมข้อมูล

## 2.1 กลุ่มเป้าหมาย

| กลุ่มเป้าหมาย | ลักษณะและความต้องการ |
|---|---|
| นิสิตจุฬาฯ | ต้องการซื้อหนังสือ ชีท อุปกรณ์การเรียน เครื่องแต่งกาย และของใช้ในหอพักในราคาประหยัด รวมถึงส่งต่อของที่ไม่ใช้แล้ว |
| บุคลากรและอาจารย์จุฬาฯ | ต้องการซื้อหรือส่งต่อหนังสือ อุปกรณ์สำนักงาน และของใช้ทั่วไป |
| ผู้ดูแลระบบ | ผู้ได้รับมอบหมายให้ตรวจสอบรายงานและจัดการประกาศที่ไม่เหมาะสม |

ผู้ซื้อและผู้ขายใช้บัญชีสมาชิกประเภทเดียวกัน สมาชิกอาจทำหน้าที่ใดหน้าที่หนึ่งหรือทั้งสองหน้าที่ได้

## 2.2 วิธีการและขั้นตอนการเก็บข้อมูล

เอกสาร SRS ต้นฉบับระบุวิธีเก็บข้อมูลดังนี้:

1. **การสัมภาษณ์:** สัมภาษณ์นิสิตจุฬาฯ 6 คน และบุคลากรจุฬาฯ 4 คน เกี่ยวกับพฤติกรรมซื้อขาย ปัญหาการซื้อขายผ่านสื่อสังคมออนไลน์ และของที่ไม่ได้ใช้งาน
2. **การศึกษา/วิเคราะห์ระบบใกล้เคียง:** สังเกตการโพสต์และปัญหาการหลอกลวงในกลุ่มซื้อขายของมือสองบนสื่อสังคมออนไลน์
3. **หัวข้อที่สนใจ:** ประเภทสินค้าที่นิยมซื้อขาย ความมั่นใจในการทำธุรกรรม จุดนัดรับที่สะดวก และช่องทางติดต่อที่นิยม

| รายละเอียดที่รายงานกำหนด | ข้อมูลที่พบ | สถานะ |
|---|---|---|
| เก็บข้อมูลจากใคร | นิสิต 6 คน, บุคลากร 4 คน ตาม SRS ต้นฉบับ | มีข้อมูล |
| วิธีเก็บข้อมูล | สัมภาษณ์และวิเคราะห์กลุ่มซื้อขาย | มีข้อมูลระดับสรุป |
| วันที่/ช่วงเวลาที่เก็บข้อมูล | [เว้นไว้รอข้อมูล] | ขาด |
| สถานที่/ช่องทางสัมภาษณ์ | [เว้นไว้รอข้อมูล] | ขาด |
| เกณฑ์คัดเลือกผู้ให้ข้อมูล | [เว้นไว้รอข้อมูล] | ขาด |
| แบบสัมภาษณ์/คำถาม | [เว้นไว้รอข้อมูล] | ขาด |
| ผู้สัมภาษณ์/ผู้บันทึกข้อมูล | [เว้นไว้รอข้อมูล] | ขาด |
| วิธีวิเคราะห์คำตอบ | [เว้นไว้รอข้อมูล] | ขาด |
| หลักฐานการยินยอม/การจัดการข้อมูลส่วนบุคคล | [เว้นไว้รอข้อมูล] | ขาด |

## 2.3 ผลหรือข้อสรุปที่ได้จากการเก็บข้อมูล

### 2.3.1 ปัญหาการดำเนินการปัจจุบัน

- **ประกาศไม่เป็นระเบียบ:** ข้อมูลอยู่ในโพสต์ที่เลื่อนหายและไม่มีหมวดหมู่ที่สม่ำเสมอ
- **ค้นหายาก:** การค้นหาสินค้าเฉพาะวิชา/ประเภทและการกรองผลทำได้ไม่สะดวก
- **ไม่ทราบสถานะล่าสุด:** ผู้ซื้ออาจไม่รู้ว่าสินค้าพร้อมขาย ติดจอง หรือขายแล้ว
- **ความกังวลเรื่องความน่าเชื่อถือ:** ผู้ซื้อไม่สามารถแยกผู้ใช้ในชุมชนจากบุคคลภายนอกได้สะดวก
- **ต้นทุนการส่งมอบ:** การส่งพัสดุในระยะใกล้อาจไม่คุ้มค่าและเพิ่มความเสี่ยงต่อสินค้า

### 2.3.2 ข้อมูลที่เกี่ยวข้องกับระบบ

| ข้อมูล | ตัวอย่างคุณลักษณะ |
|---|---|
| ผู้ใช้ | อีเมล CU, password hash, ชื่อ, คณะ, เบอร์โทร, LINE ID, role |
| หมวดหมู่ | รหัสหมวดหมู่, ชื่อ, คำอธิบาย |
| สินค้า | ผู้ขาย, หมวดหมู่, ชื่อ, รายละเอียด, ราคา, สภาพ, สถานะ, จุดนัดรับ, วันสร้าง |
| รูปสินค้า | สินค้า, URL รูป, ตัวบ่งชี้รูปหลัก |
| Wishlist | สมาชิก, สินค้าที่บันทึก, วันสร้างรายการ |
| รายงาน | ผู้รายงาน, สินค้า, เหตุผล, สถานะ, วันสร้าง |
| บันทึกผู้ดูแล | ผู้ดูแล, การกระทำ, สินค้า/รายงานที่เกี่ยวข้อง, วันดำเนินการ |

### 2.3.3 ความต้องการของผู้ใช้

1. จำกัดการสมัครด้วยอีเมลของนิสิต/บุคลากรจุฬาฯ
2. ค้นหาสินค้าตามคำค้น หมวดหมู่ ราคา สถานะ สภาพ และจุดนัดรับได้
3. แสดงราคา สภาพ สถานะ รูป และจุดนัดรับอย่างชัดเจน
4. ติดต่อผู้ขายผ่านช่องทางที่ผู้ขายให้ไว้ โดยไม่เปิดเผยข้อมูลติดต่อแก่สาธารณะ
5. จัดการประกาศและสถานะของตนเองได้
6. บันทึกสินค้าที่สนใจและรายงานประกาศไม่เหมาะสมได้
7. ให้ผู้ดูแลตรวจสอบรายงานและดำเนินการตามสิทธิ์ได้

### 2.3.4 ฟีเจอร์หลักของระบบ

- CU Authentication และ Profile
- Product Catalog, Search, Filter และ Pagination
- Listing CRUD และ Image Upload
- Product Status Management
- Wishlist (**โครงสร้างข้อมูลมี แต่ API/UI ยังไม่มีหลักฐานการส่งมอบ**)
- Seller Contact (**ส่วน UI มี แต่ Contact API ยังไม่มี**)
- Report และ Admin Moderation API
- Responsive Web UI

# บทที่ 3 การวิเคราะห์ระบบ (System Analysis)

## 3.1 ภาพรวมของระบบ (System Overview)

UniTrade เป็นเว็บแอปพลิเคชันตลาดกลางสำหรับนิสิตและบุคลากรจุฬาฯ ผู้ใช้ทั่วไปสามารถดูและค้นหาสินค้าได้ สมาชิกที่เข้าสู่ระบบสามารถจัดการข้อมูลส่วนตัวและรายการที่มีสิทธิ์ ผู้ดูแลระบบจัดการรายงานตามบทบาท ระบบเว็บเรียก API ในแอป Next.js และ API ฝั่งเซิร์ฟเวอร์เชื่อมต่อ Supabase PostgreSQL และ Storage

ภาพบริบทและขอบเขตระบบฉบับเต็มอยู่ใน [CONTEXT-DIAGRAM.md](CONTEXT-DIAGRAM.md) แผนภาพด้านล่างย่อขอบเขตหลัก:

```mermaid
flowchart LR
    member["สมาชิก<br/>(ผู้ซื้อ / ผู้ขาย)"]
    admin["ผู้ดูแลระบบ"]
    system(("UniTrade"))
    supabase["Supabase<br/>PostgreSQL + Storage"]
    member -->|"บัญชี, ค้นหา, ประกาศ, รายงาน, คำขอติดต่อ"| system
    system -->|"ผลลัพธ์, รายการสินค้า, รายละเอียด, ช่องทางติดต่อที่ได้รับอนุญาต"| member
    admin -->|"คำขอตรวจ/คำสั่ง moderation"| system
    system -->|"รายงานและผลการดำเนินการ"| admin
    system -->|"อ่าน/เขียนข้อมูลและไฟล์"| supabase
    supabase -->|"ผลข้อมูลและไฟล์"| system
```

## 3.2 User Stories และเกณฑ์การตรวจรับงาน

User stories และ acceptance criteria ในหัวข้อนี้ถอดความจากรายการที่ผู้ใช้ให้มา จัดเป็นเกณฑ์เป้าหมายของระบบ ไม่ได้หมายความว่าทุกข้อพัฒนาเสร็จหรือผ่านการทดสอบแล้ว สถานะด้านล่างอ้างอิงหลักฐานใน repository ที่ตรวจ ณ วันที่จัดทำเอกสาร

### US-01 — สมัครสมาชิกและเข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย

**User story:** As a นักศึกษา/บุคลากร, I want to สมัครสมาชิกและเข้าสู่ระบบด้วยอีเมลมหาวิทยาลัย, so that ยืนยันตัวตนได้และมั่นใจในความปลอดภัยในการซื้อขาย  
**Priority:** Must Have

**Acceptance criteria**

1. ระบบอนุญาตให้ลงทะเบียนเฉพาะโดเมนอีเมลจุฬาฯ `@student.chula.ac.th` เท่านั้น
2. รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และต้องถูกเข้ารหัสด้วยฟังก์ชัน hashing (เช่น bcrypt) ก่อนบันทึกลงฐานข้อมูล
3. ข้อมูลบังคับ ได้แก่ ชื่อ-นามสกุล อีเมล รหัสผ่าน และช่องทางติดต่ออย่างน้อย 1 ช่องทาง (LINE ID หรือเบอร์โทรศัพท์)
4. เมื่อเข้าสู่ระบบสำเร็จ ระบบต้องออก Access Token/Session ให้ผู้ใช้เพื่อเข้าถึงฟังก์ชันที่จำกัดสิทธิ์

### US-02 — ลงประกาศขายหรือส่งต่อสิ่งของ

**User story:** As a ผู้ขาย, I want to ลงประกาศขายหรือส่งต่อสิ่งของพร้อมรูปภาพและรายละเอียด, so that นิสิตคนอื่นสามารถเห็นและติดต่อขอซื้อต่อได้  
**Priority:** Must Have

**Acceptance criteria**

1. ฟอร์มลงประกาศมีข้อมูลบังคับ: ชื่อสินค้า หมวดหมู่ (หนังสือ/อุปกรณ์/ของใช้) สภาพสินค้า ราคา (หรือ 0 บาทกรณีส่งต่อฟรี) และสถานที่นัดรับในมหาวิทยาลัย
2. อัปโหลดรูปได้ 1–5 รูป รูปละไม่เกิน 2 MB รองรับ `.jpg`, `.jpeg`, `.png`
3. ระบบแสดงตัวอย่างรูปภาพ (Image Preview) ก่อนบันทึก
4. เมื่อสร้างสำเร็จ ข้อมูลต้องถูกบันทึกลงฐานข้อมูลและกำหนดสถานะเริ่มต้นเป็น Available โดยอัตโนมัติ

### US-03 — จัดการประกาศของตนเอง

**User story:** As a ผู้ขาย, I want to แก้ไข ลบ หรือเปลี่ยนสถานะสินค้าของตนเอง, so that ข้อมูลรายการสินค้าเป็นปัจจุบันและไม่สร้างความสับสนให้ผู้ซื้อ  
**Priority:** Must Have

**Acceptance criteria**

1. ปุ่มแก้ไขและลบแสดงและใช้งานได้เฉพาะเจ้าของโพสต์
2. ผู้ขายเปลี่ยนสถานะได้ 3 ระดับ: Available (พร้อมขาย), Reserved (ติดจอง), Sold (ขายแล้ว)
3. สินค้าที่เป็น Sold แสดงป้ายกำกับชัดเจนบนการ์ด และปุ่มติดต่อผู้ขายถูกปิดการทำงาน (Disabled)
4. ก่อนลบสินค้า ต้องมีกล่องข้อความยืนยัน (Confirmation Modal) เสมอ

### US-04 — ค้นหาและคัดกรองสินค้า

**User story:** As a ผู้ซื้อ, I want to ค้นหาด้วยคำสำคัญและคัดกรองสินค้าตามหมวดหมู่, so that หาสิ่งของที่ต้องการได้สะดวกรวดเร็วโดยไม่ต้องเลื่อนหาทั้งหมด  
**Priority:** Must Have

**Acceptance criteria**

1. ค้นหาจากชื่อและคำอธิบายแบบไม่แบ่งแยกตัวพิมพ์เล็ก-ใหญ่ (Case-Insensitive)
2. ใช้ตัวกรองร่วมกันได้ (Multiple Filters): หมวดหมู่ ช่วงราคา (Min-Max) และสถานะสินค้า
3. เรียงผลลัพธ์ได้ตามวันที่โพสต์ล่าสุด ราคาต่ำไปสูง และราคาสูงไปต่ำ
4. เมื่อไม่พบข้อมูล แสดงข้อความ “ไม่พบรายการสินค้าที่คุณต้องการ” และไม่แสดงข้อผิดพลาด

### US-05 — Wishlist และช่องทางติดต่อผู้ขาย

**User story:** As a ผู้ซื้อ, I want to บันทึกสินค้าที่สนใจไว้ในรายการโปรดและเข้าถึงช่องทางติดต่อผู้ขาย, so that กลับมาดูสินค้าภายหลังได้และติดต่อเพื่อนัดรับของได้ทันที  
**Priority:** Should Have

**Acceptance criteria**

1. ผู้ใช้ที่ล็อกอินกดไอคอนหัวใจเพื่อเพิ่ม/ลบสินค้าใน Wishlist ได้แบบ Real-time/Optimistic UI
2. หน้า Wishlist แสดงสินค้าที่บันทึกทั้งหมด และลบรายการจากหน้านี้ได้
3. หน้ารายละเอียดมีปุ่มเปิด LINE (`line.me/ti/p/~line_id`) หรือโทรออก (`tel:`) ตามข้อมูลผู้ขาย

### US-06 — รายงานโพสต์และตรวจสอบโดย Admin

**User story:** As a ผู้ใช้งานทั่วไปและ Admin, I want to รายงานโพสต์ที่ไม่เหมาะสมและให้ Admin ตรวจสอบ/ลบโพสต์ได้, so that แพลตฟอร์มมีความปลอดภัยและปราศจากการหลอกลวง  
**Priority:** Should Have

**Acceptance criteria**

1. ผู้ใช้กด “รายงานโพสต์” พร้อมเลือกเหตุผลจากรายการที่กำหนด เช่น สินค้าผิดกฎหมาย หลอกลวง หรือสแปม
2. หน้า Admin Dashboard เข้าถึงได้เฉพาะ Admin; ผู้ใช้ทั่วไปถูกปฏิเสธด้วย `403 Forbidden`
3. Admin ดูตารางโพสต์ที่ถูกรายงาน จำนวนครั้งที่ถูกรายงาน และรายละเอียดโพสต์ต้นทางได้
4. Admin สั่งลบโพสต์ที่ไม่เหมาะสมออกจากระบบได้

### สถานะหลักฐานเทียบกับเกณฑ์

| Story | สถานะจากหลักฐานใน repository | ประเด็นที่ยังไม่ผ่าน/ต้องยืนยัน |
|---|---|---|
| US-01 | Partial: API สมัคร/เข้าสู่ระบบ, bcrypt และ JWT มีในระบบ | เกณฑ์โดเมนกำหนดเฉพาะนิสิต แต่ข้อกำหนด/API ปัจจุบันรองรับ `@chula.ac.th` สำหรับบุคลากรด้วย; หน้า Register/Profile ยังไม่ครบ ต้องยืนยันขอบเขตโดเมน |
| US-02 | Partial: API ตรวจข้อมูลและอัปโหลด JPEG/PNG 1–5 รูป, จำกัด 2 MiB ต่อรูป/4 MiB รวม และตั้ง Available | ยังไม่พบฟอร์มลงประกาศและ Image Preview ใน UI; ต้องยืนยันการแมปหมวดหมู่ตัวอย่างกับหมวดหมู่จริง |
| US-03 | Partial: API ตรวจเจ้าของและเปลี่ยนสถานะได้; การ์ดแสดงป้ายสถานะ | UI แก้ไข/ลบและ Confirmation Modal ยังไม่พบ; หน้ารายละเอียดปัจจุบันยังไม่ปิดปุ่มติดต่อเมื่อสถานะ Sold |
| US-04 | Partial: Search/filter/sort และ empty state มีในแอป | ข้อความ empty state ปัจจุบันไม่ตรงข้อความที่กำหนดทุกคำ; ยืนยันว่าจะใช้ข้อความใดเป็นมาตรฐาน |
| US-05 | Not implemented ตามหลักฐานปัจจุบัน: มีเพียงโครงเส้นทาง/ตัวบ่งชี้บางส่วน | ยังไม่พบ Wishlist API/หน้าใช้งานจริง; Contact API ยังไม่มี แม้มี UI และ mock flow; optimistic UI และ deep link ต้องทดสอบ |
| US-06 | Partial: API รายงานและ moderation ฝั่ง Admin มี | ยังไม่พบ Admin Dashboard UI; API รายงานกำหนดให้เป็นสมาชิกที่ล็อกอิน ต้องยืนยันว่าผู้ใช้ทั่วไปที่ไม่ล็อกอินรายงานได้หรือไม่ |

รายการนี้เป็นการเทียบเอกสารกับไฟล์ใน repository ไม่ใช่ผลทดสอบ acceptance อย่างเป็นทางการ การปิดเกณฑ์แต่ละข้อยังต้องมี test case, ผลรันทดสอบ และผู้ตรวจรับตาม TASK-21

## 3.3 ความต้องการด้านหน้าที่ (Functional Requirements)

| รหัส | ฟังก์ชัน | Input | Process / เงื่อนไขสำคัญ | Output |
|---|---|---|---|---|
| FR-01 | สมัครสมาชิกผู้ใช้ CU | อีเมล, รหัสผ่าน, ชื่อ, คณะ, เบอร์หรือ LINE | ตรวจโดเมน CU และรูปแบบข้อมูล, hash รหัสผ่าน, ป้องกันอีเมลซ้ำ | ผลสมัครและข้อมูลผู้ใช้ที่ไม่รวม password hash |
| FR-02 | Authentication และ Authorization | อีเมล/รหัสผ่าน หรือ bearer token | ตรวจบัญชีและ bcrypt hash, ออก HS256 JWT อายุ 24 ชม.; ตรวจสิทธิ์ทุก protected operation | token และผลการตรวจสิทธิ์ |
| FR-03 | สร้างประกาศสินค้า | ฟิลด์สินค้าและ JPEG/PNG 1–5 รูป | ตรวจข้อมูล/ขนาด/bytes, ตั้งรูปแรกเป็น primary, สร้างสินค้าและ upload | รายละเอียดประกาศและผลสำเร็จ |
| FR-04 | จัดการประกาศ | product ID, body หรือสถานะใหม่ | ตรวจมีสินค้าและเจ้าของก่อน validate; อนุญาตแก้ไข/เปลี่ยนสถานะ/ลบตามสิทธิ์ | รายละเอียด/สถานะ/ผลลบ |
| FR-05 | ค้นหาและกรองสินค้า | keyword, category, price, free_only, status, location, condition, sort | validate query, keyword case-insensitive, stable pagination; ครอบคลุมการดูรายการและรายละเอียดสาธารณะ | รายการและ pagination หรือ empty list / product detail |
| FR-06 | ดูข้อมูลติดต่อผู้ขาย | product ID และ token | ต้องล็อกอิน; ห้ามส่งข้อมูลติดต่อตาม public product API | ช่องทางติดต่อและ pickup; UI มี แต่ API ยังไม่ทำ |
| FR-07 | Wishlist | สมาชิกและ product ID | ต้องล็อกอินและจำกัดเจ้าของข้อมูล | รายการที่บันทึกและสถานะ wishlisted; API contract ยังไม่กำหนด |
| FR-08 | Report & Moderation | report reason/product ID หรือคำสั่งจาก Admin | ต้องล็อกอิน, ห้ามรายงานตนเอง/รายงานซ้ำ; admin ตรวจ role และบันทึก moderation log | ผลการรายงาน, รายการรายงาน และผลการดำเนินการ |
| FR-09 | จัดการโปรไฟล์สมาชิก | bearer token และข้อมูลโปรไฟล์ | ให้สมาชิกอ่าน/แก้เฉพาะโปรไฟล์ตนเอง; ห้ามแก้อีเมล/role และต้องเหลือ contact อย่างน้อยหนึ่งช่องทาง | ข้อมูลโปรไฟล์ที่อนุญาต; API มี แต่หน้า UI ยังไม่ครบ |
| FR-10 | ส่วนติดต่อผู้ใช้และสถานะการทำงาน | การกระทำของผู้ใช้และข้อมูลจาก API | รองรับการนำทาง การแสดงผล responsive และสถานะ loading/empty/error/success | หน้าจอและข้อความภาษาไทยตาม flow ที่ทำแล้ว |

### ข้อกำหนดตรวจสอบข้อมูลหลัก

- อีเมลต้องลงท้ายด้วย `@student.chula.ac.th` หรือ `@chula.ac.th`
- รหัสผ่านอย่างน้อย 8 ตัว มีตัวอักษรและตัวเลข และไม่เกิน 72 UTF-8 bytes สำหรับ bcrypt
- ต้องระบุเบอร์โทรหรือ LINE ID อย่างน้อยหนึ่งช่องทาง
- ชื่อ 2–255 ตัวอักษร; ชื่อสินค้า 3–255; รายละเอียดไม่เกิน 2,000
- ราคา 0–999,999.99 และมีทศนิยมไม่เกิน 2 ตำแหน่ง
- รูป 1–5 รูป, JPEG/PNG จากการตรวจ bytes, ≤2 MiB ต่อรูป และ ≤4 MiB รวม
- สถานะสินค้า: `available`, `reserved`, `sold`

## 3.4 ความต้องการที่ไม่ใช่ด้านหน้าที่ (Non-functional Requirements)

| รหัส | ข้อกำหนด | วิธีตรวจสอบ / สถานะ |
|---|---|---|
| NFR-01 | Route ที่ต้องป้องกันต้องตรวจ authentication/authorization ฝั่ง server | ตรวจ code และ negative API tests |
| NFR-02 | Admin role ต้องตรวจจาก server-controlled data | ตรวจ `requireAdmin` และทดสอบบัญชี member |
| NFR-03 | รหัสผ่านเก็บเป็น bcrypt hash เท่านั้น | ตรวจ implementation/schema |
| NFR-04 | JWT ใช้ HS256 อายุ 24 ชั่วโมง และ secret อยู่ฝั่ง server | unit test auth |
| NFR-05 | Production ใช้ HTTPS | ต้องตรวจ deployment จริง; deployment status ยังไม่ยืนยัน |
| NFR-06 | ห้ามเปิดเผย service key/JWT secret | ตรวจ config, source control และ bundle ก่อน release |
| NFR-07 | Public response ต้องไม่มีอีเมล/เบอร์/LINE/password hash | unit tests ของ product mappers และ API tests |
| NFR-08 | ห้ามคืนข้อความ Supabase ดิบแก่ client | ตรวจ route error handling |
| NFR-09 | หน้าแรกโหลดไม่เกิน 3 วินาที | **เป้าหมายต้นฉบับ; วิธีวัดและผล [เว้นไว้รอข้อมูล]** |
| NFR-10 | Product list/search API ≤500 ms ที่ 50 concurrent users | **เป้าหมายต้นฉบับ; test setup/result [เว้นไว้รอข้อมูล]** |
| NFR-11 | Availability ≥95% ในช่วงทดสอบ/นำเสนอ | **เป้าหมายต้นฉบับ; ช่วงวัด/ผล [เว้นไว้รอข้อมูล]** |
| NFR-12 | Responsive อย่างน้อย 375px และ desktop 1024px ขึ้นไป | ทดสอบ UI บน browser/device matrix; รายงานผลรอเติม |
| NFR-13 | รองรับ current stable Chrome และ Safari | เวอร์ชันและผลทดสอบ [เว้นไว้รอข้อมูล] |
| NFR-14 | รองรับ Node.js 22+ | package manifest กำหนด `>=22` |
| NFR-15 | Frontend และ API deploy ใน Next.js application เดียว | ตรวจ architecture/build |

ค่า 3 วินาที, 500 ms/50 users และ 95% มาจาก SRS ต้นฉบับ แต่ยังไม่มีรายละเอียด hardware, network, percentile, dataset หรือ monitoring window จึงยังไม่ถือเป็นผลที่พิสูจน์แล้ว

## 3.5 ความต้องการด้านส่วนต่อประสานภายนอก (External Interface Requirements)

### 3.5.1 User Interface

- ภาษาแสดงผลหลักเป็นภาษาไทย
- Home แสดงหมวดหมู่ การ์ดสินค้า Search/Filter, Sort และ Pagination
- Product detail แสดงข้อมูลประกาศโดยไม่ฝังข้อมูลติดต่อผู้ขายใน public response
- ปุ่มติดต่อและเมนูสมาชิกต้องเปลี่ยนตามสถานะ guest/authenticated
- API errors แสดงเป็นข้อความที่เหมาะกับผู้ใช้และเชื่อมกับฟิลด์ที่ผิดเมื่อมี `field`

### 3.5.2 Software/Communication Interface

| Interface | รายละเอียด |
|---|---|
| Web/API | Next.js routes ใต้ `/api/v1`; JSON โดยทั่วไป, multipart สำหรับสร้างสินค้า |
| Database | Supabase PostgreSQL ผ่าน server-side service role |
| Image storage | Supabase Storage bucket `product-images`; server เป็นผู้ upload/remove |
| Auth | Bearer JWT อายุ 24 ชั่วโมง |
| Seller contact | LINE/โทรศัพท์ภายนอก; Contact API ยังรอการกำหนด owner/contract |

## 3.6 สภาพแวดล้อมการทำงานของระบบ (System Environment)

| ส่วนประกอบ | สภาพแวดล้อม |
|---|---|
| Runtime | Node.js 22+ |
| Framework/UI | Next.js 15 App Router, React 19, JavaScript ESM |
| Database | Supabase PostgreSQL |
| Object storage | Supabase Storage |
| Hosting target | Vercel |
| Client | Chrome/Safari รุ่นปัจจุบันบน desktop/mobile; ต้องยืนยันรุ่นทดสอบ |
| Source control | Git/GitHub |
| Development editor | Visual Studio Code ตาม environment เอกสารทีม |

# บทที่ 4 การออกแบบระบบ (System Design)

## 4.1 ภาพรวมการออกแบบระบบ (System Design Overview)

ออกแบบเป็นเว็บแอปพลิเคชันเดียวที่มีหน้าเว็บและ API อยู่ใน Next.js repository เดียวกัน เพื่อลดความซับซ้อนในการ deploy และไม่ต้องตั้ง CORS ระหว่าง frontend กับ API ชั้นหน้าเว็บเรียก API ผ่าน shared request helper ส่วน API ทำหน้าที่ตรวจ token, ตรวจสิทธิ์, ตรวจข้อมูล และเรียก Supabase ด้วย secret ที่อยู่ฝั่ง server เท่านั้น

การออกแบบรักษาความเป็นส่วนตัวโดยแยก product detail สาธารณะออกจากข้อมูลติดต่อผู้ขาย และคงความถูกต้องของการสร้างประกาศด้วยการตรวจไฟล์ก่อนแตะฐานข้อมูล พร้อม cleanup เมื่อการอัปโหลดหลายขั้นตอนไม่สำเร็จ

## 4.2 การออกแบบสถาปัตยกรรมระบบ (System Architecture Design)

```mermaid
flowchart TB
    browser["Web Browser<br/>Next.js / React UI"]
    api["Next.js App Router<br/>API /api/v1"]
    auth["Auth & Authorization<br/>JWT + route guards"]
    appLogic["Validation / Mapping / Business Logic"]
    postgres[("Supabase PostgreSQL")]
    storage[("Supabase Storage<br/>product-images")]
    browser -->|"HTTPS / same-origin requests"| api
    api --> auth
    auth --> appLogic
    appLogic -->|"service_role, server only"| postgres
    appLogic -->|"server-side upload / remove"| storage
    storage -->|"public image URLs"| browser
```

**เหตุผลที่เลือกใช้**

1. Next.js รวมหน้าเว็บและ route handlers ไว้ในโปรเจกต์เดียว ทำให้ deploy ได้พร้อมกัน
2. Supabase ให้บริการ PostgreSQL และ object storage ที่รองรับข้อมูลสัมพันธ์และรูปสินค้า
3. การติดต่อฐานข้อมูลผ่าน server ช่วยไม่ให้ credential ระดับ service role ไปอยู่ใน browser
4. Shared auth/validation/mapping helpers ลดความแตกต่างระหว่าง endpoint

**ข้อจำกัด:** service role ข้าม RLS ได้ จึงต้องตรวจ authorization ในทุก route ที่เข้าถึงข้อมูลส่วนตัวหรือเขียนข้อมูล; ความปลอดภัยของระบบขึ้นกับการครอบ route และการตรวจ owner/admin อย่างถูกต้อง

## 4.3 การออกแบบกระบวนการทำงานของระบบ (Process Design)

### 4.3.1 Context Diagram และ DFD Level 0

แผนภาพ context ฉบับเต็มอยู่ที่ [CONTEXT-DIAGRAM.md](CONTEXT-DIAGRAM.md) DFD Level 0 ด้านล่างแสดง process หลักและ data stores:

```mermaid
flowchart LR
    member["สมาชิก"]
    admin["ผู้ดูแลระบบ"]
    auth(("1.0 จัดการบัญชีและสิทธิ์"))
    catalog(("2.0 ค้นหาและดูสินค้า"))
    listing(("3.0 จัดการประกาศและรูป"))
    report(("4.0 รายงานและ moderation"))
    dUsers[("D1 Users")]
    dCatalog[("D2 Categories / Products / Images")]
    dWish[("D3 Wishlists")]
    dReports[("D4 Reports / Moderation Logs")]
    dStorage[("D5 Product Image Storage")]

    member -->|"สมัคร / login / profile"| auth
    auth <--> dUsers
    auth -->|"ผลบัญชี / session"| member
    member -->|"ค้นหา / ดูรายละเอียด"| catalog
    catalog <--> dCatalog
    catalog <--> dWish
    catalog -->|"ผลค้นหา / รายละเอียดสาธารณะ"| member
    member -->|"สร้าง / แก้ไข / เปลี่ยนสถานะ / ลบ"| listing
    listing <--> dCatalog
    listing <--> dStorage
    listing -->|"ผลประกาศ / สถานะ"| member
    member -->|"รายงานประกาศ"| report
    admin -->|"ดู / dismiss / ลบประกาศ"| report
    report <--> dReports
    report <--> dCatalog
    report -->|"ผลรายงาน / รายการสำหรับตรวจ"| member
    report -->|"รายงานและผล moderation"| admin
```

**Data stores:** D1 ผู้ใช้, D2 หมวดหมู่/สินค้า/รูป metadata, D3 Wishlist, D4 รายงาน/บันทึก moderation, D5 ไฟล์รูปสินค้า

> D3 มีตารางใน schema แต่ยังไม่พบ Wishlist API/UI ใน repository จึงเป็น data store ที่วางตามแบบข้อมูล/ขอบเขตเป้าหมาย ไม่ได้หมายความว่าฟีเจอร์พร้อมใช้งานแล้ว

### 4.3.2 กระบวนการหลัก

| Process | ขั้นตอนหลัก | เงื่อนไข/ผลลัพธ์ |
|---|---|---|
| สมัคร/เข้าสู่ระบบ | รับข้อมูล → validate → ตรวจ/สร้างบัญชี → ตรวจ password hash → ออก JWT | โดเมนอีเมล CU; JWT 24 ชม.; ไม่ส่ง hash กลับ |
| ค้นหาสินค้า | รับ query → validate → ประกอบ filters → query พร้อม count/order/range → map response | ค่าเริ่มต้น status=available; page size สูงสุด 50; no result เป็น 200 + `data: []` |
| สร้างประกาศ | parse multipart → validate fields/images → insert product → upload files → insert image rows → map detail | ถ้าขั้น upload/insert image ล้มเหลว พยายาม cleanup files และ product |
| จัดการประกาศ | หาและตรวจเจ้าของ → validate body → update/delete | non-owner ได้ 403; image edit ไม่รองรับ |
| รายงานสินค้า | ตรวจ token → ตรวจสินค้า → กัน self-report/duplicate → insert pending report | ใช้เหตุผลจาก enum ที่กำหนด |
| Admin moderation | ตรวจ token/role → ทำรายการ/ยกเลิกรายงาน/ลบสินค้าแบบ atomic → บันทึก log → cleanup รูป | เฉพาะ admin; ลบ report/product ใน transaction ตาม migration function |

### 4.3.3 Use Case Diagram

```mermaid
flowchart LR
    guest["Guest"]
    member["Member"]
    seller["Seller (Member)"]
    admin["Admin"]
    browse(["UC-04 ค้นหา/ดูสินค้า"])
    register(["UC-01 สมัคร/เข้าสู่ระบบ"])
    create(["UC-02 สร้างประกาศ"])
    manage(["UC-03 จัดการประกาศ"])
    wish(["UC-05 Wishlist"])
    report(["UC-06 รายงานสินค้า"])
    moderate(["UC-07 ตรวจ/จัดการรายงาน"])
    contact(["ขอข้อมูลติดต่อผู้ขาย"])
    guest --> browse
    guest --> register
    member --> browse
    member --> wish
    member --> report
    member --> contact
    seller --> create
    seller --> manage
    admin --> moderate
```

Use case UC-05 และ contact เป็นขอบเขตความต้องการ แต่ยังไม่ครบใน implementation; UC-01–UC-07 เป็นชื่อ/การแบ่งกลุ่มตามเอกสารโครงการที่มีอยู่

### 4.3.4 Use Case Description: UC-02 สร้างประกาศ

| หัวข้อ | รายละเอียด |
|---|---|
| รหัส / ชื่อ | UC-02 — สร้างประกาศสินค้า |
| ผู้กระทำหลัก | Member |
| เงื่อนไขก่อนเริ่ม | ผู้ใช้เข้าสู่ระบบและมี JWT ที่ยังใช้ได้ |
| ข้อมูลนำเข้า | title, description (optional), category, condition, price, pickup location, images 1–5 |
| ขั้นตอนปกติ | 1) ผู้ใช้กรอกข้อมูลและเลือกภาพ 2) ระบบ validate fields/images ก่อนเขียน DB 3) สร้าง product สถานะ available 4) อัปโหลดภาพ 5) บันทึก image metadata และกำหนดภาพแรกเป็น primary 6) ส่งรายละเอียดประกาศกลับ |
| ทางเลือก/ข้อผิดพลาด | payload ผิด → 400; ข้อมูลผิด → 422; ภาพใหญ่ → 413; ไฟล์ไม่ใช่ JPEG/PNG → 422; storage/database error → cleanup ที่เกี่ยวข้องและตอบ server error |
| เงื่อนไขหลังจบ | เมื่อสำเร็จมี product และ image metadata/files ที่เกี่ยวข้อง; เมื่อขั้นตอนภาพล้มเหลวพยายามลบข้อมูลที่สร้างไว้ |
| สถานะ implementation | API มี; หน้า form ยังไม่พบ |

### 4.3.5 Activity Diagram: Admin ลบประกาศ

```mermaid
flowchart TD
    start([เริ่ม]) --> token{มี token ถูกต้อง?}
    token -- ไม่ --> unauth["ตอบ 401"]
    token -- ใช่ --> role{role เป็น admin?}
    role -- ไม่ --> forbidden["ตอบ 403"]
    role -- ใช่ --> exists{มีประกาศ?}
    exists -- ไม่ --> missing["ตอบ 404"]
    exists -- ใช่ --> atomic["RPC transaction:<br/>ปิด pending reports,<br/>ลบ product,<br/>เขียน moderation log"]
    atomic --> files["ลบไฟล์ใน Storage"]
    files --> done["ตอบผลสำเร็จ"]
```

### 4.3.6 Sequence Diagram: สร้างประกาศ

```mermaid
sequenceDiagram
    actor Member
    participant UI as Web UI
    participant API as Next.js API
    participant DB as Supabase PostgreSQL
    participant Store as Supabase Storage
    Member->>UI: กรอกข้อมูลและเลือกรูป
    UI->>API: POST /products (multipart + bearer token)
    API->>API: ตรวจ token, fields และ bytes/size ของภาพ
    API->>DB: INSERT product (status=available)
    DB-->>API: product_id
    loop ภาพแต่ละไฟล์
        API->>Store: upload product_id/image_id.ext
        Store-->>API: upload result / public URL
    end
    API->>DB: INSERT product_images (single insert)
    DB-->>API: image rows
    API-->>UI: 201 product detail
    UI-->>Member: แสดงผลลงประกาศสำเร็จ
```

## 4.4 การออกแบบข้อมูล (Data Design)

### 4.4.1 ER Diagram

```mermaid
erDiagram
    USERS ||--o{ PRODUCTS : sells
    CATEGORIES ||--o{ PRODUCTS : classifies
    PRODUCTS ||--o{ PRODUCT_IMAGES : has
    USERS ||--o{ WISHLISTS : saves
    PRODUCTS ||--o{ WISHLISTS : saved_in
    USERS ||--o{ REPORTS : submits
    PRODUCTS o|--o{ REPORTS : reported
    USERS o|--o{ MODERATION_LOGS : performs
    REPORTS o|--o{ MODERATION_LOGS : actioned

    USERS {
      uuid user_id PK
      citext email UK
      text password_hash
      text full_name
      text phone_number
      text line_id
      text faculty
      user_role role
      timestamptz created_at
    }
    CATEGORIES {
      uuid category_id PK
      text name UK
      text description
    }
    PRODUCTS {
      uuid product_id PK
      uuid seller_id FK
      uuid category_id FK
      text title
      text description
      numeric price
      product_condition item_condition
      product_status status
      text pickup_location
      timestamptz created_at
    }
    PRODUCT_IMAGES {
      uuid image_id PK
      uuid product_id FK
      text image_url
      boolean is_primary
    }
    WISHLISTS {
      uuid wishlist_id PK
      uuid user_id FK
      uuid product_id FK
      timestamptz created_at
    }
    REPORTS {
      uuid report_id PK
      uuid reporter_id FK
      uuid product_id FK
      report_reason reason
      report_status status
      timestamptz created_at
    }
    MODERATION_LOGS {
      uuid log_id PK
      uuid admin_id FK
      moderation_action action
      uuid product_id
      text product_title
      uuid seller_id
      uuid report_id FK
      integer reports_actioned
      timestamptz created_at
    }
```

## 4.5 การออกแบบฐานข้อมูล (Database Design)

ฐานข้อมูลเป็น Supabase PostgreSQL; ชนิด enum ใช้ค่าที่กำหนดใน migration `0001_init.sql`. FK delete behavior ระบุเฉพาะที่ตั้งไว้ใน migration.

| ตาราง | ฟิลด์ (ชนิดข้อมูล) | PK / FK / ข้อจำกัดสำคัญ |
|---|---|---|
| `users` | `user_id uuid`, `email citext`, `password_hash text`, `full_name text`, `phone_number text NULL`, `line_id text NULL`, `faculty text`, `role user_role`, `created_at timestamptz` | PK `user_id`; unique `email`; CHECK CU email, bcrypt hash, format/length และ phone hoặc LINE อย่างน้อยหนึ่ง |
| `categories` | `category_id uuid`, `name text`, `description text NULL` | PK `category_id`; unique `name` |
| `products` | `product_id uuid`, `seller_id uuid`, `category_id uuid`, `title text`, `description text NULL`, `price numeric(10,2)`, `item_condition product_condition`, `status product_status`, `pickup_location text`, `created_at timestamptz` | PK `product_id`; FK seller → users (`ON DELETE CASCADE`); FK category → categories; CHECK title/description/price/location |
| `product_images` | `image_id uuid`, `product_id uuid`, `image_url text`, `is_primary boolean` | PK `image_id`; FK product → products (`ON DELETE CASCADE`); partial unique index ให้มี primary ได้ไม่เกินหนึ่งรูปต่อสินค้า |
| `wishlists` | `wishlist_id uuid`, `user_id uuid`, `product_id uuid`, `created_at timestamptz` | PK `wishlist_id`; FK user/product (`ON DELETE CASCADE`); unique (`user_id`,`product_id`) |
| `reports` | `report_id uuid`, `reporter_id uuid`, `product_id uuid NULL`, `reason report_reason`, `status report_status`, `created_at timestamptz` | PK `report_id`; FK reporter → users (`ON DELETE CASCADE`); FK product → products (`ON DELETE SET NULL`); unique (`product_id`,`reporter_id`) |
| `moderation_logs` | `log_id uuid`, `admin_id uuid NULL`, `action moderation_action`, `product_id uuid` (snapshot, no FK), `product_title text NULL`, `seller_id uuid NULL` (snapshot), `report_id uuid NULL`, `reports_actioned integer NULL`, `created_at timestamptz` | PK `log_id`; FK admin → users (`ON DELETE SET NULL`); FK report → reports (`ON DELETE SET NULL`); actioned count non-negative |

**Enum values**

- `user_role`: `member`, `admin`
- `product_status`: `available`, `reserved`, `sold`
- `product_condition`: `new`, `like_new`, `good`, `fair`
- `report_reason`: `scam`, `prohibited_item`, `spam`, `wrong_category`, `offensive_content`, `already_sold`, `other`
- `report_status`: `pending`, `actioned`, `dismissed`
- `moderation_action`: `delete_product`, `dismiss_report`

**Indexing:** มี index สำหรับ product status/date, category, seller/date, price, pickup location, title/description trigram, product images, wishlist และ report status/date. มี trigger สำหรับจำกัดภาพไม่เกิน 5, ป้องกันเปลี่ยน seller_id และป้องกัน self-report. รายละเอียด index/trigger อ้างอิง migration `supabase/migrations/0001_init.sql`.

## 4.6 การออกแบบส่วนต่อประสานผู้ใช้ (User Interface Design)

### 4.6.1 โครงสร้างและแนวคิด

ทุกหน้ามี Navbar, เนื้อหากลาง และ Footer หน้าแรกให้ค้นหาได้โดยไม่ต้อง login; ขอ login เมื่อต้องใช้การกระทำที่ผูกกับบัญชี ข้อมูลติดต่อผู้ขายไม่แสดงใน product detail สาธารณะ ปุ่มติดต่อเมื่อผู้ใช้ login แล้วจึงร้องขอ contact API (ซึ่งยังไม่มีใน backend ณ วันที่ตรวจ)

### 4.6.2 หน้าจอและสถานะการส่งมอบ

| ID | หน้าจอ | Path/รูปแบบ | สิทธิ์ | สถานะใน repo |
|---|---|---|---|---|
| S-01 | Home/Search | `/` | สาธารณะ | มี |
| S-02 | Product detail | `/products/[id]` | สาธารณะ | มี |
| S-03 | Seller contact modal | modal บน S-02 | สมาชิก | UI มี; API ยังไม่มี |
| S-04 | Login | `/login` | สาธารณะ | placeholder; ยังไม่ใช่ auth form สมบูรณ์ |
| S-05 | Register | `/register` | สาธารณะ | ยังไม่มี |
| S-06 | Profile | `/me/profile` | สมาชิก | ยังไม่มี |
| S-07 | Create listing | `/products/create` | สมาชิก | ยังไม่มี |
| S-08 | Edit listing | `/products/[id]/edit` | เจ้าของ | ยังไม่มี |
| S-09 | My listings | `/me/products` | สมาชิก | ยังไม่มี |
| S-10 | Wishlist | `/me/wishlist` | สมาชิก | ยังไม่มี |
| S-11 | Admin Dashboard | `/admin` | Admin | ยังไม่มี |
| S-12 | Not found | fallback | สาธารณะ | มี |

### 4.6.3 Navigation Flow

```mermaid
flowchart LR
    home["S-01 Home"]
    detail["S-02 Product detail"]
    contact["S-03 Contact modal"]
    login["S-04 Login"]
    register["S-05 Register"]
    profile["S-06 Profile"]
    create["S-07 Create"]
    edit["S-08 Edit"]
    mine["S-09 My listings"]
    wishlist["S-10 Wishlist"]
    admin["S-11 Admin"]
    home --> detail
    detail --> contact
    detail --> login
    login --> detail
    login --> register
    register --> login
    home --> profile
    home --> create
    home --> mine
    mine --> edit
    home --> wishlist
    home --> admin
```

เส้นทางในผังเป็นแบบเป้าหมายการใช้งาน ไม่ใช่หลักฐานว่าทุกหน้าถูกพัฒนาแล้ว; หน้าที่ยังไม่มีจะเข้าสู่ not-found route

### 4.6.4 Theme และรายละเอียด UI

- สีหลักสีชมพู `#d6608a`; สีข้อความ/พื้น/เส้นและสีสถานะกำหนดใน CSS variables
- สถานะสินค้าใช้สีเขียว (available), ส้ม (reserved), เทา (sold) พร้อมข้อความกำกับ ไม่ใช้สีอย่างเดียว
- ใช้ Noto Sans Thai และ CSS Modules
- Layout อ้างอิงเอกสาร frontend: ความกว้างเนื้อหาสูงสุด 1200 px, ขอบมือถือ 16 px; responsive filters เป็น sidebar บนจอกว้างและ panel บนจอแคบ
- รายละเอียด UI เพิ่มเติมอยู่ใน [`REPORT-FRONTEND.md`](REPORT-FRONTEND.md)

## 4.7 การออกแบบความปลอดภัยและการกำหนดสิทธิ์

| บทบาท | สิทธิ์ |
|---|---|
| Guest | อ่านหมวดหมู่ จุดนัดรับ รายการสินค้า และรายละเอียดสาธารณะ |
| Member | สิทธิ์ Guest + profile, สร้าง/จัดการสินค้าตนเอง, report; Wishlist/contact ตาม API ที่จะกำหนด |
| Admin | สิทธิ์ moderation ตาม route ที่ป้องกันด้วย admin role |

มาตรการที่พบในระบบออกแบบ/โค้ด:

1. ใช้ JWT HS256 อายุ 24 ชั่วโมง; auth API ตรวจ token ผ่าน shared wrappers
2. route ที่อ่าน/เขียนข้อมูลตามสิทธิ์ต้องใช้ `requireAuth`, `optionalAuth` หรือ `route`
3. `requireAdmin` ตรวจ role จากฐานข้อมูลฝั่ง server ไม่เชื่อ role ที่ส่งจาก client
4. `service_role` อยู่เฉพาะ server; RLS เปิดทุกตารางและไม่มี policy ให้ `anon`/`authenticated`
5. public product selects ระบุคอลัมน์ users โดยชัดเจนและ mapper ปกปิด contact fields/password hash
6. ตรวจ ownership ก่อนแก้ไข/ลบและตรวจ input ก่อนเขียน
7. API ตอบ error ตาม error code ไม่ส่งข้อความ Supabase ตรงให้ client
8. migration `0005` ใช้ Postgres functions เพื่อทำ moderation state change + delete + audit log ใน transaction

**สิ่งที่ยังต้องตรวจสำหรับการส่งมอบ:** ทบทวนทุก route ด้วย security review, ตรวจ HTTPS/deployment settings, ตรวจ secret scanning และยืนยันการตั้งค่าบัญชี Admin

# บทที่ 5 การพัฒนาและการทดสอบระบบ (System Implementation and Testing)

## 5.1 เครื่องมือและสภาพแวดล้อมในการพัฒนา

| รายการ | เครื่องมือ/เทคโนโลยี | หลักฐาน/หมายเหตุ |
|---|---|---|
| ภาษา | JavaScript, ESM | `package.json` |
| Framework | Next.js 15, React 19 | `package.json` |
| Runtime | Node.js 22+ | `engines.node >=22` |
| Database/Storage | Supabase PostgreSQL + Storage | migrations และ `@supabase/supabase-js` |
| Authentication | JWT (`jsonwebtoken`), bcrypt (`bcryptjs`) | dependencies |
| Unit testing | Node.js built-in test runner (`node:test`) | `npm test` |
| API testing | Bruno CLI/collection | `npm run test:api`; requires local server and environment config |
| Styling | CSS Modules + global CSS variables | `app/`, `components/` |
| Code editor | Visual Studio Code | project workflow |
| Version control | Git/GitHub | repository branches and pull requests |
| Hosting target | Vercel | guide prepared; actual deployment not confirmed |
| UI automated test framework | [เว้นไว้รอข้อมูล/การตัดสินใจ] | ยังไม่พบใน dependencies |

## 5.2 แนวทางและวิธีการทดสอบระบบ (Testing Strategy)

### 5.2.1 ประเภทการทดสอบ

| ประเภท | ขอบเขตที่ควรทดสอบ | สถานะหลักฐาน |
|---|---|---|
| Unit testing | validation, query parsing, mapping, image checks, auth helpers, report rules | มี Node test suite |
| Integration/API testing | HTTP response, auth/role, DB/Storage behavior, error mapping | Bruno collection มี; ผลรันล่าสุด [เว้นไว้รอข้อมูล] |
| Component testing | React component behavior | ยังไม่มี framework/test suite ใน dependencies |
| System testing | end-to-end flows บนระบบที่ต่อ backend จริง | ผลและ environment [เว้นไว้รอข้อมูล] |
| UAT | ตัวแทนผู้ใช้ทดลองและให้คะแนน | [เว้นไว้รอข้อมูล: ผู้ทดสอบ แบบประเมิน และผล] |
| Performance testing | page load, API latency, concurrent load | ยังไม่มีผลวัดที่ยืนยันได้ |
| Manual UI testing | หน้าหลัก/รายละเอียด/หน้าต่างติดต่อใน mock mode | เอกสาร TASK-07/10/16/18 บันทึก 16 cases ผ่าน; ให้ยืนยันว่าเป็นผลที่ทีมรับรอง |

### 5.2.2 ผลการทดสอบที่ตรวจยืนยันในรอบจัดทำเอกสาร

| รายการ | ผล | หมายเหตุ |
|---|---|---|
| `npm.cmd test` | **ผ่าน 61/61, fail 0** | รันใน workspace วันที่ 8 พ.ย. 2569; เป็น unit tests |
| `npm.cmd run build` | **ผ่าน** | Next.js production build ผ่าน; 8 พ.ย. 2569 |
| `npm run test:api` | [เว้นไว้รอข้อมูล] | ไม่ได้รันในรอบนี้; ต้องมี server และ Bruno environment ที่ตั้งค่าแล้ว |
| Integration กับ Supabase จริง | [เว้นไว้รอข้อมูล] | ต้องระบุ environment/วันทดสอบและวิธี cleanup |
| UAT / ความพึงพอใจ | [เว้นไว้รอข้อมูล] | ไม่มีรายชื่อผู้ประเมิน/แบบสอบถาม/คะแนนใน repo |
| Performance / 50 concurrent users | [เว้นไว้รอข้อมูล] | ไม่มีผล load test |

มีบันทึกผลการทดสอบ API ใน [`TASK-19-CHANGELOG.md`](TASK-19-CHANGELOG.md) และการทดสอบ UI ด้วยมือใน [`TASK-07-10-16-18-CHANGELOG.md`](TASK-07-10-16-18-CHANGELOG.md) แต่เป็นรายงานในอดีต ไม่ใช่การทดสอบซ้ำในวันที่จัดทำเอกสารนี้

### 5.2.3 ตัวอย่างกรณีทดสอบสำคัญ

| Test ID | กรณี | ผลที่คาดหวัง |
|---|---|---|
| TC-AUTH-01 | สมัครด้วยอีเมลนอกโดเมน CU | 422 `NON_CU_EMAIL` |
| TC-AUTH-02 | เข้าถึง protected route โดยไม่มี token | 401 `UNAUTHORIZED` |
| TC-PROD-01 | GET product list โดยไม่พบรายการ | 200, `data: []`, pagination |
| TC-PROD-02 | ค้นหาด้วย keyword ที่มี comma/วงเล็บ/%/_ | query ถูกต้อง ไม่ทำให้ PostgREST parse error |
| TC-PROD-03 | ผู้ใช้ที่ไม่ใช่เจ้าของแก้ไขสินค้า | 403 `NOT_OWNER` |
| TC-IMG-01 | อัปโหลดไฟล์ข้อความที่เปลี่ยนนามสกุลเป็น JPG | 422 `UNSUPPORTED_FILE_TYPE` |
| TC-IMG-02 | อัปโหลดภาพใหญ่กว่า 2 MiB | 413 `FILE_TOO_LARGE` |
| TC-ADMIN-01 | สมาชิกทั่วไปเรียก admin reports | 403 `ADMIN_REQUIRED` |
| TC-ADMIN-02 | Admin ลบสินค้าที่มีรายงาน | สินค้าถูกลบ, pending reports ถูก actioned, log ถูกบันทึก, cleanup รูป |
| TC-PRIV-01 | ตรวจ product detail สาธารณะ | ไม่มี `email`, `phone_number`, `line_id`, `password_hash` |
| TC-WISH-01 | จัดการ Wishlist | [เว้นไว้รอ API contract และ implementation] |
| TC-CONTACT-01 | สมาชิกขอข้อมูลติดต่อ | [เว้นไว้รอ contact API และ contract] |

## 5.3 การตรวจสอบความสอดคล้องกับข้อกำหนด (Requirements Verification)

| ขอบเขต | พัฒนา | ทดสอบที่ยืนยันได้ | สถานะ |
|---|---|---|---|
| Auth API / JWT / Profile | มี | Unit tests; integration history ต้องแนบผลล่าสุด | พัฒนาแล้ว; API tests ล่าสุดรอยืนยัน |
| Public products / search / filter | มี | Unit tests; Bruno collection มี | พัฒนาแล้ว; API tests ล่าสุดรอยืนยัน |
| Product create/edit/delete/status API | มี | Unit tests; Bruno requests มี | พัฒนาแล้ว; API tests ล่าสุดรอยืนยัน |
| Layout / Home / Search UI | มี | Build ผ่าน; บันทึก manual test ใน frontend notes | พัฒนาแล้ว |
| Product detail UI | มี | Build ผ่าน; manual test ตาม notes | พัฒนาแล้ว |
| Seller contact | UI มี | ยังทดสอบ API จริงไม่ได้ | บางส่วน; backend endpoint ขาด |
| Register/Profile UI | ไม่ครบ | — | ยังไม่ครบ |
| Listing create/edit UI | ยังไม่พบ | — | ยังไม่พัฒนา |
| My listings/status UI | Status API มี; UI ยังไม่พบ | — | ยังไม่ครบ |
| Wishlist | Schema มี; API/UI ยังไม่พบ | — | ยังไม่พัฒนา |
| Report/Admin API | มี | Unit tests; Bruno collection มี; ผลล่าสุดรอยืนยัน | พัฒนาแล้ว |
| Admin Dashboard UI | ยังไม่พบ | — | ยังไม่พัฒนา |
| UAT / performance / uptime evidence | ไม่มีหลักฐาน | — | ยังตรวจรับไม่ได้ |

# บทที่ 6 การประเมินผลและสรุปผล (Evaluation and Conclusion)

## 6.1 วิธีการประเมินผล

ควรประเมินอย่างน้อยสี่ด้าน:

1. **ความครบถ้วนของฟังก์ชัน:** เทียบกับ Functional Requirements และสถานะในหัวข้อ 5.3
2. **ประสิทธิภาพ:** วัด page-load และ API latency ด้วย workload/เครื่องมือที่กำหนด
3. **Usability:** ให้กลุ่มเป้าหมายทดลองงานหลักและบันทึกปัญหา/เวลาทำงาน
4. **ความพึงพอใจ:** แบบสอบถามหลังใช้งาน เช่น ความชัดเจนของข้อมูลสินค้า ความง่ายในการค้นหา และความเชื่อมั่น

| รายการประเมิน | ข้อมูล |
|---|---|
| วันและสถานที่ประเมิน | [เว้นไว้รอข้อมูล] |
| กลุ่มผู้ประเมิน/จำนวน | [เว้นไว้รอข้อมูล] |
| เครื่องมือ/แบบสอบถาม | [เว้นไว้รอข้อมูล] |
| เกณฑ์คะแนนและวิธีคำนวณ | [เว้นไว้รอข้อมูล] |
| ผล usability/ความพึงพอใจ | [เว้นไว้รอข้อมูล] |
| ผล performance/load test | [เว้นไว้รอข้อมูล] |
| ผู้รับรองผล | [เว้นไว้รอข้อมูล] |

## 6.2 สรุปผล

### สรุปโครงงาน

UniTrade เป็นเว็บแอปตลาดกลางสำหรับชุมชนจุฬาฯ พัฒนาด้วย Next.js และเชื่อมต่อ Supabase โดยมี API สำหรับบัญชีผู้ใช้ การอ่านและจัดการประกาศ การค้นหา และการจัดการรายงานจากผู้ดูแล ระบบออกแบบให้การเรียกฐานข้อมูลและการตรวจสิทธิ์เกิดที่ฝั่ง server

### ผลที่ได้รับจากการดำเนินการ

จากหลักฐานใน repository ณ วันที่ตรวจ พบ API หลักสำหรับ Auth, Product Read/CRUD/Search และ Report/Admin รวมถึง UI สำหรับ Layout, Home, Search/Filter และ Product Detail; `npm test` ผ่าน 61/61 และ production build ผ่านในรอบจัดทำเอกสาร

โครงงานยังไม่สมบูรณ์ทุกฟีเจอร์: หน้า Auth เต็มรูปแบบ, Create/Edit listing, My listings, Wishlist, Admin Dashboard และ Contact API ยังขาดหรือมีเพียงบางส่วน และยังไม่มีผลยืนยัน UAT, performance test หรือ deployment จริงในเอกสารที่ตรวจ

### ปัญหาที่ประสบและวิธีแก้ไข

| ปัญหา | วิธีแก้/สถานะ |
|---|---|
| Supabase service role ข้าม RLS | ใช้ server routes เป็นจุดเข้าถึงเดียวและกำหนดให้ตรวจ auth/owner/admin ทุก route |
| PostgREST filter อาจ parse อักขระพิเศษใน keyword | escape/quote keyword ตาม helper ที่ทดสอบแล้ว |
| การสร้าง listing ใช้ทั้ง DB และ object storage ซึ่งไม่มี transaction ร่วม | ตรวจไฟล์ก่อนเขียน DB และพยายาม cleanup เมื่อ upload/insert image ล้มเหลว |
| Admin delete ต้องเปลี่ยน report, ลบสินค้า, บันทึก log อย่าง atomic | ใช้ Postgres RPC function ใน transaction และลบไฟล์หลัง DB สำเร็จ |
| บางฟีเจอร์ยังไม่มี API owner/contract | ระบุเป็น open item; ยังไม่ถือว่าพร้อมใช้งาน |
| ปัญหาอื่นจากการทำงานจริง | [เว้นไว้รอข้อมูลจากทีม] |

### ข้อจำกัดของระบบ

- ไม่มี online payment, shipment, หรือ in-app chat
- ไม่ยืนยันคุณภาพหรือความถูกต้องของประกาศและการซื้อขาย
- การ login ใช้ JWT อายุ 24 ชั่วโมงและไม่มี refresh token
- Contact API ยังไม่พร้อมใช้งาน แม้ UI จะมีปุ่มติดต่อ
- Wishlist schema มี แต่ API/UI ยังไม่พบ
- หน้าสำหรับสร้าง/แก้ไขประกาศ, โปรไฟล์, รายการของฉัน และ Admin Dashboard ยังไม่ครบ
- ยังไม่มีหลักฐานประเมิน performance, availability, UAT และ production deployment

### ข้อเสนอแนะและแนวทางพัฒนาต่อยอด

1. ปิด API contract/ownership สำหรับ Wishlist และ Seller Contact แล้วพัฒนาให้ครบทั้ง backend, frontend และ tests
2. พัฒนา Register/Profile, Listing Form, My Listings และ Admin Dashboard
3. จัดทำ QA test case และรัน Bruno API test ใน environment ที่อนุมัติ พร้อม cleanup test data
4. ทำ usability/UAT กับนิสิตและบุคลากร พร้อมบันทึกกลุ่มผู้ทดสอบและผลประเมิน
5. วัด performance ด้วย workload, dataset, percentile และ environment ที่กำหนดล่วงหน้า
6. Deploy ไปยัง Vercel เมื่อผู้ดูแล secrets/environment variables อนุมัติ แล้วเก็บหลักฐาน smoke test
7. กำหนดนโยบาย retention, backup/recovery, accessibility target และ browser support

# ภาคผนวก (Appendices)

## ภาคผนวก ก — หน้าที่หลักและการมีส่วนร่วมของสมาชิก

ตารางนี้รวบรวมบทบาทจาก project instructions และ SRS ต้นฉบับ; ชื่อจริงและการมีส่วนร่วมรายกิจกรรมที่ไม่มีหลักฐานเว้นไว้ให้ทีมตรวจทาน

| สมาชิก/Handle | บทบาทหลัก | งานที่เกี่ยวข้องตามข้อมูลที่มี | ชื่อจริง/การยืนยัน |
|---|---|---|---|
| @Snow212 | Project Manager / Business Analyst | กำหนดขอบเขตและประสานงาน; จัดทำบทนำตาม SRS ต้นฉบับ | [เว้นไว้รอข้อมูล] |
| @film_ | System Analyst / UI-UX Designer | System Overview, Context Diagram, UI specification และ flow | [เว้นไว้รอข้อมูล] |
| @Aud | QA / Software Tester / Technical Writer | เก็บ requirement, test cases และตรวจเอกสาร | [เว้นไว้รอข้อมูล] |
| @wz | Backend Lead | Architecture, auth, backend libraries, schema/API review | [เว้นไว้รอข้อมูล] |
| @yat | Frontend Lead | Layout, Home, Search/Filter, Product detail UI | [เว้นไว้รอข้อมูล] |
| @SArunPoB | Backend Developer | Product Read/CRUD และ Report/Admin ตามสถานะงานใน repository guidance | [เว้นไว้รอข้อมูล] |
| @warixm | Frontend Developer | Auth UI, listing UI, product status, Wishlist, Admin UI ตาม task ownership | [เว้นไว้รอข้อมูล] |

## ภาคผนวก ข — ผู้รับผิดชอบการจัดทำรายงาน

| บท/หัวข้อ | ผู้รับผิดชอบ | สถานะการยืนยัน |
|---|---|---|
| บทที่ 1 บทนำ | @Snow212 | ต้องให้ทีมยืนยัน |
| บทที่ 2 การเก็บข้อมูล | @Aud | ต้องเติมหลักฐานภาคสนาม |
| บทที่ 3 วิเคราะห์ระบบ | @film_, @wz, @yat, @SArunPoB | ต้องให้ทีมยืนยัน |
| บทที่ 4 ออกแบบระบบ | [เว้นไว้รอข้อมูล] | ต้องระบุผู้เขียน/ผู้ตรวจแต่ละหัวข้อ |
| บทที่ 5 พัฒนาและทดสอบ | [เว้นไว้รอข้อมูล] | ต้องระบุผู้เขียน/ผู้รวบรวมผล |
| บทที่ 6 ประเมินผลและสรุป | [เว้นไว้รอข้อมูล] | ต้องระบุผู้ประเมิน/ผู้สรุป |
| ภาคผนวก | [เว้นไว้รอข้อมูล] | ต้องตรวจรายชื่อและ contribution |

## ภาคผนวก ค — เอกสารและหลักฐานประกอบ

- SRS ฉบับปรับปรุง: [`SRS-UNTRADE-v2.2.md`](SRS-UNTRADE-v2.2.md)
- Kanban และ task tracker ที่ถอดจากกำหนดการเดิม: [`PROJECT-KANBAN.md`](PROJECT-KANBAN.md)
- Context Diagram: [`CONTEXT-DIAGRAM.md`](CONTEXT-DIAGRAM.md)
- Frontend design/testing notes: [`REPORT-FRONTEND.md`](REPORT-FRONTEND.md)
- API Specification v2.2: [เว้นไว้รอข้อมูล: เพิ่มไฟล์หรือลิงก์ฉบับอนุมัติ]
- Interview notes/consent/questionnaire: [เว้นไว้รอข้อมูล]
- Use case/sequence diagrams ต้นฉบับของ UC-01–UC-07: [เว้นไว้รอข้อมูล]
- Screenshot/production deployment evidence: [เว้นไว้รอข้อมูล]
- UAT forms and results: [เว้นไว้รอข้อมูล]

## รายการข้อมูลที่ยังขาดเพื่อปิดเล่ม

1. **หลักฐานเก็บความต้องการ:** วันที่/สถานที่/ช่องทางสัมภาษณ์, แบบคำถาม, เกณฑ์เลือกผู้ให้ข้อมูล, บันทึกหรือผลสรุปแยกรายข้อ และการจัดการความยินยอม/ข้อมูลส่วนบุคคล
2. **เอกสารออกแบบต้นฉบับ:** API Specification v2.2 ที่อนุมัติ, Use Case/Sequence diagrams UC-01–UC-07, ERD ต้นฉบับ และรายละเอียดโครงสร้าง database ที่ทีมรับรอง
3. **การทดสอบ:** ผล `npm run test:api` รอบล่าสุดพร้อม environment/วันทดสอบ, integration tests กับ Supabase, ผู้ทดสอบและหลักฐาน UAT, browser/device matrix และผล performance/availability
4. **การประเมิน:** วิธีประเมิน กลุ่มผู้ประเมิน จำนวน เครื่องมือ คะแนน/ผลวิเคราะห์ และข้อเสนอแนะ
5. **การดำเนินโครงงาน:** มี baseline dates และ sprint windows ใน [PROJECT-KANBAN.md](PROJECT-KANBAN.md) แล้ว; ยังขาดวันที่เสร็จจริง ความคลาดเคลื่อนจากแผน ปัญหาที่เกิดจริง วิธีแก้ และบทเรียนจากสมาชิก
6. **สถานะระบบ:** ยืนยันว่า Vercel deploy แล้วหรือยัง; หาก deploy แล้วให้เติม URL, วัน deploy, smoke test และผู้อนุมัติ โดยห้ามใส่ secret
7. **การแบ่งงานรายงาน:** ผู้เขียน/ผู้ตรวจแต่ละหัวข้อและชื่อจริงของสมาชิก
8. **ข้อกำหนดโครงการที่ยังเปิด:** Wishlist API, Contact API, account verification, browser support, accessibility level, data retention และ recovery policy

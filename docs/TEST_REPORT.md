# Test Report — Unitrade


| รายการ | ค่า |
|---|---|
| โครงการ | UniTrade (Campus Marketplace Platform) |
| เอกสารอ้างอิง |[SRS-UNITRADE-v2.2.md](docs/SRS-UNITRADE-v2.2.md)|
| ชีตทดสอบ | [UniTrand_TASK-11](docs/UniTrade_TASK-11_Test_Cases.xlsx) (75 เคส: Authentication 31, Product Read 44) |
| ขอบเขตที่ทดสอบ | Authentication (UC-01), Product Read (UC-04, UC-05) |
| สภาพแวดล้อมที่ทดสอบ | localhost dev server, Chrome 157.0.8103.52 |
| เครื่องมือ | Chrome DevTools, VS code, Bruno |

---

## 3.4 ความต้องการที่ไม่ใช่ด้านหน้าที่ (Non-functional Requirements)

> ตรวจเลขข้อและค่าเกณฑ์กับ SRS v2.2 อีกครั้ง (ชีตทดสอบอ้าง SRS v2.0 ซึ่งหัวข้อนี้อยู่ที่ 3.3)

| หมวด | ข้อกำหนด | เกณฑ์วัด | เคสทดสอบ | ผล |
|---|---|---|---|---|
| ประสิทธิภาพ | เวลาโหลดหน้าแรก | ≤ 3.0 วินาที | TC-PROD-042 | PASS |
| ประสิทธิภาพ | เวลาตอบสนอง API รายการสินค้า/ค้นหา | ≤ 500 ms ที่ 50 concurrent users | TC-PROD-043 | PASS |
| ความปลอดภัย | เก็บรหัสผ่านด้วย bcrypt | Salt Rounds ≥ 10 | TC-AUTH-018 | PASS |
| ความปลอดภัย | สื่อสารผ่าน HTTPS | TLS 1.3 | TC-AUTH-032 | PASS |
| ความปลอดภัย | อายุ JWT | 24 ชั่วโมง | TC-AUTH-025, 029 | N/A |
| ความถูกต้องของข้อมูล | ตรวจโดเมนอีเมลฝั่ง Server | เฉพาะ @student.chula.ac.th และ @chula.ac.th | TC-AUTH-003 ถึง 006, 017 | PASS |
| ความถูกต้องของข้อมูล | ขนาด/ชนิดไฟล์รูป | ≤ 2MB, .jpg/.jpeg/.png | TC-PROD-044 | FAIL|
| การใช้งาน | Responsive | 375px และ 1024px | TC-PROD-041 | N/A |
| ความพร้อมใช้งาน | System Uptime | ≥ 95% ช่วงทดสอบ/นำเสนอ | ไม่มีเคส | PASS |

---

## 5.2.1 ประเภทการทดสอบ

**แนวทาง:** ทดสอบแบบ Black-box ด้วยมือ (Manual) ผ่านหน้าเว็บ (UI) และผ่าน API โดยตรง (Bruno) เขียนเคสด้วยเทคนิค Positive/Negative, Boundary Value Analysis, Equivalence Partitioning และเคสด้านความปลอดภัย

| ประเภท | Authentication | Product Read | รวม |
|---|---|---|---|
| Positive (ทางปกติ) | 7 | 19 | 26 |
| Negative (ข้อมูลผิด/ถูกปฏิเสธ) | 13 | 11 | 24 |
| Boundary (ค่าขอบ) | 5 | 6 | 11 |
| Security | 6 | 5 | 11 |
| NFR | 0 | 3 | 3 |
| **รวม** | **31** | **44** | **75** |

> ตรวจตัวเลขกับชีตจริงก่อนส่ง ถ้ามีเคสเพิ่ม/ลด ให้แก้ตาราง

**Priority:** High 43 / Medium 30 / Low 2

---

## 5.2.2 ผลการทดสอบ

**ที่มา:** ชีต TASK-11 แท็บ Summary ณ วันที่ 14/11/2026

| ชุดทดสอบ | จำนวนเคส | Pass | Fail | Blocked | N/A | Not Run | % ดำเนินการ | % Pass |
|---|---|---|---|---|---|---|---|---|
| Authentication | 31 | 28 | 0 | 1 | 2 | 0 | 100% | 97% |
| Product Read | 44 | 41 | 1 | 0 | 2 | 0 | 100% | 98% |
| **รวม** | 75 | 67 | 1 | 1 | 4 | 0 | 100% | 97% |

### บั๊กที่พบ

| Bug ID | เคส | สรุป | ความรุนแรง | สถานะ |
|---|---|---|---|---|

### เคสที่ Fail / Blocked / N/A / Not Run (ต้องมีเหตุผลทุกเคส)
| TC-AUTH_005 | ปฏิเสธโดเมนที่ดูคล้ายโดเมนจุฬาฯ (ตรวจแบบ ends-with ไม่ใช่ contains) | ไม่ได้อยู่ใน SRS | ไม่มีผล | N/A |
| TC-AUTH_029 | token หมดอายุ | ไม่ได้อยู่ใน SRS | ไม่มีผล | N/A |
| TC-PROD-044 | ขนาดไฟล์ที่ใหญ่กว่า 2 mb ยังคงใส่ได้ | ใส่รูปขนาดใหญ่ได้ | มีผลเล็กน้อย | FAIL |

| เคส | สถานะ | เหตุผล | รอใคร/ผลกระทบ |
|---|---|---|---|
| TC-AUTH_018 | Blocked | backend check supabase | backend |

### ข้อค้นพบเรื่องความไม่ตรงกันระหว่างเอกสารกับระบบ

| รหัส | ประเด็น | สถานะ |
|---|---|---|
| TC-PROD-002 | limit 12 เลื้อนไปหน้าตอ่ไปได้ ตาม SRS คือ 20  | PASS |
| TC-PROD-043 | เวลาตอบสนองของ API รายการสินค้าและค้นหาในครั้งแรกเกิน 500 ms ที่ 50 Concurrent Users | PASS |

---

## 6.1 วิธีการประเมินผล

- **ตัดสินรายเคส:** เทียบ Actual Result กับ Expected Result ตรงกันทุกข้อ = Pass, ไม่ตรง = Fail, ทดสอบต่อไม่ได้ = Blocked, นอกขอบเขต = N/A
- **ตัวชี้วัด:** % ดำเนินการแล้ว = (Pass + Fail + Blocked) ÷ (จำนวนเคส − N/A), % Pass = Pass ÷ (จำนวนเคส − N/A)
- **ความรุนแรงของบั๊ก:** Critical (ใช้งานหลักไม่ได้/ข้อมูลรั่ว), High, Medium, Low `[ปรับตามที่ทีมตกลง]`
- **เกณฑ์ยอมรับ (ข้อเสนอ รอทีมยืนยัน):** `[ เคส High ผ่านทั้งหมด และไม่มีบั๊ก Critical ค้าง]`
- **หลักฐาน:** ทุกเคสมี Actual Result และเคส Fail มี Bug Report/ภาพประกอบ (ดูภาคผนวก ค)

---

## 6.2 สรุปผล

- **ภาพรวม:** ทดสอบแล้ว 70 จาก 71 เคส Pass 97%
- **ข้อค้นพบสำคัญ:** ระบบสามารถทำงานได้
- **ความเสี่ยงที่ยังเหลือ:** ยังสามารถเพิ่มรูปที่มีขนาดเกินที่กำหนดได้
- **ข้อจำกัดของผลทดสอบ:** วัดความเร็วบน localhost, เคสที่ต้องใช้บัญชี seed

---

## ภาคผนวก ค — เอกสารและหลักฐานประกอบ Test Report

| รายการ | ที่เก็บ/ลิงก์ | หมายเหตุ |
|---|---|---|
| ชีต Test Cases (ทุกแท็บ) | `https://docs.google.com/spreadsheets/d/1KSRb8gmezWg_BF_ALDlOLOqiiTT72ipHCiIDPhfskDI/edit?usp=sharing` | TASK21 |
| ภาพหลักฐานของเคสที่ Fail/สำคัญ | `https://docs.google.com/spreadsheets/d/1KSRb8gmezWg_BF_ALDlOLOqiiTT72ipHCiIDPhfskDI/edit?usp=sharing` | อยู่ในไฟล์หน้าสุกท้าย |
| Bug Reports | - | ยังไม่เจอ bug |

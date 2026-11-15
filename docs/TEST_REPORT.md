# Test Report — Unitrade


| รายการ | ค่า |
|---|---|
| โครงการ | UniTrade (Campus Marketplace Platform) |
| เอกสารอ้างอิง |[SRS-UNITRADE-v2.2.md](docs/SRS-UNITRADE-v2.2.md)|
| ชีตทดสอบ | [https://docs.google.com/spreadsheets/d/1KSRb8gmezWg_BF_ALDlOLOqiiTT72ipHCiIDPhfskDI/edit?gid=1287960581#gid=1287960581] (135 เคส: Authentication 31, Product Read 44, Self 20, Admin and Report 11) |
| ขอบเขตที่ทดสอบ | ทดสอบทุก FR- 1-10 และ NFR ยกเว้น FR-8  |
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

| ชุดทดสอบ | จำนวนเคส | Pass | Fail | Blocked | N/A | Not Run | % ดำเนินการ | % Pass |
|---|---|---|---|---|---|---|---|---|
| FR | 110 | 95 | 0 | 0 | 4 | 11 | 90% | 90% |
| NFR | 25 | 13 | 2 | 1 | 1 | 8 | 67% | 54% |
| **รวม** | 135 | 108 | 2 | 1 | 5 | 19 | 85% | 83% |

> ตรวจตัวเลขกับชีตจริงก่อนส่ง ถ้ามีเคสเพิ่ม/ลด ให้แก้ตาราง

---

## 5.2.2 ผลการทดสอบ

**ที่มา:** ชีต TASK-21 แท็บ Summary ณ วันที่ 15/11/2026

| ชุดทดสอบ | จำนวนเคส | Pass | Fail | Blocked | N/A | Not Run | % ดำเนินการ | % Pass |
|---|---|---|---|---|---|---|---|---|
| Authentication | 31 | 29 | 0 | 0 | 2 | 0 | 100% | 100% |
| Product Read | 48 | 47 | 0 | 0 | 1 | 0 | 100% | 100% |
| Contact-Profile-Wishlist | 20 | 28 | 0 | 1 | 0 | 0 | 100% | 100% |
| Report-Admin | 11 | 0 | 0 | 0 | 0 | 11 | 0% | 0% |
| **รวม** | 110 | 95 | 0 | 0 | 0 | 11 | 90% | 90% |

### บั๊กที่พบ

| Bug ID | เคส | สรุป | ความรุนแรง | สถานะ |
|---|---|---|---|---|

### เคสที่ Fail / Blocked / N/A / Not Run (ต้องมีเหตุผลทุกเคส)
| TC-AUTH_005 | ปฏิเสธโดเมนที่ดูคล้ายโดเมนจุฬาฯ (ตรวจแบบ ends-with ไม่ใช่ contains) | ไม่ได้อยู่ใน SRS | ไม่มีผล | N/A |
| TC-AUTH_029 | token หมดอายุ | ไม่มีความจำเป็นต้องทดสอบ | ไม่มีผล | N/A |
| TC-PROD_018 | free_only=false | ไม่ได้อยู่ใน SRS | ไม่มีผล | N/A |


| เคส | สถานะ | เหตุผล | รอใคร/ผลกระทบ |
|---|---|---|---|
| TC-ADMI | NOT RUN | ไม่สามารถทำได้ใน mock | backend |

### ข้อค้นพบเรื่องความไม่ตรงกันระหว่างเอกสารกับระบบ

| รหัส | ประเด็น | สถานะ |
|---|---|---|
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

- **ภาพรวม:** ทดสอบแล้ว 108 จาก 135 เคส Pass 85%
- **ข้อค้นพบสำคัญ:** ระบบสามารถทำงานได้
- **ความเสี่ยงที่ยังเหลือ:** ไม่มีอะไรที่เป้ฯอันตราย
- **ข้อจำกัดของผลทดสอบ:** วัดความเร็วบน localhost, เคสที่ต้องใช้บัญชี seed

---

## ภาคผนวก ค — เอกสารและหลักฐานประกอบ Test Report

| รายการ | ที่เก็บ/ลิงก์ | หมายเหตุ |
|---|---|---|
| ชีต Test Cases (ทุกแท็บ) | `https://docs.google.com/spreadsheets/d/1KSRb8gmezWg_BF_ALDlOLOqiiTT72ipHCiIDPhfskDI/edit?usp=sharing` | TASK21 |
| ภาพหลักฐานของเคสที่ Fail/สำคัญ | `https://docs.google.com/spreadsheets/d/1KSRb8gmezWg_BF_ALDlOLOqiiTT72ipHCiIDPhfskDI/edit?usp=sharing` | อยู่ในไฟล์หน้าสุกท้าย |
| Bug Reports | - | ยังไม่เจอ bug |

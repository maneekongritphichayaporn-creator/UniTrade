# UniTrade Project Kanban & Task Tracker

**วันที่จัดทำ/ปรับสถานะ:** 8 พฤศจิกายน 2569  
**ฐานเวลา:** คงวัน TASK ตามแผนต้นฉบับ และปรับกรอบ Sprint 4 ให้ครอบคลุมวันนำเสนอ 17 พ.ย. 2569  
**สถานะงาน:** อ้างอิง tracker ต้นฉบับและคำยืนยันของทีม; ไม่ใช่การรับรองผลตรวจรับหรือผลทดสอบซ้ำ

> **กติกาสถานะปัจจุบัน:** TASK-21–25 ให้พักไว้ก่อน ห้ามเดินหน้าจนกว่า TASK-01–20 จะเสร็จครบ การ์ดเหล่านี้จึงอยู่ในคอลัมน์ “รอ / Blocked” แม้ Excel ต้นฉบับระบุ TASK-23 และ TASK-25 ว่า In Progress; มีบันทึกสถานะเดิมไว้ในตารางงานด้านล่าง  

## Kanban board

### Done — 14 งาน

- **TASK-01 — Planning:** กำหนดการ, UI details และ SRS v1.0 · Sprint 0 · 01–05 ก.ย. · PM/BA · High
- **TASK-02 — UI/UX:** Wireframe และ High-Fidelity UI · Sprint 0 · 06–10 ก.ย. · SA/UI · High
- **TASK-03 — System Design:** ER-Diagram, Sequence Diagram และ Data Dictionary · Sprint 0 · 02–07 ก.ย. · SA/UI · High
- **TASK-04 — Setup:** Database design และ Supabase setup · Sprint 0 · 08–10 ก.ย. · BE Lead · High
- **TASK-05 — Setup:** API Specification และ request/response mock · Sprint 0 · 09–12 ก.ย. · BE Lead · High
- **TASK-06 — Auth:** Backend Register, Login, Profile และ JWT · Sprint 1 · 13–26 ก.ย. · BE Lead · High
- **TASK-07 — Core Layout:** Frontend layout, Navbar, routing และ theme · Sprint 1 · 14–27 ก.ย. · FE Lead · Medium
- **TASK-09 — Product Read:** Backend GET products และ product detail · Sprint 1 · 27 ก.ย.–01 ต.ค. · BE Dev · High
- **TASK-10 — Product Read:** หน้า Home และ Product Card Grid · Sprint 1 · 28 ก.ย.–02 ต.ค. · FE Lead · High
- **TASK-12 — Product CRUD:** Backend create/edit/delete และ upload รูป · Sprint 2 · 03–08 ต.ค. · BE Dev · High
- **TASK-15 — Search & Filter:** Backend query search และ category filter · Sprint 2 · 10–14 ต.ค. · BE Lead · Medium
- **TASK-16 — Search & Filter:** Frontend Search Bar และ Filter · Sprint 2 · 11–15 ต.ค. · FE Lead · Medium
- **TASK-18 — Contact:** หน้า Product Detail และ UI ติดต่อผู้ขาย · Sprint 2 · 15–17 ต.ค. · FE Lead · Medium
- **TASK-19 — Admin:** Backend Report และ Admin moderation · Sprint 3 · 18–22 ต.ค. · BE Dev · Medium

### In Progress — 5 งาน

- **TASK-08 — Auth:** Frontend Login, Register และ Profile Form · Sprint 1 · 15–28 ก.ย. · FE Dev · High
- **TASK-13 — Product CRUD:** ฟอร์มลงประกาศและแก้ไขสินค้า · Sprint 2 · 04–09 ต.ค. · FE Dev · High
- **TASK-14 — Product Status:** เปลี่ยนสถานะและหน้ารายการของฉัน · Sprint 2 · 09–11 ต.ค. · FE Dev · Medium
- **TASK-17 — Wishlist:** Wishlist FE และ BE · Sprint 2 · 14–17 ต.ค. · FE Dev · Low
- **TASK-20 — Admin:** Frontend Admin Dashboard · Sprint 3 · 20–25 ต.ค. · FE Dev · Medium

### ยังไม่เริ่ม — 1 งาน

- **TASK-11 — Testing:** Test cases ระบบ Login และการแสดงสินค้า · Sprint 1 · 29 ก.ย.–02 ต.ค. · QA/Doc · Medium. **หมายเหตุ:** ยังไม่พบเอกสาร test case แยกหรือหลักฐานส่งมอบใน repository

### รอ — 5 งาน

- **TASK-21 — Integration & System Testing:** QA/Doc · Sprint 3 · 24–30 ต.ค. · High  
  **Blocker:** เริ่มได้หลัง TASK-01–20 เสร็จครบ
- **TASK-22 — Bug Fixing:** Developers ทั้งหมด · Sprint 3 · 27 ต.ค.–01 พ.ย. · High  
  **Blocker:** รอผลทดสอบและรายการ defect จาก TASK-21
- **TASK-23 — Deployment:** Deploy Frontend ไป Vercel และเชื่อม Domain/DB · Sprint 4 · 02–05 พ.ย. · FE Lead · High  
  **Blocker:** รอ TASK-22 และ regression test; Excel ต้นฉบับระบุ In Progress/มีคู่มือเตรียม deploy แต่ยังไม่ถือว่า deploy production แล้ว
- **TASK-24 — Final Polish:** รวบรวมรายงานโครงการ 5 บทฉบับสมบูรณ์ · Sprint 4 · 03–10 พ.ย. · QA/Doc · High  
  **Blocker:** รอผล TASK-21–23 เพื่อใส่หลักฐานจริงในรายงาน
- **TASK-25 — Presentation:** สไลด์และบททดสอบ Demo · Sprint 4 · 09–17 พ.ย. · PM/BA · High  
  **Blocker:** รอ TASK-21–24 ตามคำสั่งล่าสุด; Excel ระบุ In Progress และวันนำเสนอ 17 พ.ย. ซึ่งเก็บเป็นข้อมูลแผนเดิม

## Master task register

วันทั้งหมดเป็นช่วงตาม Excel ต้นฉบับ พ.ศ. 2569; ไม่ได้เลื่อนวันตามสถานะปัจจุบัน

| Task | Sprint | Owner | Priority | วันตามแผนเดิม | สถานะบนบอร์ด | สถานะใน Excel |
| --- | --- | --- | --- | --- | --- | --- |
| TASK-01 | 0 | PM/BA | High | 01–05 ก.ย. | Done (ทีมยืนยัน) | Done |
| TASK-02 | 0 | SA/UI | High | 06–10 ก.ย. | Done (ทีมยืนยัน) | Done |
| TASK-03 | 0 | SA/UI | High | 02–07 ก.ย. | Done (ทีมยืนยัน) | Done |
| TASK-04 | 0 | BE Lead | High | 08–10 ก.ย. | Done | Done |
| TASK-05 | 0 | BE Lead | High | 09–12 ก.ย. | Done (ทีมยืนยัน) | Done |
| TASK-06 | 1 | BE Lead | High | 13–26 ก.ย. | Done | Done |
| TASK-07 | 1 | FE Lead | Medium | 14–27 ก.ย. | Done | Done |
| TASK-08 | 1 | FE Dev | High | 15–28 ก.ย. | In Progress | In Progress |
| TASK-09 | 1 | BE Dev | High | 27 ก.ย.–01 ต.ค. | Done | Done |
| TASK-10 | 1 | FE Lead | High | 28 ก.ย.–02 ต.ค. | Done | Done |
| TASK-11 | 1 | QA/Doc | Medium | 29 ก.ย.–02 ต.ค. | Not started — ยังไม่พบหลักฐานส่งมอบ | Done |
| TASK-12 | 2 | BE Dev | High | 03–08 ต.ค. | Done | Done |
| TASK-13 | 2 | FE Dev | High | 04–09 ต.ค. | In Progress | In Progress |
| TASK-14 | 2 | FE Dev | Medium | 09–11 ต.ค. | In Progress | In Progress |
| TASK-15 | 2 | BE Lead | Medium | 10–14 ต.ค. | Done (PR #8 merged; tests and changelog present) | In Progress |
| TASK-16 | 2 | FE Lead | Medium | 11–15 ต.ค. | Done | Done |
| TASK-17 | 2 | FE Dev | Low | 14–17 ต.ค. | In Progress | In Progress |
| TASK-18 | 2 | FE Lead | Medium | 15–17 ต.ค. | Done (UI; Contact API pending) | Done |
| TASK-19 | 3 | BE Dev | Medium | 18–22 ต.ค. | Done (Backend) | Done |
| TASK-20 | 3 | FE Dev | Medium | 20–25 ต.ค. | In Progress | In Progress |
| TASK-21 | 3 | QA/Doc | High | 24–30 ต.ค. | Blocked — รอ TASK-01–20 | ว่าง |
| TASK-22 | 3 | Devs ทั้งหมด | High | 27 ต.ค.–01 พ.ย. | Blocked — รอ TASK-21 | ว่าง |
| TASK-23 | 4 | FE Lead | High | 02–05 พ.ย. | Blocked — พักตาม gate; มีงานเตรียม deploy | In Progress |
| TASK-24 | 4 | QA/Doc | High | 03–10 พ.ย. | Blocked — รอ TASK-21–23 | ว่าง |
| TASK-25 | 4 | PM/BA | High | 09–17 พ.ย. | Blocked — พักตาม gate | In Progress |

## Sprint timeline: baseline

| Sprint | ช่วงเวลาตามแผนเดิม | หมายเหตุ |
|---|---|---|
| Sprint 0 | 01–12 ก.ย. 2569 | Analysis & Initial Design |
| Sprint 1 | 13 ก.ย.–03 ต.ค. 2569 | เว้น Midterm Week ตามแผน |
| Sprint 2 | 04–17 ต.ค. 2569 | Product CRUD, Search/Filter, Wishlist |
| Sprint 3 | 18–31 ต.ค. 2569 | Admin, Integration/System Testing, Bug Fixing |
| Sprint 4 | 01–17 พ.ย. 2569 | Deployment, Final Polish, Presentation/Demo |

การปรับกรอบ Sprint 4 นี้ทำให้วันนำเสนอ 17 พ.ย. อยู่ภายใน Sprint โดยคงวันเริ่ม/สิ้นสุดราย TASK ใน Excel ไว้เป็น baseline; การเปลี่ยนช่วง Sprint ไม่ได้ยืนยันว่ากิจกรรมหรือ TASK ที่ยัง Blocked ได้เริ่มดำเนินการแล้ว

## Dependencies and workflow

1. TASK-21 เริ่มได้เมื่อ TASK-01–20 เสร็จครบตาม gate ที่ทีมกำหนด
2. TASK-22 รับงานจาก defect ที่ยืนยันได้ใน TASK-21 และต้องมี regression test
3. TASK-23 ทำหลัง bug fix/regression; คู่มือหรือการเตรียมค่าระบบไม่เท่ากับ production deployment
4. TASK-24 สรุปผลจากการทดสอบ การแก้ไข และการ deploy ที่เกิดขึ้นจริง
5. TASK-25 เตรียม Demo หลังระบบและรายงานพร้อม

## Definition of Done

งานจะย้ายเป็น Done เมื่อมีหลักฐานตามความเหมาะสมครบ:

- Acceptance Criteria ของงานผ่านการตรวจรับ
- Code review ผ่านและ merge ตามกระบวนการทีม (ถ้ามีโค้ด)
- ผ่านการทดสอบที่เกี่ยวข้อง ไม่มี Critical/Major defect ค้างโดยไม่ได้รับอนุมัติ
- จัดการ error และตรวจ responsive บน mobile/desktop สำหรับงาน UI
- แนบลิงก์หลักฐาน ผลทดสอบ หรือเอกสารส่งมอบใน tracker

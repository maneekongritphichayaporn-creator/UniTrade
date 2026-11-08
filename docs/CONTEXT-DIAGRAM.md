# UniTrade — Context Diagram

**Notation:** Data Flow Diagram (DFD), Context Diagram / Level 0  
**System boundary:** UniTrade campus marketplace application and its business logic.  
**Purpose:** Show the external parties and services that exchange information with UniTrade. Internal processes, database tables, and API endpoints are intentionally omitted at this level.

```mermaid
flowchart LR
    member["สมาชิก<br/>(ผู้ซื้อ / ผู้ขาย)"]
    admin["ผู้ดูแลระบบ<br/>(Admin)"]
    system(("0<br/>UniTrade<br/>Campus Marketplace"))
    supabase["Supabase<br/>(Database & File Storage)"]

    member -->|"ข้อมูลสมัครสมาชิก / เข้าสู่ระบบ / แก้ไขโปรไฟล์และช่องทางติดต่อ"| system
    member -->|"คำค้นหาและตัวกรองสินค้า"| system
    member -->|"ข้อมูลประกาศ: สร้าง / แก้ไข / เปลี่ยนสถานะ / ลบ และรูปภาพ"| system
    member -->|"คำสั่ง Wishlist: เพิ่ม / นำออก / ดูรายการ"| system
    member -->|"รายงานประกาศและเหตุผล"| system
    member -->|"คำขอดูช่องทางติดต่อผู้ขาย"| system

    system -->|"ผลสมัคร / เข้าสู่ระบบ / โปรไฟล์"| member
    system -->|"รายการสินค้า ผลการค้นหา และรายละเอียดประกาศ"| member
    system -->|"ผลการจัดการประกาศและสถานะล่าสุด"| member
    system -->|"รายการ Wishlist และผลการเพิ่ม / นำออก"| member
    system -->|"ผลการส่งรายงาน"| member
    system -->|"ช่องทางติดต่อผู้ขาย (เฉพาะผู้ใช้ที่ได้รับอนุญาต)"| member

    admin -->|"ข้อมูลเข้าสู่ระบบผู้ดูแลและคำขอตรวจสอบรายงาน"| system
    admin -->|"คำสั่งยกเลิกรายงานหรือคำสั่งลบประกาศ"| system
    system -->|"รายการรายงานและข้อมูลประกาศที่เกี่ยวข้อง"| admin
    system -->|"ผลการดำเนินการและข้อมูลบันทึกการดูแลระบบ"| admin

    system -->|"คำสั่งอ่าน / บันทึกข้อมูลและไฟล์รูป"| supabase
    supabase -->|"ผลการอ่าน / บันทึกข้อมูล เมทาดาทา และไฟล์รูป"| system
```

## External entities and data flows

| External entity | Information sent to UniTrade | Information received from UniTrade |
|---|---|---|
| **สมาชิก (ผู้ซื้อ / ผู้ขาย)** | Registration and login details; profile and contact-channel updates; search criteria; listing content and images; listing changes; Wishlist actions; product reports; requests for seller contact details. | Authentication and profile results; product lists, search results, and details; listing and status results; Wishlist contents and action results; report result; seller contact channels when authorized. |
| **ผู้ดูแลระบบ (Admin)** | Admin sign-in details; requests to review reports; commands to dismiss a report or delete a listing. | Reports and related listing information; moderation action results and audit information. |
| **Supabase (Database & File Storage)** | Data read/write requests and image-file operations from UniTrade. | Query/write results, stored data and metadata, and image-file results. |

## Notation and scope notes

- The numbered circle is the single **context process**; `0` identifies the UniTrade system at this level.
- Rectangles represent **external entities/services**. Directed, labeled arrows represent **data flows**; paired arrows show two-way exchanges.
- Supabase is shown as an external service dependency. Its tables, storage buckets, and internal operations are not expanded here.
- Seller contact information is returned only through the authorized contact flow; public product browsing does not include private contact channels.
- UniTrade does not provide in-app chat, payments, or shipping. These are outside this system boundary.
- This diagram describes the target scope across the listed tasks. It is not a claim that every depicted feature has already been implemented; in particular, Wishlist and the contact API are not currently present in the repository.

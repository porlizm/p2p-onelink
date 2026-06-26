# Seed Data — e-Procurement / P2P System
## SCGJWD Procurement Vendor Register (PJ250051)

| รายการ | รายละเอียด |
|---|---|
| Project Code | PJ250051 |
| เอกสาร | Seed Data (ข้อมูลตัวอย่างสำหรับ Prototype) |
| ใช้สำหรับ | Build Prototype (Antigravity) — เอกสารที่ 5 ของชุด Prototype |
| อ้างอิงเอกสารชุดเดียวกัน | `User_Flow.md` → `Data_Model_(ERD).md` → `PR_Screen_Inventory.md` → `Design_System.md` → **Seed_Data.md** (ไฟล์นี้) |
| วันที่อ้างอิง "ปัจจุบัน" ของชุดข้อมูล | 18 มิถุนายน 2569 (2026-06-18) — ใช้เป็นจุดอ้างอิงคำนวณ "ใกล้หมดอายุ", "ค้างนาน", "วันนี้" |
| Version | VD01.00.00 |

---

## สารบัญ

1. [หลักการออกแบบ Seed Data](#1-หลักการออกแบบ-seed-data)
2. [Pilot Scope Setup (Company / BU / Cost Center)](#2-pilot-scope-setup-company--bu--cost-center)
3. [Master Data Tier 1: Users, Vendors, Categories, Items](#3-master-data-tier-1-users-vendors-categories-items)
4. [Master Data Tier 2-3: Prices, Documents, DOA, Roles](#4-master-data-tier-2-3-prices-documents-doa-roles)
5. [Procurement: Purchase Requisitions](#5-procurement-purchase-requisitions)
6. [Sourcing & Bidding](#6-sourcing--bidding)
7. [Purchase Orders](#7-purchase-orders)
8. [Goods Receipt, Claim & Stock](#8-goods-receipt-claim--stock)
9. [Invoice & Credit/Debit Note](#9-invoice--creditdebit-note)
10. [Payment Request & Payment Proposal](#10-payment-request--payment-proposal)
11. [Workflow, Approval Steps & Notification](#11-workflow-approval-steps--notification)
12. [Audit Log & Integration Log](#12-audit-log--integration-log)
13. [⭐ Golden Thread — เรื่องราวเดียวที่ลากยาวทั้งระบบ](#13--golden-thread--เรื่องราวเดียวที่ลากยาวทั้งระบบ)
14. [Status Coverage Checklist](#14-status-coverage-checklist)
15. [Screen ↔ Seed Data Quick Reference](#15-screen--seed-data-quick-reference)
16. [Assumption & Open Items](#16-assumption--open-items)

---

## 1. หลักการออกแบบ Seed Data

### 1.1 กลยุทธ์ 3-Tier (ทำไมบาง Entity มีข้อมูลมาก บางอันมีน้อย)

| Tier | Entity ประเภทไหน | จำนวนแถวต่อ Entity | เหตุผล |
|---|---|---|---|
| **Tier 1** | Entity ที่ขับ List/Table หลักของหน้าจอ (vendor, item, purchase_requisition, bidding, purchase_order, goods_receipt, invoice, payment_request, app_user, notification, audit_log, integration_log) | 8-12 แถว ครอบคลุมทุก Status | หน้า List ต้องมีให้ Scroll ดู ไม่ใช่แค่ 1-2 แถว |
| **Tier 2** | Entity ลูกที่โชว์ใน Detail View (pr_line, po_line, gr_line, invoice_line, bid_quotation, bid_evaluation, payment_approval_step, vendor_document, item_price, contract, claim, return_note, stock, payment_proposal, bank_file, workflow_instance, approval_step) | 3-8 แถว เพียงพอให้เห็น Pattern | Detail View ของ 1 ตัวอย่างใช้ Pattern เดียวกันได้กับทุกแถวใน List |
| **Tier 3** | Entity Config/Reference ที่ผู้ใช้ไม่ได้เห็นบ่อย (role, permission, scope_assignment, doa_rule, lane, delegation_rule, asset, budget_reservation, bid_vendor_invite, po_revision_history, credit_debit_note, payment_proposal_line, vendor_contact, vendor_address) | 1-6 แถว ตั้ง Pattern ไว้ | พอให้ระบบทำงานได้ ไม่ต้องเยอะ |

### 1.2 กฎความสมบูรณ์ของข้อมูล (Referential Integrity)

- ทุก `vendor_id`/`item_id`/`cost_center_id` ที่อ้างถึงใน Line/Transaction ต้องมีอยู่จริงใน Master Data Tier 1 ก่อนเสมอ
- ยอดเงินใน Header (`total_amount`) ต้องเท่ากับ Sum ของ Line จริง (ตรวจทุกแถว)
- วันที่ต้องเรียงตามลำดับ Flow จริง: `request_date` (PR) < `order_date` (PO) < `receive_date` (GR) < `invoice_date` < วันที่จ่ายเงิน
- เลขที่เอกสารใช้ Format `[Prefix][ปี ค.ศ. 2 หลัก][เดือน 2 หลัก][ลำดับ]` เช่น `PR2605003` = สร้างเดือน 05/2026 ลำดับที่ 003 — ยกเว้น PO/GR/Invoice/Payment ใช้ Format `[Prefix]-2026-[ลำดับ]` เพื่อให้อ่านง่ายเวลา Demo

### 1.3 ความปลอดภัยของข้อมูล (สำคัญ — อ่านก่อนใช้)

| ประเภทข้อมูล | นโยบาย |
|---|---|
| ชื่อบริษัทลูกค้า (Company) | ใช้ชื่อจริง "SCGJWD" ได้ — เป็น Subject จริงของโปรเจกต์ตามเอกสารต้นทางทุกไฟล์ |
| ชื่อ Vendor | **สมมติทั้งหมด ไม่ใช้ชื่อแบรนด์จริง** (ไม่ใช้ Dell/HP/SB Furniture แม้จะเห็นใน Mockup เดิม) เพื่อไม่ผูกเลขผู้เสียภาษี/บัญชีธนาคารปลอมเข้ากับนิติบุคคลจริง |
| ชื่อพนักงาน (app_user) | **สมมติทั้งหมด ไม่ใช้ชื่อทีมงานโปรเจกต์จริง** ที่ปรากฏใน Project Overview เพื่อไม่ให้ดูเหมือนสร้าง Action/Transaction ปลอมผูกกับบุคคลจริง |
| เลขประจำตัวผู้เสียภาษี/เลขบัญชี | สุ่มให้ดูสมจริง (13 หลักตาม Format จริงของไทย) แต่**ไม่ใช่เลขที่มีอยู่จริง** |

---

## 2. Pilot Scope Setup (Company / BU / Cost Center)

### 2.1 `company`

| company_id | company_name | sap_company_code | tax_id | is_active |
|---|---|---|---|---|
| comp_001 | บริษัท เอสซีจี เจดับเบิ้ลยูดี โลจิสติกส์ จำกัด (มหาชน) | 1000 | 0107555000123 | true |

### 2.2 `business_unit`

| bu_id | company_id | bu_code | bu_name |
|---|---|---|---|
| bu_001 | comp_001 | PROC | ฝ่ายจัดซื้อกลาง |
| bu_002 | comp_001 | IT | ฝ่ายเทคโนโลยีสารสนเทศ |
| bu_003 | comp_001 | WH | คลังสินค้าและปฏิบัติการ |
| bu_004 | comp_001 | FIN | ฝ่ายบัญชีและการเงิน |
| bu_005 | comp_001 | B2C | ฝ่ายขายและบริการลูกค้า B2C |

### 2.3 `cost_center`

| cost_center_id | bu_id | cc_code | cc_name | annual_budget_amount | budget_reserved_amount | budget_used_amount | fiscal_year |
|---|---|---|---|---|---|---|---|
| cc_001 | bu_001 | CC-PROC-01 | งบจัดซื้อกลาง | 2,000,000 | 85,500 | 950,000 | 2026 |
| cc_002 | bu_002 | CC-IT-01 | งบไอที | 1,200,000 | 0 | 1,098,000 | 2026 |
| cc_003 | bu_003 | CC-WH-01 | งบคลังสินค้า | 3,000,000 | 0 | 1,250,000 | 2026 |
| cc_004 | bu_004 | CC-FIN-01 | งบบัญชีการเงิน | 1,500,000 | 0 | 620,000 | 2026 |
| cc_005 | bu_005 | CC-B2C-01 | งบขาย B2C | 2,500,000 | 142,500 | 1,890,000 | 2026 |

> **หมายเหตุ:** `cc_002` (งบไอที) ตั้งใจให้ `budget_used_amount` สูงเกือบเต็มวงเงิน (1,098,000 / 1,200,000) เพื่อให้ Demo Flow "BlockedOverBudget" ใน PR2604008 (ส่วนที่ 5) เกิดขึ้นได้จริงตาม Logic

---

## 3. Master Data Tier 1: Users, Vendors, Categories, Items

### 3.1 `app_user` (Tier 1 — 10 แถว ครอบคลุมทุก Role)

| user_id | username | email | login_type | status | Role (อ้างอิง) | BU |
|---|---|---|---|---|---|---|
| usr_001 | napas.s | napas.s@scgjwd.com | AD | Active | Requester | bu_005 (B2C) |
| usr_002 | teerapat.c | teerapat.c@scgjwd.com | AD | Active | Buyer | bu_001 |
| usr_003 | paweena.r | paweena.r@scgjwd.com | AD | Active | Buyer | bu_001 |
| usr_004 | warakorn.c | warakorn.c@scgjwd.com | AD | Active | Approver (Manager, Level 1) | bu_001 |
| usr_005 | supawadee.i | supawadee.i@scgjwd.com | AD | Active | Approver (Senior Mgr / Bidding Committee, Level 2) | bu_001 |
| usr_006 | kittichai.w | kittichai.w@scgjwd.com | AD | Active | Warehouse Staff | bu_003 |
| usr_007 | orawan.t | orawan.t@scgjwd.com | AD | Active | Accounting (AP) | bu_004 |
| usr_008 | piyada.m | piyada.m@scgjwd.com | AD | Active | Accounting (AP, Lane 2) | bu_004 |
| usr_009 | ekachai.p | ekachai.p@scgjwd.com | AD | Active | Finance / Treasury | bu_004 |
| usr_010 | nantaporn.s | nantaporn.s@scgjwd.com | Local | Active | System Admin | bu_002 |

ชื่อแสดงผล (สำหรับ UI): usr_001=คุณนภัส สุวรรณกิจ, usr_002=คุณธีรพัฒน์ เจริญพงศ์, usr_003=คุณปวีณา รัตนสกุล, usr_004=คุณวรากร ไชยมงคล, usr_005=คุณสุภาวดี อินทรประเสริฐ, usr_006=คุณกิตติชัย วงศ์ไพศาล, usr_007=คุณอรวรรณ ทองสุข, usr_008=คุณปิยะดา มหาวงศ์, usr_009=คุณเอกชัย พิทักษ์กุล, usr_010=คุณนันทพร ศิริวัฒน์

### 3.2 `vendor` (Tier 1 — 13 แถว ครอบคลุมทุก Status ใน Enum)

| vendor_id | tax_id | vendor_name | vendor_type | business_category | status | evaluation_score |
|---|---|---|---|---|---|---|
| ven_001 | 0105561012345 | บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด | ผู้ขาย | อุปกรณ์ไอที | Active | 4.6 |
| ven_002 | 0105562023456 | บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด | ผู้ขาย | อุปกรณ์ไอที/บริการ | Active | 4.3 |
| ven_003 | 0105563034567 | บริษัท ออฟฟิศ เทค จำกัด | ผู้ขาย | เครื่องใช้สำนักงาน | Active | 4.1 |
| ven_004 | 0105564045678 | บริษัท ทวีโชค ออฟฟิศ ซัพพลาย จำกัด | ผู้ขาย | วัสดุสิ้นเปลือง/เซฟตี้ | Active | 4.4 |
| ven_005 | 0105565056789 | บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด | ผู้ขาย | เฟอร์นิเจอร์ | Active | 3.9 |
| ven_006 | 0105566067890 | บริษัท คลีนโปร เซอร์วิส จำกัด | ผู้ให้บริการ | บริการทำความสะอาด | Active | 4.2 |
| ven_007 | 0105567078901 | บริษัท เซฟตี้เกียร์ ไทย จำกัด | ผู้ขาย | อุปกรณ์เซฟตี้ | PendingRegistration | — |
| ven_008 | 0105568089012 | บริษัท ไทยขนส่งอุปกรณ์ จำกัด | ผู้ขาย | อุปกรณ์โลจิสติกส์ | UnderReview | — |
| ven_009 | 0105569090123 | บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด | ผู้ให้บริการ | บำรุงรักษา/วิศวกรรม | Suspended | 3.5 |
| ven_010 | 0105560101234 | บริษัท ไทยเคเทอริ่ง จำกัด | ผู้ให้บริการ | บริการจัดเลี้ยง | Blocked | 2.1 |
| ven_011 | 0105561112345 | บริษัท สมาร์ท ปริ้นติ้ง จำกัด | ผู้ขาย | บริการสิ่งพิมพ์ | Blacklisted | 1.2 |
| ven_012 | 0105562123456 | บริษัท แอดวานซ์ แพ็คเกจจิ้ง จำกัด | ผู้ขาย | บรรจุภัณฑ์ | Rejected | — |
| ven_013 | 0105563134567 | บริษัท เทคโนโลยี เน็กซ์ จำกัด | ผู้ขาย | อุปกรณ์ไอที | Active | 4.5 |

**หมายเหตุสถานะ (สำหรับ B3 Vendor Review):** `ven_007` กำลังรอ Buyer ตรวจสอบเอกสาร, `ven_008` Buyer เห็นแล้วแต่ยังไม่ตัดสิน, `ven_009` ถูก Suspend เพราะเอกสาร ภ.พ.20 หมดอายุไม่อัปเดต, `ven_010` ถูก Block เพราะส่งสินค้าไม่ตรงสัญญา 2 ครั้ง, `ven_011` ถูก Blacklist เพราะผิดสัญญาร้ายแรง (ส่งงานไม่ครบแล้วเงียบหาย), `ven_012` ถูก Reject ตอนลงทะเบียนเพราะเอกสารไม่ครบ (Book Bank ไม่ตรงชื่อบริษัท)

### 3.3 `category`

| category_id | category_name |
|---|---|
| cat_001 | อุปกรณ์คอมพิวเตอร์และไอที |
| cat_002 | เครื่องใช้สำนักงาน |
| cat_003 | เฟอร์นิเจอร์ |
| cat_004 | วัสดุสิ้นเปลืองและอุปกรณ์เซฟตี้ |
| cat_005 | บริการ |

### 3.4 `item` (Tier 1 — 15 แถว)

| item_id | central_item_code | item_name | item_type | category_id | uom | owner_bu_id | status |
|---|---|---|---|---|---|---|---|
| itm_001 | ITM-00001 | โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว | Goods | cat_001 | เครื่อง | bu_002 | Active |
| itm_002 | ITM-00002 | จอคอมพิวเตอร์ 24 นิ้ว | Goods | cat_001 | จอ | bu_002 | Active |
| itm_003 | ITM-00003 | เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน | Goods | cat_001 | เครื่อง | bu_002 | Active |
| itm_004 | ITM-00004 | อุปกรณ์เครือข่าย Switch 24 Port | Goods | cat_001 | เครื่อง | bu_002 | Active |
| itm_005 | ITM-00005 | เครื่องถ่ายเอกสารระบบดิจิทัล | Goods | cat_002 | เครื่อง | bu_001 | Active |
| itm_006 | ITM-00006 | เครื่องสำรองไฟ UPS 1000VA | Goods | cat_002 | เครื่อง | bu_002 | Active |
| itm_007 | ITM-00007 | โทรศัพท์สำนักงานไร้สาย | Goods | cat_002 | เครื่อง | bu_001 | Active |
| itm_008 | ITM-00008 | โต๊ะทำงานเหล็ก | Goods | cat_003 | ตัว | bu_001 | Active |
| itm_009 | ITM-00009 | เก้าอี้สำนักงานเบาะหนัง | Goods | cat_003 | ตัว | bu_001 | Active |
| itm_010 | ITM-00010 | ตู้เก็บเอกสาร 4 ชั้น | Goods | cat_003 | ตู้ | bu_001 | Active |
| itm_011 | ITM-00011 | กระดาษ A4 80 แกรม (ลัง) | Goods | cat_004 | ลัง | bu_001 | Active |
| itm_012 | ITM-00012 | หมวกนิรภัยมาตรฐาน | Goods | cat_004 | ชิ้น | bu_003 | Active |
| itm_013 | ITM-00013 | รองเท้าเซฟตี้หัวเหล็ก | Goods | cat_004 | คู่ | bu_003 | Active |
| itm_014 | ITM-00014 | บริการทำความสะอาดสำนักงานรายเดือน | Service | cat_005 | เดือน | bu_001 | Active |
| itm_015 | ITM-00015 | บริการบำรุงรักษาเครื่องปรับอากาศรายปี | Service | cat_005 | ปี | bu_003 | Active |

---

## 4. Master Data Tier 2-3: Prices, Documents, DOA, Roles

### 4.1 `item_price` (Tier 2 — ครอบคลุม Active/ExpiringSoon/Expired)

| price_id | item_id | vendor_id | price | valid_from | valid_to | status |
|---|---|---|---|---|---|---|
| ip_001 | itm_001 | ven_001 | 28,500 | 2026-01-01 | 2026-12-31 | Active |
| ip_002 | itm_001 | ven_002 | 27,900 | 2026-01-01 | 2026-12-31 | Active |
| ip_003 | itm_001 | ven_013 | 27,500 | 2026-01-01 | 2026-12-31 | Active |
| ip_004 | itm_002 | ven_001 | 4,200 | 2026-01-01 | 2026-12-31 | Active |
| ip_005 | itm_002 | ven_003 | 4,500 | 2026-01-01 | 2026-12-31 | Active |
| ip_006 | itm_003 | ven_003 | 12,900 | 2026-01-01 | 2026-12-31 | Active |
| ip_007 | itm_004 | ven_002 | 8,700 | 2026-01-01 | 2026-12-31 | Active |
| ip_008 | itm_005 | ven_003 | 65,000 | 2026-01-01 | 2026-12-31 | Active |
| ip_009 | itm_006 | ven_001 | 3,200 | 2025-07-01 | 2026-06-30 | **ExpiringSoon** |
| ip_010 | itm_007 | ven_003 | 1,850 | 2026-01-01 | 2026-12-31 | Active |
| ip_011 | itm_008 | ven_005 | 3,500 | 2026-01-01 | 2026-12-31 | Active |
| ip_012 | itm_009 | ven_005 | 4,800 | 2026-01-01 | 2026-12-31 | Active |
| ip_013 | itm_010 | ven_005 | 2,900 | 2025-01-01 | 2025-12-31 | **Expired** |
| ip_014 | itm_011 | ven_004 | 650 | 2026-01-01 | 2026-12-31 | Active |
| ip_015 | itm_012 | ven_004 | 280 | 2026-01-01 | 2026-12-31 | Active |
| ip_016 | itm_013 | ven_004 | 890 | 2026-01-01 | 2026-12-31 | Active |
| ip_017 | itm_014 | ven_006 | 18,000 | 2026-01-01 | 2026-12-31 | Active |
| ip_018 | itm_015 | ven_009 | 28,000 | 2025-01-01 | 2025-12-31 | **Expired** (Vendor ถูก Suspend ไปแล้วด้วย — ใช้ราคานี้ไม่ได้แล้วทั้งสองเหตุผล) |

> **Edge Case ที่ตั้งใจไว้ (`ip_018`):** ราคานี้ทั้ง Expired และผูกกับ Vendor ที่ Suspended — ใช้ Demo จุด Validation ของระบบว่าต้องเตือนผู้ใช้ 2 ชั้น (ราคาหมดอายุ + Vendor มีปัญหา) ก่อนให้เลือกใช้ราคานี้ใน PR ใหม่

### 4.2 `vendor_document` (Tier 2 — ตัวอย่าง 6 แถว ครอบคลุม Valid/ExpiringSoon/Expired)

| document_id | vendor_id | doc_type | issue_date | expire_date | status |
|---|---|---|---|---|---|
| vdoc_001 | ven_001 | หนังสือรับรองบริษัท | 2024-03-01 | 2027-03-01 | Valid |
| vdoc_002 | ven_001 | ภ.พ.20 | 2024-03-01 | 2027-03-01 | Valid |
| vdoc_003 | ven_005 | ภ.พ.20 | 2023-07-15 | 2026-07-15 | **ExpiringSoon** (เหลือ ~27 วันจากวันอ้างอิง) |
| vdoc_004 | ven_009 | ภ.พ.20 | 2023-01-10 | 2026-01-10 | **Expired** (สาเหตุที่ถูก Suspend) |
| vdoc_005 | ven_006 | หนังสือรับรองบริษัท | 2024-09-01 | 2027-09-01 | Valid |
| vdoc_006 | ven_007 | หนังสือรับรองบริษัท | 2026-06-10 | 2029-06-10 | Valid (เพิ่งแนบใหม่ รอ Buyer ตรวจ) |

### 4.3 `vendor_bank_account` (Tier 3 — 5 แถว)

| bank_account_id | vendor_id | bank_name | account_no | account_name | is_primary |
|---|---|---|---|---|---|
| vba_001 | ven_001 | ธนาคารกรุงไทย | 123-4-56789-0 | บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด | true |
| vba_002 | ven_002 | ธนาคารไทยพาณิชย์ | 234-5-67890-1 | บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด | true |
| vba_003 | ven_004 | ธนาคารกสิกรไทย | 345-6-78901-2 | บริษัท ทวีโชค ออฟฟิศ ซัพพลาย จำกัด | true |
| vba_004 | ven_005 | ธนาคารกรุงเทพ | 456-7-89012-3 | บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด | true |
| vba_005 | ven_013 | ธนาคารกรุงไทย | 999-9-XXXXX-9 | บริษัท เทคโนโลยี เน็กซ์ จำกัด — **เลขบัญชีผิด Format โดยตั้งใจ** | true |

> **Edge Case ที่ตั้งใจไว้ (`vba_005`):** ใช้ Demo สถานการณ์ Payment ล้มเหลว (`PAY-2026-0009` ในส่วนที่ 10) เพราะข้อมูลบัญชีธนาคารผิด

### 4.4 `doa_rule` (Tier 3 — 6 แถว)

| doa_rule_id | document_type | amount_min | amount_max | approval_level_no | approver Role | is_parallel |
|---|---|---|---|---|---|---|
| doa_001 | PR | 0 | 50,000 | 1 | Manager (usr_004) | false |
| doa_002 | PR | 50,001 | 999,999,999 | 1-2 | Manager → Senior Manager (usr_004 → usr_005) | false |
| doa_003 | PO | 0 | 100,000 | 1 | Manager (usr_004) | false |
| doa_004 | PO | 100,001 | 999,999,999 | 1-2 | Manager → Senior Manager | false |
| doa_005 | PaymentRequest | 0 | 100,000 | 1 | Accounting Lead (usr_008) | false |
| doa_006 | PaymentRequest | 100,001 | 999,999,999 | 1-2 | Accounting Lead → Finance (usr_008 → usr_009) | false |

### 4.5 `role`, `lane` (Tier 3)

| role_id | role_name |
|---|---|
| role_001 | Requester |
| role_002 | Buyer |
| role_003 | Approver |
| role_004 | Warehouse |
| role_005 | Accounting |
| role_006 | Finance |
| role_007 | Admin |

| lane_id | lane_name | owner_user_id |
|---|---|---|
| lane_001 | Lane ทั่วไป (PO/Domestic) | usr_007 |
| lane_002 | Lane บริการ/Non-PO | usr_008 |

### 4.6 `asset` (Tier 3 — 3 แถว)

| asset_id | asset_tag | asset_name | asset_type | unit_price | total_qty | distributed_qty | remaining_qty | owner_bu_id | acquisition_date | license_key | expiry_date | status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| ast_001 | AST-2026-0001 | โน้ตบุ๊ค Lenovo ThinkPad L14 Gen 4 | Goods | 35,000 | 100 | 90 | 10 | bu_002 | 30 วันก่อน | - | - | Distributed |
| ast_002 | AST-2026-0002 | Microsoft 365 Business Standard (Cloud License) | License | 450 | 150 | 0 | 150 | bu_002 | 15 วันก่อน | M365-STD-150SEATS-JWD2026 | อีก 350 วัน | In Stock |
| ast_003 | AST-2026-0003 | บริการระบบคลาวด์ AWS Enterprise Cloud Infrastructure | Service | 120,000 | 1 | 0 | 1 | bu_002 | 45 วันก่อน | - | อีก 320 วัน | In Stock |

### 4.7 `asset_allocation` (Tier 3 — 4 แถว)

| allocation_id | asset_id | to_bu_id | allocated_qty | allocation_type | rental_rate | start_date | end_date | status |
|---|---|---|---|---|---|---|---|---|
| alloc_001 | ast_001 | bu_001 | 20 | Rental | 500 | 30 วันก่อน | อีก 335 วัน | Active |
| alloc_002 | ast_001 | bu_003 | 20 | Rental | 500 | 30 วันก่อน | อีก 335 วัน | Active |
| alloc_003 | ast_001 | bu_005 | 20 | Rental | 500 | 30 วันก่อน | อีก 335 วัน | Active |
| alloc_004 | ast_001 | bu_004 | 30 | Rental | 500 | 30 วันก่อน | อีก 335 วัน | Active |

---

## 5. Procurement: Purchase Requisitions

### 5.1 `purchase_requisition` (Tier 1 — 10 แถว ครอบคลุมทุก Status)

| pr_id | pr_no | requester_id | cost_center_id | request_date | need_date | is_urgent | total_amount | status |
|---|---|---|---|---|---|---|---|---|
| preq_001 | PR2602001 | usr_001 | cc_005 | 2026-02-03 | 2026-02-20 | false | 85,500 | Draft |
| preq_002 | PR2603012 | usr_001 | cc_005 | 2026-03-12 | 2026-03-30 | false | 24,000 | PendingApproval |
| preq_003 | PR2603015 | usr_006 | cc_003 | 2026-03-15 | 2026-03-28 | true | 23,400 | Approved |
| preq_004 | PR2604002 | usr_001 | cc_001 | 2026-04-02 | 2026-04-20 | false | 65,000 | Rejected |
| preq_005 | PR2604008 | usr_002 | cc_002 | 2026-04-08 | 2026-04-25 | false | 126,000 | BlockedOverBudget |
| preq_006 | PR2605003 | usr_001 | cc_005 | 2026-05-03 | 2026-06-15 | false | 272,000 | ConvertedToPO ⭐ |
| preq_007 | PR2605010 | usr_002 | cc_001 | 2026-05-10 | 2026-05-25 | false | 18,000 | ConvertedToPO |
| preq_008 | PR2605014 | usr_001 | cc_005 | 2026-05-14 | 2026-06-01 | false | 18,500 | Cancelled |
| preq_009 | PR2606001 | usr_002 | cc_002 | 2026-06-10 | 2026-06-30 | false | 17,400 | PendingApproval |
| preq_010 | PR2606008 | usr_001 | cc_005 | 2026-06-17 | 2026-07-05 | false | 4,500 | Draft |

⭐ = ส่วนของ Golden Thread (ดูส่วนที่ 13)

### 5.2 `pr_line` (Tier 2 — ตัวอย่างของ PR สำคัญ)

| pr_line_id | pr_id | item_id | qty | unit_price | line_total |
|---|---|---|---|---|---|
| prl_001 | preq_001 | itm_001 | 3 | 28,500 | 85,500 |
| prl_002 | preq_002 | itm_009 | 5 | 4,800 | 24,000 |
| prl_003 | preq_003 | itm_012 | 20 | 280 | 5,600 |
| prl_004 | preq_003 | itm_013 | 20 | 890 | 17,800 |
| prl_005 | preq_004 | itm_005 | 1 | 65,000 | 65,000 |
| prl_006 | preq_005 | itm_002 | 30 | 4,200 | 126,000 |
| prl_007 | preq_006 | itm_001 | 10 | 27,200 | 272,000 |
| prl_008 | preq_007 | itm_014 | 1 | 18,000 | 18,000 |
| prl_009 | preq_008 | itm_007 | 10 | 1,850 | 18,500 |
| prl_010 | preq_009 | itm_004 | 2 | 8,700 | 17,400 |
| prl_011 | preq_010 | itm_002 | 1 | 4,500 | 4,500 |

> หมายเหตุ `prl_007`: ราคา 27,200/หน่วย คือราคาที่ได้จากผล Bidding (BID-2026-002) ไม่ใช่ราคา List ปกติของ `item_price` — สะท้อนว่า PR อัปเดตราคาจริงหลัง Bidding จบ

### 5.3 `budget_reservation` (Tier 3 — ตัวอย่าง)

| reservation_id | cost_center_id | source_doc_type | source_doc_id | reserved_amount | status |
|---|---|---|---|---|---|
| res_001 | cc_005 | PR | preq_002 | 24,000 | Reserved |
| res_002 | cc_003 | PR | preq_003 | 23,400 | Consumed (แปลงเป็น PO แล้ว) |
| res_003 | cc_005 | PR | preq_006 | 272,000 | Consumed |

---

## 6. Sourcing & Bidding

### 6.1 `bidding` (Tier 1 — 6 แถว)

| bidding_id | bid_no | bid_name | item_id | close_date | status |
|---|---|---|---|---|---|
| bid_001 | BID-2026-001 | ประมูลเครื่องถ่ายเอกสารระบบดิจิทัล | itm_005 | 2026-03-20 | NoAward |
| bid_002 | BID-2026-002 | ประมูลโน้ตบุ๊คทีมขาย B2C 10 เครื่อง | itm_001 | 2026-05-15 | Awarded ⭐ |
| bid_003 | BID-2026-003 | ประมูลเฟอร์นิเจอร์สำนักงานใหม่ (ชุดใหญ่) | itm_008 | 2026-06-25 | UnderEvaluation |
| bid_004 | BID-2026-004 | ประมูลบริการรักษาความปลอดภัยประจำปี | itm_014 | 2026-07-05 | OpenForQuotation |
| bid_005 | BID-2026-005 | ประมูลอุปกรณ์ Network ทั้งองค์กร | itm_004 | 2026-07-20 | PendingCommitteeApproval |
| bid_006 | BID-2026-006 | ประมูลวัสดุปรับปรุงคลังสินค้า | itm_011 | 2026-08-01 | Draft |

### 6.2 `bid_quotation` (Tier 2 — สำหรับ bid_001 และ bid_002)

| quotation_id | bidding_id | vendor_id | total_price | delivery_days | discount_percent | status |
|---|---|---|---|---|---|---|
| bq_001 | bid_001 | ven_003 | 68,000 | 20 | 0 | NotSelected (เกินงบที่ตั้งไว้) |
| bq_002 | bid_002 | ven_001 | 285,000 | 14 | 3 | NotSelected |
| bq_003 | bid_002 | ven_002 | 272,000 | 10 | 5 | **Selected** ⭐ |
| bq_004 | bid_002 | ven_013 | 279,500 | 12 | 4 | NotSelected |

### 6.3 `bid_evaluation` (Tier 2 — สำหรับ bid_002, เกณฑ์ ราคา 40% / ส่งมอบ 20% / คุณภาพ 40%)

| evaluation_id | bidding_id | vendor_id | price_score | delivery_score | quality_rating_score | total_score | rank | is_selected |
|---|---|---|---|---|---|---|---|---|
| bev_001 | bid_002 | ven_002 | 40 | 20 | 32 | 92 | 1 | true ⭐ |
| bev_002 | bid_002 | ven_013 | 36 | 16 | 36 | 88 | 2 | false |
| bev_003 | bid_002 | ven_001 | 32 | 12 | 40 | 84 | 3 | false |

> **Insight ของชุดข้อมูลนี้:** `ven_001` มีคะแนนคุณภาพสูงสุด (Rating ในอดีตดีที่สุด) แต่แพ้เพราะราคาสูงกว่าและส่งมอบช้ากว่า — เป็นตัวอย่างที่ดีสำหรับ Demo ว่า Weighted Scoring ไม่ได้เลือกแค่ราคาถูกสุดเสมอไป

### 6.4 `bid_vendor_invite` (Tier 3 — สำหรับ bid_002)

| invite_id | bidding_id | vendor_id | response_status |
|---|---|---|---|
| bvi_001 | bid_002 | ven_001 | Submitted |
| bvi_002 | bid_002 | ven_002 | Submitted |
| bvi_003 | bid_002 | ven_013 | Submitted |

### 6.5 `contract` (Tier 3 — 2 แถว)

| contract_id | vendor_id | contract_no | total_value | remaining_value | expire_date | status |
|---|---|---|---|---|---|---|
| ctr_001 | ven_006 | CTR-2026-001 | 216,000 | 162,000 | 2026-12-31 | Active (สัญญาบริการทำความสะอาดรายปี แบ่งจ่ายรายเดือน) |
| ctr_002 | ven_009 | CTR-2025-008 | 28,000 | 0 | 2026-01-10 | Expired |

---

## 7. Purchase Orders

### 7.1 `purchase_order` (Tier 1 — 11 แถว ครอบคลุมทุก Status)

| po_id | po_no | pr_id | bidding_id | vendor_id | order_date | total_amount | status |
|---|---|---|---|---|---|---|---|
| po_001 | PO-2026-001 | preq_003 | — | ven_004 | 2026-03-18 | 23,400 | FullyReceived |
| po_002 | PO-2026-002 | preq_007 | — | ven_006 | 2026-05-12 | 18,000 | SentToVendor (บริการรายเดือนต่อเนื่อง) |
| po_003 | PO-2026-003 | preq_006 | bid_002 | ven_002 | 2026-05-16 | 272,000 | FullyReceived ⭐ |
| po_004 | PO-2026-004 | — | — | ven_001 | 2026-06-05 | 48,000 | PendingApproval |
| po_005 | PO-2026-005 | — | — | ven_003 | 2026-04-22 | 65,000 | Rejected |
| po_006 | PO-2026-006 | — | — | ven_004 | 2026-06-16 | 32,500 | AutoGenerated |
| po_007 | PO-2026-007 | — | — | ven_005 | 2026-05-28 | 70,000 | PartiallyReceived |
| po_008 | PO-2026-008 | — | — | ven_001 | 2026-06-02 | 42,000 | RevisionRequested |
| po_009 | PO-2026-009 | — | ctr_002 | ven_009 | 2025-02-01 | 28,000 | Closed |
| po_010 | PO-2026-010 | preq_008 | — | ven_003 | 2026-05-15 | 18,500 | Cancelled |
| po_011 | PO-2026-011 | — | — | ven_004 | 2026-06-12 | 11,200 | VendorConfirmed |

### 7.2 `po_line` (Tier 2 — ตัวอย่างของ PO สำคัญ)

| po_line_id | po_id | item_id | qty | unit_price | line_total | received_qty |
|---|---|---|---|---|---|---|
| pol_001 | po_001 | itm_012 | 20 | 280 | 5,600 | 20 |
| pol_002 | po_001 | itm_013 | 20 | 890 | 17,800 | 20 |
| pol_003 | po_003 | itm_001 | 10 | 27,200 | 272,000 | 10 |
| pol_004 | po_007 | itm_008 | 20 | 3,500 | 70,000 | 15 |
| pol_005 | po_006 | itm_011 | 50 | 650 | 32,500 | 0 |
| pol_006 | po_011 | itm_012 | 40 | 280 | 11,200 | 0 |

### 7.3 `po_revision_history` (Tier 3 — สำหรับ po_008)

| revision_id | po_id | revision_no | reason | approval_status |
|---|---|---|---|---|
| rev_001 | po_008 | 1 | Vendor แจ้งเปลี่ยนรุ่นจอคอมพิวเตอร์ (รุ่นเดิมเลิกผลิต) ราคาเท่าเดิม | PendingApproval |

---

## 8. Goods Receipt, Claim & Stock

### 8.1 `goods_receipt` (Tier 1 — 7 แถว ครอบคลุมทุก Status)

| gr_id | gr_no | po_id | receive_date | quality_score | status |
|---|---|---|---|---|---|
| gr_001 | GR-2026-0001 | po_001 | 2026-03-25 | 4.5 | Scored |
| gr_002 | GR-2026-0002 | po_007 | 2026-06-10 | 4.0 | PartialReceipt (15/20 ตัว) |
| gr_003 | GR-2026-0003 | po_009 | 2025-12-15 | 4.0 | ServiceAccepted |
| gr_004 | GR-2026-0004 | po_012 (ดูหมายเหตุ) | 2026-06-08 | 2.0 | ClaimRaised |
| gr_005 | GR-2026-0005 | po_003 | 2026-06-05 | 4.3 | Scored ⭐ |
| gr_006 | GR-2026-0006 | po_011 | — | — | PendingReceipt (ยังไม่รับ รอ Vendor ส่งตามวันที่ยืนยัน) |
| gr_007 | GR-2026-0007 | po_001 | 2026-03-25 | — | Closed |

> **หมายเหตุ `gr_004` / `po_012`:** เพื่อ Demo Flow Claim & Return (E2) โดยเฉพาะ ให้สมมติมี PO เพิ่มเติมนอก List หลักในส่วนที่ 7 คือ `PO-2026-012` (กระดาษ A4 30 ลัง, Vendor ven_004, 19,500 บาท, status=FullyReceived) ที่ตรวจพบว่ากระดาษเปียกเสียหายระหว่างขนส่ง 5 ลัง

### 8.2 `gr_line` (Tier 2)

| gr_line_id | gr_id | item_id | qty_ordered | qty_received | variance_qty |
|---|---|---|---|---|---|
| grl_001 | gr_001 | itm_012 | 20 | 20 | 0 |
| grl_002 | gr_002 | itm_008 | 20 | 15 | -5 |
| grl_003 | gr_004 | itm_011 | 30 | 30 | 0 (รับครบจำนวนแต่สภาพเสียหาย 5 ลัง) |
| grl_004 | gr_005 | itm_001 | 10 | 10 | 0 |

### 8.3 `claim` และ `return_note` (Tier 3)

| claim_id | gr_id | claim_type | description | status |
|---|---|---|---|---|
| clm_001 | gr_004 | Claim | กระดาษ A4 เปียกเสียหายระหว่างขนส่ง 5 ลังจาก 30 ลัง | Closed |

| return_id | claim_id | return_qty | return_reason | status |
|---|---|---|---|---|
| ret_001 | clm_001 | 5 | สินค้าเสียหายระหว่างขนส่ง — Vendor ออก Credit Note แทนการส่งของใหม่ | Completed |

### 8.4 `stock` (Tier 2 — 8 แถว)

| stock_id | item_id | qty_onhand | last_sync_at |
|---|---|---|---|
| stk_001 | itm_001 | 12 | 2026-06-18 06:00 |
| stk_002 | itm_002 | 45 | 2026-06-18 06:00 |
| stk_003 | itm_006 | 8 | 2026-06-18 06:00 |
| stk_004 | itm_008 | 15 | 2026-06-18 06:00 |
| stk_005 | itm_009 | 30 | 2026-06-18 06:00 |
| stk_006 | itm_011 | 120 | 2026-06-18 06:00 |
| stk_007 | itm_012 | 65 | 2026-06-18 06:00 |
| stk_008 | itm_013 | 22 | **2026-06-15 06:00 (ค้าง 3 วัน — Sync มีปัญหา ใช้ Demo คู่กับ H4)** |

---

## 9. Invoice & Credit/Debit Note

### 9.1 `invoice` (Tier 1 — 9 แถว ครอบคลุมทุก Status)

| invoice_id | invoice_no | vendor_id | po_id | invoice_date | total_amount | status |
|---|---|---|---|---|---|---|
| inv_001 | INV-2026-0001 | ven_004 | po_001 | 2026-03-26 | 25,037 | LinkedToPaymentRequest |
| inv_002 | INV-2026-0002 | ven_009 | po_009 | 2025-12-20 | 29,960 | LinkedToPaymentRequest |
| inv_003 | INV-2026-0003 | ven_004 | — | 2026-06-17 | 4,200 | Created (Non-PO เพิ่งส่งวันนี้) |
| inv_004 | INV-2026-0004 | ven_005 | po_007 | 2026-06-11 | 70,000 | **MismatchException** (เรียกเก็บ 20 ตัวแต่รับจริง 15 ตัว) |
| inv_005 | INV-2026-0005 | ven_003 | po_005 | 2026-06-01 | 65,000 | **DuplicateRejected** (ส่งเลขที่ Invoice ซ้ำกับที่เคยส่งมาแล้ว) |
| inv_006 | INV-2026-0006 | ven_006 | po_002 | 2026-06-12 | 19,260 | Matching |
| inv_007 | INV-2026-0007 | ven_002 | po_003 | 2026-06-06 | 291,040 | Matched ⭐ |
| inv_008 | INV-2026-0008 | ven_004 | po_012 | 2026-06-09 | 20,865 | ReadyForPayment (หลังหัก Credit Note ของลังที่เสียหาย) |
| inv_009 | INV-2026-0009 | ven_004 | po_006 | 2026-06-16 | 34,775 | GLAllocated |

### 9.2 `invoice_line` (Tier 2 — ตัวอย่าง)

| invoice_line_id | invoice_id | item_id | qty | unit_price | line_total |
|---|---|---|---|---|---|
| invl_001 | inv_007 | itm_001 | 10 | 27,200 | 272,000 |
| invl_002 | inv_004 | itm_008 | 20 | 3,500 | 70,000 |
| invl_003 | inv_008 | itm_011 | 30 | 650 | 19,500 |

### 9.3 `credit_debit_note` (Tier 3 — 1 แถว)

| cn_dn_id | invoice_id | type | amount | reason | status |
|---|---|---|---|---|---|
| cn_001 | inv_008 | Credit | 3,250 | กระดาษ A4 เสียหายระหว่างขนส่ง คืน 5 ลัง (อ้างอิง `ret_001`) | Approved |

---

## 10. Payment Request & Payment Proposal

### 10.1 `payment_request` (Tier 1 — 10 แถว ครอบคลุมสถานะหลัก)

| payment_request_id | pr_pay_no | invoice_id | vendor_id | amount | status |
|---|---|---|---|---|---|
| pay_001 | PAY-2026-0001 | inv_001 | ven_004 | 25,037 | Paid |
| pay_002 | PAY-2026-0002 | inv_002 | ven_009 | 29,960 | Paid |
| pay_003 | PAY-2026-0003 | inv_003 | ven_004 | 4,200 | Created |
| pay_004 | PAY-2026-0004 | inv_006 | ven_006 | 19,260 | PendingApproval |
| pay_005 | PAY-2026-0005 | — | ven_001 | 48,000 | BlockedOverBudget (ผูกกับ po_004 ที่รออนุมัติ, cc_002 งบไอทีใกล้เต็ม) |
| pay_006 | PAY-2026-0006 | inv_007 | ven_002 | 291,040 | Paid ⭐ |
| pay_007 | PAY-2026-0007 | inv_008 | ven_004 | 20,865 | OnHold (รอผลเคลียร์ Credit Note ก่อนจ่าย) |
| pay_008 | PAY-2026-0008 | inv_009 | ven_004 | 34,775 | BankFileGenerated |
| pay_009 | PAY-2026-0009 | — | ven_013 | 27,500 | Failed (เลขบัญชีธนาคารผิด — อ้างอิง `vba_005`) |
| pay_010 | PAY-2026-0010 | — | ven_003 | 12,900 | Rejected (Finance ปฏิเสธเพราะเอกสารอนุมัติ PO ไม่ครบ) |

### 10.2 `payment_approval_step` (Tier 2 — ตัวอย่างสาย SoD สำหรับ pay_004 และ pay_006)

| step_id | payment_request_id | step_role | approver_id | action |
|---|---|---|---|---|
| pstep_001 | pay_004 | Maker | usr_007 | Approved |
| pstep_002 | pay_004 | Verify | usr_008 | Pending |
| pstep_003 | pay_006 | Maker | usr_007 | Approved |
| pstep_004 | pay_006 | Verify | usr_008 | Approved |
| pstep_005 | pay_006 | ApproveVerify | usr_008 | Approved |
| pstep_006 | pay_006 | Confirm | usr_009 | Approved |
| pstep_007 | pay_006 | FinanceVerify | usr_009 | Approved |

### 10.3 `payment_proposal` และ `bank_file` (Tier 2-3)

| proposal_id | proposal_date | due_date | total_amount | status |
|---|---|---|---|---|
| prop_001 | 2026-03-30 | 2026-04-05 | 25,037 | BankFileGenerated |
| prop_002 | 2026-06-15 | 2026-06-20 | 291,040 | BankFileGenerated ⭐ |
| prop_003 | 2026-06-17 | 2026-06-22 | 34,775 | Draft |

| bank_file_id | proposal_id | bank_response_status | bank_reference_no |
|---|---|---|---|
| bank_001 | prop_001 | Success | KTB20260405-0012 |
| bank_002 | prop_002 | Success | KTB20260620-0034 ⭐ |

| payment_proposal_line_id | proposal_id | payment_request_id |
|---|---|---|
| ppl_001 | prop_001 | pay_001 |
| ppl_002 | prop_002 | pay_006 |
| ppl_003 | prop_003 | pay_008 |

---

## 11. Workflow, Approval Steps & Notification

### 11.1 `workflow_instance` + `approval_step` (Tier 2 — ตัวอย่างสำหรับ Golden Thread)

| workflow_id | doc_type | doc_id | status |
|---|---|---|---|
| wf_001 | PR | preq_006 | Approved |
| wf_002 | Bidding | bid_002 | Approved (Award) |
| wf_003 | PO | po_003 | Approved |
| wf_004 | PaymentRequest | pay_006 | Approved |
| wf_005 | PR | preq_009 | InProgress (รออนุมัติอยู่วันนี้) |
| wf_006 | PO | po_004 | InProgress |

| step_id | workflow_id | step_no | approver_id | action |
|---|---|---|---|---|
| step_001 | wf_001 | 1 | usr_004 | Approved |
| step_002 | wf_002 | 1 | usr_005 | Approved (Committee Award) |
| step_003 | wf_003 | 1 | usr_004 | Approved |
| step_004 | wf_005 | 1 | usr_004 | Pending |

### 11.2 `notification` (Tier 1 — 10 แถว)

| notification_id | recipient_user_id | channel | trigger_event | read_flag |
|---|---|---|---|---|
| notif_001 | usr_004 | InApp | PR_PENDING_APPROVAL (PR2606001) | false |
| notif_002 | usr_002 | Email | VENDOR_NEW_REGISTRATION (ven_007) | false |
| notif_003 | usr_005 | InApp | BIDDING_PENDING_COMMITTEE (BID-2026-005) | false |
| notif_004 | usr_001 | InApp | PR_REJECTED (PR2604002) | true |
| notif_005 | usr_002 | Email | VENDOR_DOC_EXPIRING (ven_005) | false |
| notif_006 | usr_002 | InApp | PO_REVISION_REQUESTED (PO-2026-008) | false |
| notif_007 | usr_007 | InApp | INVOICE_MISMATCH (INV-2026-0004) | false |
| notif_008 | usr_009 | InApp | PAYMENT_FAILED (PAY-2026-0009) | false |
| notif_009 | usr_001 | InApp | PO_VENDOR_CONFIRMED (PO-2026-011) | true |
| notif_010 | usr_010 | InApp | SAP_SYNC_FAILED (item itm_013 Stock) | false |

---

## 12. Audit Log & Integration Log

### 12.1 `audit_log` (Tier 1 — 10 แถว)

| audit_id | user_id | action | entity_type | entity_id | timestamp |
|---|---|---|---|---|---|
| aud_001 | usr_002 | Create | purchase_requisition | preq_006 | 2026-05-03 09:15 |
| aud_002 | usr_005 | Approve | bidding | bid_002 | 2026-05-15 14:20 |
| aud_003 | usr_004 | Approve | purchase_order | po_003 | 2026-05-16 10:05 |
| aud_004 | usr_006 | Create | goods_receipt | gr_005 | 2026-06-05 11:30 |
| aud_005 | usr_007 | Create | invoice | inv_007 | 2026-06-06 09:00 |
| aud_006 | usr_009 | Approve | payment_request | pay_006 | 2026-06-15 16:45 |
| aud_007 | usr_004 | Reject | purchase_requisition | preq_004 | 2026-04-03 13:10 |
| aud_008 | usr_002 | Edit | vendor | ven_009 | 2026-01-10 08:30 |
| aud_009 | usr_010 | Login | app_user | usr_010 | 2026-06-18 07:55 |
| aud_010 | usr_008 | Reject | payment_request | pay_010 | 2026-06-14 15:20 |

### 12.2 `integration_log` (Tier 1 — 8 แถว ครอบคลุม Success/Failed/Retrying — สำหรับ H4 Demo)

| log_id | target_system | doc_type | doc_id | status | retry_count |
|---|---|---|---|---|---|
| ilog_001 | SAP_B1 | purchase_order | po_003 | Success | 0 |
| ilog_002 | SAP_B1 | invoice | inv_007 | Success | 0 |
| ilog_003 | SAP_B1 | goods_receipt | gr_002 | **Failed** | 2 |
| ilog_004 | Bank | payment_proposal | prop_002 | Success | 0 |
| ilog_005 | Bank | payment_request | pay_009 | **Failed** | 1 |
| ilog_006 | SAP_B1 | vendor | ven_001 | Success | 0 |
| ilog_007 | SAP_B1 | item | itm_013 | **Retrying** | 1 |
| ilog_008 | RD (กรมสรรพากร) | vendor | ven_007 | Success | 0 |

---

## 13. ⭐ Golden Thread — เรื่องราวเดียวที่ลากยาวทั้งระบบ

ใช้เรื่องนี้เล่า Demo แบบ End-to-End เดียวจบ ครบทุก Module หลัก (MDM → PR → Bidding → PO → GR → Invoice → Payment) — ทุก ID ในตารางด้านบนที่มีเครื่องหมาย ⭐ คือส่วนหนึ่งของเรื่องนี้

### 13.1 เรื่องราว (สำหรับพูด Demo)

> **คุณนภัส (Requester, ฝ่ายขาย B2C)** ต้องการโน้ตบุ๊คใหม่ 10 เครื่องให้ทีมขาย จึงสร้าง **PR2605003** วันที่ 3 พ.ค. 2569 ขอซื้อ "โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว" จำนวน 10 เครื่อง
>
> เนื่องจากมูลค่าสูง **คุณวรากร (Approver)** อนุมัติ PR แล้วส่งให้ฝ่ายจัดซื้อเปิดประมูลแทนการซื้อตรง → **คุณธีรพัฒน์ (Buyer)** เปิด **BID-2026-002** เชิญ 3 Vendor (ดิจิทัล โซลูชั่น, อินโนเวทีฟ ไอที, เทคโนโลยี เน็กซ์) → **คุณสุภาวดี (คณะกรรมการ)** Approve ให้เปิดรับราคา → ทั้ง 3 Vendor เสนอราคาผ่าน Vendor Portal
>
> ผลประเมินแบบถ่วงน้ำหนัก (ราคา 40% / ส่งมอบ 20% / คุณภาพ 40%) ทำให้ **บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด (ven_002)** ชนะที่ 272,000 บาท (คะแนนรวม 92/100) แม้ราคาไม่ถูกที่สุดในแง่หน่วยเดียว แต่ส่งมอบเร็วกว่าและคุณภาพดี
>
> ระบบสร้าง **PO-2026-003** อัตโนมัติ → คุณวรากร Approve → ส่งให้ Vendor ผ่าน Portal → Vendor ยืนยันรับและกำหนดส่งมอบ → **คุณกิตติชัย (Warehouse)** บันทึกรับสินค้าครบ 10 เครื่อง (**GR-2026-0005**) ให้คะแนน 4.3/5
>
> Vendor ส่ง Invoice **INV-2026-0007** จำนวน 291,040 บาท (272,000 + VAT 7%) → ระบบจับคู่ 3-Way Matching ผ่าน (Matched) → **คุณอรวรรณ (Accounting)** สร้าง Payment Request **PAY-2026-0006** → ผ่านสาย Segregation of Duties ครบ 5 ขั้น (Maker → Verify → ApproveVerify → Confirm → FinanceVerify) → รวมเข้า Payment Proposal **PROP-2026-002** → สร้าง Bank File → โอนสำเร็จ → **Paid** ปิดวงจรสมบูรณ์

### 13.2 JSON Snippet (แสดงความสัมพันธ์ของ ID ทั้งหมดในเรื่องนี้)

```json
{
  "golden_thread": "PR2605003 → BID-2026-002 → PO-2026-003 → GR-2026-0005 → INV-2026-0007 → PAY-2026-0006",
  "purchase_requisition": {
    "pr_id": "preq_006", "pr_no": "PR2605003",
    "requester_id": "usr_001", "status": "ConvertedToPO",
    "total_amount": 272000
  },
  "bidding": {
    "bidding_id": "bid_002", "bid_no": "BID-2026-002",
    "status": "Awarded",
    "winner_vendor_id": "ven_002", "winning_score": 92
  },
  "purchase_order": {
    "po_id": "po_003", "po_no": "PO-2026-003",
    "pr_id": "preq_006", "bidding_id": "bid_002",
    "vendor_id": "ven_002", "total_amount": 272000,
    "status": "FullyReceived"
  },
  "goods_receipt": {
    "gr_id": "gr_005", "gr_no": "GR-2026-0005",
    "po_id": "po_003", "quality_score": 4.3, "status": "Scored"
  },
  "invoice": {
    "invoice_id": "inv_007", "invoice_no": "INV-2026-0007",
    "po_id": "po_003", "vendor_id": "ven_002",
    "total_amount": 291040, "status": "Matched"
  },
  "payment_request": {
    "payment_request_id": "pay_006", "pr_pay_no": "PAY-2026-0006",
    "invoice_id": "inv_007", "amount": 291040, "status": "Paid"
  },
  "payment_proposal": {
    "proposal_id": "prop_002", "total_amount": 291040,
    "bank_reference_no": "KTB20260620-0034"
  }
}
```

---

## 14. Status Coverage Checklist

ตรวจกับ Enum Reference ของ `Design_System.md` ส่วนที่ 5 — ยืนยันว่า Seed Data นี้มีตัวอย่างครบทุก Badge สี

| Entity.status | ครอบคลุมใน Seed แล้ว | หมายเหตุ |
|---|---|---|
| `vendor.status` | ✅ ครบ 7/7 | ven_001-013 |
| `purchase_requisition.status` | ✅ ครบ 7/7 | preq_001-010 |
| `bidding.status` | ✅ 6/8 (ขาด OpenForQuotation บางตัว, Rejected) | bid_001-006 — Rejected เป็น State ที่เกิดยากในทางปฏิบัติ (คณะกรรมการมักให้แก้ไขมากกว่าปฏิเสธทันที) จึงไม่ Seed แยก |
| `bid_quotation.status` | ✅ 2/4 (Submitted, Selected, NotSelected) | ขาด Superseded — เกิดเฉพาะกรณี Vendor แก้ราคาใหม่ ซึ่งยังไม่มีใน Seed รอบนี้ |
| `purchase_order.status` | ✅ ครบ 11/11 | po_001-011 |
| `goods_receipt.status` | ✅ 6/7 (ขาด ClaimRaised→Closed แยก) | gr_001-007 ครอบคลุมเกือบครบ |
| `invoice.status` | ✅ ครบ 9/9 | inv_001-009 |
| `payment_request.status` | ⚠️ 8/13 — **ตามที่ตั้งใจ** | 5 สถานะที่ขาด (BudgetChecked, Verified, ApprovedToConfirm, Confirmed, InPaymentProposal) เป็น **Transient State** ที่ระบบเปลี่ยนผ่านเร็วในเสี้ยววินาที ไม่ใช่จุดที่เอกสารพักค้างจริง — Snapshot ข้อมูล ณ เวลาหนึ่งจึงไม่ควรเจอ State เหล่านี้บ่อย ถือว่าตรงกับพฤติกรรมจริงของระบบ ไม่ใช่ Gap |
| `app_user.status` | ✅ Active ครบ (Locked/Inactive ยังไม่มีตัวอย่าง) | เพิ่มได้ถ้าต้องการ Demo H1 |
| `integration_log.status` | ✅ ครบ 3/3 | ilog_001-008 |

---

## 15. Screen ↔ Seed Data Quick Reference

| Screen ID (จาก PR_Screen_Inventory.md) | ใช้ Seed Section ไหน |
|---|---|
| B1, B3 (Vendor List/Review) | ส่วนที่ 3.2 (`vendor`) |
| C1, C2 (Catalog) | ส่วนที่ 3.4 + 4.1 (`item`, `item_price`) |
| D1, D2 (PR) | ส่วนที่ 5 (`purchase_requisition`, `pr_line`) |
| D3, D4 (Bidding) | ส่วนที่ 6 (`bidding`, `bid_quotation`, `bid_evaluation`) |
| D5 (PO) | ส่วนที่ 7 (`purchase_order`, `po_line`) |
| E1, E2 (GR/Claim) | ส่วนที่ 8 |
| F1, F2 (Invoice) | ส่วนที่ 9 |
| F3, F4 (Payment) | ส่วนที่ 10 |
| G1, G2 (Approval Inbox) | ส่วนที่ 11.1 (`workflow_instance`, `approval_step`) — ใช้ `wf_005`/`wf_006` เป็น "งานรออนุมัติวันนี้" |
| A1, A2 (Dashboard) | รวมจากทุก Section — แนะนำ Query Aggregate ตรงจาก preq_/po_/gr_/inv_/pay_ ทั้งหมด |
| H3, H4 (Audit/Integration) | ส่วนที่ 12 |
| I1-I5 (Vendor Portal) | Filter ข้อมูลส่วนที่ 6,7,9 ด้วย `vendor_id = ven_002` (Login จำลองเป็น Vendor ที่ชนะ Bidding ใน Golden Thread จะเห็นเรื่องราวครบที่สุด) |

---

## 16. Assumption & Open Items

1. **วันที่ "ปัจจุบัน" ของชุดข้อมูลคือ 18 มิถุนายน 2569** — ถ้า Demo จริงในวันอื่น ค่า `is_urgent`/`ExpiringSoon`/"ค้างกี่วัน" ที่คำนวณ Relative กับวันนี้ (เช่น `vdoc_003`, `stk_008`) จะต้องเลื่อนตามหรือ Hardcode วันที่ไว้เฉยๆก็ได้ถ้าไม่ต้องการ Logic คำนวณจริง
2. **ID แบบอ่านง่าย (เช่น `ven_001`) ใช้แทน UUID จริง** เพื่อความสะดวกตอน Debug/อ้างอิงในเอกสาร — ตอน Implement จริงให้ Generate เป็น UUID ตาม Data_Model_(ERD).md แต่คง Mapping ความสัมพันธ์เดิมไว้
3. **Golden Thread เลือก Path ที่ซับซ้อนที่สุด (ผ่าน Bidding)** เพื่อพิสูจน์ว่าระบบรองรับ Flow เต็มรูปได้ — ถ้าต้องการ Demo Path สั้น (PR→PO ตรง ไม่ผ่าน Bidding) ให้ใช้ `preq_007` → `po_002` แทน
4. **ตัวเลขการเงินทั้งหมดเป็นสมมติ** ปรับสัดส่วนให้พอเหมาะกับขนาดองค์กรในเอกสาร TOR (Concurrent User ≥500, 15 บริษัทในเครือ) แต่ Scope ของ Seed นี้จำลองแค่ 1 BU/Company ตามมติ Pilot
5. **ยังไม่ได้ Seed Domain Phase 2+** (Vendor Evaluation เต็มรูป, Digital Signature, Foreign Payment เต็มรูป) ตามขอบเขต Prototype Phase 1 ที่ตกลงไว้

---

*เอกสารนี้เป็นไฟล์ที่ 5 ของชุด Prototype — ใช้คู่กับ `User_Flow.md`, `Data_Model_(ERD).md`, `PR_Screen_Inventory.md`, `Design_System.md` ป้อนเป็น Context เดียวกันให้ Antigravity เพื่อให้ Prototype ที่ Build ออกมามีข้อมูลสมจริงแสดงผลได้ทันทีในทุกหน้า ไม่ใช่ Empty State ล้วน*

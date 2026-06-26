# User Story Baseline

## SCGJWD e-Procurement

**Project Code:** PJ250051
**Document Type:** User Story Baseline for Development, QA, SIT and UAT
**Prepared by:** Senior PM / BA / QA / SA
**Version:** v2.2 Complete Baseline
**Purpose:** ใช้เป็นเอกสาร Baseline สำหรับนำไปแตกเป็น SRS, Screen Inventory, API Specification, Data Model, Sprint Backlog, SIT Test Case และ UAT Script

---

# 1. Executive Summary

User Story Baseline จัดทำขึ้นเพื่อยกระดับเอกสาร User Story เดิมให้พร้อมใช้งานจริงสำหรับการพัฒนาระบบ SCGJWD e-Procurement โดยครอบคลุม Core Features 0–8 และ Supporting Layer ทั้งหมด

เอกสารฉบับนี้ไม่ใช่เพียงรายการ Function แต่เป็น Baseline ที่อธิบาย Business Scope, User Story, Business Rule, Acceptance Criteria, Status Flow, Permission, Interface, KPI, Test Coverage และ Open Decision ที่ต้องยืนยันก่อนเริ่ม Development

ระบบ e-Procurement มีเป้าหมายหลักในการสร้าง One Corporate Platform สำหรับงานจัดซื้อของ SCGJWD ให้ทุก BU ใช้ข้อมูล Vendor, Product, Asset, Organization, DOA, Financial Master และเอกสารจัดซื้อร่วมกัน ลดการทำงานซ้ำ ลด Manual Process เพิ่มความโปร่งใส และเชื่อมโยงข้อมูลกับ SAP B1 และระบบ e-Payment ที่เป็นระบบแยกต่างหาก

---

# 2. Scope Boundary
## 2.1 In Scope

ระบบ e-Procurement ครอบคลุม Module หลักดังนี้

0. Foundation: Master Data Management
1. Procurement Planning
2. Budget Control
3. e-Purchasing: PR / PO
4. Goods Receipt, Inventory and Asset Interface
5. Strategic Sourcing
6. e-Bidding / Tender Management
7. Contract Management
8. Vendor Management and Portal
9. Supporting Layer: Management and Control
10. API and Integration
11. Reporting and Analytics
12. Data Migration, Training, UAT, Go-live and Hypercare

## 2.2 e-Payment Scope

ระบบ e-Procurement ทำหน้าที่เป็น **Interface Only** กับระบบ e-Payment

ระบบ e-Procurement ทำเฉพาะ

1. ส่งข้อมูล PO / GR / Vendor / Amount / Cost Center / Due Date ไปยังระบบ e-Payment
2. รับสถานะกลับจากระบบ e-Payment เช่น Sent, Processing, Success, Failed, Cancelled
3. แสดง Interface Log, Error Log, Retry Status และ Payment Interface Status
4. Hold การส่งข้อมูลจ่ายเงิน เมื่อ Vendor Bank Account อยู่ระหว่างตรวจสอบ หรือ Vendor ถูก Block / Blacklist
5. เก็บ Audit Log ทุกครั้งที่มีการส่งข้อมูลหรือรับ Callback

ระบบ e-Procurement ไม่ทำ

1. Full AP Processing
2. Invoice OCR แบบ Production
3. Bank Transfer
4. Payment Batch Run
5. Payment Confirmation โดยตรง
6. Payroll
7. ESS Payment เช่น Travel, Cash Advance, Expense Claim, Mileage, Medical Expense
8. Foreign Remittance และ Employee-to-Payment

---

# 3. Scope Priority Matrix

| Priority           | ความหมาย                                                  | ตัวอย่าง Module / Function                                                                 |
| ------------------ | --------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Must for Go-live   | จำเป็นต่อการใช้งานจริง ถ้าขาดจะทำให้ Flow หลักไม่สมบูรณ์  | MDM, Vendor Master, PR, Budget Check, PO, GR, Basic RFQ, SAP B1 Interface, Security        |
| Should for Go-live | สำคัญและควรมี แต่สามารถแยกส่งภายหลังได้หาก Timeline จำกัด | Procurement Planning, Vendor Evaluation, Contract Utilization, Asset Rental, KPI Dashboard |
| Post Go-live       | เป็น Enhancement หลัง Go-live                             | Advanced Tender, BAFO, Reverse Auction, E-Signature, Custom Dashboard Builder              |
| Interface Only     | ระบบนี้ไม่ประมวลผลเอง แต่ส่งข้อมูลให้ระบบอื่น             | e-Payment Interface, OCR Engine, AI Engine                                                 |
| Mockup / Future    | ทำเพื่อยืนยัน Vision หรือ Prototype เท่านั้น              | AI Recommendation, AI Price Benchmarking, AI Replenishment                                 |

---

# 4. Role Definition

| Role                   | คำอธิบาย                                                        |
| ---------------------- | --------------------------------------------------------------- |
| Requester              | ผู้ขอซื้อสินค้า บริการ หรือระบุ Requirement                     |
| BU Manager             | ผู้จัดการหน่วยงานที่อนุมัติ Demand, PR หรือ Budget              |
| Procurement Planner    | ผู้วางแผนจัดซื้อและรวม Demand จากหลาย BU                        |
| Buyer                  | ผู้ดูแล Sourcing, RFQ, Bidding, PO, Contract และ Vendor         |
| Bidding Committee      | คณะกรรมการประเมิน Technical / Commercial และ Award              |
| Approver               | ผู้อนุมัติตาม DOA                                               |
| Warehouse Staff        | ผู้รับสินค้า ทำ GR, QC, Return และ Stock Movement               |
| Asset Admin            | ผู้ดูแล Asset Register, Rental, Transfer, Sale และ Maintenance  |
| Contract Admin         | ผู้ดูแล Contract Request, Draft, Review, Repository และ Renewal |
| Vendor                 | ผู้ขายที่ลงทะเบียน เสนอราคา ตอบ Bid ตอบรับ PO และดู KPI         |
| Finance Interface User | ผู้ดูแลข้อมูล Payment Readiness และ Interface ไป e-Payment      |
| Accounting Admin       | ผู้ดูแล Financial Master, Budget, Cost Center, GL, Tax Code     |
| MDM Admin              | ผู้ดูแล Master Data กลาง                                        |
| System Admin           | ผู้ดูแล User, Role, Workflow, Security และ Integration          |
| Executive              | ผู้บริหารที่ดู Dashboard และ Report                             |
| Auditor                | ผู้ตรวจสอบ Audit Log, Compliance และเอกสารย้อนหลัง              |

---

# 5. Core Feature 0: Foundation — Master Data Management

## Business Objective

Foundation หรือ MDM เป็นฐานข้อมูลกลางของระบบ One Corporate Platform เพื่อให้ทุก BU และทุกบริษัทใช้ข้อมูลชุดเดียวกัน ลด Duplicate Data และรองรับทุก Module ในระบบ

## Master Data Domain

1. Product and Service
2. Vendor Profile
3. Asset
4. Organization
5. E-Document
6. Evaluation
7. DOA
8. Financial

---

## US-0001: Product and Service Master

**As a** MDM Admin
**I want** to create and maintain product and service master data
**So that** ทุก BU ใช้ข้อมูลสินค้าและบริการชุดเดียวกันในการจัดซื้อ

### Business Rule

1. Product / Service ต้องมีรหัสกลางของระบบ
2. ต้องรองรับ Goods, Service, Asset, Rental, License และ Consumable
3. ต้องมีสถานะ Draft, Pending Approval, Active, Inactive, Blocked
4. ต้องรองรับ Price Effective Date และ Price Expiry Date
5. ข้อมูลที่ส่งไป SAP B1 ต้องมี Mapping Code ที่ถูกต้อง
6. การแก้ไขข้อมูลสำคัญต้องเก็บ Version History

### Acceptance Criteria

1. ระบบต้องสร้าง Product / Service Master ได้
2. ระบบต้องระบุชื่อสินค้า ประเภท หน่วย ราคา วันที่เริ่มใช้ วันที่หมดอายุ รายละเอียด และเอกสารแนบได้
3. ระบบต้องสร้างรหัสสินค้าอัตโนมัติตาม Format ที่กำหนด
4. ระบบต้องรองรับ Price History
5. ระบบต้องแจ้งเตือนเมื่อราคาหมดอายุหรือใกล้หมดอายุ
6. ระบบต้องกำหนด Owner BU หรือ Central Owner ได้
7. ระบบต้องป้องกันการสร้างสินค้าซ้ำ
8. ระบบต้องปิดใช้งานสินค้าโดยไม่กระทบเอกสารย้อนหลัง
9. ระบบต้อง Sync ข้อมูลที่อนุมัติแล้วไป SAP B1 ตาม Interface ที่กำหนด
10. ระบบต้องเก็บ Audit Trail ทุกการสร้าง แก้ไข ปิดใช้งาน และ Sync

### QA / UAT Scenario

1. สร้างสินค้าใหม่ประเภท Goods
2. สร้าง Service Item
3. สร้าง Asset Item แล้วตรวจว่าเชื่อม Asset Module ได้
4. แก้ไขราคาและตรวจ Price History
5. ทดสอบ Product Duplicate
6. ทดสอบ Sync SAP B1 สำเร็จและล้มเหลว

---

## US-0002: Vendor Profile Master

**As a** MDM Admin / Buyer
**I want** to maintain vendor profile data
**So that** ข้อมูล Vendor ถูกต้อง ตรวจสอบได้ และใช้ซ้ำได้ทุก BU

### Business Rule

1. Vendor ต้องใช้ Tax ID เป็น Unique Key หลัก
2. Vendor ต้องมีสถานะ Draft, Pending Review, Qualified, Active, Suspended, Blocked, Blacklisted
3. Vendor ที่ Blocked / Blacklisted ห้ามเข้าร่วม Sourcing, Tender หรือรับ PO ใหม่
4. Vendor Bank Account Change ต้องเข้าสู่ Dual Authorization
5. Vendor Document ต้องมี Expiry Date และแจ้งเตือนก่อนหมดอายุ

### Acceptance Criteria

1. ระบบต้องเก็บ Vendor Name, Tax ID, Address, Contact, Email, Phone, Vendor Type และ Business Category ได้
2. ระบบต้องแนบเอกสาร Vendor เช่น ภ.พ.20, หนังสือรับรองบริษัท, Book Bank และเอกสารภาษีได้
3. ระบบต้องตรวจสอบ Vendor ซ้ำจาก Tax ID, Bank Account, ชื่อบริษัท และที่อยู่
4. ระบบต้องรองรับ Vendor Profile ใช้ร่วมกันหลาย BU
5. ระบบต้องแจ้งเตือน Vendor Document ใกล้หมดอายุ
6. ระบบต้องเก็บประวัติการเปลี่ยนแปลง Vendor Profile
7. ระบบต้อง Sync Vendor ที่ Active แล้วไป SAP B1
8. ระบบต้องเก็บ Vendor Mapping Code แยกตาม Company ได้

---

## US-0003: Asset Master

**As an** Asset Admin
**I want** to maintain asset master data
**So that** สินทรัพย์ที่จัดซื้อ ถือครอง ปล่อยเช่า หรือจำหน่ายมีข้อมูลกลางที่ตรวจสอบได้

### Acceptance Criteria

1. ระบบต้องสร้าง Asset Master จาก GR หรือ Manual Register ได้
2. ระบบต้องเก็บ Asset Code, Asset Name, Category, Serial Number, Purchase Price, Purchase Date, Owner BU, Responsible Person และ Location ได้
3. ระบบต้องรองรับ Asset Status เช่น Available, In Use, Rented, Under Maintenance, Sold, Scrapped, Lost
4. ระบบต้องผูก Asset กับ PO, GR, Contract และ Rental Record ได้
5. ระบบต้องรองรับ Asset Tag และรูปภาพ Asset
6. ระบบต้องเก็บประวัติการโอนย้าย การปล่อยเช่า การขาย และการซ่อมบำรุง
7. ระบบต้องส่งข้อมูล Asset ไป SAP Fixed Asset Interface ตามเงื่อนไขที่กำหนด

---

## US-0004: Organization Master

**As a** System Admin
**I want** to maintain organization structure
**So that** ระบบสามารถควบคุมสิทธิ์ งบประมาณ และ Approval ได้ตามโครงสร้างจริง

### Acceptance Criteria

1. ระบบต้องรองรับ Company, BU, Department, Section, Cost Center และ Position
2. ระบบต้องกำหนด Parent-Child Structure ได้
3. ระบบต้องกำหนด User อยู่ภายใต้ Company / BU / Cost Center ได้
4. ระบบต้องใช้ Organization Master ใน Workflow, Budget, Reporting และ Permission
5. ระบบต้องรองรับหลายบริษัทในเครือ
6. ระบบต้องเก็บ Effective Date ของโครงสร้างองค์กร
7. ระบบต้องรองรับการปิดใช้งาน BU / Cost Center โดยไม่กระทบเอกสารเก่า

---

## US-0005: E-Document Master

**As a** Document Admin
**I want** to configure e-document types and templates
**So that** เอกสารในระบบมีรูปแบบและกฎการใช้งานเป็นมาตรฐาน

### Acceptance Criteria

1. ระบบต้องกำหนด Document Type เช่น Plan, PR, PO, RFQ, RFI, RFP, Bid, GR, Claim, Contract, Asset Rental ได้
2. ระบบต้องกำหนด Document Number Format ได้
3. ระบบต้องกำหนด Mandatory Attachment ตาม Document Type ได้
4. ระบบต้องกำหนด Retention Period ของเอกสารได้
5. ระบบต้องกำหนด Template ของเอกสารได้
6. ระบบต้องรองรับ Version Control ของ Template
7. ระบบต้องกำหนด Document Status Flow แยกตาม Document Type ได้

---

## US-0006: Evaluation Master

**As a** Procurement Admin
**I want** to configure evaluation criteria
**So that** การประเมิน Vendor, Sourcing และ Tender มีเกณฑ์มาตรฐาน

### Acceptance Criteria

1. ระบบต้องสร้าง Evaluation Template ได้
2. ระบบต้องรองรับเกณฑ์ Technical, Commercial, Delivery, Quality, Warranty, Service และ Compliance
3. ระบบต้องกำหนด Weight ของแต่ละเกณฑ์ได้
4. ระบบต้องแยก Template ตาม BU, Category, Vendor Type หรือ Tender Type ได้
5. ระบบต้องใช้ Evaluation Master ใน Strategic Sourcing, e-Bidding และ Vendor Evaluation ได้
6. ระบบต้องเก็บ Version ของ Evaluation Template

---

## US-0007: DOA Master

**As a** System Admin
**I want** to configure Delegation of Authority
**So that** ระบบอนุมัติเอกสารตามอำนาจอนุมัติขององค์กรได้ถูกต้อง

### Acceptance Criteria

1. ระบบต้องกำหนด DOA ตาม Company, BU, Amount, Category, Document Type และ Position ได้
2. ระบบต้องรองรับ Sequential Approval
3. ระบบต้องรองรับ Parallel Approval
4. ระบบต้องรองรับ Substitute Approver และ Delegation
5. ระบบต้องเก็บ Effective Date ของ DOA
6. ระบบต้องใช้ DOA กับ PR, PO, Budget, Bidding Award, Contract, Claim, Asset Disposal และ Vendor Approval ได้
7. ระบบต้องบันทึก Approval History ทุก Step

---

## US-0008: Financial Master

**As an** Accounting Admin
**I want** to maintain financial master data
**So that** Budget, PR, PO, GR, Asset และ Interface ไป SAP B1 ใช้ข้อมูลบัญชีที่ถูกต้อง

### Acceptance Criteria

1. ระบบต้องเก็บ GL Code, Tax Code, Cost Center, Budget Code, Currency และ Payment Term ได้
2. ระบบต้อง Mapping Financial Master กับ SAP B1 ได้
3. ระบบต้องใช้ข้อมูล Financial Master ใน Budget Check และ PO ได้
4. ระบบต้องตรวจสอบ Mapping ก่อนส่ง Interface
5. ระบบต้องเก็บประวัติการเปลี่ยนแปลง Financial Master
6. ระบบต้องป้องกันการใช้ Financial Master ที่ Inactive

---

## US-0009: Master Data Quality Dashboard

**As a** MDM Admin
**I want** to monitor master data quality
**So that** สามารถแก้ไขข้อมูลที่ไม่ครบ ซ้ำ หมดอายุ หรือ Mapping ไม่ครบก่อนกระทบการทำงานจริง

### Acceptance Criteria

1. Dashboard ต้องแสดง Vendor เอกสารหมดอายุ
2. Dashboard ต้องแสดง Item ที่ไม่มี SAP Mapping
3. Dashboard ต้องแสดง Cost Center ที่ Inactive หรือ Mapping ไม่ครบ
4. Dashboard ต้องแสดง Duplicate Vendor / Duplicate Item Candidate
5. Dashboard ต้องแสดงข้อมูล Master ที่รออนุมัติ
6. Dashboard ต้อง Export รายการ Data Quality Issue ได้

---

# 6. Core Feature 1: Procurement Planning

## Business Objective

Procurement Planning ใช้สำหรับวางแผนความต้องการจัดซื้อประจำปีหรือรายช่วงเวลา เพื่อให้ฝ่ายจัดซื้อเห็น Demand ล่วงหน้า วางงบประมาณ วางแผน Category และติดตาม Planned vs Actual ได้

---

## US-0101: Annual Procurement Plan

**As a** Procurement Planner / BU Manager
**I want** to create annual procurement plan
**So that** องค์กรสามารถวางแผนการจัดซื้อล่วงหน้าและเตรียมงบประมาณได้อย่างเป็นระบบ

### Acceptance Criteria

1. ระบบต้องสร้าง Annual Procurement Plan ได้
2. ระบบต้องระบุ Fiscal Year, Company, BU, Category และ Cost Center ได้
3. ระบบต้องระบุ Item / Service / Requirement, Quantity, Estimated Price, Estimated Budget, Expected Purchase Month และ Owner ได้
4. ระบบต้องรองรับ Upload Plan จาก Excel Template
5. ระบบต้องส่ง Plan เข้า Approval Workflow ได้
6. ระบบต้องแสดงสถานะ Draft, Submitted, Approved, Revised, Closed, Cancelled
7. ระบบต้องสร้าง PR จาก Approved Plan ได้
8. ระบบต้องเปรียบเทียบ Plan กับ PR / PO / GR Actual ได้

---

## US-0102: Demand Collection

**As a** Procurement Planner
**I want** to collect demand from multiple BU
**So that** ฝ่ายจัดซื้อรวมความต้องการก่อนวางแผนจัดซื้อและต่อรองราคาได้

### Acceptance Criteria

1. ระบบต้องเปิดรอบ Demand Collection ได้
2. BU ต้องส่งความต้องการสินค้า บริการ หรือ Requirement ได้
3. ระบบต้องรองรับ Demand ทั้งแบบมี Catalog Item และไม่มี Catalog Item
4. ระบบต้อง Consolidate Demand ตาม Category, Item, Vendor และช่วงเวลาได้
5. ระบบต้องรวม Demand หลาย BU เป็น Procurement Plan ได้
6. ระบบต้องแจ้งเตือน BU ที่ยังไม่ส่ง Demand
7. ระบบต้องปิดรอบ Demand Collection ตามวันที่กำหนด

---

## US-0103: Budget Planning Link

**As a** BU Manager / Accountant
**I want** procurement plan to link with budget planning
**So that** งบประมาณรองรับแผนจัดซื้อได้ตั้งแต่ต้นปี

### Acceptance Criteria

1. ระบบต้องผูก Procurement Plan กับ Budget Code และ Cost Center ได้
2. ระบบต้องรวม Estimated Budget จาก Plan ได้
3. ระบบต้องส่งข้อมูลไป Budget Setup หรือ Budget Request ได้
4. ระบบต้องแสดง Plan ที่ยังไม่มี Budget รองรับ
5. ระบบต้องแสดง Budget Available เทียบกับ Planned Amount ได้
6. ระบบต้องแจ้งเตือนเมื่อ Plan เกินงบประมาณที่จัดสรรไว้

---

## US-0104: Category Planning

**As a** Category Manager / Buyer
**I want** to plan procurement by category
**So that** สามารถวางกลยุทธ์จัดซื้อ แบ่งกลุ่ม Vendor และต่อรองราคาได้ดีขึ้น

### Acceptance Criteria

1. ระบบต้องจัดกลุ่ม Plan ตาม Category ได้
2. ระบบต้องแสดง Spend Forecast ตาม Category
3. ระบบต้องแสดง Vendor ที่เกี่ยวข้องกับ Category นั้น
4. ระบบต้องระบุ Sourcing Strategy ต่อ Category ได้ เช่น Direct Purchase, RFQ, RFP, Tender, Contract Renewal
5. ระบบต้องเชื่อม Category Planning ไปยัง Strategic Sourcing ได้
6. ระบบต้องแสดง Category Owner และ Buyer Owner ได้

---

## US-0105: Procurement Calendar

**As a** Buyer
**I want** to view procurement calendar
**So that** เห็นแผนจัดซื้อ กำหนดการประมูล และสัญญาที่ต้องต่ออายุล่วงหน้า

### Acceptance Criteria

1. ระบบต้องแสดง Calendar รายเดือน รายไตรมาส และรายปี
2. Calendar ต้องแสดง Planned Purchase, RFQ, Tender, Contract Renewal, Delivery Due และ Budget Period
3. ผู้ใช้งานต้อง Filter ตาม Company, BU, Category และ Buyer ได้
4. Calendar ต้องแจ้งเตือนรายการใกล้ถึงกำหนด
5. Calendar ต้อง Drill-down ไปยัง Plan, PR, Tender หรือ Contract ได้

---

## US-0106: Planned vs Actual Monitoring

**As a** Management User
**I want** to monitor planned vs actual procurement
**So that** เห็นความแตกต่างระหว่างแผนและการจัดซื้อจริง

### Acceptance Criteria

1. ระบบต้องเปรียบเทียบ Planned Amount กับ PR Amount, PO Amount และ GR Amount ได้
2. ระบบต้องแสดง Variance เป็นจำนวนเงินและเปอร์เซ็นต์
3. ระบบต้องแสดง Over Plan, Under Plan และ Not Planned Purchase ได้
4. ระบบต้อง Drill-down ไปยังเอกสารต้นทางได้
5. ระบบต้อง Export Report ได้

---

## US-0107: Unplanned Purchase Control

**As a** Procurement Manager
**I want** to identify purchases not linked to approved plan
**So that** Management สามารถควบคุมรายการซื้อที่เกิดนอกแผนได้

### Acceptance Criteria

1. ระบบต้องตรวจว่า PR เชื่อมกับ Approved Plan หรือไม่
2. หากไม่เชื่อม Plan ระบบต้อง Tag เป็น Unplanned Purchase
3. Unplanned Purchase ต้องกรอกเหตุผล
4. Unplanned Purchase ที่เกินวงเงินต้องผ่าน Approval พิเศษ
5. Dashboard ต้องแสดง Unplanned Purchase Amount และจำนวนรายการ
6. รายงานต้อง Drill-down ไปยัง PR / PO ต้นทางได้

---

# 7. Core Feature 2: Budget Control

## Business Objective

Budget Control ใช้ควบคุมวงเงินงบประมาณก่อนดำเนินการจัดซื้อ เพื่อป้องกันการใช้เงินเกินงบ การกันงบซ้ำ และทำให้ Commitment จาก PR / PO ถูกต้อง

---

## US-0201: Budget Setup

**As an** Accountant / Budget Admin
**I want** to setup annual budget by company, BU and cost center
**So that** ระบบมีวงเงินตั้งต้นสำหรับตรวจสอบก่อนจัดซื้อ

### Acceptance Criteria

1. ระบบต้องสร้าง Budget ตาม Fiscal Year ได้
2. ระบบต้องระบุ Company, BU, Cost Center, Budget Code และ Amount ได้
3. ระบบต้องรองรับ Budget Upload ผ่าน Excel Template
4. ระบบต้องรองรับ Budget Revision
5. ระบบต้องเก็บ Version ของ Budget
6. ระบบต้องแสดง Budget Status ได้แก่ Draft, Active, Closed
7. ระบบต้องป้องกันการแก้ Budget ที่ Closed แล้ว ยกเว้น Admin ตามสิทธิ์

---

## US-0202: Budget Check

**As a** Requester
**I want** the system to check budget before PR submission
**So that** ไม่สามารถขอซื้อเกินงบโดยไม่ผ่านการอนุมัติพิเศษ

### Acceptance Criteria

1. ระบบต้องตรวจสอบ Budget Available ขณะสร้าง PR
2. ระบบต้องคำนวณ Budget Available จาก Budget Amount - Used - Reserved - Commitment
3. ระบบต้องรองรับหลาย Cost Center ใน PR เดียว
4. ระบบต้องแจ้งเตือนเมื่อยอดเกินงบ
5. ระบบต้อง Block หรือ Escalate ตาม Budget Policy
6. ระบบต้องบันทึก Budget Check Result ใน PR
7. ระบบต้องแสดง Budget Warning แบบ Real-time

---

## US-0203: Budget Reservation

**As a** System
**I want** to reserve budget after PR approval
**So that** งบประมาณถูกกันไว้ก่อนออก PO

### Acceptance Criteria

1. ระบบต้อง Reserve Budget เมื่อ PR อนุมัติ
2. ระบบต้องปรับ Reserved Amount ตาม PR Line และ Cost Center
3. ระบบต้อง Release Budget เมื่อ PR ถูก Reject, Cancel หรือ Closed แบบไม่ดำเนินการต่อ
4. ระบบต้องปรับ Reservation เมื่อ PR Amendment อนุมัติ
5. ระบบต้องเก็บ Budget Reservation Log
6. ระบบต้องป้องกัน Race Condition ระหว่างการ Reserve / Release

---

## US-0204: Commitment Control

**As an** Accountant / Buyer
**I want** PO commitment to be controlled against budget
**So that** ภาระผูกพันจาก PO ถูกสะท้อนในงบประมาณจริง

### Acceptance Criteria

1. ระบบต้องเปลี่ยน Reserved Budget เป็น Commitment เมื่อ PO อนุมัติ
2. ระบบต้องลด Commitment เมื่อ PO ถูก Cancel หรือ Closed
3. ระบบต้องรองรับ Partial PO และ Partial GR
4. ระบบต้องเปรียบเทียบ PR Amount, PO Amount และ Commitment Amount ได้
5. ระบบต้องแจ้งเตือนเมื่อ PO Amount เกิน PR Budget
6. ระบบต้องแสดง Commitment Report ตาม Cost Center
7. ระบบต้องรองรับการคืน Commitment ส่วนที่ไม่ใช้เมื่อปิด PO

---

## US-0205: Budget Transfer and Annual Reset

**As an** Accountant
**I want** to transfer and reset budget
**So that** บริหารงบประมาณได้ถูกต้องตามปีบัญชี

### Acceptance Criteria

1. ระบบต้องโอนงบระหว่าง Cost Center ได้
2. การโอนงบข้าม Company ต้องผ่าน Approval พิเศษ
3. ระบบต้องป้องกันการโอนเกิน Budget Available
4. ระบบต้องรองรับ Annual Budget Reset
5. ระบบต้องเก็บประวัติการโอนและ Reset
6. ระบบต้อง Export Budget Transaction ได้

---

## US-0206: Budget Reconciliation with SAP B1

**As an** Accountant
**I want** to reconcile budget reserved, committed and actual amount with SAP B1
**So that** ข้อมูลควบคุมงบประมาณใน e-Procurement และ SAP B1 ถูกต้องตรงกัน

### Acceptance Criteria

1. ระบบต้องแสดง Budget Reserved, Commitment และ Actual ตาม Cost Center
2. ระบบต้องรับข้อมูลอ้างอิงจาก SAP B1 ตาม Interface ที่ตกลง
3. ระบบต้องแสดง Difference ระหว่าง e-Procurement และ SAP B1
4. ระบบต้องให้ Accounting บันทึก Correction Remark ได้
5. ระบบต้อง Export Budget Reconciliation Report ได้
6. ระบบต้องเก็บ Reconciliation Log

---

# 8. Core Feature 3: e-Purchasing — PR / PO

## Business Objective

e-Purchasing ครอบคลุมกระบวนการตั้งแต่การสร้าง PR การอนุมัติ การแปลงเป็น PO การแก้ไข ยกเลิก ปิดเอกสาร และติดตามสถานะ

---

## US-0301: Catalog PR

**As a** Requester
**I want** to create PR from catalog
**So that** ขอซื้อสินค้าที่มีข้อมูลพร้อมใช้งานได้รวดเร็ว

### Acceptance Criteria

1. ผู้ใช้งานต้องเลือกสินค้าจาก Catalog ได้
2. ระบบต้องดึงราคา หน่วย Vendor และเอกสารอ้างอิงจาก Master Data ได้
3. ระบบต้องให้ระบุ Quantity, Delivery Date, Cost Center และ Reason ได้
4. ระบบต้องตรวจ Budget และ Procurement Policy ก่อน Submit
5. ระบบต้องส่ง PR เข้า Workflow ตาม DOA
6. ระบบต้องแสดง PR Status และ Timeline
7. ระบบต้องรองรับ PR หลายบรรทัด หลาย Cost Center

---

## US-0302: Non-Catalog PR

**As a** Requester
**I want** to create PR without catalog item
**So that** ขอซื้อสินค้าหรือบริการใหม่ได้โดยไม่ต้องรอสร้าง Master Data ก่อน

### Acceptance Criteria

1. ผู้ใช้งานต้องเลือก PR Type เป็น Non-Catalog ได้
2. ระบบต้องให้ระบุชื่อสินค้า รายละเอียด จำนวน ประมาณราคา และเอกสารแนบ
3. Buyer ต้องเลือก Action ได้ เช่น Create Item Master, Proceed to Sourcing, Proceed to Bidding, Reject
4. ระบบต้องเก็บการตัดสินใจของ Buyer
5. ระบบต้องแปลง Non-Catalog PR ไปเป็น Catalog Item ได้เมื่อได้รับอนุมัติ
6. ระบบต้องรองรับการส่ง Non-Catalog PR ไปขอราคา Vendor

---

## US-0303: Requirement-Based PR

**As a** Requester
**I want** to create PR by describing requirement instead of selecting item
**So that** Vendor หรือ Buyer สามารถเสนอสินค้า บริการ หรือ Solution ที่เหมาะสมภายหลัง

### Acceptance Criteria

1. ระบบต้องมี PR Type เป็น Requirement-Based
2. ผู้ใช้งานต้องระบุ Requirement Description, Objective, Expected Outcome, Estimated Budget และ Required Date ได้
3. ระบบต้องรองรับเอกสารแนบ เช่น TOR, Scope of Work, รูปภาพ หรือไฟล์อ้างอิง
4. ผู้ใช้งานต้องเลือกได้ว่าจะขอราคา Vendor หรือให้ Vendor แนบรายละเอียดกลับมา
5. Buyer ต้องส่ง Requirement ให้ Vendor เพื่อขอ Proposal ได้
6. Vendor ต้องแนบ Proposal, Specification, BOQ หรือ Solution กลับมาได้
7. Buyer ต้องเปรียบเทียบ Proposal และเลือกดำเนินการต่อได้
8. ระบบต้องสร้าง PR Line, Sourcing Event หรือ Bidding Event จาก Requirement ได้
9. ระบบต้องเก็บ Requirement Version และเอกสาร Vendor Response

---

## US-0304: Workflow and Approval by DOA

**As an** Approver
**I want** PR and PO to follow DOA workflow
**So that** เอกสารได้รับการอนุมัติตามอำนาจอนุมัติที่ถูกต้อง

### Acceptance Criteria

1. ระบบต้อง Route PR / PO ตาม DOA Master
2. ระบบต้องรองรับ Sequential และ Parallel Approval
3. ระบบต้องรองรับ Delegation และ Substitute Approver
4. Approver ต้อง Approve, Reject, Revise ได้
5. Reject ต้องบังคับระบุเหตุผล
6. ระบบต้องบันทึก Approval History
7. ระบบต้องแจ้งเตือนผู้เกี่ยวข้อง
8. ระบบต้อง Escalate เมื่อเกิน SLA

---

## US-0305: Purchase Order Creation

**As a** Buyer
**I want** to create PO from approved PR or awarded sourcing / bidding
**So that** ออกใบสั่งซื้อได้ถูกต้องและลดการกรอกข้อมูลซ้ำ

### Acceptance Criteria

1. ระบบต้องสร้าง PO จาก Approved PR ได้
2. ระบบต้องสร้าง PO จาก Awarded Strategic Sourcing ได้
3. ระบบต้องสร้าง PO จาก Awarded e-Bidding ได้
4. ระบบต้องรองรับ 1 PR สร้างหลาย PO ตาม Vendor ได้
5. ระบบต้องสร้าง PO Number ตาม Format
6. ระบบต้องส่ง PO ไป SAP B1 ตาม Interface
7. ระบบต้องเก็บ SAP Reference Number
8. ระบบต้องตรวจ Vendor Status, Budget, Mapping และ Required Attachment ก่อนส่ง PO

---

## US-0306: PR / PO Amendment

**As a** Requester / Buyer
**I want** to amend PR or PO with version control
**So that** การเปลี่ยนแปลงเอกสารถูกควบคุมและตรวจสอบย้อนหลังได้

### Acceptance Criteria

1. ระบบต้องรองรับ PR Amendment
2. ระบบต้องรองรับ PO Amendment
3. การแก้ไขข้อมูลสำคัญต้องเข้า Approval ใหม่
4. ระบบต้องสร้าง Version ใหม่
5. ระบบต้องแสดง Before / After
6. ระบบต้องแจ้งผู้เกี่ยวข้องเมื่อ Amendment มีผลต่อ Vendor, Budget หรือ Delivery
7. ระบบต้องส่ง Revision ไป SAP B1 หากจำเป็น

---

## US-0307: PR / PO Cancellation and Closure

**As a** Buyer / Requester
**I want** to cancel or close PR / PO
**So that** เอกสารที่ไม่ดำเนินการต่อหรือเสร็จสิ้นแล้วถูกปิดอย่างถูกต้อง

### Acceptance Criteria

1. ระบบต้อง Cancel PR ได้ก่อนสร้าง PO
2. ระบบต้อง Cancel PO ได้ตามสิทธิ์และสถานะ
3. ระบบต้อง Close PR เมื่อสร้าง PO ครบทุก Line
4. ระบบต้อง Close PO เมื่อรับของครบหรือปิดงานแล้ว
5. ระบบต้อง Release Budget หรือ Commitment ตามสถานะเอกสาร
6. ระบบต้องบังคับกรอกเหตุผลการ Cancel / Close
7. ระบบต้องเก็บ Audit Trail
8. ระบบต้องรองรับการปิด PO ที่รับสินค้าไม่ครบ โดยต้องระบุเหตุผลและผ่าน Approval ตาม Rule

---

## US-0308: PR / PO Tracking

**As a** User
**I want** to track PR and PO status
**So that** เห็นว่าเอกสารอยู่ที่ใคร ขั้นตอนไหน และต้องดำเนินการอะไรต่อ

### Acceptance Criteria

1. ระบบต้องมี PR / PO Timeline
2. ระบบต้องแสดง Current Step, Current Owner และ Next Action
3. ระบบต้องแสดงสถานะของเอกสารครบถ้วน
4. ระบบต้องค้นหาและ Filter PR / PO ได้
5. ระบบต้อง Export รายการ PR / PO ได้
6. ระบบต้องแสดงเอกสารที่เกี่ยวข้อง เช่น Plan, RFQ, Bid, Contract, GR และ SAP Reference

---

## US-0309: PR Consolidation and PO Split

**As a** Buyer
**I want** to consolidate multiple PRs and split POs by vendor
**So that** สามารถรวมความต้องการเพื่อเจรจาราคา และออก PO ให้ถูกต้องตาม Vendor ได้

### Acceptance Criteria

1. Buyer ต้องรวมหลาย PR เป็น Sourcing Event เดียวได้
2. ระบบต้องแสดง PR Line ที่นำมารวม
3. ระบบต้องป้องกันการนำ PR Line เดิมไปใช้ซ้ำ
4. หลัง Award ระบบต้อง Split PO ตาม Vendor ได้
5. ระบบต้องอัปเดตสถานะ PR Line แต่ละรายการ
6. ระบบต้องเก็บ Link ระหว่าง PR, Sourcing Event, Award และ PO

---

# 9. Core Feature 4: Goods Receipt, Inventory and Asset Interface

## Business Objective

Module นี้ครอบคลุมการตรวจรับสินค้าและบริการ การตรวจคุณภาพ การเคลม การคืนสินค้า การปรับ Stock และการส่งข้อมูลไปยัง Asset / SAP Fixed Asset Interface เมื่อสินค้าที่รับเข้าเป็นสินทรัพย์

---

## US-0401: Goods Receipt

**As a** Warehouse Staff
**I want** to record goods receipt against PO
**So that** การรับสินค้ามีหลักฐานและอัปเดตสถานะ PO ได้ถูกต้อง

### Acceptance Criteria

1. ระบบต้องค้นหา PO ที่รอรับสินค้าได้
2. ระบบต้องแสดง Ordered Qty, Received Qty, Remaining Qty
3. ระบบต้องรองรับ Full Receipt และ Partial Receipt
4. ระบบต้องรองรับ Over / Short Receipt ตาม Tolerance
5. ระบบต้องแนบรูปภาพหลักฐานได้
6. ระบบต้องบันทึกผู้รับ วันที่ เวลา และ Location
7. ระบบต้องอัปเดต PO Status และ Stock
8. ระบบต้องส่ง GR ไป SAP B1 ตาม Interface
9. ระบบต้องสร้าง GR Number ตาม Format ที่กำหนด

---

## US-0402: Service Acceptance

**As a** Requester / Buyer
**I want** to accept service delivery
**So that** งานบริการถูกตรวจรับก่อนปิด PO

### Acceptance Criteria

1. ระบบต้องรองรับ PO ประเภท Service
2. ระบบต้องให้บันทึกผลตรวจรับบริการ
3. ระบบต้องแนบ Service Report, Timesheet หรือ Deliverable Document ได้
4. ระบบต้องรองรับ Partial Service Acceptance
5. Service Acceptance ต้องผ่าน Approval ตาม Rule
6. ระบบต้องอัปเดต PO Status หลังตรวจรับ
7. ระบบต้องรองรับ Milestone Acceptance สำหรับงานบริการตามงวด

---

## US-0403: Inspection / QC

**As a** QC / Warehouse Staff
**I want** to inspect goods before completing GR
**So that** รับเฉพาะสินค้าที่ผ่านคุณภาพและมีหลักฐานตรวจสอบ

### Acceptance Criteria

1. ระบบต้องกำหนดได้ว่าสินค้าประเภทใดต้อง QC
2. ระบบต้องบันทึกผล Pass, Partial Pass, Fail ได้
3. ระบบต้องบันทึกจำนวนที่ผ่านและไม่ผ่าน
4. ระบบต้องแนบรูปภาพหรือเอกสาร QC ได้
5. หาก QC Fail ระบบต้องสร้าง Claim หรือ Return ได้
6. ระบบต้องบันทึกผล QC ไป Vendor Evaluation
7. ระบบต้องไม่ให้ GR Complete หาก QC Required แต่ยังไม่บันทึกผล QC

---

## US-0404: Return and Claim

**As a** Warehouse Staff / Requester
**I want** to create claim and return documents
**So that** สินค้าที่เสียหาย รับไม่ครบ หรือผิด Spec ถูกจัดการได้เป็นระบบ

### Acceptance Criteria

1. ระบบต้องสร้าง Claim จาก PO, GR หรือ QC ได้
2. ระบบต้องระบุ Claim Type เช่น Damage, Shortage, Wrong Item, QC Fail, Transport Damage
3. ระบบต้องแนบหลักฐานได้
4. ระบบต้องแจ้ง Buyer และ Vendor
5. ระบบต้องสร้าง Return Note ได้
6. ระบบต้องติดตามสถานะ Claim ได้
7. ระบบต้องกระทบ Stock และ Vendor Score ตาม Rule
8. ระบบต้องรองรับ Supplier Replacement หรือ Credit / Compensation Reference ในเชิงข้อมูลอ้างอิง

---

## US-0405: Stock Balance and Inventory Movement

**As a** Warehouse Staff / Buyer
**I want** to view stock balance and movement
**So that** ติดตามสินค้าคงคลังและวางแผนจัดซื้อได้ถูกต้อง

### Acceptance Criteria

1. ระบบต้องแสดง Stock Balance ตาม Warehouse และ Location
2. ระบบต้องแสดง Stock Movement จาก GR, Return, Transfer, Adjustment, Write-off
3. ระบบต้องรองรับ Lot, Serial และ Expiry Tracking
4. ระบบต้องแจ้งเตือน Near Expiry
5. ระบบต้องรองรับ FEFO ในสินค้าที่มีวันหมดอายุ
6. ระบบต้อง Export Stock Report ได้
7. ระบบต้อง Sync Stock กับ SAP B1 ตาม Interface ที่กำหนด

---

## US-0406: SAP Fixed Asset Interface

**As an** Asset Admin / Accounting User
**I want** asset-related GR data to interface to SAP Fixed Asset
**So that** สินทรัพย์ที่รับเข้าถูกบันทึกในระบบทรัพย์สินได้ถูกต้อง

### Acceptance Criteria

1. ระบบต้องระบุได้ว่า PO Line ใดเป็น Asset
2. เมื่อ GR Complete สำหรับ Asset Item ระบบต้องสร้าง Asset Record
3. ระบบต้องส่งข้อมูล Asset ไป SAP Fixed Asset Interface ตาม Format ที่ตกลง
4. ระบบต้องส่งข้อมูล Asset Code, Description, Purchase Price, Vendor, PO Ref, GR Ref, Cost Center และ Owner BU
5. ระบบต้องแสดง Interface Status
6. หากส่งไม่สำเร็จ ต้องมี Error Log และ Retry
7. ระบบต้องป้องกันการส่ง Asset ซ้ำ

---

## US-0407: Put Away and Location Confirmation

**As a** Warehouse Staff
**I want** to confirm storage location after goods receipt
**So that** Stock Balance และตำแหน่งจัดเก็บสินค้าถูกต้อง

### Acceptance Criteria

1. ระบบต้องให้ระบุ Location / Bin หลังจากรับสินค้า
2. ระบบต้องรองรับ Scan หรือ Manual Confirm Location
3. ระบบต้องแสดง Suggested Location ตาม Category หรือ Storage Rule หากมี
4. ระบบต้องบันทึกผู้จัดเก็บ วันที่ เวลา และ Location
5. ระบบต้องอัปเดต Stock Location หลัง Confirm
6. ระบบต้องแสดงรายการ GR ที่รับแล้วแต่ยังไม่ได้ Put Away
7. ระบบต้องเก็บ Put Away History

---

# 10. Core Feature 5: Strategic Sourcing

## Business Objective

Strategic Sourcing ใช้สำหรับค้นหา คัดกรอง และเปรียบเทียบผู้ขายก่อนเข้าสู่การจัดซื้อหรือการประมูลอย่างเป็นทางการ โดยรองรับ RFI, RFQ, RFP, Vendor Recommendation และ Quotation Comparison

---

## US-0501: RFI — Request for Information

**As a** Buyer
**I want** to create RFI to collect vendor information
**So that** สามารถคัดกรอง Vendor เบื้องต้นก่อนขอราคา หรือเปิด Tender

### Acceptance Criteria

1. Buyer ต้องสร้าง RFI ได้
2. ระบบต้องระบุ Objective, Scope, Category, Response Deadline และเอกสารแนบได้
3. Buyer ต้องเชิญ Vendor ให้ตอบ RFI ได้
4. Vendor ต้องตอบคำถามและแนบเอกสารได้
5. ระบบต้องเปรียบเทียบ Response ของ Vendor ได้
6. ระบบต้องสร้าง Vendor Longlist / Shortlist ได้
7. ระบบต้องเก็บ RFI History

---

## US-0502: RFQ — Request for Quotation

**As a** Buyer
**I want** to request quotation from vendors
**So that** เปรียบเทียบราคาก่อนตัดสินใจจัดซื้อหรือเปิด e-Bidding

### Acceptance Criteria

1. Buyer ต้องสร้าง RFQ จาก PR, Requirement, Plan หรือ Standalone ได้
2. ระบบต้องระบุ Item / Service / Requirement, Quantity, Delivery Date และ Terms ได้
3. Vendor ต้องเสนอราคาและแนบ Quotation ได้
4. ระบบต้องป้องกัน Vendor เห็นราคาคู่แข่ง
5. Buyer ต้องเปรียบเทียบราคาได้
6. ระบบต้อง Export Quotation Comparison ได้
7. ระบบต้องสร้าง Award Recommendation ได้

---

## US-0503: RFP — Request for Proposal

**As a** Buyer
**I want** to request proposal from vendors
**So that** Vendor สามารถเสนอ Solution, Technical Detail และ Commercial Proposal ได้

### Acceptance Criteria

1. Buyer ต้องสร้าง RFP ได้
2. ระบบต้องแนบ TOR, Scope of Work และ Evaluation Criteria ได้
3. Vendor ต้องส่ง Technical Proposal และ Commercial Proposal ได้
4. ระบบต้องรองรับการประเมิน Proposal ตามเกณฑ์
5. Buyer ต้อง Shortlist Vendor ได้
6. ระบบต้องส่งผลต่อไปยัง e-Bidding หรือ Contract ได้

---

## US-0504: Vendor Recommendation

**As a** Buyer
**I want** the system to recommend potential vendors
**So that** เลือก Vendor ที่เหมาะสมกับ Category และ Performance ได้ง่ายขึ้น

### Acceptance Criteria

1. ระบบต้องแนะนำ Vendor จาก Category, Vendor Type, Past Performance, Scorecard และ Blacklist Status
2. ระบบต้องไม่แนะนำ Vendor ที่ถูก Block หรือ Blacklist
3. ระบบต้องแสดงเหตุผลที่แนะนำ Vendor
4. Buyer ต้องเพิ่มหรือลบ Vendor จาก Recommendation ได้
5. ระบบต้องเก็บเหตุผลการเลือก Vendor
6. หาก AI Recommendation ยังไม่อยู่ใน Scope ให้ใช้ Rule-based Recommendation ก่อน

---

## US-0505: Quotation Comparison

**As a** Buyer
**I want** to compare vendor quotations
**So that** เลือกข้อเสนอที่เหมาะสมทั้งราคา คุณภาพ และเงื่อนไข

### Acceptance Criteria

1. ระบบต้องเปรียบเทียบราคา Delivery Term, Payment Term, Warranty และ Service Term ได้
2. ระบบต้องรองรับการเปรียบเทียบหลาย Vendor
3. ระบบต้องแสดง Vendor ที่เสนอราคาต่ำสุด
4. Buyer ต้องเลือก Vendor ที่ไม่ใช่ราคาต่ำสุดได้ โดยต้องระบุเหตุผล
5. ระบบต้อง Export Comparison Report ได้
6. ระบบต้องส่งผลไปสร้าง PR, PO, Contract หรือ e-Bidding ได้

---

## US-0506: Vendor Shortlist Approval

**As a** Procurement Manager
**I want** vendor shortlist to be reviewed and approved
**So that** การคัดเลือก Vendor สำหรับงานมูลค่าสูงโปร่งใสและตรวจสอบได้

### Acceptance Criteria

1. Buyer ต้องสร้าง Vendor Shortlist ได้
2. ระบบต้องตรวจ Vendor Status, Qualification และ Risk ก่อนเข้ารายชื่อ
3. งานที่เกินวงเงินที่กำหนดต้องส่ง Shortlist เข้า Approval
4. Approver ต้อง Approve / Reject พร้อมเหตุผลได้
5. ระบบต้องเก็บ Shortlist Approval History
6. Shortlist ที่อนุมัติแล้วต้องนำไปใช้ใน RFQ / RFP / Tender ได้

---

# 11. Core Feature 6: e-Bidding / Tender Management

## Business Objective

e-Bidding / Tender Management ใช้บริหารกระบวนการประมูลอย่างเป็นทางการ ตั้งแต่ Bid Setup, Vendor Invitation, Bid Submission, Bid Opening, Technical Evaluation, Commercial Evaluation, BAFO และ Award

---

## US-0601: Bid Setup

**As a** Buyer
**I want** to setup bidding event
**So that** เปิดประมูลได้ถูกต้องตามกติกาและประเภทงานจัดซื้อ

### Acceptance Criteria

1. ระบบต้องสร้าง Bid Event ได้ทั้งแบบ Standalone และ PR-linked
2. ระบบต้องระบุ Bid Type เช่น Sealed Bid, Multi-round, Reverse Auction, Technical + Commercial ได้
3. ระบบต้องระบุ Scope, TOR, BOQ, Category, Budget Reference และ Schedule ได้
4. ระบบต้องกำหนด Bid Opening Date และ Submission Deadline ได้
5. ระบบต้องกำหนด Evaluation Criteria ได้
6. ระบบต้องตั้งคณะกรรมการได้
7. ระบบต้องบันทึก Bid Status
8. ระบบต้องกำหนด Bid Rule เช่น Allow Revision, Late Bid, Withdrawal, BAFO ได้

---

## US-0602: Vendor Invitation

**As a** Buyer
**I want** to invite vendors to bidding
**So that** Vendor ที่เหมาะสมเข้าร่วมประมูลได้ตามระเบียบ

### Acceptance Criteria

1. Buyer ต้องเลือก Vendor จาก Vendor Master, Shortlist หรือ Recommendation ได้
2. ระบบต้องตรวจสอบ Vendor Status ก่อนเชิญ
3. Vendor ที่ Block / Blacklist ต้องถูกห้ามเชิญ
4. ระบบต้องส่ง Invitation ไปยัง Vendor Portal และ Email
5. ระบบต้องเก็บ Invitation Log
6. Vendor ต้อง Accept หรือ Decline Invitation ได้

---

## US-0603: Bid Submission

**As a** Vendor
**I want** to submit bid through portal
**So that** เสนอราคาและเอกสารประมูลได้อย่างปลอดภัยและตรวจสอบได้

### Acceptance Criteria

1. Vendor ต้องเห็นเฉพาะ Bid ที่ได้รับเชิญ
2. Vendor ต้อง Submit Price, Technical Document, Commercial Document และ Attachment ได้
3. ระบบต้องป้องกันการ Submit หลัง Deadline
4. ระบบต้องบันทึกเวลาส่งเอกสาร
5. Vendor ต้องแก้ไข Submission ได้เฉพาะช่วงเวลาที่อนุญาต
6. ระบบต้องแสดงสถานะ Submitted ให้ Vendor เห็น
7. ระบบต้องรองรับ Bid Withdrawal หาก Policy อนุญาต และต้องเก็บ Log

---

## US-0604: Bid Opening

**As a** Bidding Committee
**I want** to open bids according to schedule and permission
**So that** การเปิดซองประมูลโปร่งใสและตรวจสอบได้

### Acceptance Criteria

1. ระบบต้องไม่ให้เปิด Bid ก่อน Bid Opening Date
2. เฉพาะผู้มีสิทธิ์เท่านั้นที่เปิด Bid ได้
3. ระบบต้องรองรับการเปิด Technical Envelope และ Commercial Envelope แยกกัน
4. ระบบต้องบันทึกผู้เปิดซอง วันที่ เวลา และ IP Address
5. ระบบต้องแสดงรายการ Vendor ที่ Submit และไม่ Submit
6. ระบบต้องเก็บ Bid Opening Log
7. ระบบต้องป้องกันการแก้ไข Bid หลังเปิดซอง

---

## US-0605: Technical Evaluation

**As a** Committee Member
**I want** to evaluate technical proposal
**So that** คัดเลือก Vendor ที่ผ่านคุณสมบัติทางเทคนิคก่อนพิจารณาราคา

### Acceptance Criteria

1. ระบบต้องแสดง Technical Proposal ให้กรรมการประเมิน
2. กรรมการต้องให้คะแนนตาม Criteria ได้
3. ระบบต้องรองรับ Pass / Fail และ Weighted Score
4. ระบบต้องรวมคะแนนกรรมการหลายคนได้
5. ระบบต้องระบุ Vendor ที่ผ่าน Technical ได้
6. ระบบต้องเก็บ Comment และ Score History
7. ระบบต้องรองรับ Conflict of Interest Declaration ก่อนเริ่มประเมิน

---

## US-0606: Commercial Evaluation

**As a** Committee Member / Buyer
**I want** to evaluate commercial proposal
**So that** เปรียบเทียบราคาและเงื่อนไขเชิงพาณิชย์ได้ถูกต้อง

### Acceptance Criteria

1. ระบบต้องแสดง Commercial Proposal ของ Vendor ที่ผ่าน Technical
2. ระบบต้องเปรียบเทียบราคา Payment Term, Warranty, Delivery และ Discount ได้
3. ระบบต้องคำนวณคะแนน Commercial ตาม Weight ได้
4. ระบบต้องรวมคะแนน Technical และ Commercial ได้
5. ระบบต้องแสดง Ranking Vendor ได้
6. ระบบต้อง Export Evaluation Summary ได้
7. ระบบต้องรองรับ Tie-break Rule หากคะแนนเท่ากัน

---

## US-0607: BAFO — Best and Final Offer

**As a** Buyer
**I want** to request BAFO from shortlisted vendors
**So that** ได้ข้อเสนอสุดท้ายที่ดีที่สุดก่อน Award

### Acceptance Criteria

1. Buyer ต้องเปิด BAFO Round ได้
2. ระบบต้องเชิญเฉพาะ Vendor ที่ผ่านเกณฑ์หรือ Shortlist
3. Vendor ต้องส่ง Best and Final Offer ได้ภายใน Deadline
4. ระบบต้องเก็บราคาก่อน BAFO และหลัง BAFO
5. ระบบต้องเปรียบเทียบผล BAFO ได้
6. ระบบต้องเก็บ BAFO History
7. ระบบต้องป้องกัน Vendor ที่ไม่อยู่ใน Shortlist เข้าร่วม BAFO

---

## US-0608: Award

**As a** Buyer / Committee
**I want** to award winning vendor
**So that** สรุปผลประมูลและนำไปสร้าง PR, PO หรือ Contract ได้

### Acceptance Criteria

1. ระบบต้องเลือก Award Vendor ได้
2. ระบบต้องบังคับกรอกเหตุผลการ Award
3. Award ต้องผ่าน Approval ตาม DOA
4. ระบบต้องแจ้ง Vendor ที่ชนะและไม่ชนะ
5. ระบบต้องสร้าง Award Summary Report ได้
6. ระบบต้องส่งผล Award ไปสร้าง PR, PO หรือ Contract ได้
7. ระบบต้องรองรับ Re-award กรณี Vendor ผู้ชนะไม่ตอบรับ
8. ระบบต้องรองรับ Award Cancellation พร้อมเหตุผลและ Audit Trail

---

## US-0609: Bid Confidentiality and Opening Control

**As an** Auditor
**I want** bid submissions to remain sealed until official opening
**So that** กระบวนการ Tender โปร่งใสและป้องกันการเปิดราคาก่อนเวลา

### Acceptance Criteria

1. ระบบต้องล็อก Bid Submission จนถึง Bid Opening Date
2. ระบบต้องป้องกัน Buyer หรือ Committee ดู Commercial Price ก่อนเวลาที่กำหนด
3. ระบบต้องเก็บ Hash / Checksum หรือ Security Log ของไฟล์ที่ส่ง
4. ระบบต้องบันทึกทุกการเข้าถึงเอกสาร Bid
5. ระบบต้องแสดง Audit Report สำหรับ Bid Opening
6. ระบบต้องแจ้งเตือน Auditor หากมี Unauthorized Access Attempt

---

# 12. Core Feature 7: Contract Management

## Business Objective

Contract Management ใช้บริหารสัญญาหลังคัดเลือกผู้ขาย ตั้งแต่ Contract Request, Draft, Review, Approval, Repository, Utilization, Renewal, Expiry Notification และ Obligation Control

---

## US-0701: Contract Request

**As a** Buyer / Requester
**I want** to create contract request
**So that** เริ่มกระบวนการจัดทำสัญญาหลังคัดเลือก Vendor หรือ Award ได้

### Acceptance Criteria

1. ระบบต้องสร้าง Contract Request จาก Award, PO, Asset Rental หรือ Manual ได้
2. ระบบต้องระบุ Contract Type เช่น Purchase, Service, Rental, Warranty, Maintenance, Framework, Blanket Agreement ได้
3. ระบบต้องระบุ Vendor, Scope, Contract Value, Start Date, End Date และ Owner ได้
4. ระบบต้องแนบเอกสารประกอบได้
5. ระบบต้องส่ง Contract Request เข้า Workflow ได้

---

## US-0702: Draft Contract

**As a** Contract Admin
**I want** to draft contract from template
**So that** เอกสารสัญญามีรูปแบบมาตรฐานและลดการจัดทำเอกสารซ้ำ

### Acceptance Criteria

1. ระบบต้องสร้าง Draft Contract จาก Template ได้
2. ระบบต้องดึงข้อมูล Vendor, Award, PO, Asset หรือ Rental มาใส่ใน Draft ได้
3. ระบบต้องรองรับ Manual Upload Contract
4. ระบบต้องเก็บ Version ของ Draft Contract
5. ระบบต้องแนบไฟล์ Word / PDF ได้
6. ระบบต้องกำหนดผู้ Review ได้

---

## US-0703: Review and Approval

**As a** Legal / Buyer / Approver
**I want** to review and approve contract
**So that** สัญญาได้รับการตรวจสอบก่อนมีผลบังคับใช้

### Acceptance Criteria

1. ระบบต้องส่ง Contract เข้าสู่ Review Workflow ได้
2. Reviewer ต้อง Comment, Approve, Reject หรือ Request Revision ได้
3. ระบบต้องเก็บ Review History
4. ระบบต้องรองรับ Parallel Review เช่น Buyer, Legal, Finance
5. Contract ต้อง Active หลังได้รับ Approval ครบ
6. ระบบต้องแจ้งผู้เกี่ยวข้องเมื่อ Contract Active

---

## US-0704: Contract Repository

**As a** Contract Admin / Auditor
**I want** to store contracts in central repository
**So that** ค้นหาและตรวจสอบสัญญาได้จากระบบกลาง

### Acceptance Criteria

1. ระบบต้องเก็บ Contract File และ Metadata ได้
2. ระบบต้องค้นหาสัญญาจาก Vendor, Contract No, Category, BU, Expiry Date และ Status ได้
3. ระบบต้องกำหนดสิทธิ์การดูสัญญาได้
4. ระบบต้องเก็บ Signed Contract Version
5. ระบบต้อง Export Contract List ได้

---

## US-0705: Contract Utilization

**As a** Buyer / Contract Admin
**I want** to track contract utilization
**So that** ควบคุมการใช้วงเงินและเงื่อนไขของสัญญาได้

### Acceptance Criteria

1. ระบบต้องผูก Contract กับ PR / PO / Asset / Rental ได้
2. ระบบต้องแสดง Contract Value, Used Amount, Remaining Amount ได้
3. ระบบต้องแจ้งเตือนเมื่อใช้วงเงินใกล้หมด
4. ระบบต้องป้องกันการใช้ Contract เกินวงเงินถ้า Policy กำหนด
5. ระบบต้องแสดงเอกสารที่อ้างอิง Contract ทั้งหมด

---

## US-0706: Renewal and Expiry Notification

**As a** Contract Owner
**I want** to receive contract expiry and renewal notification
**So that** ไม่พลาดการต่ออายุสัญญาหรือการเปิด Tender ใหม่

### Acceptance Criteria

1. ระบบต้องแจ้งเตือนก่อนหมดอายุ 30 / 60 / 90 วัน
2. Contract Owner ต้องสร้าง Renewal Request ได้
3. ระบบต้องเลือกได้ว่าจะต่อสัญญาเดิมหรือเปิด Strategic Sourcing / e-Bidding ใหม่
4. ระบบต้องแสดง Contract ที่ Expired และ Expiring
5. ระบบต้องเก็บ Renewal History

---

## US-0707: Contract Obligation and Milestone Tracking

**As a** Contract Owner
**I want** to track obligations, deliverables, milestones and SLA
**So that** สามารถติดตามการปฏิบัติตามสัญญาหลังลงนามได้

### Acceptance Criteria

1. ระบบต้องบันทึก Contract Obligation ได้
2. ระบบต้องบันทึก Deliverable และ Due Date ได้
3. ระบบต้องรองรับ Milestone Billing / Milestone Delivery ในเชิงข้อมูลอ้างอิง
4. ระบบต้องแจ้งเตือน Obligation ที่ใกล้ครบกำหนด
5. ระบบต้องบันทึก SLA, Penalty และ Breach Event ได้
6. ระบบต้องเชื่อม Obligation กับ Service Acceptance หรือ GR ได้
7. ระบบต้องแสดง Contract Obligation Dashboard ได้

---

# 13. Core Feature 8: Vendor Management and Portal

## Business Objective

Vendor Management and Portal ใช้บริหาร Vendor ตลอด Lifecycle ตั้งแต่ลงทะเบียน คัดกรอง Qualification ประเมินความเสี่ยง ประเมินผลงาน Blacklist และสื่อสารกับ Vendor ผ่าน Portal

---

## US-0801: Vendor Registration

**As a** Vendor / Buyer
**I want** to register vendor through portal
**So that** ข้อมูล Vendor เข้าสู่ระบบกลางและตรวจสอบได้

### Acceptance Criteria

1. Vendor ต้องลงทะเบียนผ่าน Portal ได้
2. Buyer ต้องสร้าง Vendor แทน Vendor ได้
3. ระบบต้องบังคับกรอกข้อมูลพื้นฐานและเอกสารจำเป็น
4. ระบบต้องตรวจ Duplicate Vendor
5. ระบบต้องส่ง Vendor เข้า Approval Workflow
6. ระบบต้องแจ้งผลการอนุมัติให้ Vendor

---

## US-0802: Vendor Qualification

**As a** Buyer / Procurement Admin
**I want** to qualify vendor before active use
**So that** Vendor ที่ผ่านเกณฑ์เท่านั้นจึงเข้าร่วมจัดซื้อได้

### Acceptance Criteria

1. ระบบต้องกำหนด Qualification Checklist ได้
2. ระบบต้องตรวจเอกสาร Vendor ตามประเภท Vendor
3. ระบบต้องให้ Buyer บันทึกผล Qualified / Not Qualified ได้
4. Vendor ที่ไม่ Qualified ต้องไม่สามารถเข้าร่วม RFQ / Tender ได้
5. ระบบต้องเก็บ Qualification History

---

## US-0803: Vendor Profile and Self-Service

**As a** Vendor
**I want** to manage my vendor profile
**So that** ข้อมูลบริษัท เอกสาร และข้อมูลติดต่อเป็นปัจจุบัน

### Acceptance Criteria

1. Vendor ต้อง Login เข้าระบบได้
2. Vendor ต้องดู Profile ของตนเองได้
3. Vendor ต้องขอแก้ไขข้อมูลได้
4. การแก้ไขข้อมูลสำคัญต้องเข้า Approval
5. Vendor ต้อง Upload เอกสารใหม่เมื่อหมดอายุ
6. ระบบต้องแจ้งสถานะการอนุมัติให้ Vendor

---

## US-0804: Vendor Risk

**As a** Buyer / Risk Owner
**I want** to classify vendor risk
**So that** ควบคุมความเสี่ยงก่อนเลือกใช้ Vendor

### Acceptance Criteria

1. ระบบต้องกำหนด Risk Level เช่น Low, Medium, High, Critical ได้
2. Risk ต้องคำนวณจากข้อมูล เช่น เอกสารหมดอายุ, Claim Rate, Delivery Delay, Evaluation Score, Blacklist Status
3. Buyer ต้อง Override Risk Level ได้ตามสิทธิ์ พร้อมเหตุผล
4. Vendor Risk ต้องแสดงใน Vendor Profile, Sourcing และ Bidding
5. ระบบต้องแจ้งเตือนเมื่อ Vendor Risk สูง

---

## US-0805: Vendor Evaluation

**As a** Buyer / Evaluator
**I want** to evaluate vendor performance
**So that** ใช้ข้อมูลจริงในการบริหารผู้ขายและการคัดเลือกครั้งถัดไป

### Acceptance Criteria

1. ระบบต้องสร้าง Evaluation ตาม Template ได้
2. Evaluation ต้องดึงข้อมูลจาก GR, Claim, On-time Delivery และ Quality Score ได้
3. ผู้ประเมินต้องให้คะแนนและ Comment ได้
4. Evaluation ต้องผ่าน Approval ตาม Rule
5. Vendor ต้องดูผล Evaluation ได้ตามสิทธิ์
6. ระบบต้องเก็บ Evaluation History

---

## US-0806: Blacklist and Block Vendor

**As a** Procurement Admin
**I want** to block or blacklist vendor
**So that** Vendor ที่มีความเสี่ยงหรือไม่ผ่านมาตรฐานไม่สามารถทำธุรกรรมใหม่ได้

### Acceptance Criteria

1. Admin ต้องเปลี่ยนสถานะ Vendor เป็น Blocked หรือ Blacklisted ได้
2. ระบบต้องบังคับกรอกเหตุผลและเอกสารประกอบ
3. การ Blacklist ต้องผ่าน Approval
4. Vendor ที่ Blocked / Blacklisted ต้องไม่สามารถเข้าร่วม RFQ, Tender หรือรับ PO ใหม่ได้
5. ระบบต้องแจ้งผู้เกี่ยวข้องเมื่อ Vendor ถูก Block หรือ Blacklist
6. ระบบต้องเก็บประวัติการ Block / Unblock

---

## US-0807: Vendor Communication Center

**As a** Buyer / Vendor
**I want** to communicate through vendor portal
**So that** การสื่อสารเกี่ยวกับ RFQ, Tender, PO, Claim และ Contract มีหลักฐานในระบบ

### Acceptance Criteria

1. ระบบต้องมี Message Center ระหว่าง Buyer และ Vendor
2. ระบบต้องเชื่อม Communication กับเอกสารต้นทาง เช่น RFQ, Bid, PO, Claim, Contract
3. Vendor ต้องได้รับ Notification เมื่อมีข้อความใหม่
4. Buyer ต้องส่งประกาศหรือ Clarification ให้ Vendor หลายรายได้
5. ระบบต้องเก็บ Communication History
6. ระบบต้องค้นหาข้อความย้อนหลังได้

---

## US-0808: Vendor Re-Qualification

**As a** Buyer
**I want** vendors to be re-qualified periodically
**So that** Vendor ที่ Active อยู่ยังคงผ่านมาตรฐานและเอกสารถูกต้อง

### Acceptance Criteria

1. ระบบต้องกำหนดรอบ Re-Qualification ได้ เช่น รายปี
2. ระบบต้องแจ้ง Buyer และ Vendor ก่อนถึงกำหนด
3. Vendor ต้องอัปโหลดเอกสารใหม่ได้
4. Buyer ต้องประเมิน Re-Qualification Checklist ได้
5. Vendor ที่ไม่ผ่าน Re-Qualification ต้องถูก Suspended หรือ Block ตาม Rule
6. ระบบต้องเก็บ Re-Qualification History

---

# 14. Asset Management Module

## Business Objective

Asset Management ใช้บริหารสินทรัพย์ที่เกิดจากการจัดซื้อหรือบันทึกเพิ่มเติมในระบบ เพื่อให้เห็นสินทรัพย์ที่ถือครอง ปล่อยเช่า โอนย้าย ขาย จำหน่าย และบำรุงรักษาได้ครบถ้วน

---

## US-1001: Asset Acquisition and Registry

**As an** Asset Admin
**I want** to register asset from GR or manual entry
**So that** บริษัทมีทะเบียนสินทรัพย์กลางที่เชื่อมกับ PO, GR, Contract และ BU Owner

### Acceptance Criteria

1. ระบบต้องสร้าง Asset Record จาก GR ได้
2. ระบบต้องสร้าง Asset แบบ Manual ได้ตามสิทธิ์
3. ระบบต้องระบุ Asset Tag, Asset Name, Category, Serial Number, Purchase Price, Purchase Date, PO Ref และ GR Ref ได้
4. ระบบต้องระบุ Owner Company, Owner BU, Responsible Person และ Location ได้
5. ระบบต้องรองรับ Asset Status เช่น Available, In Use, Rented, Under Maintenance, Sold, Scrapped, Lost
6. ระบบต้องแนบรูปและเอกสาร Asset ได้
7. ระบบต้องเก็บ Audit Trail ของ Asset Record

---

## US-1002: Asset Holding and Ownership Console

**As an** Asset Manager / Executive
**I want** to view asset holding by company, BU and location
**So that** เห็นสินทรัพย์ที่องค์กรถือครองและติดตามการใช้งานได้จากหน้าจอเดียว

### Acceptance Criteria

1. ระบบต้องแสดง Asset ทั้งหมดตาม Company, BU, Category, Location และ Status
2. ระบบต้องแสดงมูลค่าทุนรวมของสินทรัพย์
3. ระบบต้องแสดงจำนวน Asset ที่ Available, In Use, Rented, Sold และ Scrapped
4. ระบบต้อง Drill-down ไปยัง Asset Detail ได้
5. ระบบต้องค้นหา Asset ด้วย Asset Tag, Serial Number, PO No, Vendor หรือ Owner ได้
6. ระบบต้อง Export Asset Register ได้
7. ระบบต้องจำกัดสิทธิ์การเห็น Asset ตาม Company / BU / Role

---

## US-1003: Asset Rental Management

**As an** Asset Admin
**I want** to record asset rental and rental price
**So that** ติดตามได้ว่าสินทรัพย์ถูกปล่อยเช่าให้ใคร ที่ไหน ระยะเวลาเท่าไร และราคาเท่าไร

### Acceptance Criteria

1. ระบบต้องสร้าง Rental Record จาก Asset ได้
2. ระบบต้องระบุผู้เช่า ประเภทผู้เช่า สถานที่ใช้งาน วันที่เริ่มเช่า วันที่สิ้นสุด และผู้รับผิดชอบได้
3. ระบบต้องระบุ Rental Price, Billing Cycle, Deposit และเงื่อนไขค่าเสียหายได้
4. ระบบต้องแนบ Rental Contract หรือเอกสารข้อตกลงได้
5. ระบบต้องเปลี่ยนสถานะ Asset เป็น Rented เมื่อ Rental Active
6. ระบบต้องไม่ให้ปล่อยเช่า Asset ซ้ำในช่วงเวลาเดียวกัน
7. ระบบต้องแจ้งเตือนก่อนวันสิ้นสุดการเช่า
8. ระบบต้องบันทึก Rental History ของ Asset
9. ระบบต้องแสดง Rental Value ใน Dashboard

---

## US-1004: Asset Sale and Disposal

**As an** Asset Manager
**I want** to record asset sale, disposal or scrapping
**So that** การขายหรือจำหน่ายสินทรัพย์มีหลักฐานและตรวจสอบย้อนหลังได้

### Acceptance Criteria

1. ระบบต้องสร้าง Asset Disposal Request ได้
2. ระบบต้องระบุ Disposal Type เช่น Sale, Scrap, Lost, Write-off หรือ Donation
3. ระบบต้องระบุราคาขาย ผู้ซื้อ วันที่ขาย และเอกสารประกอบได้
4. Disposal ต้องผ่าน Approval ตามวงเงินหรือ Policy
5. เมื่ออนุมัติ ระบบต้องเปลี่ยนสถานะ Asset เป็น Sold หรือ Scrapped
6. ระบบต้องบันทึกกำไร / ขาดทุนจากการขายในเชิงข้อมูลรายงาน
7. ระบบต้องเชื่อมกับ Contract หรือเอกสารขายได้
8. ระบบต้องเก็บ Disposal History

---

## US-1005: Asset Maintenance and Warranty Tracking

**As an** Asset Admin
**I want** to track maintenance and warranty of assets
**So that** ไม่พลาดวันหมดประกันและสามารถควบคุมค่าใช้จ่ายในการบำรุงรักษาได้

### Acceptance Criteria

1. ระบบต้องบันทึก Warranty Start Date และ Warranty End Date ได้
2. ระบบต้องบันทึก Maintenance Contract Ref ได้
3. ระบบต้องบันทึกประวัติการซ่อม บำรุงรักษา และค่าใช้จ่ายได้
4. ระบบต้องแจ้งเตือนก่อน Warranty หรือ Maintenance Contract หมดอายุ
5. ระบบต้องแสดง Asset ที่มีประวัติซ่อมบ่อย
6. ระบบต้องเชื่อมโยงกับ Vendor หรือ Service Provider ได้

---

## US-1006: Asset Transfer between BU

**As an** Asset Admin
**I want** to transfer asset between BU
**So that** การเปลี่ยนเจ้าของหรือสถานที่ใช้งานสินทรัพย์มีหลักฐานและตรวจสอบได้

### Acceptance Criteria

1. ระบบต้องสร้าง Asset Transfer Request ได้
2. ระบบต้องระบุ From BU, To BU, From Location, To Location และ Responsible Person ใหม่ได้
3. Transfer ต้องผ่าน Approval ตาม Rule
4. ระบบต้องเปลี่ยน Owner / Location หลัง Approve
5. ระบบต้องเก็บ Transfer History
6. ระบบต้องแสดง Asset ที่อยู่ระหว่าง Transfer

---

# 15. Supporting Layer: Management and Control

## US-0901: Single Sign-On and Authentication

**As a** System Admin
**I want** users to login securely
**So that** ควบคุมการเข้าระบบได้ตามมาตรฐานองค์กร

### Acceptance Criteria

1. ระบบต้องรองรับ Local Login
2. ระบบต้องรองรับ SSO / Active Directory ตามที่ตกลง
3. ระบบต้องรองรับ MFA
4. ระบบต้องมี Password Policy
5. ระบบต้องมี Account Lockout
6. ระบบต้องเก็บ Login History
7. ระบบต้องรองรับ Session Timeout

---

## US-0902: Role-Based Access Control

**As a** System Admin
**I want** to control user access by role and organization
**So that** ผู้ใช้งานเห็นและทำรายการได้เฉพาะตามสิทธิ์

### Acceptance Criteria

1. ระบบต้องกำหนด Role ได้
2. ระบบต้องกำหนดสิทธิ์ตาม Company, BU, Cost Center, Category และ Document Type ได้
3. ระบบต้องควบคุมสิทธิ์ Create, View, Edit, Approve, Cancel, Export, Admin ได้
4. Vendor ต้องเห็นเฉพาะข้อมูลของตนเอง
5. ระบบต้องรองรับ Delegated Access
6. ระบบต้องมี Permission Audit

---

## US-0903: Audit Log and Tracking

**As an** Auditor
**I want** to review system audit log
**So that** ตรวจสอบการทำงานย้อนหลังได้ครบถ้วน

### Acceptance Criteria

1. ระบบต้องเก็บ Log การ Create, Edit, Delete, Submit, Approve, Reject, Cancel, Export, Interface
2. Log ต้องมี User, Role, Date, Time, IP Address, Action และ Before / After สำหรับข้อมูลสำคัญ
3. ระบบต้องค้นหา Audit Log ได้
4. ระบบต้อง Export Audit Log ได้ตามสิทธิ์
5. ระบบต้องป้องกันการแก้ไข Audit Log
6. ระบบต้องเก็บ Log ตาม Retention Policy

---

## US-0904: Data Encryption and PDPA Compliance

**As a** Security Admin
**I want** sensitive data to be protected
**So that** ระบบสอดคล้องกับ Security และ PDPA Requirement

### Acceptance Criteria

1. ระบบต้องเข้ารหัสข้อมูลระหว่างรับส่งด้วย TLS
2. ระบบต้องเข้ารหัสข้อมูลสำคัญที่จัดเก็บ
3. ระบบต้อง Mask ข้อมูล Bank Account และข้อมูลส่วนบุคคลตามสิทธิ์
4. ระบบต้องรองรับ Data Retention Policy
5. ระบบต้องรองรับ Consent หรือ Privacy Notice ตามที่กำหนด
6. ระบบต้องมี Export Log เมื่อมีการดึงข้อมูลสำคัญ
7. ระบบต้องรองรับการ Revoke Session

---

## US-0905: Reporting and Analytics

**As a** Management User
**I want** to view procurement reports and analytics
**So that** ใช้ข้อมูลประกอบการตัดสินใจและติดตามประสิทธิภาพจัดซื้อ

### Acceptance Criteria

1. ระบบต้องมี Document Tracking Dashboard
2. ระบบต้องมี Spend Analytics
3. ระบบต้องมี Planned vs Actual Report
4. ระบบต้องมี Vendor Performance Dashboard
5. ระบบต้องมี Contract and Asset Dashboard
6. ระบบต้องมี Exception Report เช่น ค้างอนุมัติ ค้าง GR ค้าง Vendor Response ค้าง Interface
7. ระบบต้อง Export Excel / PDF ได้
8. ระบบต้องควบคุมสิทธิ์การเห็นรายงานตาม Company / BU / Role

---

## US-0906: SAP B1 Integration

**As a** System
**I want** to integrate with SAP B1
**So that** Master Data และ Transaction ที่เกี่ยวข้องถูกเชื่อมโยงกับระบบบัญชีหลัก

### Acceptance Criteria

1. ระบบต้อง Sync Vendor Master กับ SAP B1
2. ระบบต้อง Sync Item Master กับ SAP B1
3. ระบบต้อง Sync Cost Center, GL, Tax Code ตาม Interface ที่ตกลง
4. ระบบต้องส่ง PO ไป SAP B1
5. ระบบต้องส่ง GR / Stock Movement ไป SAP B1 ตาม Scope ที่ตกลง
6. ระบบต้องรับ SAP Reference Number กลับมา
7. ระบบต้องมี Integration Log, Retry, Error Handling และ Reconciliation Report
8. ระบบต้องป้องกัน Duplicate Submission

---

## US-0907: e-Payment Interface Only

**As a** Finance Interface User
**I want** e-Procurement to send payment-ready data to e-Payment
**So that** ระบบ e-Payment สามารถดำเนินการจ่ายเงินต่อได้

### Acceptance Criteria

1. ระบบต้องส่งข้อมูล PO / GR ที่พร้อมส่งต่อ e-Payment
2. Payload ต้องมี Vendor, Vendor Tax ID, Bank Account, PO No, GR Ref, Amount, Currency, Company, Cost Center และ Due Date
3. ระบบต้องรับ Callback Status จาก e-Payment
4. ระบบต้องแสดง Sent, Processing, Success, Failed, Cancelled
5. ระบบต้องรองรับ Idempotency ป้องกันส่งซ้ำ
6. ระบบต้องมี Error Log และ Retry
7. ระบบต้อง Hold การส่งข้อมูลหาก Vendor Bank Pending Verification หรือ Vendor ถูก Block
8. ระบบต้อง Export Interface Log ได้

---

## US-0908: OCR Engine Interface

**As a** Document User
**I want** the system to support OCR engine interface
**So that** เอกสารแนบสามารถนำไปอ่านข้อมูลอัตโนมัติในอนาคตได้

### Acceptance Criteria

1. ระบบต้องออกแบบ Attachment Metadata ให้รองรับ OCR ในอนาคต
2. ระบบต้องส่งเอกสารไป OCR Engine ได้เมื่อเปิดใช้ Feature
3. ระบบต้องรับ OCR Result กลับมาเป็น Draft Data ได้
4. ผู้ใช้งานต้องตรวจสอบและยืนยันข้อมูลก่อนนำไปใช้จริง
5. ระบบต้องเก็บ OCR Confidence Score และ OCR Log

### Scope Note

OCR ใน Phase แรกเป็น Optional / Future Enhancement / Mockup หากยังไม่อยู่ใน Scope พัฒนาจริง

---

## US-0909: AI Engine Interface

**As a** Management User / Buyer
**I want** the system architecture to support future AI engine
**So that** สามารถต่อยอด AI Recommendation, AI Price Benchmarking และ AI Replenishment ได้ในอนาคต

### Acceptance Criteria

1. ระบบต้องออกแบบ Data Structure ให้รองรับ AI ในอนาคต
2. AI Use Case ต้องแยกสถานะเป็น Mockup, Pilot หรือ Production
3. AI Recommendation ต้องไม่ตัดสินใจแทนผู้ใช้โดยไม่มีการยืนยัน
4. ระบบต้องเก็บ Source Data และ Recommendation Log
5. ผู้ใช้ต้องเห็นเหตุผลของ AI Suggestion เมื่อเปิดใช้งาน

---

# 16. Document Status Matrix

| Document            | Status Flow                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Procurement Plan    | Draft, Submitted, Pending Approval, Approved, Revised, Closed, Cancelled                                                      |
| Demand Collection   | Open, Submitted, Consolidated, Closed, Cancelled                                                                              |
| Budget              | Draft, Active, Revised, Closed                                                                                                |
| Budget Request      | Draft, Submitted, Pending Approval, Approved, Rejected, Cancelled                                                             |
| PR                  | Draft, Submitted, Pending Approval, Approved, Rejected, Revised, Converted to Sourcing, Converted to PO, Closed, Cancelled    |
| RFQ / RFI / RFP     | Draft, Published, Vendor Responding, Closed, Evaluated, Shortlisted, Cancelled                                                |
| Bid / Tender        | Draft, Published, Submitted, Opened, Technical Evaluation, Commercial Evaluation, BAFO, Award Pending, Awarded, Cancelled     |
| PO                  | Draft, Pending Approval, Approved, Sent to Vendor, Vendor Acknowledged, Partially Received, Fully Received, Closed, Cancelled |
| GR                  | Draft, Pending QC, QC Passed, QC Failed, Partial Received, Completed, Cancelled                                               |
| Claim               | Open, In Review, Waiting Vendor, Approved, Returned, Compensated, Closed, Cancelled                                           |
| Contract            | Draft, Under Review, Approved, Active, Expiring, Expired, Renewed, Terminated                                                 |
| Asset               | Available, In Use, Rented, Under Maintenance, Transferred, Sold, Scrapped, Lost                                               |
| Vendor              | Draft, Pending Review, Qualified, Active, Suspended, Blocked, Blacklisted                                                     |
| e-Payment Interface | Ready, Sent, Processing, Success, Failed, Retried, Cancelled                                                                  |

---

# 17. Role and Permission Matrix

| Module        | Requester         | Buyer                              | Approver                    | Warehouse         | Vendor               | Admin            | Executive      |
| ------------- | ----------------- | ---------------------------------- | --------------------------- | ----------------- | -------------------- | ---------------- | -------------- |
| MDM           | View              | Request / View                     | Approve                     | View              | Maintain Own Profile | Manage           | View           |
| Planning      | Create Demand     | Consolidate                        | Approve Plan                | View              | -                    | Config           | View Dashboard |
| Budget        | View Own          | View                               | Approve Exception           | -                 | -                    | Setup / Transfer | View Dashboard |
| PR            | Create / Edit Own | Review / Convert                   | Approve / Reject            | View              | -                    | Config           | View           |
| Sourcing      | Request           | Create / Compare / Award Recommend | Approve                     | -                 | Submit Quotation     | Config           | View           |
| Tender        | View              | Create / Manage                    | Approve Award               | -                 | Submit Bid           | Config           | View           |
| PO            | View Own          | Create / Amend / Send              | Approve                     | View              | Acknowledge          | Config           | View           |
| GR            | View              | View                               | Approve Exception           | Create GR / QC    | View Own Delivery    | Config           | View           |
| Claim         | Create / View     | Manage                             | Approve                     | Create / Update   | Respond              | Config           | View           |
| Contract      | Request / View    | Draft / Manage                     | Approve                     | -                 | Sign / View Own      | Config           | View           |
| Vendor Portal | -                 | Communicate                        | Approve Vendor              | -                 | Use Portal           | Manage           | View KPI       |
| Asset         | Request / View    | View                               | Approve Transfer / Disposal | Receive           | -                    | Manage           | View Dashboard |
| Reporting     | View by Scope     | View by Scope                      | View by Scope               | View by Scope     | View Own             | Configure        | View All       |
| Integration   | -                 | View Status                        | -                           | View GR Interface | -                    | Retry / Monitor  | View           |

---

# 18. Interface Specification Summary

| Interface                    | Direction                                   | Trigger                         | Key Payload                                       | Error Handling                   |
| ---------------------------- | ------------------------------------------- | ------------------------------- | ------------------------------------------------- | -------------------------------- |
| Vendor Master to SAP B1      | e-Procurement to SAP B1                     | Vendor Active                   | Vendor Code, Tax ID, Name, Address, Bank, Company | Log, Retry, Manual Correction    |
| Item Master to SAP B1        | e-Procurement to SAP B1                     | Product Active                  | Item Code, Name, Category, UOM, Company Mapping   | Log, Retry, Duplicate Check      |
| Cost Center / GL from SAP B1 | SAP B1 to e-Procurement                     | Scheduled / Manual Sync         | Company, Cost Center, GL, Tax Code                | Log, Exception Report            |
| PO to SAP B1                 | e-Procurement to SAP B1                     | PO Approved                     | PO No, Vendor, Item, Qty, Price, Cost Center      | Log, Retry, SAP Ref              |
| PO Revision to SAP B1        | e-Procurement to SAP B1                     | PO Amendment Approved           | PO No, Version, Before / After                    | Log, Retry                       |
| GR to SAP B1                 | e-Procurement to SAP B1                     | GR Completed                    | GR No, PO No, Qty, Warehouse, Location            | Log, Retry, SAP Ref              |
| Stock Movement to SAP B1     | e-Procurement to SAP B1                     | Return / Write-off / Adjustment | Item, Qty, Movement Type, Location                | Log, Retry                       |
| Asset to SAP Fixed Asset     | e-Procurement to SAP B1                     | Asset GR Completed              | Asset Code, Purchase Price, Owner, Cost Center    | Log, Retry, Duplicate Prevention |
| e-Payment Trigger            | e-Procurement to e-Payment                  | Payment Ready                   | Vendor, Bank, PO, GR, Amount, Due Date            | Log, Retry, Idempotency          |
| e-Payment Callback           | e-Payment to e-Procurement                  | Payment Status Update           | Transaction Ref, Status, Error Code               | Log, Status Update               |
| OCR Engine                   | e-Procurement to OCR / OCR to e-Procurement | Attachment Uploaded             | File, Metadata, OCR Result                        | Confidence Score, Manual Confirm |
| AI Engine                    | e-Procurement to AI / AI to e-Procurement   | Future / Mockup                 | Spend, Vendor, Price, Stock, Evaluation           | Recommendation Log               |

---

# 19. KPI and Report Catalogue

| Dashboard / Report   | KPI / Data Point                                                        |
| -------------------- | ----------------------------------------------------------------------- |
| Procurement Planning | Planned Amount, Actual Amount, Variance, Unplanned Purchase             |
| Budget Dashboard     | Budget Amount, Reserved, Commitment, Used, Available, Over Budget       |
| PR Dashboard         | PR Count, Pending Approval, PR Cycle Time, Rejected PR                  |
| PO Dashboard         | PO Count, PO Cycle Time, Vendor Acknowledgement SLA, PO Closure         |
| Sourcing Dashboard   | RFQ Response Rate, Quotation Saving, Shortlist Vendor, Award Cycle Time |
| Tender Dashboard     | Bid Participation, Technical Pass Rate, BAFO Saving, Award Lead Time    |
| GR Dashboard         | On-time Delivery, Partial Receipt, QC Fail Rate, Claim Rate             |
| Inventory Dashboard  | Stock Balance, Near Expiry, Slow Moving, Write-off                      |
| Asset Dashboard      | Asset Holding, Rental Value, Maintenance Cost, Disposal Value           |
| Contract Dashboard   | Expiring Contract, Utilization, Remaining Value, SLA Breach             |
| Vendor Dashboard     | Vendor Score, Risk Level, Claim Rate, Delivery Performance              |
| Interface Dashboard  | Success Rate, Failed Transaction, Retry Count, Pending Interface        |
| Audit Report         | User Action, Export Log, Approval Log, Interface Log                    |
| Exception Report     | Pending Approval, Pending GR, Vendor No Response, Interface Failed      |

---

# 20. Test Coverage Matrix

| Test Type           | Coverage                                                                               |
| ------------------- | -------------------------------------------------------------------------------------- |
| Positive Test       | Create Master Data, Create PR, Approve PR, Create PO, GR, Interface Success            |
| Negative Test       | Budget Not Enough, Vendor Blacklisted, SAP Mapping Missing, Late Bid, Expired Contract |
| Boundary Test       | Over Budget Tolerance, Over Receipt Tolerance, Contract Value Near Limit, Bid Deadline |
| Permission Test     | Vendor sees only own data, BU sees own BU, Executive sees dashboard by role            |
| Integration Test    | SAP B1 Success / Failed / Retry, e-Payment Callback Success / Failed                   |
| Workflow Test       | Sequential Approval, Parallel Approval, Delegation, Escalation                         |
| Security Test       | MFA, Password Policy, Account Lockout, Session Timeout, Audit Log                      |
| Regression Test     | PR Amendment, PO Revision, Budget Release, Vendor Status Change                        |
| UAT E2E Test        | Plan to PR to Tender to PO to GR to SAP / e-Payment Interface                          |
| Data Migration Test | Upload Vendor, Item, Cost Center, Asset, Contract, Error Report                        |

---

# 21. End-to-End UAT Scenarios

## Scenario 1: Annual Plan to PR to PO

1. BU สร้าง Annual Procurement Plan
2. Procurement Planner รวม Demand
3. Accounting ผูก Budget กับ Plan
4. Requester สร้าง PR จาก Plan
5. ระบบตรวจ Budget และ Reserve Budget
6. Approver อนุมัติ PR
7. Buyer สร้าง PO
8. Vendor ตอบรับ PO
9. Warehouse รับสินค้า
10. Dashboard แสดง Planned vs Actual

## Scenario 2: Requirement-Based PR to Strategic Sourcing

1. Requester เปิด Requirement-Based PR
2. Requester ระบุความต้องการและแนบ TOR
3. Buyer เปิด RFI หรือ RFP
4. Vendor ส่ง Proposal
5. Buyer ทำ Quotation / Proposal Comparison
6. Buyer Shortlist Vendor
7. ระบบสร้าง PR Line หรือส่งต่อ e-Bidding
8. Approver อนุมัติ
9. Buyer สร้าง PO หรือ Contract

## Scenario 3: Standalone Tender to PR to PO

1. Buyer เปิด Standalone e-Bidding โดยไม่อ้างอิง PR
2. Buyer เชิญ Vendor
3. Vendor ส่ง Bid
4. Committee เปิดซองและประเมิน Technical / Commercial
5. Buyer ขอ BAFO
6. Committee Award
7. ระบบสร้าง Draft PR เพื่อของบประมาณ
8. PR ได้รับอนุมัติ
9. ระบบสร้าง PO จาก Award
10. Vendor ตอบรับ PO

## Scenario 4: PR-Linked Tender

1. Requester สร้าง PR
2. ระบบตรวจ Budget
3. Approver อนุมัติ PR
4. Buyer เปิด e-Bidding โดย Ref PR
5. Vendor ส่ง Bid
6. Committee ประเมิน
7. Buyer Award
8. ระบบตรวจ Award Amount เทียบ Budget
9. ระบบสร้าง PO
10. Vendor ตอบรับ PO

## Scenario 5: PO to GR to Asset Interface

1. Buyer สร้าง PO สำหรับ Asset
2. Vendor ตอบรับ PO
3. Warehouse รับสินค้า
4. QC ตรวจรับ
5. ระบบสร้าง GR
6. ระบบสร้าง Asset Record
7. ระบบส่งข้อมูลไป SAP Fixed Asset Interface
8. Asset Admin ระบุ Owner และ Location
9. Dashboard แสดง Asset Holding

## Scenario 6: Asset Rental

1. Asset Admin เลือก Asset ที่ Available
2. สร้าง Rental Record
3. ระบุผู้เช่า ระยะเวลา ราคาเช่า และ Billing Cycle
4. แนบ Rental Contract
5. ระบบเปลี่ยนสถานะ Asset เป็น Rented
6. ระบบแจ้งเตือนก่อนหมดอายุเช่า
7. ปิด Rental และ Asset กลับเป็น Available
8. Dashboard แสดง Rental Value

## Scenario 7: Vendor Lifecycle

1. Vendor ลงทะเบียน
2. Buyer ตรวจเอกสาร
3. ระบบตรวจ Duplicate
4. Buyer ทำ Qualification
5. Vendor Active
6. Vendor เข้าร่วม RFQ / Tender
7. Vendor ได้รับ Evaluation
8. Vendor Risk เปลี่ยนเป็น High
9. Procurement Admin Block Vendor
10. ระบบห้าม Vendor เข้าร่วมงานใหม่

## Scenario 8: e-Payment Interface Only

1. PO / GR ครบเงื่อนไขพร้อมส่งต่อ
2. ระบบตรวจ Vendor Bank Status
3. ระบบส่ง Payload ไป e-Payment
4. e-Payment ตอบ Processing
5. e-Payment ส่ง Callback Success หรือ Failed
6. ระบบแสดง Interface Status
7. กรณี Failed ระบบ Retry
8. Dashboard แสดงรายการค้าง Interface

---

# 22. Required Data Model Groups

## Foundation Data

1. Product
2. Service
3. Vendor
4. Asset
5. Organization
6. Company
7. BU
8. Cost Center
9. Category
10. DOA
11. Financial Master
12. E-Document Template
13. Evaluation Template

## Planning Data

1. Procurement Plan
2. Demand Collection
3. Plan Line
4. Procurement Calendar
5. Planned vs Actual Snapshot

## Budget Data

1. Budget Header
2. Budget Line
3. Budget Reservation
4. Budget Commitment
5. Budget Transfer
6. Budget Transaction Log
7. Budget Reconciliation

## Procurement Data

1. PR Header
2. PR Line
3. PR Amendment
4. PR Consolidation
5. PO Header
6. PO Line
7. PO Amendment
8. Document Timeline

## Sourcing and Tender Data

1. RFI
2. RFQ
3. RFP
4. Sourcing Event
5. Vendor Shortlist
6. Bid Event
7. Vendor Invitation
8. Bid Submission
9. Technical Score
10. Commercial Score
11. BAFO
12. Award

## Fulfillment Data

1. GR Header
2. GR Line
3. QC Result
4. Claim
5. Return Note
6. Stock Movement
7. Lot / Serial / Expiry
8. Put Away

## Asset Data

1. Asset Register
2. Asset Location
3. Asset Rental
4. Asset Transfer
5. Asset Disposal
6. Asset Maintenance
7. Asset Interface Log

## Contract Data

1. Contract Request
2. Contract Header
3. Contract Version
4. Contract Attachment
5. Contract Utilization
6. Contract Obligation
7. Renewal Request

## Vendor Data

1. Vendor Registration
2. Vendor Qualification
3. Vendor Risk
4. Vendor Evaluation
5. Vendor Communication
6. Vendor Blacklist History
7. Vendor Re-Qualification

## Control Data

1. Workflow
2. Approval Step
3. Notification
4. Audit Log
5. Integration Log
6. Interface Retry
7. Security Event

---

# 23. Open Decision Log

| Decision                                                                  | Owner                 | Impact            |
| ------------------------------------------------------------------------- | --------------------- | ----------------- |
| Go-live Scope ใช้ Must ทั้งหมด หรือแบ่ง Phase                             | PM / Customer         | Scope, Timeline   |
| SAP B1 Interface Method ใช้ API, Web Service หรือ Database                | IT / SAP Owner        | Architecture      |
| ระบบใดเป็น Master ของ Vendor, Item, Price, Cost Center                    | Customer / IT         | Data Governance   |
| DOA Matrix แยก 15 บริษัท                                                  | Customer              | Workflow          |
| Bidding Go-live รองรับ RFQ เท่านั้น หรือรวม Sealed Bid, Multi-round, BAFO | Procurement           | Development Scope |
| e-Payment Payload และ Callback Format                                     | Integration Team      | Interface         |
| Asset เชื่อม SAP Fixed Asset ระดับใด                                      | Accounting / IT       | Asset Scope       |
| Asset Rental ใช้เฉพาะ Internal BU หรือรวม External Customer               | Business Owner        | Asset Scope       |
| Contract ต้องใช้ E-Sign Provider ใด                                       | Legal / IT            | Contract Scope    |
| Notification ใช้ Email, Teams, Line หรือ In-app                           | Customer              | Integration       |
| OCR เป็น Future หรือ Production                                           | Sponsor               | Scope Control     |
| AI เป็น Mockup, Pilot หรือ Production                                     | Sponsor               | Scope Control     |
| Vendor ลงทะเบียนเองหรือ Buyer สร้างเป็นหลัก                               | Procurement           | Vendor Portal     |
| Vendor Bank Change Dual Approver เป็นฝ่ายใด                               | Procurement / Finance | Security          |
| UAT จะทดสอบแบบ Module-by-Module หรือ End-to-End                           | PM / Customer         | UAT Plan          |

---

# 24. Definition of Ready

User Story จะพร้อมเข้าสู่ Development เมื่อมีข้อมูลครบดังนี้

1. Business Owner ยืนยัน Scope แล้ว
2. Business Rule ชัดเจน
3. Role and Permission ชัดเจน
4. Field หลักและ Validation ชัดเจน
5. Status Flow ชัดเจน
6. Workflow Rule และ DOA ชัดเจน
7. Integration Requirement ชัดเจน
8. Acceptance Criteria ทดสอบได้
9. Mockup หรือ Screen Flow พร้อมสำหรับหน้าจอที่ซับซ้อน
10. Test Scenario เบื้องต้นพร้อม
11. Data Migration Impact ได้รับการระบุแล้ว
12. Report / Dashboard Impact ได้รับการระบุแล้ว
13. Open Decision ที่กระทบ Development ถูกปิดแล้ว หรือมี Assumption ชัดเจน

---

# 25. Definition of Done

User Story จะถือว่าเสร็จเมื่อผ่านเงื่อนไขต่อไปนี้

1. Development เสร็จตาม Acceptance Criteria
2. Unit Test ผ่าน
3. SIT ผ่าน
4. Integration Test ผ่านสำหรับ Story ที่เชื่อม SAP B1 หรือ e-Payment
5. Permission Test ผ่าน
6. Audit Log ตรวจสอบได้
7. Error Handling ทำงานได้
8. QA Retest ผ่าน
9. UAT ผ่านโดยลูกค้า
10. ไม่มี Critical หรือ High Defect ค้าง
11. User Manual หรือ Release Note ได้รับการอัปเดต
12. Dashboard หรือ Report ที่เกี่ยวข้องได้รับการตรวจสอบแล้ว

---

# 26. Final Recommendation

User Story Baseline v2.2 นี้สามารถใช้เป็น Baseline สำหรับ SRS, Screen Inventory, API Specification, Data Model, Sprint Backlog, SIT Test Case และ UAT Script ได้ โดยควรใช้แนวทางพัฒนาเป็นลำดับดังนี้

1. Foundation MDM
2. Organization, DOA, Financial Master และ Security
3. Procurement Planning
4. Budget Control
5. e-Purchasing PR / PO
6. Strategic Sourcing
7. e-Bidding / Tender Management
8. Goods Receipt, Inventory and Asset Interface
9. Contract Management
10. Vendor Management and Portal
11. Reporting and Analytics
12. SAP B1 Integration
13. e-Payment Interface Only
14. Data Migration, Training, Go-live และ Hypercare

ลำดับนี้จะลดความเสี่ยงด้านข้อมูลและ Integration เพราะ Module ส่วนใหญ่ต้องพึ่งพา Master Data, Organization, DOA, Financial Master, Vendor, Product, Budget และ SAP B1 Mapping ก่อนเสมอ

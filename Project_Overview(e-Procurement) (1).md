# Project Overview — e-Procurement (P2P System)

## SCGJWD Procurement Vendor Register (e-Procurement)

| รายการ | รายละเอียด |
|---|---|
| Project Code | PJ250051 |
| Project Name | SCGJWD Procurement Vendor Register (e-Procurement) |
| Customer | SCGJWD Logistics Public Company Limited |
| Developed by | Dynamic IT Solutions Co., Ltd. (DITS) — In-house Development |
| Document Type | Project Overview (สรุปภาพรวมโครงการ) |
| Document Version | VD01.00.00 |
| จัดทำโดย | Business Analyst / System Analyst |
| สถานะเอกสาร | Draft สำหรับทบทวนร่วมกับทีมโครงการ |

อ้างอิงเอกสารต้นทาง: I_Kick_Off_Presentation_PJ250051_DITS_VD01.00.00, E_Business_Solution_&_Design_PJ250051_DITS_VD01.00.00 (Sign), I_Project_Management_Process_Description_DITS_VD02.00.00, TOR_P2P_Function_Requirement_VD2.00.1 (Final)

---

## 1. Executive Summary

โครงการนี้คือการพัฒนาระบบ **e-Procurement / P2P (Procure-to-Pay)** ให้กับ SCGJWD Logistics เพื่อแก้ปัญหาการจัดซื้อที่กระจัดกระจายในปัจจุบัน และสร้างระบบกลางที่เชื่อมต่อกับ SAP B1 ครอบคลุมตั้งแต่การลงทะเบียนผู้ขาย (Vendor Register) การขอซื้อ (PR) การเปรียบเทียบราคา/ประมูล (Bidding) การออกใบสั่งซื้อ (PO) การรับสินค้า (GR) ไปจนถึงการตั้งวางบิลและจ่ายเงิน (Invoice to Payment) โดยอ้างอิงตามขอบเขตงานในเอกสาร Business Solution & Design (BSD)

ระบบถูกออกแบบไว้ในภาพ Roadmap ให้ครอบคลุม **All Companies (ประมาณ 15 บริษัทในเครือ)** และมีการวาง Vision ระยะยาวที่จะนำ **AI** เข้ามาเสริมในหลายจุดของ Flow (DOA อัตโนมัติ, OCR, AI Suggestion จากข้อมูลตลาด/Social Listening, AI Replenishment ฯลฯ)

ปัจจุบันมีความต้องการ **ปรับลดระยะเวลาพัฒนาจาก 5 เดือน เหลือ 3 เดือน** สำหรับการส่งมอบรอบแรก และ **ตัด AI ออกจาก Phase แรก** เพื่อให้ระบบ Go-live ได้เร็วขึ้น เอกสารนี้จึงทำหน้าที่สรุปภาพรวมโครงการทั้งหมด ทั้งขอบเขตเดิม ขอบเขตที่ตัดเพื่อ Phase 1 และแผนการแบ่ง Phase ที่เหลือ เพื่อให้ทุกฝ่าย (ลูกค้า, PM, BA/SA, ทีม Dev) เข้าใจภาพเดียวกันก่อนเริ่มงาน

---

## 2. ที่มาและความจำเป็นของโครงการ (Background)

### 2.1 ปัญหาที่ลูกค้าพบในปัจจุบัน (Customer Pain Points)

อ้างอิงจาก I_Kick_Off_Presentation:

1. **ข้อมูลผู้ขายและสินค้าไม่เป็นศูนย์กลาง** — มีการเก็บข้อมูลซ้ำในหลาย BU ไม่สามารถใช้ข้อมูลร่วมกันได้
2. **การสร้าง PR/PO ล่าช้า** — ต้องตรวจสอบงบประมาณและอนุมัติหลายขั้นตอนในระบบต่างกัน
3. **การเปรียบเทียบราคาและการประมูลทำด้วยมือ** — ไม่มีระบบรวมข้อมูลการเสนอราคาจากหลาย Vendor
4. **ขาดความเชื่อมโยงกับ SAP B1** — ทำให้ต้องกรอกข้อมูลซ้ำระหว่างระบบ E-Procurement กับระบบบัญชีหลัก
5. **การติดตามสถานะเอกสารไม่ชัดเจน** — ผู้ใช้งานไม่สามารถดูสถานะ PR/PO/GR แบบ Real-Time ได้
6. **ไม่มี Dashboard รวมข้อมูล** — การวิเคราะห์และรายงานผลใช้เวลานาน ต้องรวบรวมจากหลายแหล่ง

### 2.2 วัตถุประสงค์ของโครงการ (Objectives)

1. ทำให้ข้อมูลเป็นศูนย์กลาง (Centralized Data) สำหรับสินค้า ผู้ขาย และเอกสารจัดซื้อ
2. ลดระยะเวลาและขั้นตอนการทำงาน ด้วยการอนุมัติอัตโนมัติและเชื่อมต่อกับ SAP B1
3. เพิ่มความโปร่งใสและตรวจสอบได้ในทุกขั้นตอนของการจัดซื้อและการเลือกผู้ขาย
4. รองรับการวิเคราะห์ข้อมูลเชิงกลยุทธ์ผ่านรายงานและ Dashboard
5. เพิ่มความสะดวกให้ Vendor ในการลงทะเบียน เสนอราคา และยืนยัน PO ผ่าน Portal
6. ลดความผิดพลาดจากการกรอกข้อมูลซ้ำ และปรับปรุงความถูกต้องของข้อมูลทางบัญชี

### 2.3 บริการที่ระบบต้องครอบคลุม (Service Requirement)

ระบบถูกออกแบบเพื่อบริหารกระบวนการจัดซื้อภายในองค์กรแบบครบวงจร ตั้งแต่การลงทะเบียนผู้ขาย, การขอซื้อ (PR), การเปรียบเทียบราคา, การออกใบสั่งซื้อ (PO), การรับสินค้า (GR) จนถึงการรายงานและวิเคราะห์ข้อมูล โดยเชื่อมโยงข้อมูลกับ SAP B1 (SCGJWD) เพื่อให้การทำงานเป็นแบบอัตโนมัติและลดความซ้ำซ้อน ฟังก์ชันหลักประกอบด้วย:

- การลงทะเบียนและจัดการข้อมูลผู้ขาย (Vendor Registration & Management)
- การจัดการข้อมูลสินค้าและราคา (Product Catalog & Master Data)
- การสร้าง PR/PO และตรวจสอบงบประมาณ (Procurement & Budget Control)
- การบริหารการประมูลและคัดเลือกผู้ขาย (Bidding & Vendor Evaluation)
- การรับสินค้าและจัดการเคลม (Goods Receipt & Claim Management)
- การแสดงผลรายงานและ Dashboard วิเคราะห์ข้อมูลจัดซื้อ (Reporting & Analytics)
- การเชื่อมโยงข้อมูลกับ SAP B1 และควบคุมสิทธิ์ผู้ใช้งาน (Integration & Security Control)

---

## 3. ผู้มีส่วนเกี่ยวข้องในโครงการ (Project Stakeholders)

### 3.1 ฝั่งลูกค้า (Customer — SCGJWD)

| No. | Name-Surname | Position ในองค์กร | บทบาทในโครงการ |
|---|---|---|---|
| 1 | Atipop Raveewong | Vice President Procurement Supply Chain Management | Vice President Procurement Supply Chain Management |
| 2 | Vachiravit Junpen | Senior Purchasing Supervisor (B2C) | Project Manager (ฝั่งลูกค้า) |

### 3.2 ฝั่งผู้พัฒนา (DITS)

| No. | Name-Surname | Position ในองค์กร | บทบาทในโครงการ |
|---|---|---|---|
| 1 | Nuttapon Sirichotirut | Business Development Manager | Business Development Manager |
| 2 | Krittika Jantree | Business Analyst | Business Analyst |
| 3 | Nattida Horata | Project Manager | Project Manager |
| 4 | Ratmanee Thasai | Corporate Digital Marketing & Technology Department | Corporate Digital Marketing & Technology Department |

> หมายเหตุ: รายชื่อข้างต้นเป็น Core Team ที่ระบุในเอกสาร Kick-off เริ่มต้น เมื่อเข้าสู่ Phase พัฒนาจริงจะต้องเพิ่ม Developer Team, Tester Team, และอาจมี Key User ฝั่งจัดซื้อ/บัญชี/ผู้แทนแต่ละ BU เข้ามาร่วม UAT เพิ่มเติม

---

## 4. ขอบเขตของโครงการ (Project Scope)

### 4.1 ขอบเขตระบบที่เกี่ยวข้อง (System Boundary)

อ้างอิงจาก Business Solution & Design Document หัวข้อ Business Process (Project Scope / High Level) ระบุระบบที่เกี่ยวข้องในเครือข่ายธุรกิจไว้ 3 กลุ่มหลัก:

| กระบวนการ | ระบบที่เกี่ยวข้อง |
|---|---|
| Register Vendor | Web, SAP |
| Catalog | Web, SAP |
| Bidding | Web, SAP |

โครงการที่พัฒนาขึ้นจะอ้างอิงการ Implement ครอบคลุม **รวม 15 บริษัท (Company)** ภายในขอบเขตของงานตามเอกสาร Business Solution & Design

### 4.2 ขอบเขตที่ "ไม่รวม" ตามเอกสาร Quotation ต้นฉบับ (Out of Scope — สำคัญมาก)

ตามหมายเหตุในเอกสาร Deliverable Document (แนบในใบเสนอราคา) ระบุไว้อย่างชัดเจนว่า **ขอบเขตของงานไม่รวมถึง**:

- การเชื่อมต่อกับระบบใด ๆ และไม่มีการส่งข้อมูลผ่าน **MDM (Master Data Management)**
- การแลกเปลี่ยนข้อมูลระหว่างกันโดยตรงระหว่าง **Vendor Portal ↔ Billing System** (ระบบไม่มี Link เข้าสู่ Billing System)

> **⚠️ ข้อควรทราบ / จุดที่ต้อง Confirm กับลูกค้าก่อนเริ่มงาน:** ข้อความข้างต้นมาจากเอกสารใบเสนอราคา/Deliverable Document ฉบับเดิม ซึ่ง**ขัดแย้งโดยตรง**กับเอกสาร TOR_P2P_Function_Requirement (ฉบับล่าสุด) ที่ระบุให้ **SAP B1 Integration และ MDM เป็น Must (M)** ในหลายจุด (เช่น Vendor Master Sync SAP, Item Code Governance, PR/PO/GR/Invoice/Payment Integration กับ SAP B1) จึงจำเป็นต้อง**ยืนยันกับลูกค้าอีกครั้ง**ว่าข้อความ Exclusion นี้ยังมีผลบังคับใช้หรือถูก Supersede ไปแล้วโดย TOR ฉบับใหม่ เพราะมีผลกระทบต่อ Effort และราคาโครงการอย่างมีนัยสำคัญ

### 4.3 ขอบเขตฟังก์ชันตามเอกสาร TOR ฉบับล่าสุด (Functional Scope Reference)

เอกสาร TOR_P2P_Function_Requirement_VD2.00.1 (Final) คือเอกสารที่ลงรายละเอียด Function ระดับ Operational มากที่สุด แบ่งเป็น 3 ชีท:

| Sheet | จำนวน Requirement | ครอบคลุม |
|---|---|---|
| 1. Purchase & Vendor Portal | 204 ข้อ | Master Data, Procurement, Bidding, PR/PO, GR/Stock, Document Mgmt, Vendor Portal, Invoice & Payment เบื้องต้น, Reporting, Technical/Non-Functional, Workflow, Security, Implementation |
| 2. Vendor to Payment | 293 ข้อ | AP/Payment เต็มรูปแบบ (Vendor to Payment) + **Employee to Payment** (ESS: Travel/Advance/Expense/Medical/Payroll) + Reporting + Technical/Security ที่ซ้ำกับ Sheet 1 |
| 3. e-Bidding | 4 ข้อ | รูปแบบการประมูล 3 แบบ + เงื่อนไขการจ่ายเงินผ่าน e-Procurement |

โดยรวมมี Function ที่เกี่ยวข้องกับ P2P โดยตรง (ไม่รวม Employee-to-Payment) ประมาณ **341 Requirements** ซึ่งเกินกว่าที่จะทำให้เสร็จใน 3 เดือนได้ทั้งหมด จึงต้องมีการจัดลำดับความสำคัญ (Prioritization) ใหม่ ตามหัวข้อที่ 7

---

## 5. ภาพรวมระบบ (System Overview)

### 5.1 ภาพรวม Diagram กระบวนการ "Back Office Improvement | Purchase to Pay | P2P System" (All Companies)

ระบบถูกออกแบบเป็น 25 ขั้นตอนหลัก แบ่งเป็น 3 บทบาทผู้ใช้งาน (Employee / Vendor Portal / E-Procurement-จัดซื้อ) คร่อมไปบน 12 กลุ่มกระบวนการ ตั้งแต่ Master Data จนถึง Performance:

| ลำดับกลุ่ม | กลุ่มกระบวนการ | ขั้นตอนสำคัญ (No. ใน Diagram) |
|---|---|---|
| 0 | Master Data | Product/Service, Vendor, Asset, Organization, DOA, Billing Doc, Evaluation |
| 1 | Request → Vendor Selection | 1. E-Catalog/New Request, 2. Request Quotation/Bidding, 3. Propose Quotation, 4. Assess & Select, 5. Selection Result |
| 2 | Register → PR → PO | 6. Register Vendor, 7. Vendor Profile, 8. Auto PR & Approve, 9. Auto PO & Approve |
| 3 | GR (Goods Receipt) | 10. Accept & Inform, 11. Delivery, 12. Goods Receipt & Evaluate, 13. Stock, 14. Claim & Complaint, 15. Corrective & Preventive |
| 4 | Billing | 16. Submit Document, 17. Document Processing |
| 5 | Verify / AP Posting | 18. Document Verification, 19. Auto AP |
| 6 | Payment | 20. Outgoing Payment, 21. Receive Payment Due |
| 7 | Document | 22. Document Management |
| 8 | Performance | 23. Vendor Evaluation, 24. Evaluation Response, 25. KPI Report |

จุดที่มี **AI** เข้ามาเกี่ยวข้องตาม Vision เดิมของ Diagram มีทั้งหมด **9 จุด**: AI scraping ข้อมูลตลาด/ผู้ขาย (จุด 1), AI suggestion จาก Social Listening (จุด 2), DOA AI (จุด 6), AI detect ตอนรับสินค้า (จุด 4 ของแผนภาพ AI), AI Replenishment (จุด 5), OCR Engine (จุด 7), AI metadata & Indexing เพื่อจัดเก็บเอกสาร (จุด 8), AI suggestion จากผล Evaluation ของ Vendor (จุด 9)

### 5.2 E-Procurement & P2P System Roadmap (ภาพรวม Vision ระยะยาว)

Roadmap แบ่งเสาหลักเป็น **3 กลุ่ม** บนฐาน **0. Master Data Management (MDM)**:

1. **E-Purchasing** — PR, PO, E-Bidding, Stock, Evaluate, Analytics, Register Vendor
2. **Vendor Portal** — สำหรับ E-Procurement / Vendor to Pay
3. **Vendor to Pay** — Document / Accounting

แต่ละกลุ่มแตกเป็น Sub-module ย่อยอีก เช่น 1.0 Budget Control, 1.1 PR/PO, 1.2 E-Bidding, 1.3 GR, 1.4 Stock, 1.5 Evaluation, 1.6 Analytics, 1.7 Other, 2.1 Vendor Management และมีแถบ Management & Control ครอบคลุม Security & Access (SSO, Role-Based, MFA, Audit Log, PDPA) และ API & Integration (SAP B1, Master Data: MDM, DOA, OCR Engine, AI Engine, Vendor Portal, Employee Portal)

---

## 6. แผนงานเดิมของโครงการ (Original Project Plan — 5 เดือน)

ตามเอกสาร Kick-off เดิม วางแผนไว้ **5 เดือน (M1–M5, สัปดาห์ที่ 1–20)** ดังนี้:

| Task | ช่วงเวลา (สัปดาห์โดยประมาณ) |
|---|---|
| Project Kick Off Meeting (Internal + External) | W1–W2 |
| Requirement Gathering | W2–W4 |
| System Requirement Specification (SRS) | W3–W6 |
| SRS Approval | W6 |
| Develop & Unit Testing | W3–W12 |
| System Integration Testing (SIT) | W10–W13 |
| User Acceptance Testing (UAT) | W14–W15 |
| Implementation (Software Update / Data Migration & Configuration / Tuning & Configuration) | W14–W17 |
| Training | W18 |
| Release Production (Go-live) | W19–W20 |

### ข้อมูลเชิงพาณิชย์ (Commercial Reference)

| รายการ | รายละเอียด |
|---|---|
| Quotation No. | JUN25/R334 |
| PO No. | ยังไม่ได้รับ PO (ขณะออกแบบเริ่มพัฒนาล่วงหน้าตามแผน) |
| มูลค่างาน (Net) | 6,240,000.00 บาท |
| ภาษีมูลค่าเพิ่ม (7%) | 436,800.00 บาท |
| มูลค่างานรวม (Grand Total) | 6,676,800.00 บาท |
| Delivery | 12 เดือน |
| Price Validation | 30 วัน |
| เงื่อนไขการจ่ายเงิน | 30% เมื่อเซ็น PO/Contract, 30% เมื่อเซ็น SRS, 30% เมื่อเซ็น UAT, 10% เมื่อส่งมอบ Delivery Document (Go-live) |
| ผู้รับผิดชอบพัฒนา | In-house Development (DITS) |
| Maintenance หลังส่งมอบ | Free MA 6 เดือน หลังจากนั้นมีค่าบริการดูแลรักษาตามเอกสาร MA 18% ต่อปี ของมูลค่างาน |

> หมายเหตุ: เอกสาร Baseline ของ Business Solution & Design ลงวันที่ 21 พ.ค. 2568 (21MAY25) และมีการ Internal Kick Off ระบุไว้ในเอกสารฉบับล่าสุด — หากมีช่วงเวลาห่างจากแผนเดิมพอสมควร ควรตรวจสอบว่าเอกสาร TOR ฉบับ Final ที่ใช้ในปัจจุบันคือฉบับปรับปรุงล่าสุดที่ทุกฝ่าย Sign-off ร่วมกันแล้วหรือยัง ก่อนเริ่มงานพัฒนาจริง

---

## 7. ความจำเป็นในการปรับแผน (Re-plan): จาก 5 เดือน เหลือ 3 เดือน และตัด AI ออก

เนื่องจากข้อจำกัดด้านเวลาที่ต้องการให้ระบบ Go-live เร็วขึ้น (จาก 5 เดือนเหลือ 3 เดือน, ลดลง ~40%) และต้องการลดความซับซ้อนของ Phase แรกโดย**ไม่มี AI เข้ามาเกี่ยวข้อง**ในรอบแรก จึงมีความจำเป็นต้อง:

1. **คัดเลือก Function เฉพาะที่จำเป็นต่อการ Go-live ได้จริง (MVP)** จาก 341 Requirements ในเอกสาร TOR ให้เหลือ Scope ที่ทำได้ใน 3 เดือน
2. **แทนที่ AI Touchpoint ทั้ง 9 จุดด้วยกระบวนการ Manual/Rule-based** ที่เทียบเท่ากันในเชิง Workflow (เช่น DOA Engine แบบ Config-based แทน AI Suggestion, Key-in แทน OCR)
3. **แยก Employee-to-Payment (ESS)** ออกจาก Phase แรก เนื่องจากเป็น Domain คนละ User Journey กับ P2P (พบใน Sheet 2 ของ TOR มากกว่า 130 ข้อ)
4. **แบ่งทีม Dev เป็น Squad คู่ขนาน** โดยมี Master Data Management (MDM) และ SAP B1 Integration เป็น Critical Path ที่ต้องเริ่มก่อน

---

## 8. แผนการแบ่ง Phase เพื่อปิดโปรเจค (Phased Roadmap)

เพื่อให้ Scope ทั้งหมดถูกส่งมอบอย่างเป็นระบบและลูกค้าสามารถตรวจสอบขอบเขตทีละ Phase ได้ จึงแบ่งงานออกเป็น 4 Phase ดังนี้:

| Phase | ชื่อ Phase | ระยะเวลา (ประมาณ) | เป้าหมายหลัก | มี AI หรือไม่ |
|---|---|---|---|---|
| Phase 1 | P2P Core MVP | 3 เดือน | Flow หลักใช้งานได้จริง: MDM → PR → Bidding พื้นฐาน → PO → GR → Invoice → Payment, เชื่อม SAP B1, Security พื้นฐาน | ไม่มี |
| Phase 2 | P2P Enhancement & Compliance | 2–3 เดือน | Sourcing/Evaluation/Analytics เต็มรูปแบบ, Compliance ระดับสูง, AP ขั้นสูง | ไม่มี |
| Phase 3 | Employee to Payment (ESS) | 2–3 เดือน | ระบบเบิกจ่ายพนักงาน (Travel/Advance/Expense/Medical) — Domain แยกจาก P2P | ไม่มี |
| Phase 4 | AI Enablement | 2–3 เดือน | นำ AI กลับเข้าไปในทุก Touchpoint ตาม Vision เดิมของ Roadmap | มี |

### 8.1 Phase 1 — P2P Core MVP (รายละเอียด Function หลัก)

**Module 0: Master Data Management (MDM)** — Foundation ต้องเสร็จก่อนสัปดาห์ที่ 2–3 เพราะทุก Module อื่นพึ่งพา
- Product/Service Master (ชื่อ/ประเภท/รหัส Auto/หน่วย/ราคา 1 ระดับ, แนบรูป/ใบเสนอราคา, แจ้งเตือนราคาใกล้หมดอายุ, Sync E-Catalog แบบ Real-time, Sync SAP B1)
- Category Management & Item Standardization, Product Search & Lookup
- Vendor Master (Register ผ่าน Web + แนบเอกสาร, Buyer ตรวจสอบ/Activate, Sync SAP B1, Master Profile ใช้ซ้ำข้าม BU, แยกประเภท Vendor)
- Vendor Registration Validation (เช็คเลขผู้เสียภาษี/ชื่อ/ที่อยู่)
- Master Data Governance (Accounting): Vendor Financial Master, Vendor Type/Business Category, mapping รหัส Item/Vendor รายบริษัท
- Item Code Governance (Mapping รหัสกลาง ↔ SAP B1 แยกตามบริษัท)
- Organization & Cost Center Setup

**Module 1: Procurement Initiation (PR)**
- Catalog & Product Request, PR Configuration & Validation, PR หลายบรรทัด/หลายหน่วยงาน
- Budget Checking & Approval Routing, Real-time Budget Control, Procurement Policy Control

**Module 2: Vendor Selection & Sourcing (Bidding พื้นฐาน 1 รูปแบบ)**
- Price Comparison, RFQ/e-Bidding (เลือก 1 รูปแบบ: ส่ง Supplier ≥3 ราย → Approve → กรอกราคา → Award)
- Bid Evaluation พื้นฐาน, Digital Price Comparison, Bidding Item Validation

**Module 3: Purchase Order Management**
- Auto PR → PO (Rule-based ตาม DOA), PO Change/Revision Control, Vendor Confirmation ผ่าน Portal

**Module 4: Goods Receipt & Claim Management**
- GR ผ่าน Web + แนบรูป, Partial Receipt, Service Entry/Acceptance, GR Scoring (Manual), Claim & Return

**Module 5: Stock & Inventory (พื้นฐาน)**
- Stock Sync กับ SAP B1, Stock Summary Report (Static)

**Module 6: Document Management**
- Attachment Management, PR/PO Custom Fields, Contract Administration พื้นฐาน

**Module 7: Vendor Portal**
- Vendor Self-Service: ลงทะเบียน, เสนอราคา (เห็นเฉพาะของตน), ตอบรับ PO + ยืนยันวันส่งมอบ

**Module 8: Invoice & Accounts Payable**
- Invoice Creation (Key-in), Invoice Matching Engine (2-Way/3-Way), Duplicate Invoice Detection, Tax Validation (VAT/WHT)
- GL/Cost Center Allocation, Payment Request (Domestic: PO + Non-PO), Payment Due & Schedule, Payment Proposal
- Multi-level Payment Approval (Segregation of Duties), Bank Integration, Request Utility พื้นฐาน

**Module 9: Workflow & Approval Engine** (ใช้แทน "DOA AI")
- Rule-based Approval Engine, Parallel Approval & Escalation, DOA Management, Status Tracking & Reject Notification, User Group & Permission

**Module 10: Reporting (ขั้นต่ำที่ต้องมีวันแรก)**
- Document Tracking Real-time, Exception Report (ค้างอนุมัติ/ค้างรับ/ค้างวางบิล/ค้างจ่าย), Export Excel/PDF

**Module 11: Integration & Security Baseline**
- SAP B1 Integration (Master Data + Transaction PR/PO/GR/Invoice/Payment), Authentication & Access Control (SSO/AD/RBAC/MFA)
- Audit Log, Security Baseline (Encryption, TLS, Password Policy), Environment & Availability (DEV/UAT/PROD, Sandbox, HA design)
- Mobile Approval, Performance (Concurrent User ≥500, Report ≤10s)

**Module 13: Asset Management & Inter-BU Distribution Control** (เพิ่มขอบเขตพิเศษเรื่องการจัดเก็บและเช่าครุภัณฑ์)
- Asset Acquisition & Registry (บันทึกข้อมูลและประวัติการถือครองสินทรัพย์ประเภทสินค้า บริการ หรือซอฟต์แวร์ลิขสิทธิ์จากการตรวจรับสินค้า GR อัตโนมัติ หรือคีย์มือถือเข้าสู่คลังส่วนกลาง)
- Inter-BU Asset Distribution & Rental Tracking (จัดสรรส่งมอบและแบ่งเช่าครุภัณฑ์ข้ามหน่วยงาน/บริษัทในเครือ พร้อมระบบคำนวณตัดสต็อกและบันทึกอัตราเช่าภายใน)
- Asset Holding Console & Utilization Dashboard (แดชบอร์ดสรุปสัดส่วนการกระจายผู้ถือครองสินทรัพย์ในเครือ SCGJWD และแจ้งเตือนสัญญาหรือลิขสิทธิ์ที่ใกล้หมดอายุ)

**Module 12: Implementation & Go-Live Readiness**
- Data Migration ≥2 รอบ, UAT Support, Training Key User ≥3 รุ่น + คู่มือภาษาไทย, SLA & Support (Sev1≤4hr/Sev2≤8hr), Security Testing ก่อน Go-live

### 8.2 Phase 2 — P2P Enhancement & Compliance

- Advanced Bidding (Multi-round, Sealed Bid, Weighted Scoring, Asset Procurement Bidding, Contract Renewal)
- Vendor Evaluation Framework เต็มรูปแบบ (ประเมินรายปี, แบบฟอร์มหลายรูปแบบตาม BU, Approval หลายระดับ, แจ้งผล Vendor, Audit เข้าตรวจสอบได้)
- Vendor Portal Enhancement (Vendor Upload Catalog เอง, ดูผล Evaluation/KPI ตนเอง)
- Full Reporting & Analytics (Custom Dashboard, Spend Analytics, Price Trend, Executive Dashboard)
- Digital Contract & Signature
- AP ขั้นสูง (Credit/Debit Note, Penalty/Deduction, Payment Batch Run, Foreign Payment, Alternative Payee, Reverse/Block/Unblock ผ่าน API)
- PR Amendment & Version Control, 3rd-Party Catalog Sync (Officemate ฯลฯ)
- Security ขั้น Compliance (PDPA Consent Tracking, Data Retention Automation, IP Restriction, Key Rotation)
- System Scaling (Horizontal Scaling, Auto Failover, API Monitoring Dashboard)

### 8.3 Phase 3 — Employee to Payment (ESS)

Domain แยกจาก P2P โดยสิ้นเชิง (สะท้อนจุด "Reimburse: E-Expense/E-Trip/E-Mileage" ใน Diagram เดิม):

- Travel Authorization, Advance & Fixed Advance Management, Expense Claim & Reimbursement
- Foreign Remittance, Health & Medical Expense
- Reporting กลุ่ม ESS (Advance Overdue, Expense Statement, Traveling Expense, Vehicle Mileage, Payroll-related, Self Approval, User History)
- Workflow Inbox & History เฉพาะฝั่งพนักงาน

### 8.4 Phase 4 — AI Enablement (ปิด Vision เต็มรูปแบบตาม Roadmap เดิม)

| Function | ตำแหน่งใน Diagram เดิม |
|---|---|
| AI Market & Vendor Scraping | จุด 1 |
| AI Social Listening Suggestion | จุด 2 |
| Smart DOA (AI-based Approval) | จุด 6 (ต่อยอดจาก Rule-based Phase 1) |
| AI Detection ตอนรับสินค้า | จุด 4 |
| AI Replenishment Suggestion | จุด 5 |
| OCR Engine | จุด 7 |
| AI Metadata & Indexing | จุด 22 |
| AI Suggestion จากผล Evaluation | จุด 25 |
| AI Price Benchmarking (Social Listening) | Non-functional No.137 |

---

## 9. สรุปสัดส่วน Scope ต่อ Phase (Quantification)

| | Phase 1 (Must) | Phase 2 (Defer) | หมายเหตุ |
|---|---|---|---|
| Sheet 1 — Purchase & Vendor Portal (204 ข้อ) | ~155 | ~48 | 1 ข้อตัดเพราะ AI |
| Sheet 2 — Vendor to Payment เฉพาะ AP (47+4 ข้อ) | ~22 | ~25 | 2 ข้อตัดเพราะ AI/OCR |
| Sheet 2 — Employee to Payment + Reporting (130+ ข้อ) | 0 | ทั้งหมด → ย้ายเป็น Phase 3 | คนละ Domain |
| e-Bidding (4 ข้อ) | 2 | 2 | เลือก RFQ แบบเดียวก่อน |

**รวม Phase 1 ≈ 180 Requirements** จากทั้งหมด ~341 ข้อที่เกี่ยวกับ P2P โดยตรง (ไม่รวม Employee-to-Payment) คิดเป็นการลด Scope ลงประมาณ **47%** ซึ่งสอดคล้องกับการบีบเวลา 5→3 เดือน (-40%) ได้พอดี **ภายใต้เงื่อนไข**ว่าตัด Employee-to-Payment ออกเป็น Phase แยก และเริ่ม Pilot ด้วย Business Unit เดียวก่อน

---

## 10. ความเสี่ยงและประเด็นที่ต้องยืนยันกับลูกค้า (Key Risks & Open Items)

1. **ความขัดแย้งเรื่องขอบเขต Integration/MDM** — เอกสาร Quotation เดิมระบุว่าขอบเขตงาน**ไม่รวม**การเชื่อมต่อระบบและ MDM แต่ TOR ฉบับล่าสุดกำหนดให้เป็น Must ทั้งคู่ ต้องยืนยันให้ชัดเจนก่อนเริ่มงาน เพราะกระทบทั้ง Effort, ราคา และ Timeline
2. **Pilot Business Unit** — ระบบถูกออกแบบสำหรับ All Companies (~15 บริษัท) แต่ Phase 1 ที่บีบเวลาควรเริ่มกับ 1 BU นำร่องก่อน เพื่อลดความซับซ้อนของ Multi-company Mapping ใน MDM แล้วขยายในภายหลัง
3. **รูปแบบ Bidding ที่เลือกใช้ใน Phase 1** — ต้องให้ฝ่ายจัดซื้อ Confirm ว่า RFQ แบบเดียวเพียงพอสำหรับกระบวนการจริงในช่วง 3 เดือนแรก ส่วนรูปแบบอื่น (Sealed Bid, ประมูลขายทรัพย์สิน) ใช้กระบวนการเดิมคู่ขนานไปก่อนจนถึง Phase 2
4. **SAP B1 API Readiness** — ควรทำ Integration Spike กับทีม SAP ก่อนเริ่ม Phase 1 จริง เนื่องจากเป็น Dependency ของแทบทุก Module และมักเป็นจุดที่ใช้เวลาเกินคาด
5. **จุดตัด Phase 3–4** — หากองค์กรมองว่า Employee-to-Payment ไม่ใช่ Priority ของโครงการนี้ สามารถแยกเป็นโครงการอื่นทั้งหมด และให้ Phase 2 เป็น Phase สุดท้ายของโครงการนี้ได้ ส่วน AI (Phase 4) ควรเป็น Enhancement Program ต่อเนื่องหลังระบบ Stable แล้ว ไม่จำเป็นต้องผูกกับ Timeline ปิดโครงการหลัก
6. **ช่องว่างของวันที่ในเอกสาร** — เอกสาร BSD Baseline ลงวันที่ 21 พ.ค. 2568 ขณะที่ใบเสนอราคาออกวันที่ 10 พ.ย. 2568 และมีการ Internal Kick Off ในรอบล่าสุด ควรตรวจสอบว่าเอกสาร TOR และ BSD ที่ใช้อ้างอิงทั้งหมดเป็นฉบับล่าสุดที่ทุกฝ่าย Sign-off ตรงกันแล้ว
7. **Sign-off Gate ต่อ Phase** — แนะนำให้มี Customer Sign-off แยกทุกจบ Phase (ไม่ใช่ Sign-off ครั้งเดียวท้ายโครงการ) เพื่อให้ปรับ Scope ของ Phase ถัดไปตามผลการใช้งานจริงของ Phase ก่อนหน้าได้

---

## 11. เอกสารอ้างอิง (Document References)

| เอกสาร | Version | บทบาท |
|---|---|---|
| I_Kick_Off_Presentation_PJ250051_DITS_VD01.00.00 | VD01.00.00 | ภาพรวมโครงการ, Stakeholder, Project Plan เดิม, Deliverable Document |
| E_Business_Solution_&_Design_PJ250051_DITS_VD01.00.00 (Sign) | VT03.00.00 | ขอบเขตระบบ, Requirement List ระดับ Function, Business Flow |
| TOR_P2P_Function_Requirement_VD2.00.1 (Final) | VD2.00.1 | รายละเอียด Requirement ระดับปฏิบัติการ (341+ ข้อ) พร้อม Priority M/S/O |
| I_Project_Management_Process_Description_DITS_VD02.00.00 | VD02.00.00 | กระบวนการบริหารโครงการของ DITS (Timeline, Kick Off, Progress Report) |

---

## 12. ประวัติการแก้ไขเอกสาร (Revision History)

| Version | วันที่ | รายละเอียดการแก้ไข | จัดทำโดย |
|---|---|---|---|
| VD01.00.00 | (วันที่จัดทำเอกสารนี้) | จัดทำ Project Overview ฉบับแรก สรุปภาพรวมทั้งหมดของโครงการเพื่อใช้วางแผนแบ่ง Phase | BA/SA |

---

*เอกสารนี้จัดทำขึ้นเพื่อสรุปภาพรวมโครงการสำหรับทีมงานภายในและการนำเสนอลูกค้า ควรใช้คู่กับเอกสาร TOR ฉบับเต็มและ Business Solution & Design เพื่อดูรายละเอียดระดับ Function/Requirement ที่ครบถ้วนที่สุด*

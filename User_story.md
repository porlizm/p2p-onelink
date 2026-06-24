# User Story — e-Procurement / P2P System (PJ250051 SCGJWD)

เอกสารนี้รวบรวม User Story ทั้งหมดของระบบ e-Procurement โดยวิเคราะห์และปรับปรุงให้สอดคล้องกับขอบเขตการพัฒนาจริงล่าสุด (Refactored Scope) พร้อมกับการเพิ่ม **Enterprise Use Cases & Edge Cases** เพื่อความสมบูรณ์ ความถูกต้องของข้อมูล และความปลอดภัยระดับองค์กรสูงสุด

จัดกลุ่มเป็น **4 Phase** ตามขอบเขตการดำเนินงานจริง:

| Phase | ชื่อ | ขอบเขตการพัฒนาล่าสุด | สถานะการพัฒนา |
|---|---|---|---|
| Phase 1 | P2P Core MVP & Integrations | Master Data → PR (พร้อมเช็คงบประมาณและปลดล็อกแบบยืดหยุ่น) → Bidding พื้นฐาน → PO → GR → **e-Payment Bridge & Webhook** (พร้อมระบบเคลมงวดงาน/การโอนล้มเหลว), **Cost Center & Budget Management** (พร้อมระบบปลดล็อกงบ), **Post-Bidding Notifications**, SAP B1 Sync, Security Baseline | พัฒนาจริง (Core Prototype เสร็จสิ้น) |
| Phase 2 | P2P Enhancement & Compliance | Advanced Sourcing (Reverse Auction, Multi-Criteria sheets), Evaluation, Analytics, Compliance ขั้นสูง | พัฒนาจริงบางส่วน (Reverse Auction & Multi-Criteria ถูกพัฒนาเป็น Mockup เพิ่มเติม) |
| Phase 3 | Employee to Payment (ESS) | Travel/Advance/Expense/Foreign/Medical (ระบบเบิกจ่ายพนักงาน) | **ยกเลิกการพัฒนาจริง (ทำเฉพาะ Mockup ตามข้อตกลงล่าสุด)** |
| Phase 4 | AI Enablement | AI Sourcing Suggestions, Risk Audit, Defect Detection, OCR Scanner, Sentiment Insights | พัฒนาเป็น **Interactive Mockup ในระบบ Prototype** เพื่อให้ลูกค้าคอนเฟิร์ม |

---

# PHASE 1 — P2P Core MVP & Refactored Integrations

> เป้าหมาย: ระบบใช้งานได้จริงครบ Flow ตั้งแต่ Master Data, PR, Bidding, PO, GR และเชื่อมต่อไปยัง e-Payment ภายนอกผ่าน API, มีระบบบริหารงบประมาณระดับ Cost Center และการแจ้งเตือนหลังประมูล

## Epic P1-A: Master Data Management (MDM)

### US-101: Product / Service Master
**As a** Buyer / MDM Admin
**I want** to create and maintain product/service master records with pricing and lifecycle info
**So that** ทุกหน่วยงานใช้ข้อมูลสินค้าชุดเดียวกัน ลดความซ้ำซ้อนและความผิดพลาดของราคา

**Acceptance Criteria:**
- [x] (No.1) กรอกข้อมูลสินค้า เช่น ชื่อ ประเภท รหัส (Auto) หน่วย ราคา ช่วงเวลาที่มีผล รายละเอียด และแนบรูปภาพ/ใบเสนอราคาได้
- [x] (No.2) จัดการราคาสินค้าหลายระดับ เช่น "ราคาเดียวต่อ Volume" พร้อม Note อ้างอิง และรองรับหลายราคาต่อ 1 สินค้าผ่านฟังก์ชัน Adjust
- [x] (No.3) แสดงรายการสินค้าให้ทุก BU เห็นร่วมกัน กำหนด Owner BU ได้
- [x] (No.4) Sync ข้อมูลสินค้าที่เพิ่มในระบบเข้าสู่ SAP B1 ได้
- [x] (No.5) แจ้งเตือนรายการสินค้าที่ต้องอัปเดตราคาหรือใกล้หมดอายุ พร้อมแสดงรายการและ Tag แยก
- [x] (No.6) อัปเดตราคาลง E-Catalog ได้แบบเรียลไทม์
- [x] (No.20) มีโครงสร้างมาตรฐานสินค้า (Item Standardization Framework)
- [x] (No.22) จัดกลุ่มสินค้า/บริการ (Category Management)

**Priority:** Must | **TOR Reference:** Sheet 1 No.1,2,3,4,5,6,20,22

---

### US-102: Vendor Master & Registration
**As a** Vendor / Buyer
**I want** to register and maintain vendor master data with supporting documents and validation
**So that** ข้อมูลผู้ขายถูกต้อง ตรวจสอบได้ และใช้ซ้ำได้ทุก BU โดยไม่ต้องลงทะเบียนใหม่

**Acceptance Criteria:**
- [x] (No.8) Vendor หรือ Buyer ลงทะเบียน Vendor ใหม่ กรอกข้อมูล + แนบเอกสาร (ภพ.20, Book Bank, หนังสือรับรองบริษัท)
- [x] (No.9) Buyer ตรวจสอบข้อมูลที่ Vendor กรอก และ Active Vendor พร้อมส่งข้อมูลเข้า SAP
- [x] (No.10) กำหนด Vendor ให้เป็น Master ใช้ซ้ำใน BU อื่น โดย Sync Auto จาก Master Profile
- [x] (No.11) อัปเดตคะแนนประเมินรายปีของ Vendor บันทึกลงใน Vendor Profile
- [x] (No.12) แยกประเภทของ Vendor ได้ (ผู้ขาย/ผู้รับเหมาแรงงาน/ผู้ให้บริการ)
- [x] (No.18) Vendor Golden Record: Unique Identifier (Tax ID based), Deduplication Logic, Merge/Split capability, Status (Active/Block/Blacklist)
- [x] (No.19) Item Master Management: รหัสกลาง + mapping รหัสแต่ละ BU เชื่อมข้อมูลกัน
- [x] (No.29) ตรวจจับการขึ้นทะเบียน Vendor ซ้ำ จาก Tax ID / ชื่อ / ที่อยู่
- [x] (No.97) ตรวจสอบข้อมูลผู้ขายซ้ำ (Duplicate Vendor Check) จาก Tax ID ก่อนอนุมัติ Vendor
- [x] (No.98) กำหนดวันหมดอายุเอกสารผู้ขาย พร้อมแจ้งเตือนก่อนหมดอายุ
- [x] (No.99) อนุมัติการแก้ไขข้อมูลสำคัญของผู้ขาย เช่น บัญชีธนาคาร ที่อยู่ ข้อมูลภาษี โดยเก็บประวัติการเปลี่ยนแปลง

**Priority:** Must | **TOR Reference:** Sheet 1 No.8,9,10,11,12,18,19,29,97,98,99

---

### US-103: Master Data Governance (Accounting / Multi-Company Mapping)
**As a** System Admin / Accounting
**I want** to manage company-specific master data mapping for Item, Vendor, and Asset
**So that** ข้อมูลที่ใช้รหัสต่างกันในแต่ละบริษัทเชื่อมกับ ERP ได้ถูกต้องครบทุกบริษัทในเครือ

**Acceptance Criteria:**
- [x] (No.13) จัดการข้อมูล Vendor Financial Master
- [x] (No.14) จัดการข้อมูล Vendor Type / Business Category
- [x] (No.15) จัดการข้อมูล Item ที่มีรหัสต่างกันตามบริษัทตอนลง ERP (1 Item คนละบริษัท = คนละรหัส)
- [x] (No.16) จัดการข้อมูล Vendor ที่มีรหัสต่างกันตามบริษัทตอนลง ERP (1 Vendor คนละบริษัท = คนละรหัส)
- [x] (No.17) จัดการข้อมูล Physical/Digital Asset ที่สั่งซื้อ ระบุเจ้าของได้ พร้อม Sync HR
- [x] (No.25) Control Code Item, Central Mapping Code ใน SAP B1 แยกตาม BU ได้
- [x] (No.128) Multi-Company Structure Management (โครงสร้างหลายบริษัท)
- [x] (No.129) Business Unit Hierarchy (โครงสร้าง BU)
- [x] (No.130) Cost Center Integration (เชื่อม Cost Center)

**Priority:** Must | **TOR Reference:** Sheet 1 No.13,14,15,16,17,25,128,129,130

---

### US-104: Product Search & Lookup
**As a** Requester
**I want** to search for products without typing the full product name
**So that** ค้นหาสินค้าที่ต้องการได้สะดวกและรวดเร็วขึ้น

**Acceptance Criteria:**
- [x] (No.24) ระบบค้นหาสินค้าได้โดยไม่ต้องพิมพ์ชื่อเต็มของสินค้า (รองรับ Smart Autocomplete/Search)

**Priority:** Must | **TOR Reference:** Sheet 1 No.24

---

## Epic P1-B: Procurement Initiation & Budget Control (PR)

### US-105: Catalog & New Product Request
**As a** Requester
**I want** to browse the catalog and request products including new items not yet listed
**So that** ฉันสามารถขอซื้อสินค้าที่ต้องการได้ครบทุกกรณีพร้อมข้อมูลราคาที่ถูกต้อง

**Acceptance Criteria:**
- [x] (No.30) Request สินค้าใหม่ กรอกรายละเอียด ส่งอนุมัติ (Manager, Buyer)
- [x] (No.31) แสดงสินค้าใน Catalog พร้อมข้อมูล ชื่อ รายละเอียด ราคา และตรวจสอบอายุราคาว่าหมดอายุหรือยัง
- [x] (No.32) เลือกสินค้าจาก Catalog ใส่ลงใน PR ได้หลายรายการ พร้อม Preview Price/Quotation
- [x] (No.33) สำหรับสินค้าที่ไม่มีราคาชัดเจน กรอกข้อมูลเพิ่มเติม เช่น จำนวน ราคา หน่วยงาน และแนบเอกสารก่อนทำ PR

**Priority:** Must | **TOR Reference:** Sheet 1 No.30,31,32,33

---

### US-106: Cost Center Budget Validation & Enforcement (PR Creation)
**As a** Requester
**I want** the system to check remaining budget during PR creation
**So that** ป้องกันการสั่งซื้อเกินวงเงินที่ได้รับอนุมัติประจำปีของ Cost Center นั้นๆ

**Acceptance Criteria:**
- [x] (No.34 / 50 / 101) ตรวจสอบวงเงินงบประมาณคงเหลือระดับ Cost Center แบบ Real-time ในขั้นตอนการทำ PR
- [x] (No.102) ตรวจสอบยอดรวม PR เทียบกับสูตร: `annual_budget_amount - budget_reserved_amount - budget_used_amount` ของ Cost Center ที่เกี่ยวข้อง
- [x] (No.102) บล็อกการส่งคำขอ PR ทันทีหากยอดเงินของรายการ PR เกินงบประมาณคงเหลือ และแสดงแถบเตือนสีแดง (Warning Banner)
- [x] (No.102) แสดงปุ่ม **"ขอปรับเพิ่มงบประมาณ (Request Budget)"** บนหน้าจอเพื่ออำนวยความสะดวกให้ผู้ใช้งานส่งคำร้องขอเพิ่มงบ

**Priority:** Must | **TOR Reference:** Sheet 1 No.34,50,101,102,103

---

### US-128: Budget Request & Approval Workflow
**As a** BU User / Accountant
**I want** to request additional budget and get reviewed by the Accounting team
**So that** หน่วยงานสามารถปรับเพิ่มงบประมาณเพื่อดำเนินโครงการต่อได้เมื่อมีความจำเป็นเร่งด่วน

**Acceptance Criteria:**
- [x] BU User สามารถเปิดฟอร์มยื่นคำขอเพิ่มงบประมาณ โดยระบุ Cost Center, ยอดเงินที่ต้องการเพิ่ม, เหตุผลความจำเป็น และแนบเอกสารอ้างอิง
- [x] ระบบบันทึกรายการเป็น Entity `BudgetRequest` ในสถานะ `Pending`
- [x] Accountant สามารถเข้าถึง Admin Budget Dashboard (`/admin/budget`) เพื่อตรวจสอบรายการคำขอที่รออนุมัติ
- [x] Accountant สามารถกด **Approve** หรือ **Reject** รายการคำขอได้
- [x] เมื่อกด **Approve** ระบบจะปรับปรุงค่า `annual_budget_amount` ของ Cost Center นั้นเพิ่มขึ้นตามจำนวนเงินที่อนุมัติโดยอัตโนมัติ และเปลี่ยนสถานะคำขอเป็น `Approved`

**Priority:** Must | **TOR Reference:** Custom Scope Enhancement for PJ250051

---

### US-129: Budget Transfer & Annual Reset
**As an** Accountant
**I want** to transfer budget between Cost Centers and perform year-end resets
**So that** สามารถบริหารจัดการและปรับเกลี่ยงบประมาณของกลุ่มบริษัทได้อย่างถูกต้องตามปฏิทินบัญชี

**Acceptance Criteria:**
- [x] จำกัดสิทธิ์ให้เฉพาะผู้ใช้งานกลุ่ม Accountant/Admin เท่านั้นที่สามารถทำรายการโอนงบประมาณได้ (BU User ทั่วไปไม่มีสิทธิ์เข้าถึง)
- [x] Accountant สามารถเลือกโอนวงเงินจาก Cost Center ต้นทางไปยัง Cost Center ปลายทาง โดยระบบจะทำหักลบและเพิ่มยอดใน Transaction เดียวกัน (Pessimistic Locking)
- [x] มีฟังก์ชันระบบจำลอง Job สิ้นปี (Year-End Reset) เพื่อรีเซ็ตค่าวงเงินงบประมาณคงเหลือ, วงเงินสำรอง (Reserved) และวงเงินที่ใช้ไปแล้ว (Used) ของทุก Cost Center กลับเข้าสู่ระดับ Baseline ที่ตั้งไว้สำหรับปีงบประมาณถัดไป (ในวันที่ 31 ธันวาคม)

**Priority:** Must | **TOR Reference:** Custom Scope Enhancement for PJ250051

---

### US-133: Budget Reservation Release Flow
**As a** System
**I want** to release reserved budget when documents are rejected, cancelled, or deleted
**So that** คืนวงเงินงบประมาณกลับไปให้หน่วยงานใช้งานได้ทันที ไม่เกิดปัญหางบสำรองค้างในระบบ

**Acceptance Criteria:**
- [ ] เมื่อ PR หรือ PO ถูกปฏิเสธการอนุมัติ (Rejected) หรือถูกกดยกเลิกเอกสาร (Cancelled) หรือถูกลบรายการออก
- [ ] ระบบต้องวิ่งไปลดค่า `budget_reserved_amount` ของ Cost Center ที่เกี่ยวข้องคืนกลับมาเท่ากับมูลค่ารายการที่ยกเลิกโดยอัตโนมัติ
- [ ] บันทึกประวัติการคืนวงเงินลงใน Audit Trail เพื่อใช้ตรวจสอบย้อนหลัง

**Priority:** Must | **TOR Reference:** Enterprise Edge Case (PJ250051-Budget-01)

---

### US-134: Budget Overrun Policy & Escalation Routing
**As a** System / Approver
**I want** budget overruns to be routed to special approvers based on tolerance policies instead of hard blocking
**So that** สามารถดำเนินโครงการเร่งด่วนต่อได้ภายใต้นโยบายควบคุมความเสี่ยงของฝ่ายบริหาร

**Acceptance Criteria:**
- [ ] กำหนดค่าเกณฑ์ยอมรับงบประมาณเกิน (Tolerance Limits) เช่น ยอมให้เกินได้ไม่เกิน 5% ของงบประมาณคงเหลือ หรือไม่เกิน 20,000 บาท
- [ ] หากยอดจัดซื้อเกินงบไม่เกินเกณฑ์ Tolerance ระบบจะไม่บล็อกการสร้าง PR แต่จะขึ้นเตือนสถานะงบเกินสีส้ม และทำการเปลี่ยนเส้นทางอนุมัติ (Escalation Approval Route) ส่งตรงไปหาหัวหน้าแผนก หรือ CFO/VP โดยอัตโนมัติ ตามลำดับขั้น DOA พิเศษ
- [ ] หากยอดเกินเกณฑ์ Tolerance ที่กำหนดไว้ ระบบจะแสดง Hard Block และบังคับส่งเอกสารขอเพิ่มงบ (US-128) เท่านั้น

**Priority:** Should | **TOR Reference:** Enterprise Risk Policy (PJ250051-Budget-02)

---

## Epic P1-C: Vendor Selection & Bidding (Post-Bidding Notification)

### US-107: Price Comparison
**As a** Buyer
**I want** to compare prices from multiple vendors side by side
**So that** เลือกผู้ขายที่ราคาดีที่สุดได้อย่างโปร่งใสและมีหลักฐานบันทึกไว้

**Acceptance Criteria:**
- [x] (No.36) แสดงราคาสินค้าจากหลาย Vendor พร้อมเปรียบเทียบราคา แยกตาม Vendor
- [x] (No.46) เปรียบเทียบราคาแบบ Digital ตามระเบียบจัดซื้อจัดจ้าง และบันทึกข้อมูลได้
- [x] (No.47) แยกประเภทของการเปรียบเทียบแบบหลายมิติ/หลายราคาได้

**Priority:** Must | **TOR Reference:** Sheet 1 No.36,46,47

---

### US-108: RFQ / e-Bidding (RFQ/BOQ ปิดราคา)
**As a** Buyer
**I want** to run a closed-price RFQ bidding process with at least 3 suppliers
**So that** ได้ราคาที่ดีที่สุดผ่านกระบวนการที่โปร่งใส ตรวจสอบได้ และเป็นไปตามระเบียบจัดซื้อ

**Acceptance Criteria:**
- [x] (No.37) สร้างรายการประมูล พร้อมรายละเอียดสินค้า วันปิดรับเสนอราคา เงื่อนไข และเลือก/เพิ่ม Vendor เข้าร่วม
- [x] (No.38) Vendor วางใบเสนอราคาได้โดยเห็นเฉพาะของตนเอง และ Buyer เห็นรายการจากทุก Vendor
- [x] (No.39) Buyer ประเมินราคา คัดเลือก Vendor ผู้ชนะ พร้อมสร้าง PR และ PO ทันที
- [x] (No.40) ตรวจสอบว่าต้องมี Item ก่อนการเปิดประมูล เพื่อความถูกต้องของขั้นตอน
- [x] (e-Bidding No.2) ขั้นตอน RFQ/BOQ ปิดราคา: พนักงานจัดซื้อส่ง TOR/RFQ/BOQ พร้อมเอกสารประกอบและรายชื่อ Supplier ≥3 ราย → คณะกรรมการตัดสินหรือต่อรองเพิ่มและ Award ผู้ชนะ

**Priority:** Must | **TOR Reference:** Sheet 1 No.37,38,39,40 / e-Bidding No.2

---

### US-131: Post-Bidding Award Notification & 24hr Unread Email Alert
**As a** System
**I want** to automatically notify the bid winner and trigger email warnings if unread
**So that** มั่นใจได้ว่าผู้ชนะประมูลได้รับทราบผลและเข้ามาดำเนินการต่อในระบบอย่างรวดเร็ว ป้องกันโครงการล่าช้า

**Acceptance Criteria:**
- [x] เมื่อ Buyer กดตัดสินผลการประมูล (Award Bid) ระบบจะบันทึกสถานะลงฐานข้อมูลและส่ง Notification ไปหา Vendor อัตโนมัติ
- [x] มีระบบตรวจสอบ (Background Scheduler Simulator) หากบันทึกแจ้งเตือนยังไม่ได้ถูกอ่าน (`read_flag = false`) และมีอายุเกิน 24 ชั่วโมง
- [x] เมื่อเข้าเงื่อนไขเกิน 24 ชั่วโมง ระบบจะส่งอีเมลแจ้งเตือนผู้ขายอ้างอิงอีเมลใน Vendor Master เพื่อแจ้งเตือนให้รีบเข้ามาอัปโหลดใบตอบรับ PO

**Priority:** Must | **TOR Reference:** Custom Scope Enhancement for PJ250051

---

### US-138: Non-Responsive Winner Escalation Workflow
**As a** Buyer
**I want** the system to escalate or re-award to the runner-up if the winner does not respond within the deadline
**So that** ป้องกันโครงการล่าช้าเนื่องจากผู้ขายที่เป็นผู้ชนะละทิ้งงานหรือไม่ทำธุรกรรมต่อตามเวลาที่กำหนด

**Acceptance Criteria:**
- [ ] สามารถตั้งค่าระยะเวลารอคอยสูงสุดสำหรับ Vendor ในการตอบรับ PO (เช่น 3 วันทำการ หรือ 72 ชั่วโมง)
- [ ] หากผู้ขายยังคงเงียบเฉย ไม่มีการกดยืนยัน (Acknowledge) หรืออัปโหลดไฟล์หลังจากแจ้งเตือนทางอีเมลไปแล้วครบกำหนดเวลา ระบบจะส่ง Noti แจ้งเตือน Buyer ทันทีเพื่อดำเนินการขั้นถัดไป
- [ ] Buyer สามารถกดยกเลิกสิทธิ์ผู้ชนะรายนั้นในหน้ารายละเอียดการตัดสิน และระบบจะแสดงปุ่มให้เลือกกดยืนยันให้ผู้ชนะลำดับที่ 2 (Runner-up) เป็นผู้ชนะแทน พร้อมเดินเอกสารสร้าง PO ใหม่ให้คู่ค้ารายใหม่ทันที

**Priority:** Should | **TOR Reference:** Business Continuity Policy (PJ250051-Sourcing-03)

---

## Epic P1-D: Purchase Order Management

### US-109: Auto PR→PO, PO Revision & Vendor Confirmation
**As a** Buyer / Vendor
**I want** PO to be generated automatically after PR approval, support post-approval revision, and capture vendor confirmation digitally
**So that** ลดเวลาในการออก PO และผู้ขายรับทราบคำสั่งซื้อพร้อมยืนยันวันส่งมอบได้ทันที

**Acceptance Criteria:**
- [x] (No.52) สร้าง PR และ PO อัตโนมัติหลังจากผ่านการอนุมัติได้
- [x] (No.54) Vendor สามารถตอบรับ PO ผ่าน Portal ได้
- [x] (No.55) Vendor สามารถยืนยันวันที่จัดส่งสินค้าได้
- [x] (No.107) แก้ไข PO หลังอนุมัติผ่านกระบวนการเปลี่ยนแปลงเอกสาร (PO Change/Revision Control) พร้อมเก็บประวัติ
- [x] (No.132) ดึงข้อมูลจาก PR เข้ามาเป็น PO ได้

**Priority:** Must | **TOR Reference:** Sheet 1 No.52,54,55,107,132

---

### US-132: Vendor Portal PO Acknowledgment & Upload
**As a** Vendor
**I want** to acknowledge the awarded PO and upload the signed PO document on the portal
**So that** ยืนยันการรับทราบและยอมรับคำสั่งซื้ออย่างเป็นทางการในรูปแบบอิเล็กทรอนิกส์

**Acceptance Criteria:**
- [x] Vendor สามารถล็อกอินเข้าสู่ Vendor Portal และเปิดดูรายละเอียดใบสั่งซื้อ (PO) ที่ได้รับมอบหมาย
- [x] มีปุ่มให้กด **"ตอบรับใบสั่งซื้อ (Acknowledge PO)"** เพื่อยืนยันสถานะในระบบ
- [x] Vendor สามารถอัปโหลดไฟล์เอกสารใบส่งมอบงาน/ใบสั่งซื้อที่ลงนามแล้ว (Signed PO / Delivery Acknowledgment Document) กลับเข้าสู่ระบบได้เพื่อใช้เป็นหลักฐานประกอบการตรวจรับงาน

**Priority:** Must | **TOR Reference:** Custom Scope Enhancement for PJ250051

---

## Epic P1-E: Goods Receipt & Claim Management

### US-110: Goods Receipt (GR)
**As a** Warehouse staff / Requester
**I want** to record goods receipt with photo evidence, partial receipt handling, and quality scoring
**So that** มีหลักฐานการรับสินค้าครบถ้วนและใช้ประเมินคุณภาพผู้ขายได้

**Acceptance Criteria:**
- [x] (No.56) บันทึกรับสินค้า (GR) ผ่าน Web ได้
- [x] (No.57) แนบรูปภาพหลักฐานการรับสินค้า หรือสินค้าเสียหายได้
- [x] (No.58) ให้คะแนนการรับของเพื่อประเมินคุณภาพผู้ขายได้ (รายครั้ง)
- [x] (No.108) รับสินค้าบางส่วน (Partial Receipt) รับเกิน/ขาดตามค่าความคลาดเคลื่อนที่กำหนดได้
- [x] (No.109) รับงานบริการ (Service Entry/Service Acceptance) ก่อนนำไปตั้งเบิกจ่ายได้

**Priority:** Must | **TOR Reference:** Sheet 1 No.56,57,58,108,109

---

### US-111: Claim & Return Management
**As a** Requester / Buyer
**I want** to log claims/complaints and create return documents
**So that** ติดตามปัญหาสินค้าและจัดการกระบวนการคืนสินค้าได้เป็นระบบ

**Acceptance Criteria:**
- [x] (No.59) บันทึกเคลมสินค้า ร้องเรียน หรือบันทึกการแก้ไขปัญหา (Corrective Action) ได้
- [x] (No.60) สร้างเอกสารคืนสินค้า (Return Note) และจัดการกระบวนการคืนได้

**Priority:** Must | **TOR Reference:** Sheet 1 No.59,60

---

## Epic P1-F: Stock & Inventory (พื้นฐาน)

### US-112: Stock Sync & Summary
**As a** Warehouse staff / Buyer
**I want** stock data to sync with SAP B1 and show movement/sufficiency summary
**So that** ทราบยอดคงเหลือที่ตรงกับ ERP และวางแผนสั่งซื้อล่วงหน้าได้

**Acceptance Criteria:**
- [x] (No.61) เชื่อมข้อมูลสินค้ากับ SAP B1 เพื่ออัปเดตสต็อกอัตโนมัติได้
- [x] (No.62) สรุปยอดการเคลื่อนไหวและประเมินความเพียงพอของสต็อกประจำปีได้
- [x] (No.63) แสดงผลสรุปและแนวโน้มการใช้สินค้าคงคลังได้

**Priority:** Must | **TOR Reference:** Sheet 1 No.61,62,63

---

## Epic P1-G: Document & Contract Management

### US-113: Attachment Management & PR/PO Custom Fields
**As a** Buyer / Admin
**I want** to attach all file types and configure custom fields per BU on PR/PO
**So that** เอกสารมีหลักฐานครบถ้วนและรองรับความแตกต่างของแต่ละ BU

**Acceptance Criteria:**
- [x] (No.64) Custom Columns ใน PR/PO ตามประเภท BU รวมถึง Report/Export ได้
- [x] (No.66) รองรับการแนบไฟล์ทุกประเภท (All file)

**Priority:** Must | **TOR Reference:** Sheet 1 No.64,66

---

### US-114: Contract / Blanket Agreement Linkage (พื้นฐาน)
**As a** Buyer
**I want** to link pre-agreed contract/blanket pricing to PR/PO and track contract validity
**So that** ราคาที่ตกลงไว้ล่วงหน้าถูกใช้อ้างอิงถูกต้อง และไม่พลาดวันต่ออายุสัญญา

**Acceptance Criteria:**
- [x] (No.105) จัดการสัญญา/ข้อตกลงราคา (Contract/Blanket Agreement) และอ้างอิงไปยัง PR หรือ PO ได้
- [x] (No.106) ควบคุมมูลค่าสัญญาคงเหลือ วันหมดอายุสัญญา และแจ้งเตือนต่ออายุสัญญา ทั้งภายในและภายนอก

**Priority:** Must | **TOR Reference:** Sheet 1 No.105,106

---

## Epic P1-H: Vendor Portal (สิทธิ์เข้าถึงของผู้ขาย)

### US-115: Vendor Self-Service Portal
**As a** Vendor
**I want** a self-service portal to register, submit quotations, and confirm purchase orders
**So that** ฉันทำธุรกรรมกับบริษัทได้สะดวกโดยไม่ต้องรอติดต่อ Buyer ทางอีเมล/โทรศัพท์

**Acceptance Criteria:**
- [x] รวม Use Case จาก US-102 (ลงทะเบียน Vendor), US-108 (เสนอราคา), US-109 (ยืนยัน PO), และ US-132 (ตอบรับและแนบใบส่งมอบงาน) ที่แสดงใน Vendor Portal โดยแบ่งสิทธิ์การเข้าถึงเห็นเฉพาะข้อมูลตนเอง

**Priority:** Must | **TOR Reference:** อ้างอิงร่วมกับ Vendor Portal Requirements

---

### US-139: Vendor Account Recovery & Password Reset
**As a** Vendor
**I want** to reset my forgotten password on the vendor portal using my registered email
**So that** ฉันสามารถเข้าถึงระบบเพื่อทำธุรกรรม เสนอราคา หรือรับทราบ PO ได้โดยไม่ต้องติดต่อฝ่ายจัดซื้อจัดจ้าง

**Acceptance Criteria:**
- [ ] มีลิงก์ "ลืมรหัสผ่าน (Forgot Password)" บนหน้า Login ของ Vendor Portal
- [ ] Vendor กรอกอีเมลที่ลงทะเบียนไว้ ระบบจะทำการตรวจสอบและสร้าง Secure Verification Token ส่งลิงก์ตั้งค่ารหัสผ่านใหม่ไปทางอีเมล
- [ ] มีขั้นตอนบังคับให้ตั้งรหัสผ่านใหม่ที่ตรงตาม Password Complexity Policy (ยาวขั้นต่ำ 8 ตัวอักษร, มีอักษรพิเศษและตัวเลข)
- [ ] เก็บบันทึกไอพีแอดเดรสและเวลาที่มีการเปลี่ยนรหัสผ่านเพื่อความปลอดภัย

**Priority:** Must | **TOR Reference:** Security Operations (PJ250051-Vendor-04)

---

### US-140: Dual-Authorization for Vendor Bank Changes (Fraud Prevention)
**As a** System Admin / Auditor
**I want** vendor bank account changes to require dual internal verification and temporarily block payment triggers
**So that** ป้องกันการหลอกลวงแก้ไขเลขที่บัญชีเพื่อสวมรอยรับเงินโอน (Invoice Redirection / Bank Fraud)

**Acceptance Criteria:**
- [ ] เมื่อ Vendor ทำการขอแก้ไขเลขที่บัญชีธนาคาร (Bank Account) หรือเอกสาร Book Bank บน Portal
- [ ] ระบบต้องระงับ (Hold) การจ่ายเงินและล็อคการทำธุรกรรมโอนเงิน (e-Payment Trigger) ของ Vendor รายนี้ไว้ชั่วคราว พร้อมตั้งสถานะของข้อมูลธนาคารเป็น `Pending Verification`
- [ ] ระบบสร้างคำขอให้ฝ่ายจัดซื้อจัดจ้างและฝ่ายบัญชี (2 คนแยกกัน) ทำการตรวจสอบเอกสารตัวจริงและโทรศัพท์ติดต่อยืนยันตัวตนกับผู้มีอำนาจของ Vendor (Dual-Verification Flow)
- [ ] เมื่อได้รับการอนุมัติยืนยันครบถ้วนจากทั้งสองแผนก จึงจะทำการอัปเดตและปลดล็อคการส่งจ่ายเงิน e-Payment ได้

**Priority:** Must | **TOR Reference:** Financial Control & Anti-Fraud Policy (PJ250051-Security-05)

---

## Epic P1-I: e-Payment Bridge & Integration

> **💡 Refactored Scope:** ตามความต้องการในการนำกระบวนการจัดการ Invoice, 3-Way Matching, SoD Payment Lanes และ Bank CSV Generation ออกจากระบบ e-Procurement (เนื่องจากมีอีกทีมรับผิดชอบระบบ e-Payment แยกต่างหาก) ระบบ e-Procurement จึงปรับโฉมโมดูลการเงินให้เป็น **Payment Bridge** เพื่อเชื่อมต่อข้อมูลจ่ายเงินของ PO ไปยังระบบ e-Payment ผ่าน API เท่านั้น

### US-116: e-Payment Bridge Queue (Buyer Portal)
**As a** Buyer / Finance User
**I want** a simplified Payment Queue showing POs awaiting payment
**So that** ฉันสามารถติดตามสถานะการจ่ายเงินของ PO และกดส่งคำขอโอนเงินไปยังระบบ e-Payment ได้อย่างรวดเร็ว

**Acceptance Criteria:**
- [x] หน้ารวมการเงิน (`/finance`) ปรับโฉมเป็น **Payment Queue** แสดงรายการ POs ทั้งหมด
- [x] กรองแสดงเฉพาะ POs ที่มีสถานะพร้อมจ่ายเงิน (เช่น มีการรับของ GR ครบถ้วนแล้ว)
- [x] มีปุ่ม **"ส่งจ่ายเงิน e-Payment (Trigger Payment)"** สำหรับ PO แต่ละรายการ
- [x] เมื่อกดปุ่มดังกล่าว ระบบจะทำการเรียก API `POST /api/payment/trigger` เพื่อจำลองการส่ง Payload ไปยังระบบ e-Payment และอัปเดตสถานะ PO ในระบบเป็น `ProcessingPayment`

**Priority:** Must | **TOR Reference:** Refactored from Sheet 1 No.73, 114, 115, 116 / Sheet 2 No.1, 15, 18, 19

---

### US-117: e-Payment Status Callback & Updates
**As a** System
**I want** to provide webhook callback endpoints for the external e-Payment team
**So that** ระบบสามารถรับผลการทำจ่ายเงินและอัปเดตสถานะ PO เป็น Paid หรือชำระเงินไม่สำเร็จได้โดยอัตโนมัติ

**Acceptance Criteria:**
- [x] ให้บริการ API Endpoint `POST /api/payment/callback` สำหรับรับผลการโอนเงิน (Success หรือ Failed)
- [x] หากผลลัพธ์การโอนเงินสำเร็จ (`Success`) ระบบจะปรับปรุงสถานะของ PO เป็น `Paid`
- [x] หากผลลัพธ์การโอนเงินไม่สำเร็จ (`Failed`) ระบบจะคืนสถานะของ PO กลับเป็น `VendorConfirmed` (หรือก่อนทำรายการโอน) เพื่อเปิดโอกาสให้ทำรายการชำระเงินใหม่อีกครั้ง
- [x] ทำการทดสอบจำลอง Webhook Callback ในหน้าจอ Prototype (Mock Callback Actions) เพื่อการันตีความถูกต้องของ Flow

**Priority:** Must | **TOR Reference:** Refactored Integration Scope

---

### US-135: e-Payment Failure Details & Error Logging
**As a** Finance User / Accountant
**I want** the system to log detailed e-payment error messages and code details when callbacks fail
**So that** ฉันสามารถวินิจฉัยหาสาเหตุที่การจ่ายเงินล้มเหลวและดำเนินการแก้ไขได้อย่างตรงจุด

**Acceptance Criteria:**
- [ ] เมื่อ API `POST /api/payment/callback` ส่งสถานะ `Failed` มา ระบบต้องบันทึกรายละเอียดของสาเหตุ เช่น `ErrorCode` (e.g. INSUFFICIENT_FUNDS, INVALID_ACCOUNT, EXPIRY_REJECT) และคำบรรยายข้อผิดพลาด
- [ ] แสดงรายละเอียดข้อผิดพลาดนี้บนแถบแจ้งเตือนของหน้าต่างประวัติการจ่ายเงินของ PO บน Payment Queue
- [ ] เก็บ Log ประวัติความพยายามในการกดจ่ายเงิน และจำนวนรอบการล้มเหลวลงใน Integration Logs หน้าจอระบบ

**Priority:** Should | **TOR Reference:** Operational Efficiency (PJ250051-Payment-03)

---

### US-136: Milestone & Partial Payment Handling
**As a** Buyer / Accountant
**I want** to process PO payments in milestones or partial amounts
**So that** สามารถจ่ายเงินล่วงหน้าและจ่ายเงินตามรอบการส่งมอบงานในแต่ละงวดสัญญาได้ถูกต้อง

**Acceptance Criteria:**
- [ ] ระบบอนุญาตให้จัดตั้งงวดการชำระเงิน (Milestones) ในหน้าจอ PO หรือสร้างคำขอแบ่งจ่ายบางส่วน (Partial Payments) เช่น งวดที่ 1 จ่าย 30%
- [ ] เมื่อกด "ส่งคำขอจ่ายเงิน (Trigger Payment)" ระบบจะดึงข้อมูลยอดของงวดปัจจุบันส่งไปยัง e-Payment และบันทึกยอดเงินค้างจ่าย (Pending Balance) ที่เหลือของ PO รายการนั้น
- [ ] อัปเดตสถานะของงวดนั้นๆ แยกเป็น `Paid` หรือ `Processing` โดย PO จะถูกปิดสมบูรณ์ (`Paid` ทั้งใบ) ก็ต่อเมื่องวดจ่ายงวดสุดท้ายเสร็จสมบูรณ์

**Priority:** Must | **TOR Reference:** Procurement Custom Contract Terms (PJ250051-Payment-04)

---

### US-137: Credit & Debit Notes Matching in Payments
**As an** Accountant
**I want** payment requests to automatically deduct approved Credit Notes
**So that** ยอดโอนเงินสุทธิ (Net Payout) ที่ส่งไปยัง e-Payment มีความถูกต้องหลังหักลบค่าปรับหรือสินค้ารับคืน

**Acceptance Criteria:**
- [ ] ระบบตรวจสอบและดึงรายการ Credit Notes (ใบลดหนี้) หรือ Debit Notes (ใบเพิ่มหนี้) ทั้งหมดที่ถูกอนุมัติเชื่อมโยงกับ PO หรือคู่ค้ารายนั้น
- [ ] หน้าจอการเงินแสดงแถบสำหรับติ๊กเลือกใบ CN/DN เพื่อนำมาหักกลบกับการจ่ายเงินรอบนี้
- [ ] ทำการคำนวณยอดเงินจ่ายสุทธิ: `Net Payment = PO Amount - CN Amount` และนำยอดสุทธิเสนอเข้า e-Payment Bridge ป้องกันการจ่ายเงินเกินขอบเขตจริง

**Priority:** Must | **TOR Reference:** Accounting Principles & Auditing (PJ250051-Payment-05)

---

## Epic P1-J: Workflow & Approval Engine

### US-121: Rule-based Approval Engine
**As a** System / Approver
**I want** approvals to be routed automatically by configured rules
**So that** อนุมัติเอกสารได้ถูกต้องรวดเร็วตามสาย DOA ของบริษัท

**Acceptance Criteria:**
- [x] (No.152) Rule-based Approval Engine (อนุมัติตามเงื่อนไข)
- [x] (No.153) Parallel Approval (อนุมัติพร้อมกัน)
- [x] (No.154) Escalation Management (ระบบเร่งรัด)
- [x] (No.155) Delegation of Authority (DOA Management)
- [x] (No.156) ทุกฟังก์ชันรองรับการเช็คสถานะที่เกี่ยวข้อง (Status Tracking)
- [x] (No.157) กรณี Reject มีระบบแจ้งเตือนผู้เกี่ยวข้องเพื่อ Revise PR/PO
- [x] (No.127) Vendor Data Governance: การขอสร้าง/แก้ไข Vendor ต้องผ่านอนุมัติ

**Priority:** Must | **TOR Reference:** Sheet 1 No.127,152,153,154,155,156,157

---

### US-122: User Authentication, Permission & Scope Control
**As a** Admin / Security
**I want** role-based authentication and granular permission/scope control
**So that** ผู้ใช้แต่ละกลุ่มเข้าถึงและดำเนินการได้เฉพาะตามสิทธิ์ที่กำหนด สอดคล้องกับมาตรการความปลอดภัยและหน้าที่ความรับผิดชอบ

**Acceptance Criteria:**
- [x] (No.92 / 122 / 192) กำหนดสิทธิ์การเข้าถึงแยกตามบริษัท / BU / Role
- [x] (Sheet2 No.242) Authentication - Local Login (Username/Password)
- [x] (Sheet2 No.243) Authentication - Active Directory Login (Azure AD / SSO)
- [x] (Sheet2 No.244-253) จัดกลุ่มและจัดการสิทธิ์ผู้ใช้งาน (Requester, Buyer, Approver, Warehouse, Accounting, Finance, Admin)
- [x] (Sheet2 No.254-259) จำกัดขอบเขตการดูข้อมูลตาม Company, Cost Center, และวงเงินที่กำหนด

**Priority:** Must | **TOR Reference:** Sheet 1 No.92,122,192 / Sheet 2 No.242-259

---

### US-123: Audit Log, Integration Monitoring & Notification
**As a** Admin
**I want** system activity logged and integration status monitored
**So that** ตรวจสอบย้อนหลังได้และทีมงานแก้ไขปัญหาการเชื่อมต่อภายนอกได้รวดเร็ว

**Acceptance Criteria:**
- [x] (No.90) ส่งอีเมลแจ้งเตือนอัตโนมัติสำหรับการเคลื่อนไหวของเอกสาร
- [x] (No.91) อัปเดตสถานะเอกสารกับ SAP B1 อัตโนมัติ
- [x] (No.93) เก็บ Log การเข้าใช้งานและกิจกรรมของผู้ใช้ได้
- [x] (No.94) ตรวจสอบสถานะการเชื่อมต่อข้อมูลระหว่าง E-Procurement และ SAP B1 ได้
- [x] (No.96 / 123) แสดงข้อมูล Audit Log และ Audit Trail ครบทุกธุรกรรม

**Priority:** Must | **TOR Reference:** Sheet 1 No.90,91,93,94,96,123

---

## Epic P1-K: SAP B1 Integration & Security Baseline

### US-124: SAP B1 Master & Transaction Integration
**As a** Integration Team
**I want** bi-directional integration between the system and SAP B1
**So that** ข้อมูล Master และ Transaction ตรงกันทั้งสองระบบ ลดความซ้ำซ้อนการกรอกข้อมูล

**Acceptance Criteria:**
- [x] (No.118) เชื่อมต่อข้อมูล Master Data ระหว่างระบบ P2P และ SAP B1 เช่น Vendor, Item, GL, Cost Center, Project, Tax Code
- [x] (No.119) ส่งข้อมูล PR/PO/GR ไปยัง SAP B1 และรับเลขที่เอกสาร/สถานะกลับมาเก็บในระบบ
- [x] (No.121) ติดตามสถานะ Interface และแสดง Error Log พร้อมกลไก Retry/Reprocess ผ่าน Dashboard

**Priority:** Must | **TOR Reference:** Sheet 1 No.118,119,120,121

---

### US-125: Security Baseline (Encryption, Access Control, Password Policy)
**As a** Security / Admin
**I want** baseline security controls implemented from day one
**So that** ข้อมูลขององค์กรและผู้ขายได้รับการปกป้องตามมาตรฐานความปลอดภัยทางไซเบอร์

**Acceptance Criteria:**
- [x] (No.158-160) เข้ารหัสข้อมูลระหว่างรับส่งและจัดเก็บ (AES-256, TLS 1.2+), จำกัดสิทธิ์ระดับ Row/Field
- [x] (No.161) สำรองข้อมูลรายวันและกู้คืนข้อมูลได้ตามแผน (Disaster Recovery Plan)
- [x] (No.170-172) นโยบายความซับซ้อนของรหัสผ่าน, Account Lockout และ Brute-force protection
- [x] (No.173-174) จัดเก็บและส่งออก Log ไปยังระบบ SIEM เก็บ Log ย้อนหลังอย่างน้อย 1 ปี
- [x] (No.186-187) รองรับ MFA และจัดการ Session Timeout / Auto Logout

**Priority:** Must | **TOR Reference:** Sheet 1 No.158-162,164,166,167,170-174,183,185-187,190

---

### US-126: Security Operations & Compliance Process
**As a** Service Provider
**I want** recurring security operations and incident-response processes in place
**So that** ระบบได้รับการตรวจสอบและป้องกันความเสี่ยงอย่างต่อเนื่องตลอดอายุสัญญา

**Acceptance Criteria:**
- [x] (No.175) ดำเนินการ Penetration Test อย่างน้อยปีละ 1 ครั้ง
- [x] (No.176) มีนโยบายติดตั้ง Security Patch ตามระดับความรุนแรง
- [x] (No.177-178) มี DR Site แยก Region และทดสอบแผนกู้คืนรายปี
- [x] (No.179-180) มีกระบวนการ Secure SDLC และ Incident Response Plan

**Priority:** Must | **TOR Reference:** Sheet 1 No.175-182,188

---

## Epic P1-L: Reporting (ขั้นต่ำ)

### US-127: Document Tracking & Exception Report
**As a** Buyer / Manager
**I want** real-time document status tracking and exception reports
**So that** ตรวจสอบสถานะการสั่งซื้อและปัญหาค้างจ่ายสะสมได้จาก Dashboard

**Acceptance Criteria:**
- [x] (No.74 / 78) แสดงรายงานวิเคราะห์ความเร็วการอนุมัติและรายงานเอกสารที่ค้างเกินกำหนด (Overdue Documents)

**Priority:** Must | **TOR Reference:** Sheet 1 No.74,78

---

# PHASE 2 — P2P Enhancement & Compliance

> เป้าหมาย: ฟังก์ชันเพิ่มเติมสำหรับการวิเคราะห์ การประเมิน และการประมูลขั้นสูง

## Epic P2-A: Advanced Sourcing

### US-201: Live Reverse Auction Sourcing
**As a** Buyer / Vendor
**I want** to execute and participate in a real-time Reverse Auction bidding event
**So that** เกิดการแข่งขันราคาอย่างอิสระและได้ข้อตกลงราคาจัดซื้อที่ดีที่สุด

**Acceptance Criteria:**
- [x] แสดงหน้าจอจำลองการแข่งราคาประมูลสดแบบ Dark Theme
- [x] มีเวลานับถอยหลัง (Timer Countdown) และตารางจัดลำดับ Supplier Leaderboard ตามเวลาจริง
- [x] แสดง Activity Feed ล็อกราคาระหว่างผู้แข่งขันอย่างต่อเนื่อง
- [x] มีปุ่มให้จัดซื้อสามารถยื่นข้อเสนอต่อรองราคาพิเศษ (e.g. ลดเพิ่ม 1.5%) ให้ Supplier กดตอบรับได้

**Priority:** Should | **TOR Reference:** Custom Bidding Enhancement (Option 1)

---

### US-202: Multi-criteria Evaluation Sheets
**As a** Buyer / Bidding Committee
**I want** to evaluate bids based on non-price criteria (Technical, Delivery, Warranty)
**So that** ได้ผู้ชนะการเสนอราคาที่มีความเพียบพร้อมในทุกมิติ ไม่ใช่เลือกเพียงแค่ราคาต่ำสุดเท่านั้น

**Acceptance Criteria:**
- [x] คณะกรรมการสามารถปรับเลื่อนคะแนน Slider เพื่อให้เกรด Supplier ในมิติ เช่น *คุณภาพเทคนิค*, *ความเร็วในการจัดส่ง*, *การรับประกัน/SLA*, *ความมั่นคงของบริษัท*
- [x] ระบบคำนวณคะแนนเกรดด้านเทคนิคออกมาเป็น 100% โดยอัตโนมัติ
- [x] ระบบเชื่อมผลการประเมินกลับมาคำนวณถ่วงน้ำหนักรวมกับคะแนนราคาเพื่อชี้วัดอันดับคะแนนรวมในส่วนเปรียบเทียบซองปิด (Sealed Bidding Comparison)

**Priority:** Should | **TOR Reference:** Custom Bidding Enhancement (Option 1)

---

### US-203 ถึง US-219: (คงไว้ตามข้อกำหนด TOR เดิมใน Sheet 1 & Sheet 2)
- **Advanced Evaluation & Vendor Scorecard Suite** (US-204 to US-208)
- **AP Advanced & Credit/Debit Notes Management** (US-209 to US-214)
- **Full Reporting Suite & Custom Dashboard Builder** (US-215 to US-217)
- **Advanced Compliance, IP/Geo Restrictions & PDPA** (US-218)
- **Admin Training, Knowledge Base & SLAs** (US-219)

**Priority:** Should/Optional | **TOR Reference:** Mapped to Sheet 1 & Sheet 2 remaining Phase 2 items.

---

# PHASE 3 — Employee to Payment (ESS)

> **⚠️ DEFERRED / OUT-OF-SCOPE:** ตามคำร้องขอของลูกค้า ระบบเบิกจ่ายของพนักงาน (Employee Self-Service / ESS) ได้แก่ หมวดการเดินทาง, เงินยืมทดรองจ่าย, ค่าใช้จ่ายเบ็ดเตล็ด, การโอนเงินตราต่างประเทศ และค่ารักษาพยาบาล **ได้ถูกลดสถานะจากการพัฒนาเต็มระบบเป็นเฉพาะหน้ากาก Mockup เท่านั้น** เพื่อไปเร่งพัฒนาการเชื่อมต่อ e-Payment และ Budget Control ใน Phase 1

### US-301 ถึง US-312: ESS Mockups
- **Epic P3-A: Travel & Advance Mockups** (TA Request, Cash Advance, Fixed Advance)
- **Epic P3-B: Expense Claim & Reimbursement Mockups** (Perdiem, Mileage, Receipt attachments)
- **Epic P3-C: Foreign Remittance & Medical Mockups** (Foreign currency return, Family medical claims)
- **Epic P3-D: ESS Inbox & Approval Mockups**
- **Epic P3-E: ESS Standard Reports Mockups** (34 standard layouts)
- **Epic P3-F: Payroll & HR Integration Mockups**

**Priority:** Mockup Only | **TOR Reference:** Refactored from Sheet 2 items.

---

# PHASE 4 — AI Enablement

> เป้าหมาย: จุดเชื่อมต่อระบบอัจฉริยะ (AI Touchpoints) ที่พัฒนาขึ้นบนหน้าจอจัดซื้อและคลังสินค้าเพื่อการพิจารณาตัดสินใจและลดภาระผู้ใช้งาน (ปัจจุบันพัฒนาเป็น Interactive Mockups ในหน้าจอ Prototype เพื่อขอรับการยืนยันการใช้บริการจากกลุ่มเป้าหมาย)

### US-401: AI Market & RFQ Sourcing Suggestions
- **Interface:** Injected suggestion widget on Bidding/Comparison pages. Suggests alternative local contractors and lists web-scraped price indices for comparison.

### US-402: AI Vendor Sentiment & Insights
- **Interface:** Renders visual sentiment rating cards (positive/neutral/negative gauges) on Vendor Detail Profiles based on external public sources review scraping.

### US-403: Smart DOA Risk Auditor Badge
- **Interface:** Embeds compliance risk classification badges (e.g. Low/High Risk flags) inside Approval drawers to help approvers analyze compliance of the submissions.

### US-404: Goods Receipt Defect Detection
- **Interface:** Displays a computer vision simulator inside the GR creation window (`/gr-stock/create`) showing bounded boxes highlighting mock defects (e.g. package damage) on cargo photographs.

### US-405: AI Stock Replenishment Planner
- **Interface:** Smart inventory reorder widget under `/gr-stock` suggesting reorder points and safety stock levels.

### US-406: AP Invoice OCR Scanner
- **Interface:** Split-screen scanning dashboard on `/finance` displaying raw invoices side-by-side with parsed metadata and automatically populating inputs.

### US-409: AI Price Benchmarking
- **Interface:** Historical commercial score trends and benchmarking line graphs during RFQ evaluation.

---

# สรุป Coverage ทั้งหมด (Traceability Summary)

| Phase | ขอบเขตหลัก | จำนวน User Story | สถานะการทำงาน |
|---|---|---|---|
| Phase 1 | Core MVP, e-Payment Bridge, Cost Center Budget, Post-Bidding Noti, Enterprise Cases | 40 Stories | พัฒนาสมบูรณ์ตามขอบเขตใหม่ |
| Phase 2 | Advanced Sourcing & Evaluation (Reverse Auction, Multi-Criteria) | 19 Stories | พัฒนาสมบูรณ์ตามความต้องการ (Mockup + Core Calculations) |
| Phase 3 | ESS Module (Travel, Advance, Expense, Medical) | 12 Stories | จัดทำเฉพาะ Mockup (Out of scope of implementation) |
| Phase 4 | AI Enablement (Sourcing, OCR, GR defect, Replenishment planner) | 9 Stories | จัดทำเป็น Interactive Mockup ในระบบ Prototype |
| **รวม** | | **80 Stories (511 TOR RQs)** | |

User Story — e-Procurement / P2P System (PJ250051 SCGJWD)
เอกสารนี้รวบรวม User Story ทั้งหมดของระบบ e-Procurement โดยวิเคราะห์และแปลงมาจากเอกสาร TOR_P2P_Function_Requirement_VD2.00.1 (Final) ทั้ง 3 ชีท (Purchase & Vendor Portal, Vendor to Payment, e-Bidding) รวม 511 รายการ Requirement (RQ/No.) ให้ครบทุกข้อ โดยจัดกลุ่มเป็น User Story ระดับ Function (1 Story ครอบคลุมหลาย RQ ที่สัมพันธ์กัน) เพื่อให้นำไปวางแผน Sprint ได้จริง พร้อมอ้างอิงเลข TOR No. ในทุก Acceptance Criteria เพื่อ Traceability แบบ 100%
จัดกลุ่มเป็น 4 Phase ตามแผนการส่งมอบที่ตกลงไว้ใน Project Overview:
Phase
ชื่อ
ขอบเขตหลัก
AI
Phase 1
P2P Core MVP
Master Data → PR → Bidding พื้นฐาน → PO → GR → Invoice → Payment, SAP B1, Security พื้นฐาน
ไม่มี
Phase 2
P2P Enhancement & Compliance
Advanced Sourcing, Evaluation, Full Analytics, AP ขั้นสูง, Compliance ระดับสูง
ไม่มี
Phase 3
Employee to Payment (ESS)
Travel/Advance/Expense/Foreign/Medical — Domain แยกจาก P2P
ไม่มี
Phase 4
AI Enablement
AI Touchpoint ทั้ง 9 จุดตาม Roadmap เดิม
มี

รูปแบบ User Story: As a [Role] / I want [Feature] / So that [Benefit] ตามด้วย Acceptance Criteria ที่อ้างอิง TOR No. ทุกข้อ, Priority (M=Must, S=Should, O=Optional ตามที่ระบุใน TOR) และ TOR Reference
หมายเหตุเรื่อง Duplicate: เอกสาร TOR มีบาง Requirement ปรากฏซ้ำกันข้าม Sheet (เช่น Technical/Security/Implementation Module ใน Sheet "Vendor to Payment" ส่วนที่ 5/6/7 ซ้ำกับ Sheet "Purchase & Vendor Portal" Module 13/15/16) เพื่อไม่ให้เกิด User Story ซ้ำซ้อน เอกสารนี้รวม Story เดียวแล้วอ้างอิง TOR No. ของทั้งสอง Sheet ไว้ในที่เดียวกัน รายละเอียดอยู่ในหัวข้อ "Cross-Reference ของรายการที่ซ้ำกัน" ท้ายเอกสาร


PHASE 1 — P2P Core MVP
เป้าหมาย: ระบบใช้งานได้จริงครบ Flow ตั้งแต่ Master Data จนถึง Payment โดยไม่มี AI, เชื่อมต่อ SAP B1, รองรับ 1 BU นำร่องก่อนขยาย
Epic P1-A: Master Data Management (MDM)
US-101: Product / Service Master
As a Buyer / MDM Admin I want to create and maintain product/service master records with pricing and lifecycle info So that ทุกหน่วยงานใช้ข้อมูลสินค้าชุดเดียวกัน ลดความซ้ำซ้อนและความผิดพลาดของราคา
Acceptance Criteria:
[ ] (No.1) กรอกข้อมูลสินค้า เช่น ชื่อ ประเภท รหัส (Auto) หน่วย ราคา ช่วงเวลาที่มีผล รายละเอียด และแนบรูปภาพ/ใบเสนอราคาได้ทั้งทันทีหรือภายหลัง
[ ] (No.2) จัดการราคาสินค้าหลายระดับ เช่น "ราคาเดียวต่อ Volume" พร้อม Note อ้างอิง และรองรับหลายราคาต่อ 1 สินค้าผ่านฟังก์ชัน Adjust
[ ] (No.3) แสดงรายการสินค้าให้ทุก BU เห็นร่วมกัน กำหนด Owner BU ได้
[ ] (No.4 — เฉพาะ Sync พื้นฐาน) Sync ข้อมูลสินค้าที่เพิ่มในระบบเข้าสู่ SAP ได้ (การส่ง Code Item ไป ERP หลาย BU แบบเต็มรูปแบบอยู่ใน Phase 2)
[ ] (No.5) แจ้งเตือนรายการสินค้าที่ต้องอัปเดตราคาหรือใกล้หมดอายุ พร้อมแสดงรายการและ Tag แยก
[ ] (No.6) อัปเดตราคาลง E-Catalog ได้แบบเรียลไทม์
[ ] (No.20) มีโครงสร้างมาตรฐานสินค้า (Item Standardization Framework)
[ ] (No.22) จัดกลุ่มสินค้า/บริการ (Category Management)
Priority: Must | TOR Reference: Sheet 1 No.1,2,3,4,5,6,20,22

US-102: Vendor Master & Registration
As a Vendor / Buyer I want to register and maintain vendor master data with supporting documents and validation So that ข้อมูลผู้ขายถูกต้อง ตรวจสอบได้ และใช้ซ้ำได้ทุก BU โดยไม่ต้องกรอกใหม่
Acceptance Criteria:
[ ] (No.8) Vendor หรือ Buyer ลงทะเบียน Vendor ใหม่ กรอกข้อมูล + แนบเอกสาร (ภพ.20, Book Bank, หนังสือรับรองบริษัท) และ Sync กับกรมพัฒนาธุรกิจหรือหน่วยงานข้อมูลกลางได้
[ ] (No.9) Buyer ตรวจสอบข้อมูลที่ Vendor กรอก และ Active Vendor พร้อมส่งข้อมูลเข้า SAP
[ ] (No.10) กำหนด Vendor ให้เป็น Master ใช้ซ้ำใน BU อื่น โดย Sync Auto จาก Master Profile โดยไม่ต้องกรอกใหม่
[ ] (No.11) อัปเดตคะแนนประเมินรายปีของ Vendor บันทึกลงใน Vendor Profile
[ ] (No.12) แยกประเภทของ Vendor ได้ (ผู้ขาย/ผู้รับเหมาแรงงาน/ผู้ให้บริการ) เพราะมีผลตอนประเมินประจำปี
[ ] (No.18) Vendor Golden Record: Unique Identifier (Tax ID based), Deduplication Logic, Merge/Split capability, Status (Active/Block/Blacklist)
[ ] (No.19) Item Master Management: รหัสกลาง + mapping รหัสแต่ละ BU เชื่อมข้อมูลกันโดยไม่กระทบของเดิม
[ ] (No.29) ตรวจจับการขึ้นทะเบียน Vendor ซ้ำ เช่น เช็คเลขผู้เสียภาษี / ชื่อ / ที่อยู่
[ ] (No.97) ตรวจสอบข้อมูลผู้ขายซ้ำ (Duplicate Vendor Check) จาก Tax ID, ชื่อผู้ขาย, เลขที่บัญชีธนาคาร ก่อนอนุมัติ Vendor
[ ] (No.98) กำหนดวันหมดอายุเอกสารผู้ขาย เช่น หนังสือรับรองบริษัท ภ.พ.20 และหนังสือมอบอำนาจ พร้อมแจ้งเตือนก่อนหมดอายุ
[ ] (No.99) อนุมัติการแก้ไขข้อมูลสำคัญของผู้ขาย เช่น บัญชีธนาคาร ที่อยู่ ข้อมูลภาษี โดยเก็บประวัติการเปลี่ยนแปลง
Priority: Must | TOR Reference: Sheet 1 No.8,9,10,11,12,18,19,29,97,98,99

US-103: Master Data Governance (Accounting / Multi-Company Mapping)
As a System Admin / Accounting I want to manage company-specific master data mapping for Item, Vendor, and Asset So that ข้อมูลที่ใช้รหัสต่างกันในแต่ละบริษัทเชื่อมกับ ERP ได้ถูกต้องครบทุกบริษัทในเครือ
Acceptance Criteria:
[ ] (No.13) จัดการข้อมูล Vendor Financial Master
[ ] (No.14) จัดการข้อมูล Vendor Type / Business Category
[ ] (No.15) จัดการข้อมูล Item ที่มีรหัสต่างกันตามบริษัทตอนลง ERP (1 Item คนละบริษัท = คนละรหัส)
[ ] (No.16) จัดการข้อมูล Vendor ที่มีรหัสต่างกันตามบริษัทตอนลง ERP (1 Vendor คนละบริษัท = คนละรหัส)
[ ] (No.17) จัดการข้อมูล Physical/Digital Asset ที่สั่งซื้อ ระบุเจ้าของได้ พร้อม Sync HR
[ ] (No.25) Control Code Item, Central Mapping Code ใน SAP B1 แยกตาม BU ได้
[ ] (No.128) Multi-Company Structure Management (โครงสร้างหลายบริษัท)
[ ] (No.129) Business Unit Hierarchy (โครงสร้าง BU)
[ ] (No.130) Cost Center Integration (เชื่อม Cost Center)
Priority: Must | TOR Reference: Sheet 1 No.13,14,15,16,17,25,128,129,130

US-104: Product Search & Lookup
As a Requester I want to search for products without typing the full product name So that ค้นหาสินค้าที่ต้องการได้สะดวกและรวดเร็วขึ้น
Acceptance Criteria:
[ ] (No.24) ระบบค้นหาสินค้าได้โดยไม่ต้องพิมพ์ชื่อเต็มของสินค้า
Priority: Must | TOR Reference: Sheet 1 No.24

Epic P1-B: Procurement Initiation (PR)
US-105: Catalog & New Product Request
As a Requester I want to browse the catalog and request products including new items not yet listed So that ฉันสามารถขอซื้อสินค้าที่ต้องการได้ครบทุกกรณีพร้อมข้อมูลราคาที่ถูกต้อง
Acceptance Criteria:
[ ] (No.30) Request สินค้าใหม่ กรอกรายละเอียด ส่งอนุมัติ (Manager, Buyer) และแสดงรายการให้จัดซื้อพิจารณา
[ ] (No.31) แสดงสินค้าใน Catalog พร้อมข้อมูล ชื่อ รายละเอียด ราคา และตรวจสอบอายุราคาว่าหมดอายุหรือยัง
[ ] (No.32) เลือกสินค้าจาก Catalog ใส่ลงใน PR ได้หลายรายการ (ประเภทเดียวกัน) พร้อม Preview Price/Quotation รองรับ PR > อนุมัติ > PO โดยไม่ต้องอนุมัติซ้ำใน SAP (หากกำหนดไว้)
[ ] (No.33) สำหรับสินค้าที่ไม่มีราคาชัดเจน กรอกข้อมูลเพิ่มเติม เช่น จำนวน ราคา หน่วยงาน และแนบเอกสารก่อนทำ PR
Priority: Must | TOR Reference: Sheet 1 No.30,31,32,33

US-106: PR Configuration, Budget Control & Policy
As a Buyer / Finance I want PR creation to validate against budget and procurement policy automatically So that ป้องกันการสั่งซื้อเกินงบประมาณและไม่เป็นไปตามนโยบายจัดซื้อขององค์กร
Acceptance Criteria:
[ ] (No.34) ตรวจสอบวงเงินงบประมาณของ BU ก่อนสร้างหรืออนุมัติ PR/PO
[ ] (No.35) กำหนดเส้นทางการอนุมัติ PR/PO ตามระดับผู้มีสิทธิ์แต่ละ BU
[ ] (No.48) PR Template Configuration (ตั้งค่าแบบฟอร์ม PR)
[ ] (No.49) Dynamic Field Control (ฟิลด์ปรับตามประเภทสินค้า/บริการ)
[ ] (No.50) Budget Validation (ตรวจสอบงบประมาณ)
[ ] (No.100) สร้าง PR แบบหลายบรรทัด หลายหน่วยงาน หลายศูนย์ต้นทุนในเอกสารเดียว
[ ] (No.101) ตรวจสอบงบประมาณคงเหลือแบบ Real-time และกันวงเงินงบประมาณเมื่อ PR/PO ได้รับอนุมัติ
[ ] (No.102) ควบคุมการสั่งซื้อเกินงบประมาณ โดยแจ้งเตือน บล็อก หรือขออนุมัติเพิ่มเติมได้
[ ] (No.103) กำหนดนโยบายการสั่งซื้อ เช่น วงเงินตาม DOA, รายการสินค้าต้องห้ามซื้อ, บังคับแนบเอกสารประกอบ
Priority: Must | TOR Reference: Sheet 1 No.34,35,48,49,50,100,101,102,103

Epic P1-C: Vendor Selection & Sourcing (Bidding พื้นฐาน)
US-107: Price Comparison
As a Buyer I want to compare prices from multiple vendors side by side So that เลือกผู้ขายที่ราคาดีที่สุดได้อย่างโปร่งใสและมีหลักฐานบันทึกไว้
Acceptance Criteria:
[ ] (No.36) แสดงราคาสินค้าจากหลาย Vendor พร้อมเปรียบเทียบราคา แยกตาม Vendor และแสดงราคาที่เคยเสนอแต่ไม่ผ่าน
[ ] (No.46) เปรียบเทียบราคาแบบ Digital ตามระเบียบจัดซื้อจัดจ้าง และบันทึกข้อมูลได้
[ ] (No.47) แยกประเภทของการเปรียบเทียบแบบหลายมิติ/หลายราคาได้
Priority: Must | TOR Reference: Sheet 1 No.36,46,47

US-108: RFQ / e-Bidding (รูปแบบที่ 2 — TOR/RFQ/BOQ ปิดราคา)
As a Buyer I want to run a closed-price RFQ bidding process with at least 3 suppliers So that ได้ราคาที่ดีที่สุดผ่านกระบวนการที่โปร่งใส ตรวจสอบได้ และเป็นไปตามระเบียบจัดซื้อ
Acceptance Criteria:
[ ] (No.37) สร้างรายการประมูล พร้อมรายละเอียดสินค้า วันปิดรับเสนอราคา เงื่อนไข และเลือก/เพิ่ม Vendor เข้าร่วมได้หลายรูปแบบ
[ ] (No.38) Vendor วางใบเสนอราคาได้โดยเห็นเฉพาะของตนเอง และ Buyer เห็นรายการจากทุก Vendor
[ ] (No.39) Buyer ประเมินราคาโดยไม่ต้องใช้แบบฟอร์มเพิ่มเติม คัดเลือก Vendor ได้ พร้อมสร้าง PR และ PO ทันที
[ ] (No.40) ตรวจสอบว่าต้องมี Item ก่อนการเปิดประมูล เพื่อความถูกต้องของขั้นตอน
[ ] (e-Bidding No.2) ขั้นตอน RFQ/BOQ ปิดราคา: พนักงานจัดซื้อส่ง TOR/RFQ/BOQ พร้อมเอกสารประกอบและรายชื่อ Supplier ≥3 ราย (ก่อนวันเสนอราคา ≥2 เดือน) → ผู้มีอำนาจ/คณะกรรมการ Approve ก่อนเปิดรับราคา → Supplier กรอกราคาในระบบ (แก้ไขได้แต่ต้องสูงกว่าครั้งแรก) → คณะกรรมการตัดสินหรือต่อรองเพิ่มและ Award ผู้ชนะ
[ ] (e-Bidding No.4) การจ่ายเงินให้ Supplier ต้องผ่านการอนุมัติขั้นสุดท้ายของ e-Procurement เท่านั้น
Priority: Must | TOR Reference: Sheet 1 No.37,38,39,40 / e-Bidding No.2,4

Epic P1-D: Purchase Order Management
US-109: Auto PR→PO, PO Revision & Vendor Confirmation
As a Buyer / Vendor I want PO to be generated automatically after PR approval, support post-approval revision, and capture vendor confirmation digitally So that ลดเวลาในการออก PO และผู้ขายรับทราบคำสั่งซื้อพร้อมยืนยันวันส่งมอบได้ทันที
Acceptance Criteria:
[ ] (No.52) สร้าง PR และ PO อัตโนมัติหลังจากผ่านการอนุมัติได้
[ ] (No.54) Vendor สามารถตอบรับ PO ผ่าน Portal ได้
[ ] (No.55) Vendor สามารถยืนยันวันที่จัดส่งสินค้าได้
[ ] (No.107) แก้ไข PO หลังอนุมัติผ่านกระบวนการเปลี่ยนแปลงเอกสาร (PO Change/Revision Control) พร้อมเก็บประวัติ
[ ] (No.132) ดึงข้อมูลจาก PR (คนละโปรแกรม) เข้ามาเป็น PO ได้
Priority: Must | TOR Reference: Sheet 1 No.52,54,55,107,132

Epic P1-E: Goods Receipt & Claim Management
US-110: Goods Receipt (GR)
As a Warehouse staff / Requester I want to record goods receipt with photo evidence, partial receipt handling, and quality scoring So that มีหลักฐานการรับสินค้าครบถ้วนและใช้ประเมินคุณภาพผู้ขายได้
Acceptance Criteria:
[ ] (No.56) บันทึกรับสินค้า (GR) ผ่าน Web ได้
[ ] (No.57) แนบรูปภาพหลักฐานการรับสินค้า หรือสินค้าเสียหายได้
[ ] (No.58) ให้คะแนนการรับของเพื่อประเมินคุณภาพผู้ขายได้ (รายครั้ง)
[ ] (No.108) รับสินค้าบางส่วน (Partial Receipt) รับเกิน/ขาดตามค่าความคลาดเคลื่อนที่กำหนดได้
[ ] (No.109) รับงานบริการ (Service Entry/Service Acceptance) ก่อนนำไปวางบิลได้
Priority: Must | TOR Reference: Sheet 1 No.56,57,58,108,109

US-111: Claim & Return Management
As a Requester / Buyer I want to log claims/complaints and create return documents So that ติดตามปัญหาสินค้าและจัดการกระบวนการคืนสินค้าได้เป็นระบบ
Acceptance Criteria:
[ ] (No.59) บันทึกเคลมสินค้า ร้องเรียน หรือบันทึกการแก้ไขปัญหา (Corrective Action) ได้
[ ] (No.60) สร้างเอกสารคืนสินค้า (Return Note) และจัดการกระบวนการคืนได้
Priority: Must | TOR Reference: Sheet 1 No.59,60

Epic P1-F: Stock & Inventory (พื้นฐาน)
US-112: Stock Sync & Summary
As a Warehouse staff / Buyer I want stock data to sync with SAP B1 and show movement/sufficiency summary So that ทราบยอดคงเหลือที่ตรงกับ ERP และวางแผนสั่งซื้อล่วงหน้าได้
Acceptance Criteria:
[ ] (No.61) เชื่อมข้อมูลสินค้ากับ SAP B1 เพื่ออัปเดตสต็อกอัตโนมัติได้
[ ] (No.62) สรุปยอดการเคลื่อนไหวและประเมินความเพียงพอของสต็อกประจำปีได้
[ ] (No.63) แสดงผลสรุปและแนวโน้มการใช้สินค้าคงคลังได้
Priority: Must | TOR Reference: Sheet 1 No.61,62,63

Epic P1-G: Document & Contract Management
US-113: Attachment Management & PR/PO Custom Fields
As a Buyer / Admin I want to attach all file types and configure custom fields per BU on PR/PO So that เอกสารมีหลักฐานครบถ้วนและรองรับความแตกต่างของแต่ละ BU
Acceptance Criteria:
[ ] (No.64) Custom Columns ใน PR/PO ตามประเภท BU รวมถึง Report/Export ได้
[ ] (No.66) รองรับการแนบไฟล์ทุกประเภท (All file)
Priority: Must | TOR Reference: Sheet 1 No.64,66

US-114: Contract / Blanket Agreement Linkage (พื้นฐาน)
As a Buyer I want to link pre-agreed contract/blanket pricing to PR/PO and track contract validity So that ราคาที่ตกลงไว้ล่วงหน้าถูกใช้อ้างอิงถูกต้อง และไม่พลาดวันต่ออายุสัญญา
Acceptance Criteria:
[ ] (No.105) จัดการสัญญา/ข้อตกลงราคา (Contract/Blanket Agreement) และอ้างอิงไปยัง PR หรือ PO ได้
[ ] (No.106) ควบคุมมูลค่าสัญญาคงเหลือ วันหมดอายุสัญญา และแจ้งเตือนต่ออายุสัญญา ทั้งภายในและภายนอก
Priority: Must | TOR Reference: Sheet 1 No.105,106
หมายเหตุ: โมดูล Contract Administration แบบเต็มรูปแบบ (No.65) และ Digital Signature (No.67) อยู่ใน Phase 2 — Phase 1 รองรับเฉพาะการอ้างอิงราคา/วันหมดอายุที่จำเป็นต่อการออก PO เท่านั้น

Epic P1-H: Vendor Portal
US-115: Vendor Self-Service Portal
As a Vendor I want a self-service portal to register, submit quotations, and confirm purchase orders So that ฉันทำธุรกรรมกับบริษัทได้สะดวกโดยไม่ต้องรอติดต่อ Buyer ทางอีเมล/โทรศัพท์
Acceptance Criteria:
[ ] รวม Use Case จาก US-102 (ลงทะเบียน Vendor — No.8), US-108 (เสนอราคาเห็นเฉพาะของตน — No.38), US-109 (ตอบรับ PO + ยืนยันวันส่งมอบ — No.54,55) ที่แสดงผลในมุมมอง Vendor Portal โดยแบ่งสิทธิ์ให้ Vendor เห็นเฉพาะข้อมูลของตนเอง
Priority: Must | TOR Reference: อ้างอิงร่วมกับ Sheet 1 No.8,38,54,55 (ไม่เพิ่ม RQ ใหม่ — เป็นมุมมอง UI ของ Function ที่นับไว้แล้ว)

Epic P1-I: Invoice & Accounts Payable
US-116: Invoice Creation with MDM Mapping
As a Vendor / Accounting I want to create invoices with data auto-mapped from PO/Vendor master (Key-in, no OCR in this phase) So that ลดการกรอกข้อมูลซ้ำและลดความผิดพลาดในการวางบิล
Acceptance Criteria:
[ ] (Sheet2 No.2) Goods Receipt - Domestic: เอกสาร Goods Receipt ภายในประเทศ
[ ] (Sheet2 No.10) สร้างเอกสารวางบิล ระบบ mapping ข้อมูลจาก MDM มาได้ ลดการ Key ข้อมูลบางส่วน
[ ] (Sheet2 No.11) ทำ Document Split & Console, Multi-Document Attachment Type
Priority: Must | TOR Reference: Sheet 2 No.2,10,11

US-117: Invoice Matching, Tax & GL Validation
As a Accounting I want invoices to be automatically matched, validated, and posted to correct GL/Cost Center So that ป้องกันการจ่ายเงินผิดพลาดหรือซ้ำซ้อน และข้อมูลบัญชีถูกต้องตรงกับ SAP B1
Acceptance Criteria:
[ ] (No.69) Invoice Matching Engine (จับคู่ PO-GR-Invoice)
[ ] (No.70 / Sheet2 No.110,222 dup) Duplicate Invoice Detection จากเลขที่เอกสาร ผู้ขาย วันที่เอกสาร และจำนวนเงิน
[ ] (No.71) Tax Validation (ตรวจ VAT/ภาษี)
[ ] (No.111 / Sheet2 No.222 dup) ทำ 2-Way และ 3-Way Matching โดยกำหนด Tolerance ได้ตามประเภทสินค้า/กลุ่มผู้ขาย
[ ] (No.112) คำนวณภาษีมูลค่าเพิ่ม ภาษีหัก ณ ที่จ่าย รองรับเชื่อมต่อ e-Tax/e-Withholding Tax
[ ] (No.113 / Sheet2 No.223 dup) แยกประเภทค่าใช้จ่าย บัญชี GL ศูนย์ต้นทุน และโครงการ เพื่อส่งข้อมูลเข้า SAP B1 ได้ถูกต้อง
Priority: Must | TOR Reference: Sheet 1 No.69,70,71,111,112,113 (รวม Sheet 2 No.110,221,222,223 ที่ซ้ำกัน)

US-118: Payment Request (Domestic — PO / Non-PO)
As a Accounting I want to create domestic payment requests linked to PO or Non-PO with budget check So that จ่ายเงินผู้ขายได้ถูกต้องตามกระบวนการอนุมัติและงบประมาณที่กำหนด
Acceptance Criteria:
[ ] (Sheet2 No.15) Payment Request - Domestic: เอกสารคำขอชำระเงินภายในประเทศ
[ ] (Sheet2 No.18) Payment Request - PO (Auto Post): บันทึกบัญชีแบบมี Purchase Order
[ ] (Sheet2 No.19) Payment Request - Non-PO (Auto Post): บันทึกบัญชีระบุ Expense Code, Cost Center, IO
[ ] (Sheet2 No.24) Payment Request - Auto Indexing (Manual Post): บันทึกบัญชีผ่าน Text file นำไปวางใน SFTP ตามรอบ
[ ] (Sheet2 No.25) Payment Request - Manual Matching (Manual Post): ระบุ Accounting Doc. จาก Open-Clearing CSV เพื่อดำเนินเอกสารต่อ
[ ] (Sheet2 No.26) Payment Request - Non Indexing & Non Matching (Manual Post): ค้นหา Accounting Doc. จาก Open-Clearing CSV เพื่อดำเนินเอกสารต่อ
[ ] (Sheet2 No.27) Payment Request - Budget Check: ตรวจสอบงบประมาณของ Cost Center พร้อมแจ้งเตือนเมื่อเกินงบและส่งอนุมัติตามอำนาจ
Priority: Must | TOR Reference: Sheet 2 No.15,18,19,24,25,26,27

US-119: Payment Scheduling & Bank Integration
As a Treasury / Accounting I want automatic payment proposals, multi-level approval, and bank file integration So that จ่ายเงินตรงตามกำหนดเวลา ลดงาน Manual และมี Segregation of Duties ที่ถูกต้อง
Acceptance Criteria:
[ ] (No.73) Payment Schedule Management (จัดตารางจ่ายเงิน)
[ ] (Sheet2 No.1) Payment Due Date Auto Calculation
[ ] (No.114 / Sheet2 No.226 dup) สร้าง Payment Proposal อัตโนมัติตามวันครบกำหนดชำระ พร้อมเงื่อนไขส่วนลดเงินสด และ Hold Payment
[ ] (No.115 / Sheet2 No.226 dup) อนุมัติการจ่ายเงินหลายระดับ แยกหน้าที่ผู้จัดทำ/ผู้อนุมัติ/ผู้ปล่อยจ่ายตาม Segregation of Duties
[ ] (No.116 / Sheet2 No.197,198,199 dup) เชื่อมต่อธนาคารเพื่อสร้างไฟล์โอนเงิน และรับผลการโอนกลับเพื่ออัปเดตสถานะอัตโนมัติ
Priority: Must | TOR Reference: Sheet 1 No.73,114,115,116 / Sheet 2 No.1 (รวม Sheet2 No.197-199,226 ที่ซ้ำ/เกี่ยวเนื่อง)

US-120: Request Utility & Productivity (พื้นฐาน)
As a Accounting I want productivity utilities for creating payment documents in bulk So that ลดเวลาในการกรอกเอกสารจำนวนมากในแต่ละรอบบัญชี
Acceptance Criteria:
[ ] (Sheet2 No.29) Vendor Onetime: สร้าง Vendor ชั่วคราวเพื่อทำจ่าย
[ ] (Sheet2 No.30) Search Vendor from RD: ค้นหา Vendor ด้วย Tax ID จาก API กรมสรรพากร
[ ] (Sheet2 No.31) Upload Excel for create document: สร้างเอกสารด้วยการอัพโหลด Excel ตาม Format ที่กำหนด
[ ] (Sheet2 No.32) Copy & Paste from Excel for create Invoice
[ ] (Sheet2 No.33) Copy & Paste from Excel for add budget information (Expense Code/Cost Center/IO)
[ ] (Sheet2 No.34) Apply to item (for multiple invoice)
[ ] (Sheet2 No.35) PDF Editor: รวมไฟล์และปรับแต่ง PDF ที่แนบไว้ในเอกสาร
[ ] (Sheet2 No.36) Create Invoice with attachment: สร้าง Invoice ตามจำนวนเอกสารที่แนบ
[ ] (Sheet2 No.37) Default Field By Company
[ ] (Sheet2 No.40) Auto DOA: คำนวณอำนาจการอนุมัติผ่าน API
[ ] (Sheet2 No.41) Lane: กำหนดขอบเขตงานภายในทีมบัญชีสำหรับเอกสาร Payment Request
Priority: Must | TOR Reference: Sheet 2 No.29,30,31,32,33,34,35,36,37,40,41

Epic P1-J: Workflow & Approval Engine (ใช้แทน "DOA AI")
US-121: Rule-based Approval Engine
As a System / Approver I want approvals to be routed automatically by configured rules (not AI) So that อนุมัติเอกสารได้ถูกต้องรวดเร็ว โดยไม่ต้องพึ่งพา AI ใน Phase นี้
Acceptance Criteria:
[ ] (No.152) Rule-based Approval Engine (อนุมัติตามเงื่อนไข)
[ ] (No.153) Parallel Approval (อนุมัติพร้อมกัน)
[ ] (No.154) Escalation Management (ระบบเร่งรัด)
[ ] (No.155) Delegation of Authority (DOA Management)
[ ] (No.156) ทุกฟังก์ชันรองรับการเช็คสถานะที่เกี่ยวข้อง (Status Tracking)
[ ] (No.157) กรณี Reject มีระบบแจ้งเตือนผู้เกี่ยวข้องเพื่อ Revise PR/PO
[ ] (No.127) Vendor Data Governance: กำหนด Workflow การขอสร้าง/แก้ไข Vendor ต้องมีการอนุมัติก่อน เพื่อป้องกันข้อมูลผิดและควบคุมมาตรฐาน
[ ] (No.191) จัดให้มี Project Manager ประจำโครงการ (ฝั่งผู้ให้บริการ)
Priority: Must | TOR Reference: Sheet 1 No.127,152,153,154,155,156,157,191

US-122: User Authentication, Permission & Scope Control
As a Admin / Security I want role-based authentication and granular permission/scope control So that ผู้ใช้แต่ละกลุ่มเข้าถึงและดำเนินการได้เฉพาะตามสิทธิ์ที่กำหนด สอดคล้องกับสาย Segregation of Duties ของงานบัญชี
Acceptance Criteria:
[ ] (No.92) กำหนดสิทธิ์การเข้าถึงแยกตามบริษัท / BU / Role
[ ] (No.122) กำหนดสิทธิ์ตาม Role, Company, BU, Cost Center, ประเภทเอกสาร พร้อมรองรับการอนุมัติแทน (Delegation)
[ ] (No.192) ผู้ใช้งานสามารถ Login แยกตาม BU ได้
[ ] (Sheet2 No.242) Authentication - Local Login (Username/Password)
[ ] (Sheet2 No.243) Authentication - Active Directory Login (Azure, อิงจาก Email)
[ ] (Sheet2 No.244) Authentication - User Management: เพิ่ม แก้ไข กำหนดสถานะผู้ใช้งาน
[ ] (Sheet2 No.245) User Group & Permission - User Group: จัดการสิทธิ์เป็นรูปแบบกลุ่ม
[ ] (Sheet2 No.246) Permission - Create Request: สิทธิ์ในการสร้างเอกสาร
[ ] (Sheet2 No.247) Permission - Verify: สิทธิ์ในการบันทึกบัญชี
[ ] (Sheet2 No.248) Permission - Approve Verify: สิทธิ์ในการอนุมัติเอกสาร (หัวหน้าบัญชี)
[ ] (Sheet2 No.249) Permission - Confirm: สิทธิ์ในการอนุมัติเอกสารเพื่อทำจ่าย
[ ] (Sheet2 No.250) Permission - Finance Verify: สิทธิ์ในการอนุมัติการทำจ่ายเอกสารเบิกจ่ายระหว่างประเทศ
[ ] (Sheet2 No.251) Permission - Global Search: สิทธิ์ค้นหาข้อมูลเอกสารทั้งหมดในระบบ
[ ] (Sheet2 No.252) Permission - Manage Master: สิทธิ์จัดการข้อมูล Dropdown/Master ที่ใช้ในระบบ
[ ] (Sheet2 No.253) Permission - Manage Lane: สิทธิ์กำหนดขอบเขตงานของทีมบัญชี (หัวหน้าทีม)
[ ] (Sheet2 No.254) Scope - Company: กำหนดขอบเขตตามบริษัท (เลือกได้หลายบริษัท)
[ ] (Sheet2 No.255) Scope - Amount: กำหนดขอบเขตตามวงเงิน
[ ] (Sheet2 No.256) Scope - Service Team
[ ] (Sheet2 No.257) Scope - With/without image
[ ] (Sheet2 No.258) Scope - With/without alternative payee
[ ] (Sheet2 No.259) Scope - With/without vendor onetime
Priority: Must | TOR Reference: Sheet 1 No.92,122,192 / Sheet 2 No.242-259

US-123: Audit Log, Integration Monitoring & Notification
As a Admin I want system activity logged and integration status monitored with automated notifications So that ตรวจสอบได้และทีมงานแก้ไขปัญหาการเชื่อมต่อกับ SAP B1 ได้รวดเร็ว
Acceptance Criteria:
[ ] (No.90) ส่งอีเมลแจ้งเตือนอัตโนมัติ เช่น การอนุมัติ PR/PO สัญญาหมดอายุ/ต่ออายุได้
[ ] (No.91) อัปเดตสถานะ Quotation/PO/Delivery จาก Vendor เข้าสู่ SAP B1 อัตโนมัติ
[ ] (No.93) เก็บ Log การเข้าใช้งานและกิจกรรมของผู้ใช้ได้
[ ] (No.94) ตรวจสอบสถานะการเชื่อมต่อข้อมูลระหว่าง E-Procurement และ SAP B1 ได้
[ ] (No.96) แสดงข้อมูล Audit Log
[ ] (No.123) จัดเก็บ Audit Trail ครบทุกกิจกรรมสำคัญ (สร้าง แก้ไข อนุมัติ ยกเลิก การเชื่อมต่อข้อมูล)
Priority: Must | TOR Reference: Sheet 1 No.90,91,93,94,96,123

Epic P1-K: SAP B1 Integration & Security Baseline
US-124: SAP B1 Master & Transaction Integration
As a Integration Team I want bi-directional integration between the system and SAP B1 So that ข้อมูล Master และ Transaction ตรงกันทั้งสองระบบ ลดการกรอกข้อมูลซ้ำ
Acceptance Criteria:
[ ] (No.118 / Sheet2 No.230 dup) เชื่อมต่อข้อมูล Master Data ระหว่างระบบ P2P และ SAP B1 เช่น Vendor, Item, GL, Cost Center, Project, Tax Code
[ ] (No.119 / Sheet2 No.231 dup) ส่งข้อมูล PR/PO/GR/Invoice/Payment ไปยัง SAP B1 และรับเลขที่เอกสาร/สถานะกลับมาเก็บในระบบ
[ ] (No.120) เชื่อมต่อกับระบบอื่นที่เกี่ยวข้อง เช่น SSO, Email, DMS/EDMS, WMS, ระบบงบประมาณ, HR System (ไม่รวม OCR — อยู่ใน Phase 4)
[ ] (No.121) ติดตามสถานะ Interface และแสดง Error Log พร้อมกลไก Retry/Reprocess สำหรับรายการที่เชื่อมต่อไม่สำเร็จ
Priority: Must | TOR Reference: Sheet 1 No.118,119,120,121 (รวม Sheet2 No.230,231 ที่ซ้ำ)

US-125: Security Baseline (Encryption, Access Control, Password Policy)
As a Security / Admin I want baseline security controls implemented from day one So that ข้อมูลขององค์กรและผู้ขายได้รับการปกป้องตามมาตรฐานขั้นต่ำ
Acceptance Criteria:
[ ] (No.158 / Sheet2 No.260 dup) เข้ารหัสข้อมูลระหว่างรับส่งและจัดเก็บด้วยมาตรฐาน AES-256
[ ] (No.159 / Sheet2 No.261 dup) จำกัดสิทธิ์การเข้าถึงข้อมูลในระดับ Field
[ ] (No.160 / Sheet2 No.262 dup) กำหนดสิทธิ์การเข้าถึงข้อมูลในระดับ Row
[ ] (No.161 / Sheet2 No.263 dup) สำรองข้อมูลรายวันและกู้คืนข้อมูลได้ตามแผนที่กำหนด
[ ] (No.162 / Sheet2 No.264 dup) ควบคุมการส่งออกข้อมูลตามสิทธิ์และเงื่อนไขที่กำหนด
[ ] (No.164 / Sheet2 No.266 dup) กำหนดนโยบายการเก็บรักษาข้อมูล (Data Retention Policy)
[ ] (No.166 / Sheet2 No.269 dup) บังคับใช้การเข้ารหัสการสื่อสารด้วย TLS 1.2 ขึ้นไป
[ ] (No.167) กำหนดสิทธิ์แบบ Role-Based Access Control (RBAC) แยกตามหน้าที่ผู้ใช้งาน
[ ] (No.170 / Sheet2 No.272 dup) นโยบายความซับซ้อนของรหัสผ่าน (ความยาว/ซับซ้อน/หมดอายุ)
[ ] (No.171 / Sheet2 No.273 dup) นโยบายล็อกบัญชีเมื่อกรอกรหัสผ่านผิดตามเงื่อนไขที่กำหนด
[ ] (No.172 / Sheet2 No.274 dup) มีมาตรการป้องกันการโจมตีแบบ Brute-force
[ ] (No.173 / Sheet2 No.275 dup) ส่งออก Log ไปยังระบบ SIEM ได้
[ ] (No.174 / Sheet2 No.276 dup) จัดเก็บ Log ย้อนหลังได้อย่างน้อย 1 ปี
[ ] (No.183 / Sheet2 No.285 dup) ติดตามและบันทึกกิจกรรมของผู้ดูแลระบบได้
[ ] (No.185 / Sheet2 No.287 dup) ทดสอบช่องโหว่และแก้ไขประเด็น Critical/High ก่อนขึ้นใช้งานจริง
[ ] (No.186 / Sheet2 No.288 dup) รองรับการยืนยันตัวตนหลายปัจจัย (MFA)
[ ] (No.187 / Sheet2 No.289 dup) กำหนดระยะเวลา Session Timeout และ Auto Logout ได้
[ ] (No.190 / Sheet2 No.292 dup) รองรับ Workflow การลบข้อมูลตามนโยบายและสิทธิ์ที่กำหนด
Priority: Must | TOR Reference: Sheet 1 No.158-162,164,166,167,170-174,183,185-187,190 (รวม Sheet2 No.260-292 ที่ซ้ำ)

US-126: Security Operations & Compliance Process
As a Service Provider I want recurring security operations and incident-response processes in place So that ระบบได้รับการตรวจสอบและป้องกันความเสี่ยงด้านความปลอดภัยอย่างต่อเนื่องตลอดอายุสัญญา
Acceptance Criteria:
[ ] (No.175 / Sheet2 No.277 dup) ดำเนินการ Penetration Test อย่างน้อยปีละ 1 ครั้ง ส่งผลให้บริษัทพิจารณา
[ ] (No.176 / Sheet2 No.278 dup) มีนโยบายติดตั้ง Security Patch ภายใน 30 วันตามระดับความรุนแรง
[ ] (No.177 / Sheet2 No.279 dup) มี DR Site แยกคนละ Region/พื้นที่จาก Production Site
[ ] (No.178 / Sheet2 No.280 dup) ทดสอบแผน Disaster Recovery อย่างน้อยปีละ 1 ครั้งพร้อมหลักฐาน
[ ] (No.179 / Sheet2 No.281 dup) มีนโยบาย Secure SDLC สำหรับการพัฒนาและเปลี่ยนแปลงระบบ
[ ] (No.180 / Sheet2 No.282 dup) มีแผนตอบสนองต่อเหตุการณ์ด้านความปลอดภัย (Incident Response Plan)
[ ] (No.181 / Sheet2 No.283 dup) กำหนดช่องทางติดต่อด้านความปลอดภัยสำหรับการแจ้งเหตุ
[ ] (No.182 / Sheet2 No.284 dup) รองรับการทำสัญญา DPA
[ ] (No.188 / Sheet2 No.290 dup) ดำเนินการ Vulnerability Scan อย่างน้อยปีละ 1 ครั้ง ส่งผลให้บริษัทพิจารณา
Priority: Must | TOR Reference: Sheet 1 No.175-182,188 (รวม Sheet2 No.277-284,290 ที่ซ้ำ)

Epic P1-L: Reporting (ขั้นต่ำที่ต้องมีวันแรก)
US-127: Document Tracking & Exception Report
As a Buyer / Manager I want real-time document status tracking and exception reports So that ติดตามสถานะเอกสารและรู้ว่ามีรายการค้างดำเนินการอะไรบ้างในแต่ละวัน
Acceptance Criteria:
[ ] (No.78) แสดง Dashboard รวมข้อมูล PR, PO, GR, Stock (Phase 1 ทำเป็น List/Table พื้นฐาน ไม่ใช่ Custom Dashboard Builder)
[ ] (No.125 / Sheet2 No.228 dup ส่วน Dashboard) แสดง Dashboard สำหรับผู้บริหาร เช่น Spend Analysis, PR/PO Cycle Time, On-time Delivery, Invoice Aging (Phase 1 ทำเป็นรายงาน List พื้นฐานก่อน)
[ ] (No.126) รายงานค้างอนุมัติ ค้างรับสินค้า ค้างวางบิล ค้างจ่าย และรายงาน Exception เพื่อติดตามงานประจำวัน
Priority: Must (ลดความซับซ้อนของการแสดงผลใน Phase 1) | TOR Reference: Sheet 1 No.78,125,126

Epic P1-M: Performance, Mobile & Environment
US-128: Performance, Availability & Operational Readiness
As a IT Operations I want the system to meet performance, availability, and operational support requirements So that ผู้ใช้งานจำนวนมากใช้งานพร้อมกันได้อย่างราบรื่นตั้งแต่วัน Go-live
Acceptance Criteria:
[ ] (No.131) เมื่อระบบมีปัญหาและได้รับแจ้งแล้วต้องรีบดำเนินการแก้ไขทันที
[ ] (No.133) Backup Data
[ ] (No.134) มีข้อกำหนด SLA ชัดเจน
[ ] (No.136) No limit user
[ ] (No.138 / Sheet2 No.232 dup) แยกสภาพแวดล้อม DEV / UAT / PROD ออกจากกันอย่างชัดเจน
[ ] (No.140) แสดงผลรายงานหลักภายใน 10 วินาทีหรือน้อยกว่า
[ ] (No.142 / Sheet2 No.229 dup) รองรับผู้ใช้งานพร้อมกัน (Concurrent Users) ได้ไม่น้อยกว่า 500 คน
[ ] (No.144 / Sheet2 No.234 dup) ออกแบบสถาปัตยกรรมให้รองรับ High Availability
[ ] (No.146 / Sheet2 No.236 dup) แจ้งกำหนดการปิดปรับปรุงระบบล่วงหน้า
[ ] (No.147 / Sheet2 No.237 dup) มีนโยบายการอัปเกรดเวอร์ชันระบบที่ชัดเจน
[ ] (No.149 / Sheet2 No.239 dup) มี Sandbox Environment สำหรับทดลองใช้งานหรือทดสอบฟังก์ชัน
[ ] (No.150 / Sheet2 No.240 dup) จัดทำ Release Note ทุกครั้งที่มีการเปลี่ยนแปลงระบบ
[ ] (No.151 / Sheet2 No.241 dup) เปิดเผยรายชื่อ Sub-processor ที่เกี่ยวข้องกับการให้บริการ
Priority: Must | TOR Reference: Sheet 1 No.131,133,134,136,138,140,142,144,146,147,149,150,151 (รวม Sheet2 No.229,232,234,236,237,239,240,241 ที่ซ้ำ)

US-129: Mobile Approval
As a Approver I want to approve documents from a mobile device So that อนุมัติงานได้ทุกที่ทุกเวลา ไม่ทำให้ Flow การอนุมัติล่าช้า
Acceptance Criteria:
[ ] (No.135) Approve on Mobile
Priority: Must | TOR Reference: Sheet 1 No.135

Epic P1-N: Implementation & Go-Live Readiness
US-130: Data Migration & Environment Readiness
As a PM / Implementation Team I want data migrated and validated through multiple rounds before go-live So that ข้อมูลตั้งต้นในระบบถูกต้องครบถ้วนตั้งแต่วันใช้งานจริง
Acceptance Criteria:
[ ] (No.193 / Sheet2 No.188 dup) สนับสนุนการย้ายข้อมูล (Data Migration) อย่างน้อย 2 รอบ รวมถึงตรวจสอบความครบถ้วนของข้อมูลก่อนขึ้นใช้งานจริง
Priority: Must | TOR Reference: Sheet 1 No.193 (รวม Sheet2 No.188 ที่ซ้ำ)

US-131: UAT, Training & Documentation
As a Key User I want UAT support, structured training, and Thai-language documentation So that ผู้ใช้งานพร้อมใช้ระบบจริงตั้งแต่วัน Go-live โดยไม่ต้องพึ่งทีมพัฒนาตลอดเวลา
Acceptance Criteria:
[ ] (No.195 / Sheet2 No.191 dup) สนับสนุนการทดสอบ UAT ทั้งแบบ Onsite และ Remote พร้อมติดตามและปิดประเด็นปัญหา
[ ] (No.197 / Sheet2 No.189 dup) จัดอบรมสำหรับ Key User อย่างน้อย 3 รุ่น
[ ] (No.198 / Sheet2 No.190 dup) จัดทำคู่มือการใช้งานภาษาไทย
Priority: Must | TOR Reference: Sheet 1 No.195,197,198 (รวม Sheet2 No.189,190,191 ที่ซ้ำ)

US-132: SLA, Support Ticketing & Exit Plan
As a Customer / Service Owner I want clearly defined SLA, a support ticketing process, and an exit plan So that ปัญหาหลัง Go-live ได้รับการแก้ไขตามเวลาที่กำหนด และมีแผนรองรับหากต้องเปลี่ยนระบบในอนาคต
Acceptance Criteria:
[ ] (No.199 / Sheet2 No.182 dup) กำหนด SLA สำหรับเหตุขัดข้องระดับ Sev1 ไม่เกิน 4 ชั่วโมง
[ ] (No.200 / Sheet2 No.185 dup) กำหนด SLA สำหรับเหตุขัดข้องระดับ Sev2 ไม่เกิน 8 ชั่วโมง
[ ] (No.201 / Sheet2 No.186 dup) มีระบบ Ticket สำหรับรับแจ้งปัญหา ติดตามสถานะ และรายงานผลการแก้ไขได้
[ ] (No.204 / Sheet2 No.187 dup) จัดทำเอกสาร Exit Plan / Data Handover สำหรับกรณีสิ้นสุดสัญญาหรือเปลี่ยนระบบ
Priority: Must | TOR Reference: Sheet 1 No.199,200,201,204 (รวม Sheet2 No.182,185,186,187 ที่ซ้ำ)

สรุป Phase 1: 32 User Story ครอบคลุม TOR ประมาณ 175 รายการ (Sheet 1 ~154 ข้อ + Sheet 2 Vendor-to-Payment ~23 ข้อ + e-Bidding 2 ข้อ) บวกรายการ Duplicate Cross-reference ที่ตรงกันข้าม Sheet อีกกว่า 60 ข้อ



# Test Scenario — p2p-onelink (Procure-to-Pay System)

**วันที่ Demo:** 1 กรกฎาคม 2569  
**ขอบเขต:** ครอบคลุมทุก Module หลักของระบบตาม Source Code  
**วัตถุประสงค์:** ใช้เล่นให้ลูกค้าดูใน Prototype Demo เพื่อเก็บ Feedback และ Requirement ที่ต้องการปรับปรุง

---

## ภาพรวมกระบวนการ P2P

```
[Vendor Register] → [PR] → [RFQ/Bidding] → [PO] → [GR] → [Invoice + OCR] → [3-Way Match] → [Payment]
```

---

## TS-01 · Vendor Registration & Onboarding

**วัตถุประสงค์:** Vendor สมัครเข้าระบบ อัปโหลดเอกสาร และรอ Buyer อนุมัติ  
**Actor:** Vendor (ผู้ขาย), Buyer (ฝ่ายจัดซื้อ)  
**Module:** `POST /vendor/register`, `PATCH /vendor/:id/status`

| # | Actor | Action | Expected Result |
|---|-------|--------|-----------------|
| 1 | Vendor | กรอกข้อมูลบริษัท (ชื่อ, เลขทะเบียน, ที่อยู่, ประเภทธุรกิจ) ใน Vendor Portal | ระบบสร้าง Vendor record สถานะ `PENDING` |
| 2 | Vendor | อัปโหลดเอกสาร เช่น หนังสือรับรอง, ใบ ภ.พ.20 (PDF/JPG ≤ 5MB) | ระบบรับไฟล์ คืน `file_url` |
| 3 | Buyer | เปิดรายการ Vendor รอการอนุมัติ | เห็น Vendor ใหม่พร้อมเอกสารครบถ้วน |
| 4 | Buyer | กด "อนุมัติ" → สถานะเปลี่ยนเป็น `APPROVED` | Vendor ได้รับการแจ้งเตือนผ่านระบบ |
| 5 | Buyer | ทดสอบ "ปฏิเสธ" พร้อมระบุเหตุผล | สถานะเปลี่ยนเป็น `REJECTED` พร้อม remark |

**Edge Case ที่ควรถาม Feedback:**
- ➡️ ต้องการเพิ่ม Checklist เอกสารให้ Buyer กรอกก่อนอนุมัติหรือไม่?
- ➡️ ต้องการให้ Vendor แก้ไขและยื่นใหม่หลังถูก Reject ได้หรือไม่?

---

## TS-02 · Vendor Bank Account Verification (Segregation of Duties)

**วัตถุประสงค์:** ป้องกันการทุจริตด้วยการแยก Role ตรวจสอบบัญชีธนาคาร  
**Actor:** Vendor, Buyer, Accounting  
**Module:** `PATCH /vendor/:id/bank-account`, `/verify-buyer`, `/verify-accounting`

| # | Actor | Action | Expected Result |
|---|-------|--------|-----------------|
| 1 | Vendor | กรอกข้อมูลบัญชีธนาคาร (ธนาคาร, สาขา, เลขบัญชี, ชื่อบัญชี) | ระบบบันทึก สถานะ `PENDING_VERIFICATION` |
| 2 | Buyer | ตรวจสอบข้อมูลบัญชี → กด "Verify ฝั่ง Buyer" | สถานะอัปเดตเป็น Buyer verified |
| 3 | Accounting | ตรวจสอบซ้ำ → กด "Verify ฝั่ง Accounting" | สถานะเปลี่ยนเป็น `VERIFIED` ทั้ง 2 ฝ่าย |
| 4 | ระบบ | ตรวจสอบว่าคนเดียวไม่สามารถ Verify ทั้ง 2 ขั้นตอน | หาก userId ซ้ำกัน ระบบปฏิเสธขั้นที่ 2 |

**Edge Case ที่ควรถาม Feedback:**
- ➡️ ต้องการ Email notification แจ้ง Accounting ให้มา verify ด้วยหรือไม่?
- ➡️ ต้องการ log ประวัติการเปลี่ยนบัญชีย้อนหลังหรือไม่?

---

## TS-03 · Purchase Requisition (PR) Creation & Approval

**วัตถุประสงค์:** ผู้ขอสร้าง PR และส่งผ่านสาย Approval ตาม DOA  
**Actor:** Requester (ผู้ขอซื้อ), Approver (ผู้อนุมัติ)  
**Module:** `POST /pr`, `PATCH /pr/:id/approve`, `/reject`, `/cancel`

| # | Actor | Action | Expected Result |
|---|-------|--------|-----------------|
| 1 | Requester | สร้าง PR ระบุ รายการสินค้า, จำนวน, งบประมาณ, Cost Center | ระบบสร้าง PR สถานะ `DRAFT` พร้อมเลข PR auto-generate |
| 2 | Requester | แนบไฟล์ Quotation อ้างอิง (PDF/JPG ≤ 10MB) | ระบบรับไฟล์ บันทึก URL |
| 3 | Requester | Submit PR | สถานะเปลี่ยนเป็น `PENDING_APPROVAL` ส่งไปยัง Approver |
| 4 | Approver | เปิด PR ดูรายละเอียด → กด "อนุมัติ" | สถานะเป็น `APPROVED` พร้อม timestamp |
| 5 | Approver | ทดสอบ "ปฏิเสธ" | สถานะเป็น `REJECTED` Requester เห็นเหตุผล |
| 6 | Requester | ทดสอบยกเลิก PR ก่อน Submit | สถานะเป็น `CANCELLED` |

**Edge Case ที่ควรถาม Feedback:**
- ➡️ ต้องการ Multi-level approval (เช่น หัวหน้า → VP → CFO ตามวงเงิน) หรือไม่?
- ➡️ กรณี Budget Overrun (`is_budget_overrun = true`) ต้องการ flow พิเศษหรือไม่?

---

## TS-04 · RFQ & Bidding Process (ประมูล/สอบราคา)

**วัตถุประสงค์:** Buyer สร้าง RFQ เชิญ Vendor เสนอราคา เปรียบเทียบและ Award  
**Actor:** Buyer, Vendor (หลายราย), Committee Approver  
**Module:** `POST /bidding/rfq`, `/quote`, `/comparison`, `/shortlist`, `/award`

| # | Actor | Action | Expected Result |
|---|-------|--------|-----------------|
| 1 | Buyer | สร้าง RFQ จาก PR ที่อนุมัติแล้ว เลือก Vendor ที่จะเชิญ | ระบบส่ง invitation ไปยัง Vendor ที่เลือก |
| 2 | Buyer | ใช้ "แนะนำ Vendor อัตโนมัติ" ตาม Category | ระบบแสดง Vendor list ที่เคยทำงานด้วย sorted ตาม evaluation score |
| 3 | Vendor A | Login Vendor Portal → เห็น RFQ ที่ได้รับเชิญ → Submit ใบเสนอราคา | ระบบบันทึก Quotation พร้อม line items และ file แนบ |
| 4 | Vendor B | Submit ใบเสนอราคาคู่แข่ง | ระบบบันทึก ไม่เปิดเผยราคาคู่แข่งก่อน deadline |
| 5 | Buyer | เปิด Bid Comparison Table หลัง deadline | ระบบแสดงตารางเปรียบเทียบราคา/เงื่อนไขจากทุก Vendor |
| 6 | Buyer | เลือก Vendor ที่ชนะ → Submit Shortlist ขออนุมัติจาก Committee | ระบบส่งรอ Committee Approve |
| 7 | Committee | อนุมัติ Shortlist | สถานะ Approved |
| 8 | Buyer | กด "Award" Vendor ที่ชนะ | ระบบสร้าง PO อัตโนมัติ |

**Edge Case ที่ควรถาม Feedback:**
- ➡️ ต้องการระบบ Sealed Bid (เข้ารหัส decrypt หลัง deadline) หรือเปิดเผยราคาได้เลย?
- ➡️ ต้องการ e-Auction (ราคาลงแบบ Real-time) หรือ Static Bid เพียงพอ?
- ➡️ กรณี Vendor ไม่ตอบภายใน deadline → Escalate อัตโนมัติหรือรอ Manual?

---

## TS-05 · Purchase Order (PO) & Vendor Confirmation

**วัตถุประสงค์:** PO ถูกสร้าง ส่งให้ Vendor ยืนยัน หรือขอแก้ไข  
**Actor:** Buyer, Vendor  
**Module:** `POST /po/convert/:prId`, `POST /po/:id/confirm`, `/revision-request`, `PATCH /po/:id/revise`

| # | Actor | Action | Expected Result |
|---|-------|--------|-----------------|
| 1 | ระบบ | PO ถูกสร้างอัตโนมัติหลัง Award / PR approved | PO มีเลข auto-generate สถานะ `PENDING_VENDOR_CONFIRMATION` |
| 2 | Vendor | Login → เห็น PO ใน "คำสั่งซื้อของฉัน" → ดูรายละเอียด | ข้อมูล items, ราคา, delivery date ถูกต้อง |
| 3 | Vendor | กด "ยืนยัน PO" | สถานะเปลี่ยนเป็น `CONFIRMED` Buyer ได้รับแจ้ง |
| 4 | Vendor | ทดสอบ "ขอแก้ไข PO" พร้อมระบุเหตุผล | สถานะเป็น `REVISION_REQUESTED` ส่งกลับ Buyer |
| 5 | Buyer | แก้ไข PO ตาม request → ส่งใหม่ | PO version ใหม่ส่งให้ Vendor ยืนยันซ้ำ |
| 6 | Buyer | ทดสอบ Approve / Reject / Cancel PO | Status transitions ถูกต้องทุกกรณี |

**Edge Case ที่ควรถาม Feedback:**
- ➡️ ต้องการส่ง PO ทาง Email ให้ Vendor โดยอัตโนมัติหรือให้ Login Portal เท่านั้น?
- ➡️ ต้องการ PO Versioning ดูประวัติการแก้ไขได้ไหม?

---

## TS-06 · Goods Receipt (GR) & 3-Way Match Trigger

**วัตถุประสงค์:** ฝ่ายรับของบันทึก GR เพื่อ trigger การ match กับ PO และ Invoice  
**Actor:** Warehouse / Receiving Officer  
**Module:** `POST /gr`, `POST /gr/:id/claim`, `GET /gr/stock`

| # | Actor | Action | Expected Result |
|---|-------|--------|-----------------|
| 1 | Receiving | เลือก PO ที่ต้องรับของ → บันทึกรายการที่รับจริง (จำนวน, หน่วย) | ระบบสร้าง GR record เชื่อมกับ PO |
| 2 | Receiving | ถ่ายรูปสินค้า / แนบเอกสารส่งมอบ | ระบบบันทึก GR Attachment |
| 3 | ระบบ | ตรวจ GR quantity vs PO quantity | แสดง Over/Under Receive status |
| 4 | Receiving | ดู Stock ปัจจุบันหลังรับของ | Stock balance อัปเดตถูกต้อง |
| 5 | Receiving | ทดสอบสร้าง Claim กรณีสินค้าชำรุด | Claim record ถูกสร้าง เชื่อมกับ GR |

**Edge Case ที่ควรถาม Feedback:**
- ➡️ ต้องการ Partial GR (รับบางส่วนก่อน) แล้วค้างจำนวนส่วนที่เหลือไว้หรือไม่?
- ➡️ Return Note กรณีส่งคืนสินค้า ต้องการ flow ใดบ้าง?

---

## TS-07 · Invoice Submission + OCR + Duplicate Detection

**วัตถุประสงค์:** Vendor ส่ง Invoice → ระบบ OCR อ่านข้อมูลอัตโนมัติ + ตรวจจับซ้ำ  
**Actor:** Vendor  
**Module:** `POST /invoice/upload` (OCR), `POST /invoice`, `POST /invoice/:id/match`

| # | Actor | Action | Expected Result |
|---|-------|--------|-----------------|
| 1 | Vendor | อัปโหลด PDF/รูปใบแจ้งหนี้ → ระบบ OCR | ระบบดึงข้อมูล เลข Invoice, วันที่, ยอดเงิน, VAT, WHT ให้อัตโนมัติ |
| 2 | Vendor | ตรวจสอบ/แก้ไขข้อมูลที่ OCR อ่านมา → Submit | Invoice ถูกสร้างสถานะ `PENDING_MATCH` |
| 3 | Vendor | ระบุ PO และ/หรือ GR ที่เชื่อมกับ Invoice | ระบบเลือก Match Type: `2Way` (PO only) หรือ `3Way` (PO+GR) |
| 4 | Vendor | ทดสอบส่ง Invoice ซ้ำ (เลขเดิม, Vendor เดิม, ยอดเดิม) | ระบบปฏิเสธทันที "ตรวจพบเอกสารวางบิลซ้ำซ้อน" |
| 5 | Finance | รัน Matching Engine | ระบบเปรียบเทียบ Invoice vs PO vs GR แสดง `MATCHED` หรือ `MISMATCH` พร้อมรายละเอียดส่วนต่าง |

**Edge Case ที่ควรถาม Feedback:**
- ➡️ OCR ควรรองรับใบแจ้งหนี้ภาษาอังกฤษและภาษาไทยทั้งคู่ไหม?
- ➡️ กรณี Mismatch เล็กน้อย (tolerance ±1%) ต้องการให้ผ่านอัตโนมัติหรือไม่?
- ➡️ Invoice ที่ไม่มี PO (Non-PO Invoice) จัดการอย่างไร?

---

## TS-08 · Payment Request → Proposal → Bank File

**วัตถุประสงค์:** Finance สร้าง Payment Request แบทช์ Generate Bank File ส่งธนาคาร  
**Actor:** Finance Officer, Finance Manager  
**Module:** `POST /api/payment/request`, `/proposal`, `/proposal/:id/generate-bank-file`

| # | Actor | Action | Expected Result |
|---|-------|--------|-----------------|
| 1 | Finance | เปิด Invoice ที่ Match แล้ว → สร้าง Payment Request ระบุวันครบกำหนด | Payment Request สร้างสถานะ `PENDING` |
| 2 | Finance | เลือก Lane การจ่าย (เช่น BAHTNET, Prompt Pay, SWIFT) | Lane ถูก assign ให้ Request |
| 3 | Finance | รวม Payment Request หลายรายการ → สร้าง Payment Proposal | Proposal รวม Requests ทั้งหมดที่เลือก |
| 4 | Finance Manager | อนุมัติ Proposal | สถานะ `APPROVED` |
| 5 | Finance | Generate Bank File จาก Proposal | ระบบสร้างไฟล์ตาม format ธนาคาร พร้อม download |
| 6 | ระบบ | รับ Payment Callback (Success/Failed) จากธนาคาร | สถานะ Payment Request อัปเดตเป็น `PAID` หรือ `FAILED` |

**Edge Case ที่ควรถาม Feedback:**
- ➡️ ต้องการ Hold/Unhold รายการที่ยังไม่พร้อมจ่าย ค้างไว้รอ Proposal ถัดไปหรือไม่?
- ➡️ Bank File format ที่ต้องการ: KTB, SCB, BBL หรือ BAY?
- ➡️ กรณีจ่ายต่างประเทศ (SWIFT + FX Rate) ต้องการ flow พิเศษอย่างไร?

---

## TS-09 · Credit/Debit Note & Payment Reversal

**วัตถุประสงค์:** จัดการส่วนลด/เพิ่มเงิน และยกเลิกการจ่ายที่ผิดพลาด  
**Actor:** Finance, Vendor  
**Module:** `POST /api/payment/credit-debit-note`, `/request/:id/reverse`

| # | Actor | Action | Expected Result |
|---|-------|--------|-----------------|
| 1 | Finance | สร้าง Credit Note บน Invoice (เช่น Vendor ให้ส่วนลดหลังจ่าย) | Credit Note สร้างเชื่อมกับ Invoice |
| 2 | Finance Manager | อนุมัติ Credit Note | สถานะ `APPROVED` ยอดถูก net ออกจาก Payment |
| 3 | Finance | ดู Credit/Debit Notes ทั้งหมดของ Invoice | รายการครบถ้วนถูกต้อง |
| 4 | Finance | Reverse Payment ที่จ่ายผิด | สร้าง Reversal record สถานะ `REVERSED` |

**Edge Case ที่ควรถาม Feedback:**
- ➡️ ต้องการให้ Vendor สร้าง Credit Note เองจาก Vendor Portal ได้ไหม?
- ➡️ Debit Note (เรียกเงินเพิ่ม) ต้องการ Approval flow กี่ขั้น?

---

## TS-10 · AI Audit & Dashboard KPIs

**วัตถุประสงค์:** ผู้บริหารเห็น KPI ภาพรวม และระบบ AI ตรวจจับความผิดปกติ  
**Actor:** Management, Auditor  
**Module:** `GET /api/dashboard/kpis`, `/ai/audit`, `/integration-log`

| # | Actor | Action | Expected Result |
|---|-------|--------|-----------------|
| 1 | Management | เปิด Dashboard | เห็น KPI: ยอด PO รอ, Invoice ค้าง, Payment ที่ครบกำหนด, Vendor ที่อยู่ระหว่างอนุมัติ |
| 2 | Auditor | เปิด AI Audit Log | ระบบแสดง Anomaly ที่ตรวจพบ เช่น Invoice ซ้ำ, Vendor ที่ผ่านการอนุมัติผิดปกติ |
| 3 | Finance | ดู Integration Log การส่งข้อมูลไปยังระบบภายนอก (ERP, Bank) | รายการ Log พร้อม Success/Failed status |
| 4 | Finance | Retry Integration ที่ Failed | ระบบส่งข้อมูลใหม่อีกครั้ง อัปเดต Log status |
| 5 | Management | Filter Dashboard ตาม Company / Business Unit | ข้อมูลกรองถูกต้องตาม Scope |

**Edge Case ที่ควรถาม Feedback:**
- ➡️ Dashboard ต้องการ Export เป็น Excel/PDF ได้ไหม?
- ➡️ AI Audit ต้องการ Alert แบบ Real-time ส่ง Email/Line Notify หรือไม่?
- ➡️ ต้องการเชื่อมต่อกับ ERP ระบบใด (SAP, Oracle, Microsoft D365)?

---

## สรุป Module Coverage

| Module | Test Scenario | Status |
|--------|--------------|--------|
| Vendor Registration & Approval | TS-01 | ✅ |
| Bank Account Verification (SoD) | TS-02 | ✅ |
| Purchase Requisition (PR) | TS-03 | ✅ |
| RFQ & Bidding | TS-04 | ✅ |
| Purchase Order (PO) | TS-05 | ✅ |
| Goods Receipt (GR) | TS-06 | ✅ |
| Invoice + OCR + Duplicate Check | TS-07 | ✅ |
| Payment Request → Bank File | TS-08 | ✅ |
| Credit/Debit Note & Reversal | TS-09 | ✅ |
| AI Audit & Dashboard | TS-10 | ✅ |

---

## Feedback Collection Sheet

คำถามรวมที่ควรถามลูกค้าหลัง Demo ทุก Scenario:

1. **Flow ตรงกับ Process จริงในองค์กรหรือไม่?** (ระบุส่วนที่ต้องปรับ)
2. **มี Role/Permission ที่ขาดไปไหม?** (เช่น Legal, IT, Internal Audit)
3. **ต้องการ Integration กับระบบภายนอกใดบ้าง?** (ERP, HR, Bank, Tax Authority)
4. **ความเร็ว/ประสิทธิภาพของระบบเป็นอย่างไร?**
5. **UI/UX มีจุดใดที่สับสนหรือต้องการปรับปรุง?**
6. **Feature ใดที่สำคัญที่สุดและอยากให้พัฒนาก่อน Go-Live?**

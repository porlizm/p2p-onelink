# Design System — e-Procurement / P2P System
## SCGJWD Procurement Vendor Register (PJ250051)

| รายการ | รายละเอียด |
|---|---|
| Project Code | PJ250051 |
| เอกสาร | Design System (Token, Component Spec, Status Color Mapping) |
| Source of Truth | `theme.css` (ไฟล์จริงจาก Prototype เดิม — VendorVerse, ตรงกับ Mockup ใน BSD) |
| ใช้สำหรับ | Build Prototype (Antigravity) — เอกสารที่ 4 ของชุด Prototype |
| อ้างอิงเอกสารชุดเดียวกัน | `User_Flow.md` → `Data_Model_(ERD).md` → `PR_Screen_Inventory.md` → **Design_System.md** (ไฟล์นี้) |
| Version | VD01.00.00 |

> **หลักการสำคัญของเอกสารนี้:** `theme.css` ที่อัปโหลดมาคือ Source of Truth ของสีและ Radius ห้ามแก้ค่าเดิมแม้แต่ตัวเดียว เอกสารนี้ทำหน้าที่ **(1)** อธิบาย Token เดิมว่าแต่ละตัวใช้ตรงไหนของระบบ **(2)** เติมเฉพาะส่วนที่ theme.css ยังไม่มี (Font, Semantic Status Color, Component Spec) **(3)** Map สี Badge เข้ากับ Enum ทุกตัวจาก `Data_Model_(ERD).md` ให้ครบ 100%

---

## สารบัญ

1. [วิเคราะห์ Gap ของ theme.css](#1-วิเคราะห์-gap-ของ-themecss)
2. [Design Tokens เดิม — Source of Truth](#2-design-tokens-เดิม--source-of-truth)
3. [Token ที่เติมเพิ่ม (Addendum)](#3-token-ที่เติมเพิ่ม-addendum)
4. [Typography System](#4-typography-system)
5. [Status Semantic Color — Enum → Badge Mapping (ครบทุก Entity)](#5-status-semantic-color--enum--badge-mapping-ครบทุก-entity)
6. [Component Library Spec](#6-component-library-spec)
   - [6.1 Button](#61-button)
   - [6.2 Status Badge](#62-status-badge)
   - [6.3 Table](#63-table)
   - [6.4 Card](#64-card)
   - [6.5 Modal / Dialog](#65-modal--dialog)
   - [6.6 Tabs](#66-tabs)
   - [6.7 Sidebar Navigation](#67-sidebar-navigation)
   - [6.8 Empty / Loading / Error State](#68-empty--loading--error-state)
   - [6.9 Form Inputs & Read-only Fields](#69-form-inputs--read-only-fields)
   - [6.10 Contrast & Color Guidelines (สำหรับส่วนจัดแสดง/พื้นหลังกรมท่า)](#610-contrast--color-guidelines-สำหรับส่วนจัดแสดงพื้นหลังกรมท่า)
   - [6.11 Number & Currency Formatting Guidelines](#611-number--currency-formatting-guidelines)
7. [Icon System](#7-icon-system)
8. [Spacing, Radius, Elevation, Breakpoints](#8-spacing-radius-elevation-breakpoints)
9. [Data Visualization (Chart Colors)](#9-data-visualization-chart-colors)
10. [Dark Mode — สถานะปัจจุบัน](#10-dark-mode--สถานะปัจจุบัน)
11. [Voice & Microcopy Guideline](#11-voice--microcopy-guideline)
12. [Implementation Notes สำหรับ Antigravity](#12-implementation-notes-สำหรับ-antigravity)
13. [Assumption & Open Items](#13-assumption--open-items)

---

## 1. วิเคราะห์ Gap ของ theme.css

| มีอยู่แล้วใน theme.css | ใช้ได้ตรงๆ | ยังไม่มี (เอกสารนี้เติม) |
|---|---|---|
| สี Semantic พื้นฐาน (primary, secondary, muted, accent, destructive) | ✅ | สี Semantic เพิ่ม (success, warning) สำหรับ Badge สถานะ ~80 ค่า |
| Sidebar Color Set แยกจาก Card/Background | ✅ | Spec การใช้งาน Sidebar จริง (Width, Active State) |
| Chart Color 5 ตัว | ✅ | ลำดับการใช้งานต่อ Chart Type |
| Radius scale (sm/md/lg/xl คำนวณจาก --radius เดียว) | ✅ | ค่า px จริงหลังคิด root font-size 14px (ไม่ใช่ 16px) |
| Font-weight (medium/normal) | ✅ | Font-family (ไม่มีเลยในไฟล์เดิม) — สำคัญที่สุดเพราะระบบเป็นภาษาไทยหนาแน่น |
| Base typography ของ h1-h4/label/button/input | ✅ | ค่า px จริงของ --text-* ที่ใช้อ้างอิง (ไม่ได้ประกาศในไฟล์ ต้องพึ่ง Tailwind Default) |
| Border color (เป็น navy เจือจาง ไม่ใช่เทาล้วน) | ✅ — เป็น Pattern ที่ต้องรักษาไว้ | Shadow/Elevation scale (ยังไม่มีเลย) |
| — | — | Component Spec ระดับ px (Button height, Table row height, Badge shape, Modal width) |
| — | — | Icon Library + Mapping ต่อ Action |
| — | — | Status Color Mapping เข้ากับ Enum จริงจาก ERD |

---

## 2. Design Tokens เดิม — Source of Truth

โค้ดต่อไปนี้คือ `theme.css` ต้นฉบับ **คัดลอกมาทั้งหมดโดยไม่แก้ไข** — ใช้ไฟล์นี้วางในโปรเจกต์ตรงๆ (เป็น Global Stylesheet)

```css
@custom-variant dark (&:is(.dark *));

:root {
  --font-size: 14px;
  --background: #F7F9FC;
  --foreground: #002266;
  --card: #FFFFFF;
  --card-foreground: #002266;
  --popover: #FFFFFF;
  --popover-foreground: #002266;
  --primary: #0054FF;
  --primary-foreground: #FFFFFF;
  --secondary: #F0F4F8;
  --secondary-foreground: #002266;
  --muted: #F1F4F9;
  --muted-foreground: #64748B;
  --accent: #E0F2FE;
  --accent-foreground: #002266;
  --destructive: #EF4444;
  --destructive-foreground: #FFFFFF;
  --border: rgba(0, 34, 102, 0.08);
  --input: transparent;
  --input-background: #FFFFFF;
  --switch-background: #E2E8F0;
  --font-weight-medium: 500;
  --font-weight-normal: 400;
  --ring: #0054FF;
  --chart-1: #0054FF;
  --chart-2: #002266;
  --chart-3: #EF5C23;
  --chart-4: #34D399;
  --chart-5: #F472B6;
  --radius: 0.75rem;
  --sidebar: #FFFFFF;
  --sidebar-foreground: #002266;
  --sidebar-primary: #0054FF;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: #F1F5F9;
  --sidebar-accent-foreground: #002266;
  --sidebar-border: rgba(0, 34, 102, 0.08);
  --sidebar-ring: #0054FF;
}

/* .dark block และ @theme inline เหมือนต้นฉบับ — ดูไฟล์ theme.css ที่อัปโหลดมา */
```

### 2.1 ตารางอธิบาย Token เดิม — ใช้ตรงไหนของระบบ

| Token | ค่า | ใช้ตรงไหนในระบบ (อ้าง Screen ID) |
|---|---|---|
| `--background` | `#F7F9FC` | พื้นหลังทุกหน้า (เทาฟ้าอ่อนมาก แทบขาว) |
| `--foreground` | `#002266` | สีตัวอักษรหลักทุกหน้า — Navy เข้ม ไม่ใช่ดำ (เป็น Brand Color หลักของ SCGJWD) |
| `--card` | `#FFFFFF` | พื้นหลัง Card ทุกใบ (C1 Product Card, A1 Summary Card) |
| `--primary` | `#0054FF` | ปุ่มหลักทุกปุ่ม ("+ สร้าง PR ใหม่" ใน D1, "อนุมัติ" ใน B3/G1), Active Tab, Link |
| `--secondary` | `#F0F4F8` | ปุ่มรอง ("ยกเลิก" ใน D2/D4), แถบ Filter ที่ไม่ Active |
| `--muted` / `--muted-foreground` | `#F1F4F9` / `#64748B` | Header แถวของ Table ทุกใบ, ข้อความ Placeholder, สถานะ Neutral |
| `--accent` / `--accent-foreground` | `#E0F2FE` / `#002266` | ใช้เป็น **Info/Draft Badge** (ดูส่วน 5), Highlight แถวที่ถูกเลือก |
| `--destructive` | `#EF4444` | ปุ่ม/Badge อันตราย ("ลบ" ใน D1, Badge "ไม่อนุมัติ"/"Rejected"/"Blacklisted") |
| `--border` | `rgba(0,34,102,0.08)` | **Pattern สำคัญ:** เส้นขอบทุกที่ Tint ด้วย Navy หลักที่ Opacity 8% ไม่ใช่เทาล้วน — ต้องรักษา Pattern นี้เวลาเพิ่ม Token ใหม่ (ดูส่วน 8.3) |
| `--ring` | `#0054FF` | Focus Ring ของ Input/Button ทุกตัวเวลากด Tab/Click |
| `--chart-1` ถึง `--chart-5` | 5 สี | สีกราฟใน A1 Dashboard, E3 Stock Chart (ดูส่วน 9) |
| `--radius` | `0.75rem` | **= 10.5px จริง** (ไม่ใช่ 12px เพราะ root = 14px ดูส่วน 8.1) — ใช้กับ Card/Modal/Input ทุกตัว |
| `--sidebar*` | (set แยก) | Sidebar ทุกหน้า — สีพื้น/ตัวอักษร/Active State แยกจาก Card/Background หลัก |

---

## 3. Token ที่เติมเพิ่ม (Addendum)

เติมเข้าไปใน `:root` และ `.dark` Block เดิม (ต่อจาก `--sidebar-ring`) — **ไม่แก้ Token เดิมแม้แต่ตัวเดียว** เติมเฉพาะส่วนใหม่ และเลือกค่าให้กลมกลืนกับ Palette เดิม (ใช้หลัก Navy-tint เดียวกับ `--border`)

```css
:root {
  /* ...token เดิมทั้งหมดคงไว้... */

  /* Font Family — ไม่มีในไฟล์เดิม เติมใหม่ */
  --font-sans: 'Inter', 'Noto Sans Thai', ui-sans-serif, system-ui, sans-serif;

  /* Semantic Status Color เพิ่มเติม — primary/destructive ใช้ของเดิม, เติมแค่ success/warning */
  --success: #34D399;              /* = --chart-4 เดิม ใช้ค่าเดียวกันเพื่อความสอดคล้อง */
  --success-foreground: #FFFFFF;
  --success-soft: #ECFDF5;          /* พื้น Badge แบบ Soft */
  --success-soft-foreground: #047857;

  --warning: #F59E0B;                /* ใหม่ — ไม่มีสีนี้ใน Palette เดิมเลย */
  --warning-foreground: #FFFFFF;
  --warning-soft: #FFFBEB;
  --warning-soft-foreground: #B45309;

  --destructive-soft: #FEF2F2;       /* Soft variant ของ destructive เดิม */
  --destructive-soft-foreground: #B91C1C;

  --urgent: var(--chart-3);          /* #EF5C23 — ใช้ของเดิม alias เป็น "Escalated/Urgent" */
  --urgent-soft: #FFF1EC;
  --urgent-soft-foreground: #C2410C;

  /* Elevation — ไม่มีในไฟล์เดิม เติมใหม่ โดย Tint ด้วย Navy ตาม Pattern ของ --border */
  --shadow-sm: 0 1px 2px rgba(0, 34, 102, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(0, 34, 102, 0.06), 0 2px 4px -2px rgba(0, 34, 102, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0, 34, 102, 0.08), 0 4px 6px -4px rgba(0, 34, 102, 0.04);
}
```

```css
@theme inline {
  /* ...ของเดิมทั้งหมดคงไว้... เติมต่อ */
  --color-success: var(--success);
  --color-success-foreground: var(--success-foreground);
  --color-warning: var(--warning);
  --color-warning-foreground: var(--warning-foreground);
  --font-sans: var(--font-sans);
}
```

---

## 4. Typography System

### 4.1 ⚠️ ข้อควรระวัง: root font-size = 14px ไม่ใช่ 16px

`theme.css` ตั้ง `html { font-size: var(--font-size); }` โดย `--font-size: 14px` — ทุกค่าที่อิง `rem` (Tailwind Type Scale, Radius) จะเล็กลงเป็นสัดส่วน 14/16 = **87.5%** ของค่าปกติ โดยอัตโนมัติทั้งระบบ ไม่ใช่แค่ตัวอักษร

| Tailwind Class | rem | px จริง (root=14px) | ใช้ที่ไหน |
|---|---|---|---|
| `text-xs` | 0.75rem | **10.5px** | Badge text, Caption, Timestamp |
| `text-sm` | 0.875rem | **12.25px** | Table cell, Helper text |
| `text-base` | 1rem | **14px** | Body, Input, Button, Label (ตาม h4/label/button/input ใน theme.css) |
| `text-lg` | 1.125rem | **15.75px** | h3 |
| `text-xl` | 1.25rem | **17.5px** | h2 |
| `text-2xl` | 1.5rem | **21px** | h1 |
| `text-3xl` | 1.875rem | **26.25px** | KPI Number ใหญ่ใน A1 Dashboard (ไม่มีกำหนดใน theme.css เดิม แต่แนะนำใช้ระดับนี้) |

### 4.2 Font Family (เติมใหม่ — ไม่มีในไฟล์เดิม)

```
--font-sans: 'Inter', 'Noto Sans Thai', ui-sans-serif, system-ui, sans-serif;
```

- **Inter** — รับผิดชอบตัวเลข/อังกฤษ (เลขที่เอกสาร, จำนวนเงิน, Field Label ภาษาอังกฤษ)
- **Noto Sans Thai** — รับผิดชอบข้อความไทยทั้งหมด (เนื้อหาส่วนใหญ่ของระบบ)
- โหลด Weight แค่ **400 (Normal)** และ **500 (Medium)** เท่านั้น ให้ตรงกับ `--font-weight-normal`/`--font-weight-medium` ที่มีอยู่แล้ว — ไม่ต้องโหลด Weight อื่นเพิ่ม เพื่อรักษาความ Minimal ของระบบเดิม (ยกเว้น KPI Number ใหญ่ใน A1 อาจใช้ 600 เพิ่มเฉพาะจุดนั้น)

### 4.3 การใช้งานตาม Role ของ Element (ตรงกับ theme.css เดิม)

| Element | Size | Weight | ใช้ที่ไหน |
|---|---|---|---|
| h1 | text-2xl (21px) | medium (500) | ชื่อหน้าหลัก เช่น "Purchase Request" ใน D1 |
| h2 | text-xl (17.5px) | medium | ชื่อ Section ย่อย เช่น "รายการสินค้า" ใน D2 |
| h3 | text-lg (15.75px) | medium | ชื่อ Card, หัว Modal |
| h4/label/button | text-base (14px) | medium | Field Label, ปุ่มทุกปุ่ม |
| input | text-base (14px) | **normal (400)** | ตัวอักษรที่กรอกในฟอร์ม (เบากว่า Label ตามที่ theme.css กำหนดไว้) |
| Table cell | text-sm (12.25px) | normal | เนื้อหาในตาราง — เล็กกว่า input เพื่อให้ Density สูงพอสำหรับ Enterprise Table |
| Badge/Caption | text-xs (10.5px) | medium | Status Badge, Timestamp, Helper Text |

---

## 5. Status Semantic Color — Enum → Badge Mapping (ครบทุก Entity)

หลักการ Map (ใช้กับทุก Entity ในระบบให้สม่ำเสมอ):

- 🔵 **Info** (`--accent`/`--accent-foreground` เดิม) = Draft, สร้างใหม่, อยู่ระหว่างดำเนินการแบบ Neutral
- 🟡 **Warning** (`--warning-soft`/`--warning-soft-foreground` ใหม่) = รอ Action จากใครสักคน, ต้องติดตาม, ใกล้ผิดเงื่อนไข
- 🟢 **Success** (`--success-soft`/`--success-soft-foreground` ใหม่) = อนุมัติแล้ว/เสร็จสมบูรณ์/จ่ายแล้ว
- 🔴 **Danger** (`--destructive-soft`/`--destructive-soft-foreground` ใหม่) = ถูกปฏิเสธ/บล็อก/หมดอายุ/ล้มเหลว
- ⚪ **Neutral** (`--muted`/`--muted-foreground` เดิม) = ปิดงานแบบไม่มีนัยบวก-ลบ, ไม่ถูกเลือก, ยกเลิก
- 🟠 **Urgent** (`--urgent-soft`/`--urgent-soft-foreground` ใหม่ alias จาก chart-3) = ใช้น้อยที่สุด เฉพาะ Escalated/SLA เกินกำหนดจริงๆ

| Entity.Field (จาก ERD) | ค่า | สี Badge |
|---|---|---|
| `vendor.status` | PendingRegistration | 🔵 Info |
| | UnderReview | 🟡 Warning |
| | Active | 🟢 Success |
| | Rejected | 🔴 Danger |
| | Suspended | 🟡 Warning |
| | Blocked | 🔴 Danger |
| | Blacklisted | 🔴 Danger |
| `purchase_requisition.status` | Draft | 🔵 Info |
| | BudgetChecked | 🔵 Info |
| | PendingApproval | 🟡 Warning |
| | Approved | 🟢 Success |
| | Rejected | 🔴 Danger |
| | BlockedOverBudget | 🟡 Warning |
| | ConvertedToPO | 🟢 Success |
| | Cancelled | ⚪ Neutral |
| `bidding.status` | Draft | 🔵 Info |
| | PendingCommitteeApproval | 🟡 Warning |
| | OpenForQuotation | 🔵 Info |
| | Closed | ⚪ Neutral |
| | UnderEvaluation | 🟡 Warning |
| | Awarded | 🟢 Success |
| | NoAward | ⚪ Neutral |
| | Rejected | 🔴 Danger |
| `bid_quotation.status` | Submitted | 🔵 Info |
| | Selected | 🟢 Success |
| | NotSelected | ⚪ Neutral |
| | Superseded | ⚪ Neutral |
| `purchase_order.status` | AutoGenerated | 🔵 Info |
| | PendingApproval | 🟡 Warning |
| | Approved | 🟢 Success |
| | Rejected | 🔴 Danger |
| | SentToVendor | 🔵 Info |
| | VendorConfirmed | 🟢 Success |
| | PartiallyReceived | 🟡 Warning |
| | FullyReceived | 🟢 Success |
| | RevisionRequested | 🟡 Warning |
| | Closed | ⚪ Neutral |
| | Cancelled | 🔴 Danger |
| `goods_receipt.status` | PendingReceipt | 🔵 Info |
| | PartialReceipt | 🟡 Warning |
| | FullReceipt | 🟢 Success |
| | ServiceAccepted | 🟢 Success |
| | Scored | 🟢 Success |
| | ClaimRaised | 🔴 Danger |
| | Closed | ⚪ Neutral |
| `claim.status` | Open / InProgress | 🟡 Warning |
| | Closed | ⚪ Neutral |
| `return_note.status` | Pending | 🟡 Warning |
| | Completed | 🟢 Success |
| `invoice.status` | Created | 🔵 Info |
| | DuplicateRejected | 🔴 Danger |
| | Matching | 🔵 Info |
| | Matched | 🟢 Success |
| | MismatchException | 🟡 Warning |
| | TaxValidated / GLAllocated | 🔵 Info |
| | ReadyForPayment / LinkedToPaymentRequest | 🟢 Success |
| `payment_request.status` | Created / BudgetChecked | 🔵 Info |
| | PendingApproval / BlockedOverBudget | 🟡 Warning |
| | Verified / ApprovedToConfirm | 🔵 Info |
| | Confirmed | 🟢 Success |
| | InPaymentProposal | 🔵 Info |
| | OnHold | 🟡 Warning |
| | BankFileGenerated | 🔵 Info |
| | Paid | 🟢 Success |
| | Failed / Rejected | 🔴 Danger |
| `vendor_document.status` | Valid | 🟢 Success |
| | ExpiringSoon | 🟡 Warning |
| | Expired | 🔴 Danger |
| `item_price.status` | Active | 🟢 Success |
| | ExpiringSoon | 🟡 Warning |
| | Expired | 🔴 Danger |
| `contract.status` | Active / Renewed | 🟢 Success |
| | Expired | 🔴 Danger |
| `approval_step.action` | Pending | 🟡 Warning |
| | Approved | 🟢 Success |
| | Rejected | 🔴 Danger |
| | Delegated | 🔵 Info |
| | Escalated | 🟠 Urgent |
| `workflow_instance.status` | InProgress | 🔵 Info |
| | Approved | 🟢 Success |
| | Rejected | 🔴 Danger |
| | Escalated | 🟠 Urgent |
| `app_user.status` | Active | 🟢 Success |
| | Locked | 🔴 Danger |
| | Inactive | ⚪ Neutral |
| `integration_log.status` | Success | 🟢 Success |
| | Failed | 🔴 Danger |
| | Retrying | 🟡 Warning |
| `asset.status` | In Stock | 🟢 Success |
| | Distributed | 🔵 Info |
| | Rented | 🟡 Warning |
| | Scrapped | 🔴 Danger |
| `asset_allocation.status` | Active | 🟢 Success |
| | Returned | ⚪ Neutral |
| | Closed | ⚪ Neutral |

---

## 6. Component Library Spec

ทุก Spec ด้านล่างอ้างอิงจาก Mockup จริงใน BSD (B1-B3, C1, D1-D2, D4-D5) ที่เห็น Pattern ซ้ำกันทุกหน้า + เติมส่วนที่ไม่มี Mockup ให้สอดคล้องกัน

### 6.1 Button

| Variant | พื้นหลัง | ตัวอักษร | ใช้ที่ไหน |
|---|---|---|---|
| Primary | `--primary` | `--primary-foreground` | Action หลักของหน้า ("+ สร้าง PR", "อนุมัติ", "บันทึก") |
| Secondary | `--secondary` | `--secondary-foreground` | Action รอง ("ยกเลิก") |
| Destructive | `--destructive` | `--destructive-foreground` | "ลบ", "ปฏิเสธ" |
| Ghost | transparent | `--foreground` | Action ในตาราง (ไอคอนดู/แก้ไข) |

| Size | Height | Padding (X) | ใช้ที่ไหน |
|---|---|---|---|
| sm | 32px (h-8) | 12px | ปุ่มในแถว Table |
| md (default) | 36px (h-9) | 16px | ปุ่มทั่วไปในฟอร์ม |
| lg | 40px (h-10) | 24px | CTA หลักของหน้า เช่น "ยืนยันการสร้างใบสั่งซื้อ" ใน D5 |

Radius ทุก Button = `--radius-md` (8.5px) — Focus State ใช้ `--ring` เป็น Outline 2px

### 6.2 Status Badge

- **รูปแบบ:** Soft Badge (พื้น Tint อ่อน + ตัวอักษรสีเข้มของ Hue เดียวกัน) — ตรงกับที่เห็นใน Mockup จริงของ B1/D1/D5 (ไม่ใช่สีตันทึบ)
- **Shape:** Pill เต็ม (`border-radius: 9999px`) — เป็นข้อยกเว้นเดียวที่ไม่ใช้ `--radius` ของระบบ
- **Padding:** 2px 10px (py-0.5 px-2.5)
- **Font:** text-xs (10.5px), font-weight-medium (500)
- **สี:** ตามตารางส่วนที่ 5 — ใช้คู่ `[color]-soft` + `[color]-soft-foreground` เสมอ ไม่ใช้สีตัน

### 6.3 Table

| Property | ค่า |
|---|---|
| Header background | `--muted` |
| Header text | `--muted-foreground`, text-xs, uppercase, tracking-wide |
| Row height | 44px (Default), 52px (ถ้ามี Avatar/Thumbnail) |
| Row hover | `--accent` ที่ Opacity 40% |
| Cell padding | 12px 16px |
| Border ระหว่างแถว | `--border` (1px) |
| Selected row | `--accent` เต็ม + แถบซ้าย 2px `--primary` |

### 6.4 Card

| Property | ค่า |
|---|---|
| Background | `--card` |
| Border | 1px `--border` |
| Radius | `--radius-lg` (10.5px) |
| Shadow | `--shadow-sm` |
| Padding | 24px (Default), 16px (Compact เช่น Card สินค้าใน C1) |

### 6.5 Modal / Dialog

| Size | Width | ใช้ที่ไหน |
|---|---|---|
| sm | 400px | Confirm Dialog ("ยืนยันลบ?") |
| md | 560px | ฟอร์มสั้น (B6 ประเมิน Vendor) |
| lg | 720px | D2 Create PR (มี Header + Line Items) |
| xl | 960px | D4 Tab รับใบเสนอราคา/ประเมิน Vendor (Table กว้าง) |

Overlay: `rgba(0,34,102,0.4)` (Navy tint ตาม Pattern เดิม ไม่ใช่ดำล้วน) | Radius: `--radius-xl` (14.5px)

### 6.6 Tabs

ตรงกับ Pattern ที่เห็นใน B1/C1/D1/D4/D5 ทุกหน้า:

| State | Style |
|---|---|
| Active | ตัวอักษร `--primary`, ขีดล่าง 2px `--primary` |
| Inactive | ตัวอักษร `--muted-foreground`, ไม่มีขีด |
| Count Badge (เช่น "ทั้งหมด (3)") | Pill เล็ก พื้น `--muted` ตัวอักษร `--muted-foreground` text-xs |

### 6.7 Sidebar Navigation

| Property | ค่า |
|---|---|
| Width (Expanded) | 260px |
| Width (Collapsed, Icon-only) | 72px |
| Background | `--sidebar` |
| Active Item | พื้น `--sidebar-accent`, ตัวอักษร `--sidebar-primary`, แถบซ้าย 3px `--sidebar-primary` |
| Inactive Item | ตัวอักษร `--sidebar-foreground` |
| Hover | พื้น `--sidebar-accent` ที่ Opacity 60% |

### 6.8 Empty / Loading / Error State

| State | Spec |
|---|---|
| Empty | Icon 48px (`--muted-foreground`) กลางจอ + ข้อความบอกสิ่งที่ทำได้ต่อ (ดูส่วน 11) + ปุ่ม Primary Action |
| Loading | Skeleton ใช้ `--muted` เป็นพื้น + Shimmer Animation เบาๆ — ห้ามใช้ Spinner กลางจอเปล่าๆ สำหรับ List/Table |
| Error (Form Validation) | Input border เปลี่ยนเป็น `--destructive`, ข้อความ Error ใต้ Field สี `--destructive` text-xs |
| Error (Page-level เช่น H4 Sync Failed) | Banner พื้น `--destructive-soft` ตัวอักษร `--destructive-soft-foreground` พร้อมปุ่ม "Retry" |

### 6.9 Form Inputs & Read-only Fields (ช่องกรอกข้อมูลและฟิลด์ที่แก้ไขไม่ได้)

- **ปัญหาที่พบ:** ช่องข้อมูลที่ถูกเติมอัตโนมัติ (Auto-filled) หรือไม่อนุญาตให้แก้ไข (Read-only / Disabled) แสดงผลคล้ายกับหน้าต่างแจ้งเตือนหรือแสดงข้อผิดพลาด (Error State) ทำให้ผู้ใช้สับสน
- **แนวทางแก้ไข (Spec):**
  - **ห้ามใช้สีแดงหรือสีกลุ่มเตือนความรุนแรง** กับฟิลด์ปิดใช้งานปกติ หรือฟิลด์ที่กรอกเสร็จแล้วแต่ห้ามพิมพ์
  - ช่องที่พิมพ์ไม่ได้/แก้ไขไม่ได้ (Read-only/Disabled) ต้องใช้พื้นหลังสีเทาอ่อนหม่น `--muted` (`#F1F4F9`) หรือสีเทาจาง (`#F8FAFC`)
  - เส้นขอบ (Border) ต้องเป็นสีบางจางปกติ `--border` (`rgba(0, 34, 102, 0.08)`) และตัวหนังสือเป็นสีน้ำเงินกรมท่าปกติแบบจาง `--muted-foreground` (`#64748B`)
  - เมื่อมีเมาส์ชี้ผ่าน (Hover) ให้เปลี่ยนสัญลักษณ์ Cursor เป็น `not-allowed` หรือคงรูปปกติ แต่ห้ามแสดงกรอบสีส้มหรือแดง (ยกเว้นกรณีตรวจพบ Invalid Validation Error เท่านั้น)
  - สำหรับฟิลด์ที่กรอกแล้วและห้ามแก้ไขในส่วนรายละเอียดตาราง ให้ออกแบบโดยใช้ตัวอักษรธรรมดา (Text Span) ไม่ต้องใส่กรอบกล่องข้อความ (Input Box) เพื่อตัดความเข้าใจผิดว่าสามารถพิมพ์ข้อมูลได้

### 6.10 Contrast & Color Guidelines สำหรับพื้นหลังสีกรมท่า (Contrast & Navy Backgrounds)

- **หลักการสำคัญ:** เมื่อมีการนำสีกรมท่ามาเป็นพื้นหลังของกล่องข้อมูล (Detail Boxes / Cards / Panels) เพื่อสรุปหรือแสดงข้อมูลที่สำคัญและต้องการการแบ่งแยกที่ชัดเจน ตัวหนังสือภายในทั้งหมดต้องถูกปรับปรุงให้เป็นสีสว่างเพื่อความชัดเจนในการอ่าน (Readability)
- **กฎการจัดสีตัวอักษร:**
  - **พื้นหลังสีกรมท่าเข้มหลัก (`#002266` หรือสอดคล้องกับ `--foreground` / `bg-slate-800` / `bg-slate-900`)**
    - หัวข้อ (Heading / Title): **ต้องใช้สีขาว (`#FFFFFF`) หรือสีฟ้าอ่อนเฉดพิเศษ (`--accent` / `#E0F2FE`) เท่านั้น**
    - ข้อความรายละเอียด (Body Text): **ต้องใช้สีขาว (`#FFFFFF`) หรือสีเทาขาวสว่างอ่อน (`#E2E8F0` / `#F1F4F9`) ห้ามใช้สีดำหรือสีน้ำเงินเข้มบนพื้นหลังเข้มเด็ดขาด**
    - ข้อความอธิบายย่อย (Muted text): **ใช้สีฟ้าอ่อนโปร่งแสงหรือสีเทาสว่าง (`rgba(255, 255, 255, 0.7)` หรือ `#CBD5E1`)**
    - ตัวเลขสถิติ / ค่าไฮไลท์: **ใช้สีเหลืองทองสว่าง (`#FACC15` หรือ `#F59E0B`) หรือเขียวสว่าง (`#34D399`) เพื่อเพิ่มมิติการสังเกตเห็นและเน้นย้ำความสำคัญ**
  - **การรวมศูนย์ของธีม (Unified Theme Consistency):** ทั้งระบบ Buyer และ Vendor Portal ต้องอ้างอิง Palette สีเดียวกัน โดยส่วนกล่องข้อมูล Detail ที่เดิมเคยใช้สีทึบหรือมืดเกินไป หรือมีตัวอักษรที่ตัดกันไม่เพียงพอ จะต้องได้รับการปรับปรุงให้อยู่ในโทนตัวอักษรสีขาวบนพื้นเข้ม เพื่อรักษาความกลมกลืนของการออกแบบพอร์ทัล

### 6.11 Number & Currency Formatting Guidelines (หลักการแสดงผลตัวเลขและจำนวนเงิน)

- **การแสดงจำนวนสินค้า/ครุภัณฑ์ (Quantity Formatting):**
  - **ต้องเป็นจำนวนเต็ม (Integer) เสมอ** ไม่มีเศษทศนิยมโดยเด็ดขาด (เช่น แล็ปท็อป 100 เครื่อง, สินค้าจัดซื้อ 5 ชิ้น)
  - รูปแบบการจัดหน้าจอ: ใช้ `Math.round()` ในการคำนวณและปัดเศษทศนิยมออกก่อนแสดงผลเสมอ
  - การคั่นหลักพัน: ใช้เครื่องหมายจุลภาค `,` เสมอ (เช่น `1,500`, `100`, `12,500`)
- **การแสดงจำนวนเงิน/ราคาสินค้า (Currency Formatting):**
  - **ต้องมีทศนิยม 2 ตำแหน่งเสมอ** เพื่อความถูกต้องของยอดบัญชี (เช่น `1,500,000.00`, `35,000.00`, `0.00`)
  - การคั่นหลักพัน: ใช้เครื่องหมายจุลภาค `,` เสมอ (เช่น `1,500,000.00`)
  - หน่วยเงิน: ระบุ `THB` หรือใช้เครื่องหมายสกุลเงินตามความเหมาะสม

---

## 7. Icon System

ใช้ **Lucide React** (`lucide-react`) — Library เดียวกับที่ระบุไว้ใน Environment ของ Antigravity อยู่แล้ว

| Action | Icon | ใช้ที่ Screen |
|---|---|---|
| ดูรายละเอียด | `Eye` | ทุก List (B1, D1, D5) |
| แก้ไข | `Pencil` | D1, D5, B2 |
| ลบ | `Trash2` | D1 |
| เพิ่มใหม่ | `Plus` | ทุกปุ่ม "+ สร้าง..." |
| อนุมัติ | `Check` หรือ `CheckCircle2` | B3, G1, D5 Tab③ |
| ปฏิเสธ | `X` หรือ `XCircle` | G1, D5 Tab③ |
| แนบไฟล์/อัปโหลด | `Paperclip` / `Upload` | B2, E1, F1 |
| ดาวน์โหลด | `Download` | A3 Export |
| ค้นหา | `Search` | C2, B1 ทุก Search Bar |
| Filter | `SlidersHorizontal` | ทุก List ที่มี Filter |
| แจ้งเตือน | `Bell` | Topbar ทุกหน้า |
| ลองใหม่ (Retry) | `RotateCw` | H4 Integration Monitor |
| ติดตามจัดส่ง | `Truck` | D5 Tab④ Tracking |
| Vendor/บริษัท | `Building2` | B1-B6, I-Group |
| การเงิน/จ่ายเงิน | `Wallet` หรือ `Banknote` | F1-F6 |
| วันที่ | `Calendar` | ทุก Date Picker |
| ด่วน/Urgent | `AlertTriangle` | D2 Toggle "ด่วน", G1 Escalated Badge |
| Mobile Approve | `Smartphone` | G2 |
| สินทรัพย์ / จัดการครุภัณฑ์ | `Cube` หรือ `Package` | admin/assets (ระบบบริหารจัดการสินทรัพย์) |
| จัดสรรสินทรัพย์ / ให้เช่า | `ArrowRightLeft` หรือ `Share2` | admin/assets (การจัดสรรหรือเช่าข้าม BU) |
| สิทธิ์ใช้งานซอฟต์แวร์ (Licenses) | `Key` หรือ `ShieldCheck` | admin/assets (สิทธิ์ใช้งานดิจิทัล) |

**Size:** 16px (ในปุ่ม/Table แถว), 20px (Sidebar Menu), 24px (Empty State/Header)

---

## 8. Spacing, Radius, Elevation, Breakpoints

### 8.1 Radius (คำนวณจาก root 14px จริง — แก้ความเข้าใจผิดที่พบบ่อย)

| Token | Formula | px จริง |
|---|---|---|
| `--radius-sm` | `var(--radius) - 4px` | **6.5px** |
| `--radius-md` | `var(--radius) - 2px` | **8.5px** |
| `--radius-lg` | `var(--radius)` | **10.5px** |
| `--radius-xl` | `var(--radius) + 4px` | **14.5px** |

### 8.2 Spacing

ใช้ Tailwind Default Spacing Scale (4px base) ตรงๆ ไม่ต้อง Override — `theme.css` ไม่ได้กำหนด Spacing Scale แยกไว้ จึงไม่มีความขัดแย้ง

### 8.3 Elevation (เติมใหม่ — ต้องรักษา Pattern Navy-tint ของ `--border` เดิม)

```
--shadow-sm: 0 1px 2px rgba(0, 34, 102, 0.04);
--shadow-md: 0 4px 6px -1px rgba(0, 34, 102, 0.06), 0 2px 4px -2px rgba(0, 34, 102, 0.04);
--shadow-lg: 0 10px 15px -3px rgba(0, 34, 102, 0.08), 0 4px 6px -4px rgba(0, 34, 102, 0.04);
```

**หลักการที่ต้องรักษาไว้ตลอด:** ทุก Neutral Element (Border, Shadow, Divider) ในระบบนี้ Tint ด้วยสี Navy หลัก (`#002266`) ที่ Opacity ต่ำ **ไม่ใช้เทาล้วน (Pure Gray/Black)** — เป็น Pattern ที่ theme.css เดิมตั้งไว้แล้วผ่าน `--border: rgba(0,34,102,0.08)` ต้อง Apply กับ Token ใหม่ทุกตัวที่เพิ่มเข้ามาเช่นกัน

### 8.4 Breakpoints

ใช้ Tailwind Default: `sm`=640px, `md`=768px, `lg`=1024px, `xl`=1280px — สำคัญกับ G2 (Mobile Approval) และ I1-I5 (Vendor Portal) ตามที่ระบุไว้ใน `PR_Screen_Inventory.md` ส่วนที่ 15

---

## 9. Data Visualization (Chart Colors)

ลำดับการใช้สีกราฟใน A1 (Dashboard) และ E3 (Stock Trend) — ใช้ตามลำดับนี้เสมอเพื่อความสม่ำเสมอข้าม Chart:

| ลำดับ | Token | สี | ใช้เป็น Series ที่ |
|---|---|---|---|
| 1 | `--chart-1` | `#0054FF` (Primary Blue) | Series หลัก/สำคัญที่สุด เช่น ยอด PR/PO รายเดือน |
| 2 | `--chart-2` | `#002266` (Navy) | Series รอง สำหรับเทียบ |
| 3 | `--chart-3` | `#EF5C23` (Orange) | จุดที่ต้อง Highlight/เน้น (ใช้คู่กับ `--urgent` ด้วย) |
| 4 | `--chart-4` | `#34D399` (Green) | Metric เชิงบวก เช่น ยอดประหยัด (ใช้คู่กับ `--success` ด้วย) |
| 5 | `--chart-5` | `#F472B6` (Pink) | Series เสริม/พิเศษ ใช้น้อยที่สุด |

---

## 10. Dark Mode — สถานะปัจจุบัน

⚠️ **ข้อสังเกตจาก theme.css ที่อัปโหลดมา:** Block `.dark` มีค่าเหมือน `:root` ทุกตัวเป๊ะ (Copy มาทั้งดุ้น ไม่ได้ปรับแยก) — แปลว่า Dark Mode **ยังไม่ถูก Implement จริง** ในต้นฉบับ

**คำแนะนำสำหรับ Prototype รอบนี้:** กำหนดให้ Phase 1 Prototype เป็น **Light Mode เท่านั้น** (สอดคล้องกับ Enterprise B2B Tool ทั่วไปที่ไม่ Priority Dark Mode) ไม่ต้องเสียเวลาแก้ `.dark` Block ตอนนี้ — ถ้าต้องการ Dark Mode จริงในอนาคต ต้องออกแบบ Token แยกใหม่ทั้งชุด (ไม่ใช่ Invert อัตโนมัติ เพราะสี Navy/Blue เดิมจะอ่านยากบนพื้นเข้ม)

---

## 11. Voice & Microcopy Guideline

ตามหลัก Empty State และ Error ต้องเป็น "คำเชิญให้ลงมือทำ" ไม่ใช่แค่บอกสถานะเฉยๆ — ใช้ Active Voice เสมอ และคำกริยาต้องสอดคล้องกันตลอด Flow (ปุ่มไหนใช้คำว่าอะไร Toast/แจ้งเตือนต้องใช้คำเดียวกัน)

| สถานการณ์ | ตัวอย่างที่ควรใช้ | หลีกเลี่ยง |
|---|---|---|
| Empty: D1 ยังไม่มี PR | "ยังไม่มีรายการขอซื้อ — สร้างใบขอซื้อแรกของคุณได้เลย" + ปุ่ม "สร้าง PR ใหม่" | "No data found" |
| Error: D2 งบไม่พอ | "วงเงินไม่พอ เหลือ 12,000 บาท — ปรับจำนวนสินค้า หรือขออนุมัติเพิ่มวงเงิน" | "Error: budget exceeded" |
| Error: F2 Mismatch | "ยอดใน Invoice ไม่ตรงกับ PO ต่างกัน 350 บาท — ตรวจสอบรายการก่อนส่งอีกครั้ง" | "Validation failed" |
| Success Toast: D5 Approve PO | "อนุมัติใบสั่งซื้อ PO-2023-001 แล้ว" (คำว่า "อนุมัติ" ตรงกับปุ่มที่กด) | "Success!" |
| H4 Sync Failed | "ส่งข้อมูลไป SAP ไม่สำเร็จ — กดลองใหม่ หรือติดต่อ IT หากเกิดซ้ำ" | "Integration error 500" |

---

## 12. Implementation Notes สำหรับ Antigravity

1. **ต้องใช้ Tailwind CSS v4** — Syntax `@custom-variant dark` และ `@theme inline` เป็นฟีเจอร์เฉพาะของ Tailwind v4 เท่านั้น ถ้า Antigravity Scaffold โปรเจกต์เป็น Tailwind v3 มาเริ่มต้น ต้อง Migrate ก่อนวาง `theme.css` นี้
2. **วาง `theme.css` เป็น Global Stylesheet ไฟล์เดียว** — เอา Addendum ในส่วนที่ 3 ของเอกสารนี้ไปต่อท้ายใน Block เดิม (`:root`, `.dark`, `@theme inline`) ไม่ต้องสร้างไฟล์ CSS แยกใหม่ เพื่อรักษาความเป็น Single Source of Truth
3. **โหลด Font** — เพิ่ม Google Fonts `Inter` (400,500) และ `Noto Sans Thai` (400,500) ผ่าน `<link>` หรือ `next/font` แล้ว Apply `font-family: var(--font-sans)` ที่ `body`
4. **shadcn/ui ใช้ได้ทันที** — ชื่อ Token ทั้งหมดตรงกับ Convention ของ shadcn/ui (`--primary`, `--card`, `--destructive` ฯลฯ) ติดตั้ง Component จาก shadcn ได้โดยไม่ต้อง Map สีใหม่
5. **Badge Component** — ต้อง Custom เพิ่มจาก shadcn Default เพราะ shadcn ไม่มี `success`/`warning` Variant มาให้ในชุดมาตรฐาน ใช้ Token จากส่วนที่ 3 สร้าง Variant เพิ่มเอง

---

## 13. Assumption & Open Items

1. **สี `--warning` (#F59E0B) เป็นสีที่เพิ่มใหม่ทั้งหมด** ไม่ได้อยู่ใน theme.css ต้นฉบับ — เลือกจากหลัก Amber มาตรฐานที่ไม่ชนกับ Palette เดิม ควร Confirm กับผู้ออกแบบ theme.css ตัวจริงอีกครั้งก่อน Build เต็มรูป (ถ้ามี Designer ที่ดูแล Brand Guideline อยู่)
2. **Font Pairing (Inter + Noto Sans Thai)** เป็นข้อเสนอจากการวิเคราะห์ ไม่ใช่ค่าที่ยืนยันจากเอกสารต้นฉบับ เพราะ theme.css ไม่ได้ระบุ Font ไว้เลย
3. **Badge เป็น Soft Style** อ้างอิงจาก Mockup จริงที่เห็นใน B1/D1/D5 (Badge สีอ่อน+ตัวอักษรเข้ม) — ถ้า Mockup จริงในบางหน้าใช้ Solid Badge ต้อง Cross-check อีกครั้ง
4. **Dark Mode ไม่อยู่ในขอบเขต Prototype รอบนี้** ตามที่ระบุในส่วนที่ 10 — ถ้าลูกค้าต้องการ Dark Mode ต้องเปิดเป็น Scope ใหม่แยก ไม่ใช่แค่ Toggle Class `.dark` เดิม

---

*เอกสารนี้คือไฟล์ที่ 4 ของชุด Prototype — ใช้คู่กับ `User_Flow.md`, `Data_Model_(ERD).md`, `PR_Screen_Inventory.md` และวาง `theme.css` (ต้นฉบับ + Addendum ส่วนที่ 3) เป็น Global Stylesheet จริงในโปรเจกต์ Antigravity*

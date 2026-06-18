import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Company } from '../entities/company.entity';
import { BusinessUnit } from '../entities/business-unit.entity';
import { CostCenter } from '../entities/cost-center.entity';
import { Role } from '../entities/role.entity';
import { AppUser } from '../entities/app-user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Permission } from '../entities/permission.entity';
import { Vendor } from '../entities/vendor.entity';
import { VendorContact } from '../entities/vendor-contact.entity';
import { VendorAddress } from '../entities/vendor-address.entity';
import { VendorBankAccount } from '../entities/vendor-bank-account.entity';
import { VendorDocument } from '../entities/vendor-document.entity';
import { Item } from '../entities/item.entity';
import { ItemPrice } from '../entities/item-price.entity';
import { DOARule } from '../entities/doa-rule.entity';

// Static UUID helpers
const uuid = (prefix: number, id: number) => {
  const pStr = prefix.toString().padStart(8, '0');
  const idStr = id.toString().padStart(12, '0');
  return `${pStr}-0000-0000-0000-${idStr}`;
};

async function bootstrap() {
  console.log('Starting Database Seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  // Clear existing data in reverse order of dependencies
  const entities = [
    DOARule, ItemPrice, Item, VendorDocument, VendorBankAccount,
    VendorAddress, VendorContact, Vendor, Permission, UserRole,
    AppUser, Role, CostCenter, BusinessUnit, Company
  ];
  for (const entity of entities) {
    await dataSource.getRepository(entity).delete({});
  }

  // 1. Seed Company
  console.log('Seeding Company...');
  const companyRepo = dataSource.getRepository(Company);
  const company = companyRepo.create({
    company_id: uuid(1, 1), // comp_001
    company_name: 'บริษัท เอสซีจี เจดับเบิ้ลยูดี โลจิสติกส์ จำกัด (มหาชน)',
    sap_company_code: '1000',
    tax_id: '0107555000123',
    is_active: true,
  });
  await companyRepo.save(company);

  // 2. Seed Business Units
  console.log('Seeding Business Units...');
  const buRepo = dataSource.getRepository(BusinessUnit);
  const bus = [
    { id: 1, code: 'PROC', name: 'ฝ่ายจัดซื้อกลาง' },
    { id: 2, code: 'IT', name: 'ฝ่ายเทคโนโลยีสารสนเทศ' },
    { id: 3, code: 'WH', name: 'คลังสินค้าและปฏิบัติการ' },
    { id: 4, code: 'FIN', name: 'ฝ่ายบัญชีและการเงิน' },
    { id: 5, code: 'B2C', name: 'ฝ่ายขายและบริการลูกค้า B2C' },
  ].map((b) =>
    buRepo.create({
      bu_id: uuid(2, b.id),
      company_id: company.company_id,
      bu_code: b.code,
      bu_name: b.name,
    })
  );
  await buRepo.save(bus);

  // 3. Seed Cost Centers
  console.log('Seeding Cost Centers...');
  const ccRepo = dataSource.getRepository(CostCenter);
  const ccs = [
    { id: 1, bu: 1, code: 'CC-PROC-01', name: 'งบจัดซื้อกลาง', annual: 2000000, reserved: 85500, used: 950000 },
    { id: 2, bu: 2, code: 'CC-IT-01', name: 'งบไอที', annual: 1200000, reserved: 0, used: 1098000 },
    { id: 3, bu: 3, code: 'CC-WH-01', name: 'งบคลังสินค้า', annual: 3000000, reserved: 0, used: 1250000 },
    { id: 4, bu: 4, code: 'CC-FIN-01', name: 'งบบัญชีการเงิน', annual: 1500000, reserved: 0, used: 620000 },
    { id: 5, bu: 5, code: 'CC-B2C-01', name: 'งบขาย B2C', annual: 2500000, reserved: 142500, used: 1890000 },
  ].map((c) =>
    ccRepo.create({
      cost_center_id: uuid(3, c.id),
      bu_id: uuid(2, c.bu),
      cc_code: c.code,
      cc_name: c.name,
      annual_budget_amount: c.annual,
      budget_reserved_amount: c.reserved,
      budget_used_amount: c.used,
      fiscal_year: '2026',
    })
  );
  await ccRepo.save(ccs);

  // 4. Seed Roles
  console.log('Seeding Roles...');
  const roleRepo = dataSource.getRepository(Role);
  const roleNames = ['Requester', 'Buyer', 'Approver', 'Warehouse', 'Accounting', 'Finance', 'Admin'];
  const roles = roleNames.map((name, index) =>
    roleRepo.create({
      role_id: uuid(4, index + 1),
      role_name: name,
    })
  );
  await roleRepo.save(roles);

  // 5. Seed Permissions
  console.log('Seeding Permissions...');
  const permRepo = dataSource.getRepository(Permission);
  const permissionsData = [
    { roleId: 1, code: 'CreateRequest' },
    { roleId: 2, code: 'ManageMaster' },
    { roleId: 2, code: 'Verify' },
    { roleId: 3, code: 'ApproveVerify' },
    { roleId: 5, code: 'Confirm' },
    { roleId: 6, code: 'FinanceVerify' },
    { roleId: 7, code: 'GlobalSearch' },
    { roleId: 7, code: 'ManageLane' },
  ];
  const permissions = permissionsData.map((p, index) =>
    permRepo.create({
      permission_id: uuid(5, index + 1),
      permission_code: p.code,
      role_id: uuid(4, p.roleId),
    })
  );
  await permRepo.save(permissions);

  // 6. Seed Users
  console.log('Seeding Users...');
  const userRepo = dataSource.getRepository(AppUser);
  const urRepo = dataSource.getRepository(UserRole);
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersData = [
    { id: 1, user: 'napas.s', email: 'napas.s@scgjwd.com', role: 1, bu: 5 }, // Requester
    { id: 2, user: 'teerapat.c', email: 'teerapat.c@scgjwd.com', role: 2, bu: 1 }, // Buyer
    { id: 3, user: 'paweena.r', email: 'paweena.r@scgjwd.com', role: 2, bu: 1 }, // Buyer
    { id: 4, user: 'warakorn.c', email: 'warakorn.c@scgjwd.com', role: 3, bu: 1 }, // Approver Manager
    { id: 5, user: 'supawadee.i', email: 'supawadee.i@scgjwd.com', role: 3, bu: 1 }, // Approver Senior Mgr
    { id: 6, user: 'kittichai.w', email: 'kittichai.w@scgjwd.com', role: 4, bu: 3 }, // Warehouse
    { id: 7, user: 'orawan.t', email: 'orawan.t@scgjwd.com', role: 5, bu: 4 }, // Accounting
    { id: 8, user: 'piyada.m', email: 'piyada.m@scgjwd.com', role: 5, bu: 4 }, // Accounting
    { id: 9, user: 'ekachai.p', email: 'ekachai.p@scgjwd.com', role: 6, bu: 4 }, // Finance
    { id: 10, user: 'nantaporn.s', email: 'nantaporn.s@scgjwd.com', role: 7, bu: 2 }, // Admin
  ];

  for (const u of usersData) {
    const user = userRepo.create({
      user_id: uuid(6, u.id),
      username: u.user,
      email: u.email,
      login_type: u.id === 10 ? 'Local' : 'AD',
      password_hash: passwordHash,
      status: 'Active',
      mfa_enabled: false,
    });
    await userRepo.save(user);

    const userRole = urRepo.create({
      user_role_id: uuid(7, u.id),
      user_id: user.user_id,
      role_id: uuid(4, u.role),
      company_id: company.company_id,
      bu_id: uuid(2, u.bu),
    });
    await urRepo.save(userRole);
  }

  // 7. Seed Vendors
  console.log('Seeding Vendors...');
  const vendorRepo = dataSource.getRepository(Vendor);
  const vendors = [
    { id: 1, tax: '0105561012345', name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด', type: 'ผู้ขาย', cat: 'อุปกรณ์ไอที', status: 'Active', score: 4.6 },
    { id: 2, tax: '0105562023456', name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด', type: 'ผู้ขาย', cat: 'อุปกรณ์ไอที/บริการ', status: 'Active', score: 4.3 },
    { id: 3, tax: '0105563034567', name: 'บริษัท ออฟฟิศ เทค จำกัด', type: 'ผู้ขาย', cat: 'เครื่องใช้สำนักงาน', status: 'Active', score: 4.1 },
    { id: 4, tax: '0105564045678', name: 'บริษัท ทวีโชค ออฟฟิศ ซัพพลาย จำกัด', type: 'ผู้ขาย', cat: 'วัสดุสิ้นเปลือง/เซฟตี้', status: 'Active', score: 4.4 },
    { id: 5, tax: '0105565056789', name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด', type: 'ผู้ขาย', cat: 'เฟอร์นิเจอร์', status: 'Active', score: 3.9 },
    { id: 6, tax: '0105566067890', name: 'บริษัท คลีนโปร เซอร์วิส จำกัด', type: 'ผู้ให้บริการ', cat: 'บริการทำความสะอาด', status: 'Active', score: 4.2 },
    { id: 7, tax: '0105567078901', name: 'บริษัท เซฟตี้เกียร์ ไทย จำกัด', type: 'ผู้ขาย', cat: 'อุปกรณ์เซฟตี้', status: 'PendingRegistration', score: 0 },
    { id: 8, tax: '0105568089012', name: 'บริษัท ไทยขนส่งอุปกรณ์ จำกัด', type: 'ผู้ขาย', cat: 'อุปกรณ์โลจิสติกส์', status: 'UnderReview', score: 0 },
    { id: 9, tax: '0105569090123', name: 'บริษัท เอ็นจิเนียริ่ง โซลูชั่น จำกัด', type: 'ผู้ให้บริการ', cat: 'บำรุงรักษา/วิศวกรรม', status: 'Suspended', score: 3.5 },
    { id: 10, tax: '0105560101234', name: 'บริษัท ไทยเคเทอริ่ง จำกัด', type: 'ผู้ให้บริการ', cat: 'บริการจัดเลี้ยง', status: 'Blocked', score: 2.1 },
    { id: 11, tax: '0105561112345', name: 'บริษัท สมาร์ท ปริ้นติ้ง จำกัด', type: 'ผู้ขาย', cat: 'บริการสิ่งพิมพ์', status: 'Blacklisted', score: 1.2 },
    { id: 12, tax: '0105562123456', name: 'บริษัท แอดวานซ์ แพ็คเกจจิ้ง จำกัด', type: 'ผู้ขาย', cat: 'บรรจุภัณฑ์', status: 'Rejected', score: 0 },
    { id: 13, tax: '0105563134567', name: 'บริษัท เทคโนโลยี เน็กซ์ จำกัด', type: 'ผู้ขาย', cat: 'อุปกรณ์ไอที', status: 'Active', score: 4.5 },
  ].map((v) =>
    vendorRepo.create({
      vendor_id: uuid(8, v.id),
      tax_id: v.tax,
      vendor_name: v.name,
      vendor_name_en: '',
      vendor_type: v.type,
      business_category: v.cat,
      status: v.status,
      evaluation_score: v.score,
      is_dedup_master: true,
    })
  );
  await vendorRepo.save(vendors);

  // 8. Seed Items
  console.log('Seeding Items...');
  const itemRepo = dataSource.getRepository(Item);
  const items = [
    { id: 1, code: 'ITM-00001', name: 'โน้ตบุ๊คสำหรับงานสำนักงาน 14 นิ้ว', type: 'Goods', cat: 1, uom: 'เครื่อง', bu: 2 },
    { id: 2, code: 'ITM-00002', name: 'จอคอมพิวเตอร์ 24 นิ้ว', type: 'Goods', cat: 1, uom: 'จอ', bu: 2 },
    { id: 3, code: 'ITM-00003', name: 'เครื่องพิมพ์เลเซอร์มัลติฟังก์ชัน', type: 'Goods', cat: 1, uom: 'เครื่อง', bu: 2 },
    { id: 4, code: 'ITM-00004', name: 'อุปกรณ์เครือข่าย Switch 24 Port', type: 'Goods', cat: 1, uom: 'เครื่อง', bu: 2 },
    { id: 5, code: 'ITM-00005', name: 'เครื่องถ่ายเอกสารระบบดิจิทัล', type: 'Goods', cat: 2, uom: 'เครื่อง', bu: 1 },
    { id: 6, code: 'ITM-00006', name: 'เครื่องสำรองไฟ UPS 1000VA', type: 'Goods', cat: 2, uom: 'เครื่อง', bu: 2 },
    { id: 7, code: 'ITM-00007', name: 'โทรศัพท์สำนักงานไร้สาย', type: 'Goods', cat: 2, uom: 'เครื่อง', bu: 1 },
    { id: 8, code: 'ITM-00008', name: 'โต๊ะทำงานเหล็ก', type: 'Goods', cat: 3, uom: 'ตัว', bu: 1 },
    { id: 9, code: 'ITM-00009', name: 'เก้าอี้สำนักงานเบาะหนัง', type: 'Goods', cat: 3, uom: 'ตัว', bu: 1 },
    { id: 10, code: 'ITM-00010', name: 'ตู้เก็บเอกสาร 4 ชั้น', type: 'Goods', cat: 3, uom: 'ตู้', bu: 1 },
    { id: 11, code: 'ITM-00011', name: 'กระดาษ A4 80 แกรม (ลัง)', type: 'Goods', cat: 4, uom: 'ลัง', bu: 1 },
    { id: 12, code: 'ITM-00012', name: 'หมวกนิรภัยมาตรฐาน', type: 'Goods', cat: 4, uom: 'ชิ้น', bu: 3 },
    { id: 13, code: 'ITM-00013', name: 'รองเท้าเซฟตี้หัวเหล็ก', type: 'Goods', cat: 4, uom: 'คู่', bu: 3 },
    { id: 14, code: 'ITM-00014', name: 'บริการทำความสะอาดสำนักงานรายเดือน', type: 'Service', cat: 5, uom: 'เดือน', bu: 1 },
    { id: 15, code: 'ITM-00015', name: 'บริการบำรุงรักษาเครื่องปรับอากาศรายปี', type: 'Service', cat: 5, uom: 'ปี', bu: 3 },
  ].map((i) =>
    itemRepo.create({
      item_id: uuid(9, i.id),
      central_item_code: i.code,
      item_name: i.name,
      item_type: i.type,
      category_id: uuid(5, i.cat), // reuse permission namespace for simple category uuid mapping
      uom: i.uom,
      owner_bu_id: uuid(2, i.bu),
      status: 'Active',
    })
  );
  await itemRepo.save(items);

  // 9. Seed Item Prices
  console.log('Seeding Item Prices...');
  const priceRepo = dataSource.getRepository(ItemPrice);
  const prices = [
    { id: 1, item: 1, ven: 1, val: 28500, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 2, item: 1, ven: 2, val: 27900, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 3, item: 1, ven: 13, val: 27500, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 4, item: 2, ven: 1, val: 4200, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 5, item: 2, ven: 3, val: 4500, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 6, item: 3, ven: 3, val: 12900, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 7, item: 4, ven: 2, val: 8700, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 8, item: 5, ven: 3, val: 65000, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 9, item: 6, ven: 1, val: 3200, status: 'ExpiringSoon', from: '2025-07-01', to: '2026-06-30' },
    { id: 10, item: 7, ven: 3, val: 1850, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 11, item: 8, ven: 5, val: 3500, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 12, item: 9, ven: 5, val: 4800, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 13, item: 10, ven: 5, val: 2900, status: 'Expired', from: '2025-01-01', to: '2025-12-31' },
    { id: 14, item: 11, ven: 4, val: 650, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 15, item: 12, ven: 4, val: 280, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 16, item: 13, ven: 4, val: 890, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 17, item: 14, ven: 6, val: 18000, status: 'Active', from: '2026-01-01', to: '2026-12-31' },
    { id: 18, item: 15, ven: 9, val: 28000, status: 'Expired', from: '2025-01-01', to: '2025-12-31' },
  ].map((p) =>
    priceRepo.create({
      price_id: uuid(10, p.id),
      item_id: uuid(9, p.item),
      vendor_id: uuid(8, p.ven),
      unit_price: p.val,
      effective_date: new Date(p.from),
      expiry_date: new Date(p.to),
      status: p.status,
    })
  );
  await priceRepo.save(prices);

  // 10. Seed Vendor Documents
  console.log('Seeding Vendor Documents...');
  const vdocRepo = dataSource.getRepository(VendorDocument);
  const vdocs = [
    { id: 1, ven: 1, type: 'หนังสือรับรองบริษัท', from: '2024-03-01', to: '2027-03-01', status: 'Valid' },
    { id: 2, ven: 1, type: 'ภ.พ.20', from: '2024-03-01', to: '2027-03-01', status: 'Valid' },
    { id: 3, ven: 5, type: 'ภ.พ.20', from: '2023-07-15', to: '2026-07-15', status: 'ExpiringSoon' },
    { id: 4, ven: 9, type: 'ภ.พ.20', from: '2023-01-10', to: '2026-01-10', status: 'Expired' },
    { id: 5, ven: 6, type: 'หนังสือรับรองบริษัท', from: '2024-09-01', to: '2027-09-01', status: 'Valid' },
    { id: 6, ven: 7, type: 'หนังสือรับรองบริษัท', from: '2026-06-10', to: '2029-06-10', status: 'Valid' },
  ].map((d) =>
    vdocRepo.create({
      document_id: uuid(11, d.id),
      vendor_id: uuid(8, d.ven),
      document_type: d.type,
      file_url: `/uploads/documents/doc_${d.id}.pdf`,
      expiry_date: new Date(d.to),
      status: d.status,
    })
  );
  await vdocRepo.save(vdocs);

  // 11. Seed Vendor Bank Accounts
  console.log('Seeding Vendor Bank Accounts...');
  const vbaRepo = dataSource.getRepository(VendorBankAccount);
  const vbas = [
    { id: 1, ven: 1, bank: 'ธนาคารกรุงไทย', no: '123-4-56789-0', name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด' },
    { id: 2, ven: 2, bank: 'ธนาคารไทยพาณิชย์', no: '234-5-67890-1', name: 'บริษัท อินโนเวทีฟ ไอที เซอร์วิส จำกัด' },
    { id: 3, ven: 4, bank: 'ธนาคารกสิกรไทย', no: '345-6-78901-2', name: 'บริษัท ทวีโชค ออฟฟิศ ซัพพลาย จำกัด' },
    { id: 4, ven: 5, bank: 'ธนาคารกรุงเทพ', no: '456-7-89012-3', name: 'บริษัท เฟอร์นิเจอร์ ครีเอชั่น จำกัด' },
    { id: 5, ven: 13, bank: 'ธนาคารกรุงไทย', no: '999-9-XXXXX-9', name: 'บริษัท เทคโนโลยี เน็กซ์ จำกัด' },
  ].map((b) =>
    vbaRepo.create({
      bank_account_id: uuid(12, b.id),
      vendor_id: uuid(8, b.ven),
      bank_name: b.bank,
      bank_branch: 'สำนักงานใหญ่',
      account_no: b.no,
      account_name: b.name,
      is_primary: true,
    })
  );
  await vbaRepo.save(vbas);

  // 12. Seed DOA Rules
  console.log('Seeding DOA Rules...');
  const doaRepo = dataSource.getRepository(DOARule);
  const doas = [
    { id: 1, type: 'PR', min: 0, max: 50000, lvl: 1, role: 'Manager' },
    { id: 2, type: 'PR', min: 50001, max: 999999999, lvl: 2, role: 'SeniorManager' },
    { id: 3, type: 'PO', min: 0, max: 100000, lvl: 1, role: 'Manager' },
    { id: 4, type: 'PO', min: 100001, max: 999999999, lvl: 2, role: 'SeniorManager' },
    { id: 5, type: 'PaymentRequest', min: 0, max: 100000, lvl: 1, role: 'AccountingLead' },
    { id: 6, type: 'PaymentRequest', min: 100001, max: 999999999, lvl: 2, role: 'Finance' },
  ].map((d) =>
    doaRepo.create({
      rule_id: uuid(13, d.id),
      company_id: company.company_id,
      doc_type: d.type,
      amount_min: d.min,
      amount_max: d.max,
      approval_level: d.lvl,
      approver_role: d.role,
    })
  );
  await doaRepo.save(doas);

  console.log('Database Seeding Completed Successfully!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});

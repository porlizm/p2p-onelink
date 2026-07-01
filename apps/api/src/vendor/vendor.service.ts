import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Vendor } from '../database/entities/vendor.entity';
import { VendorContact } from '../database/entities/vendor-contact.entity';
import { VendorAddress } from '../database/entities/vendor-address.entity';
import { VendorBankAccount } from '../database/entities/vendor-bank-account.entity';
import { VendorDocument } from '../database/entities/vendor-document.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorStatusDto } from './dto/update-vendor-status.dto';
import { VendorStatus } from '@p2p/shared';
import { VendorEvaluation } from '../database/entities/vendor-evaluation.entity';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private vendorRepository: Repository<Vendor>,
    @InjectRepository(VendorEvaluation)
    private evaluationRepository: Repository<VendorEvaluation>,
    private dataSource: DataSource,
  ) {}

  async register(dto: CreateVendorDto): Promise<Vendor> {
    // 1. Check duplicate Tax ID
    const existing = await this.vendorRepository.findOne({
      where: { tax_id: dto.tax_id },
    });
    if (existing) {
      throw new BadRequestException('Tax ID นี้ถูกลงทะเบียนในระบบเรียบร้อยแล้ว (Duplicate Tax ID)');
    }

    // 2. Perform Transaction to save all related records
    return this.dataSource.transaction(async (manager) => {
      // Create Vendor
      const vendor = manager.create(Vendor, {
        vendor_name: dto.vendor_name,
        tax_id: dto.tax_id,
        vendor_type: dto.vendor_type,
        business_category: dto.business_category || '',
        status: VendorStatus.PENDING_REGISTRATION,
        registered_date: new Date(),
        evaluation_score: 0,
        is_dedup_master: true,
      });
      const savedVendor = await manager.save(Vendor, vendor);

      // Create Contacts
      if (dto.contacts && dto.contacts.length > 0) {
        const contacts = dto.contacts.map((c, index) =>
          manager.create(VendorContact, {
            vendor_id: savedVendor.vendor_id,
            contact_name: c.contact_name,
            position: c.position || '',
            phone: c.phone || '',
            email: c.email,
            is_primary: index === 0,
          })
        );
        await manager.save(VendorContact, contacts);
      }

      // Create Addresses
      if (dto.addresses && dto.addresses.length > 0) {
        const addresses = dto.addresses.map((a, index) =>
          manager.create(VendorAddress, {
            vendor_id: savedVendor.vendor_id,
            address_type: index === 0 ? 'Billing' : 'Shipping',
            address_line1: a.address_line1,
            address_line2: a.address_line2 || '',
            subdistrict: a.subdistrict,
            district: a.district,
            province: a.province,
            postal_code: a.postal_code,
            country: 'Thailand',
          })
        );
        await manager.save(VendorAddress, addresses);
      }

      // Create Bank Accounts
      if (dto.bank_accounts && dto.bank_accounts.length > 0) {
        const banks = dto.bank_accounts.map((b, index) =>
          manager.create(VendorBankAccount, {
            vendor_id: savedVendor.vendor_id,
            bank_name: b.bank_name,
            bank_branch: b.bank_branch || '',
            account_no: b.account_no,
            account_name: b.account_name,
            is_primary: index === 0,
          })
        );
        await manager.save(VendorBankAccount, banks);
      }

      // Create Documents
      if (dto.documents && dto.documents.length > 0) {
        const docs = dto.documents.map((d) =>
          manager.create(VendorDocument, {
            vendor_id: savedVendor.vendor_id,
            document_type: d.document_type,
            file_url: d.file_url,
            expiry_date: d.expiry_date ? new Date(d.expiry_date) : null,
            status: 'Valid',
          })
        );
        await manager.save(VendorDocument, docs);
      }

      return savedVendor;
    });
  }

  async findAll(status?: VendorStatus): Promise<Vendor[]> {
    const query: any = {};
    if (status) {
      query.status = status;
    }
    return this.vendorRepository.find({
      where: query,
      order: { registered_date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({
      where: { vendor_id: id },
      relations: ['contacts', 'addresses', 'bank_accounts', 'documents'],
    });
    if (!vendor) {
      throw new NotFoundException('ไม่พบข้อมูลคู่ค้าที่ระบุ');
    }
    return vendor;
  }

  async updateStatus(id: string, dto: UpdateVendorStatusDto): Promise<Vendor> {
    const vendor = await this.vendorRepository.findOne({ where: { vendor_id: id } });
    if (!vendor) {
      throw new NotFoundException('ไม่พบข้อมูลคู่ค้าที่ระบุ');
    }

    vendor.status = dto.status;
    // Audit log or history change logic could go here
    return this.vendorRepository.save(vendor);
  }

  async getEvaluations(): Promise<VendorEvaluation[]> {
    return this.evaluationRepository.find({
      relations: ['vendor', 'approver'],
      order: { created_at: 'DESC' },
    });
  }

  async createEvaluation(body: { vendor_id: string; year: number; scores: any }): Promise<VendorEvaluation> {
    const vendor = await this.vendorRepository.findOne({ where: { vendor_id: body.vendor_id } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const evalRecord = this.evaluationRepository.create({
      vendor_id: body.vendor_id,
      year: body.year,
      scores: body.scores || null,
      status: 'PendingReview',
    });
    return this.evaluationRepository.save(evalRecord);
  }

  async approveEvaluation(id: string, approverId?: string): Promise<VendorEvaluation> {
    const evalRecord = await this.evaluationRepository.findOne({ where: { evaluation_id: id } });
    if (!evalRecord) throw new NotFoundException('Evaluation not found');

    evalRecord.status = 'Approved';
    evalRecord.approver_id = approverId || null;
    const saved = await this.evaluationRepository.save(evalRecord);

    const scores = evalRecord.scores || {};
    const sum = Number(scores.technical || 0) + Number(scores.commercial || 0) + Number(scores.delivery || 0);
    const count = 3;
    const average = Math.round(sum / count);
    const vendor = await this.vendorRepository.findOne({ where: { vendor_id: evalRecord.vendor_id } });
    if (vendor) {
      vendor.evaluation_score = average;
      await this.vendorRepository.save(vendor);
    }

    return saved;
  }

  async updateBankAccount(
    vendorId: string,
    body: { bank_name: string; bank_branch: string; account_no: string; account_name: string },
  ) {
    const bankRepo = this.dataSource.getRepository(VendorBankAccount);
    let bank = await bankRepo.findOne({ where: { vendor_id: vendorId, is_primary: true } });
    
    if (!bank) {
      bank = await bankRepo.findOne({ where: { vendor_id: vendorId } });
      if (!bank) {
        bank = bankRepo.create({ vendor_id: vendorId, is_primary: true });
      }
    }

    bank.bank_name = body.bank_name;
    bank.bank_branch = body.bank_branch;
    bank.account_no = body.account_no;
    bank.account_name = body.account_name;
    bank.verification_status = 'PendingVerification';
    bank.verified_by_buyer = null;
    bank.verified_by_accounting = null;
    return await bankRepo.save(bank);
  }

  async getPendingBankAccounts() {
    const bankRepo = this.dataSource.getRepository(VendorBankAccount);
    return await bankRepo.find({
      where: { verification_status: 'PendingVerification' },
      relations: ['vendor'],
    });
  }

  async verifyBankBuyer(accountId: string, username: string) {
    const bankRepo = this.dataSource.getRepository(VendorBankAccount);
    const bank = await bankRepo.findOne({ where: { bank_account_id: accountId } });
    if (!bank) {
      throw new NotFoundException('ไม่พบข้อมูลบัญชีธนาคาร');
    }
    bank.verified_by_buyer = username;
    if (bank.verified_by_accounting) {
      bank.verification_status = 'Active';
    }
    return await bankRepo.save(bank);
  }

  async verifyBankAccounting(accountId: string, username: string) {
    const bankRepo = this.dataSource.getRepository(VendorBankAccount);
    const bank = await bankRepo.findOne({ where: { bank_account_id: accountId } });
    if (!bank) {
      throw new NotFoundException('ไม่พบข้อมูลบัญชีธนาคาร');
    }
    if (bank.verified_by_buyer === username) {
      throw new BadRequestException('ไม่สามารถยืนยันซ้ำได้ ผู้ตรวจสอบฝั่ง Accounting ต้องเป็นคนละท่านกับฝั่ง Buyer (Segregation of Duties)');
    }
    bank.verified_by_accounting = username;
    if (bank.verified_by_buyer) {
      bank.verification_status = 'Active';
    }
    return await bankRepo.save(bank);
  }
}

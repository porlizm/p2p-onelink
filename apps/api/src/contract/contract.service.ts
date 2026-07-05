import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseContract } from '../database/entities/purchase-contract.entity';
import { Vendor } from '../database/entities/vendor.entity';
import { PurchaseOrder } from '../database/entities/purchase-order.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { Notification } from '../database/entities/notification.entity';
import { ContractMilestone } from '../database/entities/contract-milestone.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(PurchaseContract)
    private readonly contractRepo: Repository<PurchaseContract>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    @InjectRepository(PurchaseOrder)
    private readonly poRepo: Repository<PurchaseOrder>,
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(ContractMilestone)
    private readonly milestoneRepo: Repository<ContractMilestone>,
  ) {}

  async createContract(body: {
    vendor_id: string;
    title: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    document_url?: string;
    contract_type?: string;
    contract_period?: string;
    resources?: any[];
    rental_details?: any;
    warranty_details?: any;
    parent_contract_id?: string;
    contract_class?: string;
  }) {
    const vendor = await this.vendorRepo.findOne({ where: { vendor_id: body.vendor_id } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const contractNo = `CNT-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    const contract = this.contractRepo.create({
      contract_no: contractNo,
      vendor_id: body.vendor_id,
      title: body.title,
      start_date: new Date(body.start_date),
      end_date: new Date(body.end_date),
      total_amount: body.total_amount,
      remaining_amount: body.total_amount,
      status: body.contract_class === 'Amendment' || body.contract_class === 'Addendum' ? 'Draft' : 'PendingSignature',
      document_url: body.document_url || `/uploads/documents/contract_template.pdf`,
      signatures: {},
      contract_type: body.contract_type || 'Sales',
      contract_period: body.contract_period || 'Custom',
      resources: body.resources || null,
      rental_details: body.rental_details || null,
      warranty_details: body.warranty_details || null,
      parent_contract_id: body.parent_contract_id || null,
      version_no: 1,
      contract_class: body.contract_class || 'Original',
    });

    return this.contractRepo.save(contract);
  }

  async getContracts() {
    return this.contractRepo.find({
      relations: ['vendor'],
      order: { created_at: 'DESC' },
    });
  }

  async getContractsByVendor(vendorId: string) {
    return this.contractRepo.find({
      where: { vendor_id: vendorId },
      relations: ['vendor'],
      order: { created_at: 'DESC' },
    });
  }

  async submitApproval(id: string) {
    const contract = await this.contractRepo.findOne({ where: { contract_id: id } });
    if (!contract) throw new NotFoundException('Contract not found');
    contract.status = 'PendingApproval';
    return this.contractRepo.save(contract);
  }

  async approveContract(id: string) {
    const contract = await this.contractRepo.findOne({ where: { contract_id: id } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status !== 'PendingApproval') {
      throw new BadRequestException('Contract is not pending approval');
    }
    contract.status = 'PendingSignature';
    return this.contractRepo.save(contract);
  }

  async rejectContract(id: string) {
    const contract = await this.contractRepo.findOne({ where: { contract_id: id } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.status !== 'PendingApproval') {
      throw new BadRequestException('Contract is not pending approval');
    }
    contract.status = 'Rejected';
    return this.contractRepo.save(contract);
  }

  async amendContract(
    id: string,
    body: {
      title: string;
      start_date: string;
      end_date: string;
      total_amount: number;
      contract_type?: string;
      contract_period?: string;
      resources?: any[];
      rental_details?: any;
      warranty_details?: any;
    },
  ) {
    const parentContract = await this.contractRepo.findOne({ where: { contract_id: id } });
    if (!parentContract) throw new NotFoundException('Parent contract not found');
    if (parentContract.status !== 'Signed') {
      throw new BadRequestException('Only fully signed contracts can be amended');
    }

    const versionNo = Number(parentContract.version_no) + 1;
    const contractNo = `${parentContract.contract_no}-REV${versionNo}`;

    const amendment = this.contractRepo.create({
      contract_no: contractNo,
      vendor_id: parentContract.vendor_id,
      title: body.title,
      start_date: new Date(body.start_date),
      end_date: new Date(body.end_date),
      total_amount: body.total_amount,
      remaining_amount: body.total_amount,
      status: 'Draft',
      document_url: parentContract.document_url,
      signatures: {},
      contract_type: body.contract_type || parentContract.contract_type,
      contract_period: body.contract_period || parentContract.contract_period,
      resources: body.resources || parentContract.resources,
      rental_details: body.rental_details || parentContract.rental_details,
      warranty_details: body.warranty_details || parentContract.warranty_details,
      parent_contract_id: parentContract.contract_id,
      version_no: versionNo,
      contract_class: 'Amendment',
    });

    return this.contractRepo.save(amendment);
  }

  async signContract(
    id: string,
    signatory: { role: 'buyer' | 'vendor'; ip: string; name: string },
  ) {
    const contract = await this.contractRepo.findOne({ where: { contract_id: id } });
    if (!contract) throw new NotFoundException('Contract not found');

    if (contract.status === 'Signed') {
      throw new BadRequestException('Contract is already fully signed');
    }

    const signatures = contract.signatures || {};
    if (signatory.role === 'buyer') {
      signatures.buyer = {
        signed_at: new Date().toISOString(),
        ip: signatory.ip,
        name: signatory.name,
      };
    } else {
      signatures.vendor = {
        signed_at: new Date().toISOString(),
        ip: signatory.ip,
        name: signatory.name,
      };
    }

    contract.signatures = signatures;

    // If both signed, move to 'Signed' status
    if (signatures.buyer && signatures.vendor) {
      contract.status = 'Signed';

      // Supercede parent contract if it's an amendment
      if (contract.contract_class === 'Amendment' && contract.parent_contract_id) {
        const parent = await this.contractRepo.findOne({ where: { contract_id: contract.parent_contract_id } });
        if (parent) {
          parent.status = 'Superceded';
          await this.contractRepo.save(parent);

          // Update linked POs
          await this.poRepo.update(
            { contract_id: parent.contract_id },
            { contract_id: contract.contract_id }
          );

          // Log before/after comparison
          const audit = this.auditRepo.create({
            action: 'CONTRACT_AMENDMENT_EXECUTED',
            entity_type: 'PurchaseContract',
            entity_id: contract.contract_id,
            before_value_json: {
              contract_no: parent.contract_no,
              title: parent.title,
              total_amount: parent.total_amount,
              start_date: parent.start_date,
              end_date: parent.end_date,
              resources: parent.resources,
              rental_details: parent.rental_details,
              warranty_details: parent.warranty_details,
            },
            after_value_json: {
              contract_no: contract.contract_no,
              title: contract.title,
              total_amount: contract.total_amount,
              start_date: contract.start_date,
              end_date: contract.end_date,
              resources: contract.resources,
              rental_details: contract.rental_details,
              warranty_details: contract.warranty_details,
            },
            ip_address: signatory.ip,
          });
          await this.auditRepo.save(audit);
        }
      }
    } else {
      contract.status = 'PendingSignature';
    }

    return this.contractRepo.save(contract);
  }

  async checkContractExpirations(simulateDays?: number) {
    const contracts = await this.contractRepo.find({
      where: { status: 'Signed' },
      relations: ['vendor'],
    });

    const now = new Date();
    const alertLogs = [];
    const notifications = [];

    for (const contract of contracts) {
      const endDate = new Date(contract.end_date);
      const diffTime = endDate.getTime() - now.getTime();
      let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (simulateDays !== undefined) {
        diffDays = simulateDays;
      }

      if (diffDays === 30 || diffDays === 60 || diffDays === 90) {
        const message = `สัญญาจัดซื้อเลขที่ ${contract.contract_no} (${contract.title}) ของคู่ค้า ${contract.vendor?.vendor_name || 'ไม่ระบุ'} กำลังจะหมดอายุในอีก ${diffDays} วัน (สิ้นสุดวันที่ ${contract.end_date})`;
        
        const notif = this.notificationRepo.create({
          recipient_user_id: '00000000-0000-0000-0000-000000000001',
          channel: 'Portal & Email',
          trigger_event: 'ContractExpiring',
          message,
          read_flag: false,
        });
        await this.notificationRepo.save(notif);
        notifications.push(notif);

        const emailLog = `[EMAIL ALERT SENT] To: buyer-admin@scgjwd.com | Subject: แจ้งเตือนสัญญาใกล้หมดอายุ (${diffDays} วัน) | Body: สัญญา ${contract.contract_no} จะสิ้นสุดในวันที่ ${contract.end_date}`;
        console.log(emailLog);
        alertLogs.push(emailLog);
      }
    }

    return {
      success: true,
      checked_count: contracts.length,
      triggered_alerts_count: alertLogs.length,
      logged_emails: alertLogs,
    };
  }

  // ── US-0701: Contract Request (pre-draft business request) ──
  async requestContract(body: {
    vendor_id: string;
    title: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    request_reason: string;
    requested_by?: string;
  }) {
    const vendor = await this.vendorRepo.findOne({ where: { vendor_id: body.vendor_id } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const contractNo = `CNT-REQ-${Math.floor(Math.random() * 9000) + 1000}`;
    const contract = this.contractRepo.create({
      contract_no: contractNo,
      vendor_id: body.vendor_id,
      title: body.title,
      start_date: new Date(body.start_date),
      end_date: new Date(body.end_date),
      total_amount: body.total_amount,
      remaining_amount: body.total_amount,
      status: 'Requested',
      request_reason: body.request_reason,
      requested_by: body.requested_by || null,
      signatures: {},
      version_no: 1,
      contract_class: 'Original',
    });

    return this.contractRepo.save(contract);
  }

  async startDraftFromRequest(id: string) {
    const contract = await this.contractRepo.findOne({ where: { contract_id: id } });
    if (!contract) throw new NotFoundException('ไม่พบคำขอทำสัญญา');
    if (contract.status !== 'Requested') {
      throw new BadRequestException('คำขอนี้ไม่อยู่ในสถานะรอเริ่มร่างสัญญา');
    }
    contract.status = 'Draft';
    contract.contract_no = `CNT-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    return this.contractRepo.save(contract);
  }

  // ── US-0707: Contract Obligation and Milestone Tracking ──
  async getMilestones(contractId: string) {
    return this.milestoneRepo.find({
      where: { contract_id: contractId },
      order: { due_date: 'ASC' },
    });
  }

  async createMilestone(contractId: string, body: { title: string; due_date: string; amount: number }) {
    const contract = await this.contractRepo.findOne({ where: { contract_id: contractId } });
    if (!contract) throw new NotFoundException('ไม่พบสัญญาที่ระบุ');

    const milestone = this.milestoneRepo.create({
      contract_id: contractId,
      title: body.title,
      due_date: new Date(body.due_date),
      amount: body.amount,
      status: 'Pending',
    });
    return this.milestoneRepo.save(milestone);
  }

  async updateMilestoneStatus(milestoneId: string, status: 'Pending' | 'Delivered' | 'Delayed') {
    const milestone = await this.milestoneRepo.findOne({ where: { milestone_id: milestoneId } });
    if (!milestone) throw new NotFoundException('ไม่พบ Milestone ที่ระบุ');
    milestone.status = status;
    return this.milestoneRepo.save(milestone);
  }
}

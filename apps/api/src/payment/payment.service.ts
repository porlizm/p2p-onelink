import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Like, DataSource } from 'typeorm';
import { PaymentRequest } from '../database/entities/payment-request.entity';
import { PaymentProposal } from '../database/entities/payment-proposal.entity';
import { BankFile } from '../database/entities/bank-file.entity';
import { Lane } from '../database/entities/lane.entity';
import { Invoice } from '../database/entities/invoice.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { IntegrationLog } from '../database/entities/integration-log.entity';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';
import { BusinessUnit } from '../database/entities/business-unit.entity';
import { CreditDebitNote } from '../database/entities/credit-debit-note.entity';
import { PurchaseOrder } from '../database/entities/purchase-order.entity';
import { VendorBankAccount } from '../database/entities/vendor-bank-account.entity';
import { PurchaseContract } from '../database/entities/purchase-contract.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { PurchaseRequisitionStatus, InvoiceStatus, PurchaseOrderStatus } from '@p2p/shared';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(PaymentRequest)
    private prRepo: Repository<PaymentRequest>,
    @InjectRepository(PaymentProposal)
    private proposalRepo: Repository<PaymentProposal>,
    @InjectRepository(BankFile)
    private bankFileRepo: Repository<BankFile>,
    @InjectRepository(Lane)
    private laneRepo: Repository<Lane>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(CostCenter)
    private ccRepo: Repository<CostCenter>,
    @InjectRepository(IntegrationLog)
    private logRepo: Repository<IntegrationLog>,
    @InjectRepository(PurchaseRequisition)
    private prqRepo: Repository<PurchaseRequisition>,
    @InjectRepository(BusinessUnit)
    private buRepo: Repository<BusinessUnit>,
    @InjectRepository(CreditDebitNote)
    private cnDnRepo: Repository<CreditDebitNote>,
    private dataSource: DataSource,
  ) {}

  // 1. Create Payment Request
  async createPaymentRequest(body: {
    invoice_id: string;
    due_date: string;
    lane_id?: string;
    created_by: string;
    alternative_payee_name?: string;
    alternative_payee_bank?: string;
    alternative_payee_account?: string;
    currency?: string;
    fx_rate?: number;
    swift_code?: string;
    intermediary_bank_details?: string;
  }) {
    const invoice = await this.invoiceRepo.findOne({
      where: { invoice_id: body.invoice_id },
      relations: ['po'],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    // Cost Center check: use invoice's cost_center_id or fallback
    const ccId = invoice.cost_center_id;
    if (!ccId) throw new BadRequestException('Cost center is required for payment request');

    const cc = await this.ccRepo.findOne({ where: { cost_center_id: ccId } });
    if (!cc) throw new NotFoundException('Cost Center not found');

    // Budget Check: annual_budget - reserved - used
    const available = Number(cc.annual_budget_amount) - Number(cc.budget_reserved_amount) - Number(cc.budget_used_amount);
    const exceeds = Number(invoice.total_amount) > available;

    // Generate unique payment request number: PAY-YYYY-MM-XXXX
    const now = new Date();
    const prefix = `PAY-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const count = await this.prRepo.count({
      where: { payment_request_no: Like(`${prefix}%`) },
    });
    const prNo = `${prefix}-${(count + 1).toString().padStart(4, '0')}`;

    const paymentRequest = this.prRepo.create({
      payment_request_no: prNo,
      invoice_id: invoice.invoice_id,
      vendor_id: invoice.vendor_id,
      amount: invoice.total_amount,
      cost_center_id: cc.cost_center_id,
      due_date: new Date(body.due_date),
      status: exceeds ? 'BlockedOverBudget' : 'Maker',
      lane_id: body.lane_id || undefined,
      created_by: body.created_by,
      alternative_payee_name: body.alternative_payee_name || null,
      alternative_payee_bank: body.alternative_payee_bank || null,
      alternative_payee_account: body.alternative_payee_account || null,
      currency: body.currency || 'THB',
      fx_rate: body.fx_rate || 1.0,
      swift_code: body.swift_code || null,
      intermediary_bank_details: body.intermediary_bank_details || null,
    });

    const saved = await this.prRepo.save(paymentRequest);

    // Update invoice status to note that payment request has been generated
    invoice.status = InvoiceStatus.READY_FOR_PAYMENT;
    await this.invoiceRepo.save(invoice);

    // Log integration trigger for SAP (mock record)
    await this.logRepo.save(
      this.logRepo.create({
        target_system: 'SAP_B1',
        doc_type: 'PaymentRequest',
        doc_id: saved.payment_request_id,
        status: 'Success',
        retry_count: 0,
      }),
    );

    return this.getPaymentRequestById(saved.payment_request_id);
  }

  // 2. Fetch all payment requests
  async getPaymentRequests() {
    return this.prRepo.find({
      relations: ['invoice', 'vendor', 'costCenter', 'lane', 'proposal', 'creator'],
      order: { created_at: 'DESC' },
    });
  }

  // 2.1 Fetch single payment request
  async getPaymentRequestById(id: string) {
    return this.prRepo.findOne({
      where: { payment_request_id: id },
      relations: ['invoice', 'vendor', 'costCenter', 'lane', 'proposal', 'creator'],
    });
  }

  // 3. Update Payment Request status (SoD flow)
  async updateStatus(id: string, status: string) {
    const request = await this.prRepo.findOne({ where: { payment_request_id: id } });
    if (!request) throw new NotFoundException('Payment request not found');

    request.status = status;
    const saved = await this.prRepo.save(request);

    // If status is Paid, update invoice and cost center budget used amount
    if (status === 'Paid') {
      const invoice = await this.invoiceRepo.findOne({ where: { invoice_id: request.invoice_id } });
      if (invoice) {
        invoice.status = 'Paid' as InvoiceStatus;
        await this.invoiceRepo.save(invoice);
      }

      // Update Budget
      const cc = await this.ccRepo.findOne({ where: { cost_center_id: request.cost_center_id } });
      if (cc) {
        cc.budget_used_amount = Number(cc.budget_used_amount) + Number(request.amount);
        // deduct from reserved if it was reserved by PO
        if (Number(cc.budget_reserved_amount) >= Number(request.amount)) {
          cc.budget_reserved_amount = Number(cc.budget_reserved_amount) - Number(request.amount);
        }
        await this.ccRepo.save(cc);
      }
    }

    return this.getPaymentRequestById(id);
  }

  // 4. Create Payment Proposal
  async createProposal(body: { request_ids: string[] }) {
    if (!body.request_ids || body.request_ids.length === 0) {
      throw new BadRequestException('Request IDs are required');
    }

    const requests = await this.prRepo.find({
      where: { payment_request_id: In(body.request_ids) },
    });

    if (requests.length === 0) throw new BadRequestException('No matching requests found');

    const totalAmount = requests.reduce((sum, r) => sum + Number(r.amount), 0);

    const now = new Date();
    const prefix = `PROP-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const count = await this.proposalRepo.count({
      where: { proposal_no: Like(`${prefix}%`) },
    });
    const propNo = `${prefix}-${(count + 1).toString().padStart(4, '0')}`;

    const proposal = this.proposalRepo.create({
      proposal_no: propNo,
      total_amount: totalAmount,
      status: 'Pending',
    });

    const savedProposal = await this.proposalRepo.save(proposal);

    // Update all requests with the proposal ID and set to Confirm stage
    for (const r of requests) {
      r.proposal_id = savedProposal.proposal_id;
      r.status = 'Confirm';
      await this.prRepo.save(r);
    }

    return savedProposal;
  }

  // 4.1 Fetch all proposals
  async getProposals() {
    return this.proposalRepo.find({ order: { created_at: 'DESC' } });
  }

  // 4.2 Approve Payment Proposal (Finance Manager)
  async approveProposal(proposalId: string) {
    const proposal = await this.proposalRepo.findOne({ where: { proposal_id: proposalId } });
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.status !== 'Pending') {
      throw new BadRequestException('Proposal นี้ไม่อยู่ในสถานะรออนุมัติ');
    }
    proposal.status = 'Approved';
    return this.proposalRepo.save(proposal);
  }

  // 5. Generate Bank File
  async generateBankFile(proposalId: string) {
    const proposal = await this.proposalRepo.findOne({ where: { proposal_id: proposalId } });
    if (!proposal) throw new NotFoundException('Proposal not found');
    if (proposal.status !== 'Approved') {
      throw new BadRequestException('Proposal ต้องได้รับการอนุมัติจาก Finance Manager ก่อน Generate Bank File');
    }

    const requests = await this.prRepo.find({
      where: { proposal_id: proposalId },
      relations: ['vendor', 'invoice'],
    });

    // Generate CSV file content
    let csv = 'PaymentRequestNo,VendorName,TaxID,InvoiceNo,Amount,DueDate,PayeeName,PayeeBank,PayeeAccount\n';
    for (const r of requests) {
      const payeeName = r.alternative_payee_name || r.vendor?.vendor_name || 'N/A';
      const payeeBank = r.alternative_payee_bank || 'N/A';
      const payeeAccount = r.alternative_payee_account || 'N/A';
      csv += `${r.payment_request_no},"${r.vendor?.vendor_name || 'N/A'}",${r.vendor?.tax_id || 'N/A'},${r.invoice?.invoice_no || 'N/A'},${r.amount},${r.due_date},"${payeeName}","${payeeBank}",${payeeAccount}\n`;
    }

    const fileName = `BANK_TRANSFER_${proposal.proposal_no}_${new Date().toISOString().slice(0, 10)}.csv`;

    const bankFile = this.bankFileRepo.create({
      file_name: fileName,
      proposal_id: proposalId,
      file_content: csv,
      status: 'Success',
    });

    const savedFile = await this.bankFileRepo.save(bankFile);

    // Update proposal status
    proposal.status = 'Generated';
    await this.proposalRepo.save(proposal);

    // Update all requests to Paid status
    for (const r of requests) {
      r.status = 'Paid';
      await this.prRepo.save(r);

      // Trigger budget used update
      const cc = await this.ccRepo.findOne({ where: { cost_center_id: r.cost_center_id } });
      if (cc) {
        cc.budget_used_amount = Number(cc.budget_used_amount) + Number(r.amount);
        if (Number(cc.budget_reserved_amount) >= Number(r.amount)) {
          cc.budget_reserved_amount = Number(cc.budget_reserved_amount) - Number(r.amount);
        }
        await this.ccRepo.save(cc);
      }
    }

    return savedFile;
  }

  // 5.1 Fetch generated bank files
  async getBankFiles() {
    return this.bankFileRepo.find({ order: { created_at: 'DESC' } });
  }

  // 6. Lanes
  async getLanes() {
    let lanes = await this.laneRepo.find();
    if (lanes.length === 0) {
      // Seed default lanes if empty
      const defaults = [
        { lane_name: 'จัดซื้อในประเทศ (General PO)', lane_code: 'DOMESTIC_PO' },
        { lane_name: 'งานบริการ / Non-PO', lane_code: 'SERVICE_NONPO' },
        { lane_name: 'จ่ายเร่งด่วน (Urgent)', lane_code: 'URGENT' },
      ];
      lanes = await this.laneRepo.save(
        defaults.map((d) => this.laneRepo.create(d)),
      );
    }
    return lanes;
  }

  // 7. Assign Lane
  async assignLane(requestId: string, laneId: string) {
    const request = await this.prRepo.findOne({ where: { payment_request_id: requestId } });
    if (!request) throw new NotFoundException('Payment request not found');

    request.lane_id = laneId;
    return this.prRepo.save(request);
  }

  async holdPayment(id: string) {
    const request = await this.prRepo.findOne({ where: { payment_request_id: id } });
    if (!request) throw new NotFoundException('Payment request not found');

    request.status = 'BlockedOverBudget';
    return this.prRepo.save(request);
  }

  async unholdPayment(id: string) {
    const request = await this.prRepo.findOne({ where: { payment_request_id: id } });
    if (!request) throw new NotFoundException('Payment request not found');

    request.status = 'Maker';
    return this.prRepo.save(request);
  }

  async reversePayment(id: string) {
    const request = await this.prRepo.findOne({ where: { payment_request_id: id } });
    if (!request) throw new NotFoundException('Payment request not found');

    request.status = 'Reversed';
    const saved = await this.prRepo.save(request);

    await this.logRepo.save(
      this.logRepo.create({
        target_system: 'SAP_B1',
        doc_type: 'PaymentRequestReversal',
        doc_id: saved.payment_request_id,
        status: 'Success',
        retry_count: 0,
      }),
    );

    return saved;
  }

  // 8. Dashboard KPIs & Charts
  async getDashboardKpis() {
    // 8.1 Total PRs today/this week
    const totalPrs = await this.prqRepo.count();
    
    // 8.2 Pending approvals
    const pendingPrs = await this.prqRepo.count({ where: { status: PurchaseRequisitionStatus.PENDING_APPROVAL } });
    
    // 8.3 Spending this month (Mock from seed data cc amounts + sum of active POs)
    const activePrSum = await this.prqRepo.find({ where: { status: PurchaseRequisitionStatus.APPROVED } });
    const prApprovedSum = activePrSum.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

    // 8.4 Overdue payments (payment requests where due_date < now and status !== Paid)
    const overduePrs = await this.prRepo.find({
      relations: ['invoice'],
    });
    const now = new Date();
    const overdueSum = overduePrs
      .filter((r) => new Date(r.due_date) < now && r.status !== 'Paid')
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // 8.5 Donut chart: PR status count distribution
    const statuses = [
      PurchaseRequisitionStatus.DRAFT,
      PurchaseRequisitionStatus.PENDING_APPROVAL,
      PurchaseRequisitionStatus.APPROVED,
      PurchaseRequisitionStatus.REJECTED
    ];
    const prStatusDistribution = await Promise.all(
      statuses.map(async (status) => {
        const count = await this.prqRepo.count({ where: { status } });
        return { status, count };
      }),
    );

    // 8.6 Bar chart: Spending by BU
    const bus = await this.buRepo.find();
    const buSpending = await Promise.all(
      bus.map(async (bu) => {
        // Query cost centers in this BU and sum their used budget
        const ccs = await this.ccRepo.find({ where: { bu_id: bu.bu_id } });
        const spend = ccs.reduce((sum, c) => sum + Number(c.budget_used_amount || 0), 0);
        return { bu_name: bu.bu_name, spending: spend };
      }),
    );

    // 8.7 Line Chart: PR volume trend (last 6 months)
    const trend = [
      { month: 'ม.ค.', volume: 15 },
      { month: 'ก.พ.', volume: 22 },
      { month: 'มี.ค.', volume: 18 },
      { month: 'เม.ย.', volume: 28 },
      { month: 'พ.ค.', volume: 35 },
      { month: 'มิ.ย.', volume: totalPrs },
    ];

    return {
      kpis: {
        totalPrs,
        pendingApprovals: pendingPrs,
        approvedAmount: prApprovedSum + 3850200, // seed base + actual
        overdueAmount: overdueSum || 142500, // mock base if empty
      },
      charts: {
        prStatusDistribution,
        buSpending,
        trend,
      },
    };
  }

  // 9. Integration Logs
  async getIntegrationLogs() {
    let logs = await this.logRepo.find({ order: { created_at: 'DESC' } });
    if (logs.length === 0) {
      // Seed default logs if empty
      const mockLogs = [
        { target_system: 'SAP_B1', doc_type: 'PurchaseRequisition', doc_id: '00000001-0000-0000-0000-000000000001', status: 'Success', retry_count: 0 },
        { target_system: 'SAP_B1', doc_type: 'PurchaseOrder', doc_id: '00000001-0000-0000-0000-000000000002', status: 'Success', retry_count: 0 },
        { target_system: 'SAP_B1', doc_type: 'GoodsReceipt', doc_id: '00000001-0000-0000-0000-000000000003', status: 'Failed', retry_count: 1 },
        { target_system: 'Bank_Gateway', doc_type: 'PaymentRequest', doc_id: '00000001-0000-0000-0000-000000000004', status: 'Success', retry_count: 0 },
        { target_system: 'RD_TaxAPI', doc_type: 'VendorVerification', doc_id: '00000001-0000-0000-0000-000000000005', status: 'Success', retry_count: 0 },
      ];
      logs = await this.logRepo.save(
        mockLogs.map((l) => this.logRepo.create(l)),
      );
    }
    return logs;
  }

  // 10. Retry Integration log
  async retryIntegration(id: string) {
    const log = await this.logRepo.findOne({ where: { log_id: id } });
    if (!log) throw new NotFoundException('Integration log not found');

    log.status = 'Success';
    log.retry_count += 1;
    await this.logRepo.save(log);

    return log;
  }

  // 11. Credit/Debit Notes
  async createCreditDebitNote(body: { invoice_id: string; type: string; amount: number; reason: string }) {
    const invoice = await this.invoiceRepo.findOne({ where: { invoice_id: body.invoice_id } });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const note = this.cnDnRepo.create({
      invoice_id: body.invoice_id,
      type: body.type, // 'Credit' or 'Debit'
      amount: body.amount,
      reason: body.reason,
      status: 'Approved',
    });
    return this.cnDnRepo.save(note);
  }

  async getCreditDebitNotesByInvoice(invoiceId: string) {
    return this.cnDnRepo.find({ where: { invoice_id: invoiceId } });
  }

  async approveCreditDebitNote(id: string) {
    const note = await this.cnDnRepo.findOne({ where: { cn_dn_id: id } });
    if (!note) throw new NotFoundException('Credit/Debit note not found');

    note.status = 'Approved';
    return this.cnDnRepo.save(note);
  }

  async triggerPayment(poId: string, milestoneId?: string, selectedCnIds?: string[]) {
    return await this.dataSource.transaction(async (manager) => {
      const po = await manager.getRepository(PurchaseOrder).findOne({ where: { po_id: poId } });
      if (!po) {
        throw new NotFoundException('ไม่พบเอกสาร PO');
      }

      // Check if the vendor has any bank accounts in 'PendingVerification' status
      const pendingBank = await manager.getRepository(VendorBankAccount).findOne({
        where: {
          vendor_id: po.vendor_id,
          verification_status: 'PendingVerification',
        },
      });

      if (pendingBank) {
        throw new BadRequestException(
          'การโอนเงินถูกระงับชั่วคราว: ข้อมูลบัญชีธนาคารของผู้ขายอยู่ระหว่างการอนุมัติความปลอดภัยเพื่อป้องกันการทุจริต (Dual-Authorization Required)',
        );
      }

      // Apply Credit/Debit Notes if selected
      let totalDeduction = 0;
      if (selectedCnIds && selectedCnIds.length > 0) {
        const cns = await manager.getRepository(CreditDebitNote).find({
          where: { cn_dn_id: In(selectedCnIds) },
        });
        for (const cn of cns) {
          if (cn.status === 'Approved') {
            cn.status = 'Applied';
            cn.po_id = poId;
            await manager.save(cn);
            totalDeduction += Number(cn.amount);
          }
        }
      }

      let gross_amount = Number(po.total_amount);
      if (milestoneId && po.payment_milestones) {
        const milestones = [...po.payment_milestones];
        const milestone = milestones.find((m) => m.milestone_id === milestoneId);
        if (!milestone) {
          throw new NotFoundException('ไม่พบงวดชำระเงินที่ระบุ');
        }

        gross_amount = Number(milestone.amount);
        milestone.status = 'ProcessingPayment';
        milestone.error_code = null;
        milestone.error_message = null;

        po.payment_milestones = milestones;
        po.status = PurchaseOrderStatus.PROCESSING_PAYMENT;
        po.payment_error_code = null;
        po.payment_error_message = null;
      } else {
        po.status = PurchaseOrderStatus.PROCESSING_PAYMENT;
        po.payment_error_code = null;
        po.payment_error_message = null;
      }

      const net_amount = Math.max(0, gross_amount - totalDeduction);

      // Save e-Payment integration log
      const integrationLog = manager.getRepository(IntegrationLog).create({
        target_system: 'External_ePayment_Gateway',
        doc_type: milestoneId ? 'POMilestonePayment' : 'POFullPayment',
        doc_id: po.po_id,
        request_payload: {
          po_id: po.po_id,
          po_no: po.po_no,
          milestone_id: milestoneId || null,
          gross_amount: gross_amount,
          deductions: totalDeduction,
          net_payout: net_amount,
          selected_cn_ids: selectedCnIds || [],
          vendor_id: po.vendor_id,
        },
        response_payload: {
          gateway_status: 'PROCESSING',
          message: 'Payment instruction transmitted to e-Payment webhook bridge',
        },
        status: 'Success',
        retry_count: 0,
      });
      await manager.save(integrationLog);

      return await manager.save(po);
    });
  }

  async paymentCallback(poNo: string, status: 'Success' | 'Failed', errorCode?: string, errorMessage?: string) {
    return await this.dataSource.transaction(async (manager) => {
      const po = await manager.getRepository(PurchaseOrder).findOne({ where: { po_no: poNo } });
      if (!po) {
        throw new NotFoundException('ไม่พบเอกสาร PO');
      }

      let paidAmount = 0;

      if (po.payment_milestones && po.payment_milestones.length > 0) {
        const milestones = [...po.payment_milestones];
        // Find the one in 'ProcessingPayment'
        const activeMilestone = milestones.find((m) => m.status === 'ProcessingPayment');
        if (activeMilestone) {
          if (status === 'Success') {
            activeMilestone.status = 'Paid';
            activeMilestone.error_code = null;
            activeMilestone.error_message = null;
            paidAmount = Number(activeMilestone.amount);

            // If all milestones are Paid, set PO status to Paid. Otherwise, set PO status to VendorConfirmed so they can pay next milestone
            const allPaid = milestones.every((m) => m.status === 'Paid');
            if (allPaid) {
              po.status = PurchaseOrderStatus.PAID;
            } else {
              po.status = PurchaseOrderStatus.VENDOR_CONFIRMED; // Set back to confirmed so they can pay next milestone
            }
          } else {
            activeMilestone.status = 'Failed';
            activeMilestone.error_code = errorCode || 'PAYMENT_FAILED';
            activeMilestone.error_message = errorMessage || 'การชำระเงินงวดนี้ล้มเหลว';

            po.status = PurchaseOrderStatus.VENDOR_CONFIRMED;
            po.payment_error_code = errorCode || 'PAYMENT_FAILED';
            po.payment_error_message = errorMessage || 'การชำระเงินบางส่วนล้มเหลว';
          }
          po.payment_milestones = milestones;
        } else {
          // Fallback if no active milestone found
          if (status === 'Success') {
            po.status = PurchaseOrderStatus.PAID;
            po.payment_error_code = null;
            po.payment_error_message = null;
            paidAmount = Number(po.total_amount);
          } else {
            po.status = PurchaseOrderStatus.VENDOR_CONFIRMED;
            po.payment_error_code = errorCode || 'PAYMENT_FAILED';
            po.payment_error_message = errorMessage || 'การชำระเงินล้มเหลว';
          }
        }
      } else {
        // Standard full PO payment callback
        if (status === 'Success') {
          po.status = PurchaseOrderStatus.PAID;
          po.payment_error_code = null;
          po.payment_error_message = null;
          paidAmount = Number(po.total_amount);
        } else {
          po.status = PurchaseOrderStatus.VENDOR_CONFIRMED;
          po.payment_error_code = errorCode || 'PAYMENT_FAILED';
          po.payment_error_message = errorMessage || 'การชำระเงินล้มเหลวจากผู้ให้บริการเครือข่าย e-Payment';
        }
      }

      // If success payment, deduct from linked PurchaseContract remaining_amount (US-114 operational update)
      if (status === 'Success' && po.contract_id && paidAmount > 0) {
        const contract = await manager.getRepository(PurchaseContract).findOne({
          where: { contract_id: po.contract_id },
          lock: { mode: 'pessimistic_write' },
        });
        if (contract) {
          const oldRemaining = Number(contract.remaining_amount);
          const newRemaining = Math.max(0, oldRemaining - paidAmount);
          contract.remaining_amount = newRemaining;
          await manager.save(contract);

          // Log in AuditLog
          const audit = manager.getRepository(AuditLog).create({
            action: 'CONTRACT_DEDUCTION',
            entity_type: 'PurchaseContract',
            entity_id: contract.contract_id,
            before_value_json: {
              remaining_amount: oldRemaining,
            },
            after_value_json: {
              remaining_amount: newRemaining,
              po_no: po.po_no,
              paid_amount: paidAmount,
            },
            ip_address: '127.0.0.1',
          });
          await manager.save(audit);
        }
      }

      // Log external e-Payment callback transaction result
      const callbackLog = manager.getRepository(IntegrationLog).create({
        target_system: 'External_ePayment_Callback',
        doc_type: po.payment_milestones && po.payment_milestones.length > 0 ? 'POMilestoneCallback' : 'POCallback',
        doc_id: po.po_id,
        request_payload: {
          po_no: poNo,
          callback_status: status,
          error_code: errorCode || null,
          error_message: errorMessage || null,
        },
        response_payload: {
          po_status: po.status,
          processed_at: new Date(),
        },
        status: status === 'Success' ? 'Success' : 'Failed',
        retry_count: 0,
      });
      await manager.save(callbackLog);

      return await manager.save(po);
    });
  }
}

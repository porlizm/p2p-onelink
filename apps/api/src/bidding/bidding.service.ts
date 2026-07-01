import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { BiddingEvent } from '../database/entities/bidding-event.entity';
import { Vendor } from '../database/entities/vendor.entity';
import { RfqItem } from '../database/entities/rfq-item.entity';
import { RfqVendor } from '../database/entities/rfq-vendor.entity';
import { BidQuotation } from '../database/entities/bid-quotation.entity';
import { BidQuotationLine } from '../database/entities/bid-quotation-line.entity';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';
import { PurchaseRequisitionLine } from '../database/entities/purchase-requisition-line.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { AppUser } from '../database/entities/app-user.entity';
import { Notification } from '../database/entities/notification.entity';
import { PurchaseOrder } from '../database/entities/purchase-order.entity';
import { PurchaseOrderLine } from '../database/entities/purchase-order-line.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { SubmitQuoteDto } from './dto/submit-quote.dto';
import { BiddingStatus, BidQuotationStatus, PurchaseRequisitionStatus, PurchaseOrderStatus } from '@p2p/shared';

@Injectable()
export class BiddingService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(BiddingEvent)
    private rfqRepo: Repository<BiddingEvent>,
    @InjectRepository(BidQuotation)
    private quoteRepo: Repository<BidQuotation>,
    @InjectRepository(CostCenter)
    private ccRepo: Repository<CostCenter>,
  ) {}

  async createRFQ(dto: CreateRfqDto, userId: string) {
    if (!dto.vendor_ids || dto.vendor_ids.length < 3) {
      throw new BadRequestException('ระเบียบจัดซื้อกำหนดให้ต้องเชิญผู้เสนอราคาอย่างน้อย 3 รายขึ้นไป');
    }
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('ต้องระบุอย่างน้อย 1 รายการในการเปิดประมูล');
    }

    return await this.dataSource.transaction(async (manager) => {
      // 1. Generate RFQ No
      const now = new Date();
      const yy = now.getFullYear().toString().slice(-2);
      const mm = (now.getMonth() + 1).toString().padStart(2, '0');
      const prefix = `RFQ${yy}${mm}`;

      const count = await manager.getRepository(BiddingEvent).count({
        where: { rfq_no: Like(`${prefix}%`) },
      });
      const rfqNo = `${prefix}${(count + 1).toString().padStart(3, '0')}`;

      // Set up committee members and their decryption keys object
      const committeeMembers = dto.committee_member_ids && dto.committee_member_ids.length > 0
        ? dto.committee_member_ids
        : ['00000008-0000-0000-0000-000000000004', '00000008-0000-0000-0000-000000000005']; // default to warakorn.c and supawadee.i

      const decryptionKeys: Record<string, any> = {};
      for (const memberId of committeeMembers) {
        decryptionKeys[memberId] = { decrypted: false, entered_at: null };
      }

      const requiresShortlistApproval = !!dto.shortlist_approver_id;

      // 2. Save RFQ Header
      const rfq = manager.getRepository(BiddingEvent).create({
        rfq_no: rfqNo,
        title: dto.title,
        description: dto.description || null,
        close_date: new Date(dto.close_date),
        status: requiresShortlistApproval ? BiddingStatus.PENDING_COMMITTEE_APPROVAL : BiddingStatus.OPEN_FOR_QUOTATION,
        bid_type: dto.bid_type || 'RFQ_Closed',
        round_no: dto.round_no || 1,
        technical_weight: dto.technical_weight || 0,
        commercial_weight: dto.commercial_weight || 100,
        committee_members: committeeMembers,
        decryption_keys: decryptionKeys,
        is_decrypted: false,
        shortlist_approved: !requiresShortlistApproval,
        shortlist_approver_id: dto.shortlist_approver_id || null,
      });
      const savedRfq = await manager.getRepository(BiddingEvent).save(rfq);

      // 3. Save RFQ Items
      const rfqItems = dto.items.map((item) =>
        manager.getRepository(RfqItem).create({
          rfq_id: savedRfq.rfq_id,
          item_id: item.item_id || null,
          item_name: item.item_name,
          quantity: item.quantity,
          uom: item.uom,
        }),
      );
      await manager.getRepository(RfqItem).save(rfqItems);

      // 4. Save Invited Vendors
      const rfqVendors = dto.vendor_ids.map((vendorId) =>
        manager.getRepository(RfqVendor).create({
          rfq_id: savedRfq.rfq_id,
          vendor_id: vendorId,
        }),
      );
      await manager.getRepository(RfqVendor).save(rfqVendors);

      return {
        ...savedRfq,
        items: rfqItems,
        vendors: rfqVendors,
      };
    });
  }

  async listRFQs() {
    return await this.rfqRepo.find({
      relations: ['items', 'vendors', 'vendors.vendor', 'quotations', 'quotations.vendor'],
      order: { created_at: 'DESC' },
    });
  }

  async getRFQDetails(rfqId: string) {
    const rfq = await this.rfqRepo.findOne({
      where: { rfq_id: rfqId },
      relations: ['items', 'vendors', 'vendors.vendor'],
    });
    if (!rfq) {
      throw new NotFoundException('ไม่พบเอกสาร RFQ');
    }
    return rfq;
  }

  async submitQuotation(dto: SubmitQuoteDto, vendorId: string) {
    const rfq = await this.rfqRepo.findOne({ where: { rfq_id: dto.rfq_id } });
    if (!rfq) {
      throw new NotFoundException('ไม่พบเอกสาร RFQ');
    }
    if (new Date() > new Date(rfq.close_date)) {
      throw new BadRequestException('ไม่สามารถเสนอราคาได้เนื่องจากเลยเวลาปิดรับซองเสนอราคาแล้ว');
    }

    return await this.dataSource.transaction(async (manager) => {
      // Delete existing quote from the same vendor to prevent duplicate quotations
      const existingQuote = await manager.getRepository(BidQuotation).findOne({
        where: { rfq_id: dto.rfq_id, vendor_id: vendorId },
      });
      if (existingQuote) {
        await manager.getRepository(BidQuotation).remove(existingQuote);
      }

      // Create new quotation header
      const quote = manager.getRepository(BidQuotation).create({
        rfq_id: dto.rfq_id,
        vendor_id: vendorId,
        status: BidQuotationStatus.SUBMITTED,
      });
      const savedQuote = await manager.getRepository(BidQuotation).save(quote);

      // Create lines
      const crypto = require('crypto');
      const lines = dto.lines.map((line) => {
        let hash = null;
        if (line.quotation_url) {
          hash = crypto.createHash('sha256').update(line.quotation_url + '-' + savedQuote.quote_id).digest('hex');
        } else {
          hash = crypto.createHash('sha256').update(Math.random().toString() + '-' + Date.now()).digest('hex');
        }
        return manager.getRepository(BidQuotationLine).create({
          quote_id: savedQuote.quote_id,
          rfq_item_id: line.rfq_item_id,
          unit_price: line.unit_price,
          delivery_days: line.delivery_days || 0,
          quotation_url: line.quotation_url || null,
          file_hash: hash,
          vendor_remarks: line.vendor_remarks || null,
        });
      });
      await manager.getRepository(BidQuotationLine).save(lines);

      return {
        ...savedQuote,
        lines,
      };
    });
  }

  async listVendorRFQs(vendorId: string) {
    // Return RFQs where the vendor is invited
    const invitedRfqIds = await this.dataSource
      .getRepository(RfqVendor)
      .find({ where: { vendor_id: vendorId } })
      .then((mappings) => mappings.map((m) => m.rfq_id));

    if (invitedRfqIds.length === 0) return [];

    return await this.rfqRepo.find({
      where: invitedRfqIds.map((id) => ({ rfq_id: id })),
      relations: ['items'],
      order: { created_at: 'DESC' },
    });
  }

  async getComparison(rfqId: string, user: any) {
    const rfq = await this.rfqRepo.findOne({
      where: { rfq_id: rfqId },
      relations: [
        'items',
        'quotations',
        'quotations.vendor',
        'quotations.lines',
        'quotations.lines.rfq_item',
      ],
    });

    if (!rfq) {
      throw new NotFoundException('ไม่พบเอกสาร RFQ');
    }

    const today = new Date();
    const isBiddingOpen = today < new Date(rfq.close_date) && rfq.status === BiddingStatus.OPEN_FOR_QUOTATION;
    const isSealedAndLocked = rfq.bid_type === 'SealedBid' && !rfq.is_decrypted;

    if (isSealedAndLocked) {
      // Mask pricing details for Sealed Bids until decrypted, regardless of role or close date
      for (const q of rfq.quotations) {
        (q as any).is_sealed_masked = true;
        if (q.lines) {
          for (const l of q.lines) {
            l.unit_price = 0;
          }
        }
      }
    } else if (isBiddingOpen) {
      const userRole = (user && typeof user === 'object' && user.role) ? user.role : 'Requester';
      const isAdmin = userRole === 'Admin';

      if (!isAdmin) {
        if (rfq.bid_type === 'SealedBid' || rfq.bid_type === 'RFQ_Closed' || !rfq.bid_type) {
          if (rfq.bid_type === 'RFQ_Closed' || !rfq.bid_type) {
            throw new ForbiddenException(
              'ระเบียบจัดซื้อห้ามเปิดซองเสนอราคาก่อนถึงวันและเวลาที่กำหนดเปิดซอง',
            );
          }

          // Mask pricing details for Sealed Bids
          for (const q of rfq.quotations) {
            (q as any).is_sealed_masked = true;
            if (q.lines) {
              for (const l of q.lines) {
                l.unit_price = 0;
              }
            }
          }
        }
      }
    }

    return rfq;
  }

  async awardBid(rfqId: string, quoteId: string, userId: string, companyId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const rfq = await manager.getRepository(BiddingEvent).findOne({
        where: { rfq_id: rfqId },
        relations: ['items'],
      });
      if (!rfq) {
        throw new NotFoundException('ไม่พบเอกสาร RFQ');
      }

      const selectedQuote = await manager.getRepository(BidQuotation).findOne({
        where: { quote_id: quoteId },
        relations: ['lines', 'vendor'],
      });
      if (!selectedQuote) {
        throw new NotFoundException('ไม่พบข้อเสนอราคาที่ระบุ');
      }

      // Update Bidding Event status
      rfq.status = BiddingStatus.AWARDED;
      rfq.awarded_at = new Date();
      rfq.winner_quote_id = quoteId;
      rfq.is_escalated = false;
      await manager.getRepository(BiddingEvent).save(rfq);

      // Update Quotations status
      const allQuotes = await manager.getRepository(BidQuotation).find({
        where: { rfq_id: rfqId },
      });
      for (const quote of allQuotes) {
        quote.status = quote.quote_id === quoteId
          ? BidQuotationStatus.SELECTED
          : BidQuotationStatus.NOT_SELECTED;
        await manager.getRepository(BidQuotation).save(quote);
      }

      // Generate pre-filled PR automatically
      const prNoPrefix = `PR${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
      const prCount = await manager.getRepository(PurchaseRequisition).count({
        where: { pr_no: Like(`${prNoPrefix}%`) },
      });
      const prNo = `${prNoPrefix}${(prCount + 1).toString().padStart(3, '0')}`;

      // Choose a default Cost Center to auto-assign budget (IT Cost Center or first available)
      const defaultCC = await manager.getRepository(CostCenter).findOne({
        where: { cc_code: 'CC-IT-01' },
      });
      if (!defaultCC) {
        throw new BadRequestException('ไม่พบศูนย์ต้นทุนไอทีมาตรฐาน (CC-IT-01) ในระบบ');
      }

      let totalPrAmount = 0;
      const prLinesData = selectedQuote.lines.map((qLine) => {
        const rfqItem = rfq.items.find((item) => item.rfq_item_id === qLine.rfq_item_id);
        const qty = rfqItem ? Number(rfqItem.quantity) : 1;
        const lineTotal = qty * Number(qLine.unit_price);
        totalPrAmount += lineTotal;

        return {
          item_id: rfqItem?.item_id || null,
          item_name: rfqItem?.item_name || 'Item from RFQ',
          quantity: qty,
          uom: rfqItem?.uom || 'ชิ้น',
          unit_price: Number(qLine.unit_price),
          total_price: lineTotal,
          cost_center_id: defaultCC.cost_center_id,
          quotation_url: qLine.quotation_url || null,
        };
      });

      // Auto-create PR Header (Directly set status to PendingApproval for workflow)
      const resolvedCompanyId = companyId || '00000001-0000-0000-0000-000000000001';
      const pr = manager.getRepository(PurchaseRequisition).create({
        pr_no: prNo,
        requester_id: userId,
        company_id: resolvedCompanyId,
        status: PurchaseRequisitionStatus.PENDING_APPROVAL,
        total_amount: totalPrAmount,
        description: `Auto-generated from Awarded Bidding RFQ: ${rfq.rfq_no} - ${rfq.title}`,
      });
      const savedPr = await manager.getRepository(PurchaseRequisition).save(pr);

      // Create PR Lines
      const prLines = prLinesData.map((lineData) =>
        manager.getRepository(PurchaseRequisitionLine).create({
          pr_id: savedPr.pr_id,
          ...lineData,
        }),
      );
      await manager.getRepository(PurchaseRequisitionLine).save(prLines);

      // Reserve budget for the PR automatically since it's PendingApproval
      defaultCC.budget_reserved_amount = Number(defaultCC.budget_reserved_amount) + totalPrAmount;
      await manager.getRepository(CostCenter).save(defaultCC);

      // Create Vendor Notification
      const vendorUser = await manager.getRepository(AppUser).findOne({
        where: { email: Like('%vendor%') }
      }) || { user_id: '00000008-0000-0000-0000-000000000001' };

      const notification = manager.getRepository(Notification).create({
        recipient_user_id: vendorUser.user_id,
        channel: 'System',
        trigger_event: 'BiddingAwarded',
        message: `ยินดีด้วย! ข้อเสนอราคาของคุณสำหรับ RFQ: ${rfq.rfq_no} - ${rfq.title} ได้รับการคัดเลือกเป็นผู้ชนะการประมูล กรุณาเข้าสู่ระบบเพื่อดาวน์โหลดใบสั่งซื้อ (PO) และอัปโหลดเอกสารยืนยัน`,
        read_flag: false,
      });
      await manager.getRepository(Notification).save(notification);

      return {
        rfq_no: rfq.rfq_no,
        status: rfq.status,
        pr_no: savedPr.pr_no,
      };
    });
  }

  async escalateWinnerTimeout(rfqId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const rfq = await manager.getRepository(BiddingEvent).findOne({
        where: { rfq_id: rfqId },
        relations: ['items'],
      });
      if (!rfq) {
        throw new NotFoundException('ไม่พบเอกสาร RFQ');
      }

      if (rfq.status !== BiddingStatus.AWARDED) {
        throw new BadRequestException('ไม่สามารถดำเนินการปลดสิทธิ์ได้เนื่องจากสถานะประมูลไม่ได้อยู่ในขั้นตัดสินผล (Awarded)');
      }

      if (rfq.is_escalated) {
        throw new BadRequestException('เอกสาร RFQ นี้ได้รับการเลื่อนสิทธิ์ไปหาผู้ชนะลำดับสำรองเรียบร้อยแล้ว');
      }

      // 1. Find the PR auto-generated for the current winner
      const pr = await manager.getRepository(PurchaseRequisition).findOne({
        where: { description: Like(`%RFQ: ${rfq.rfq_no}%`) },
        relations: ['lines'],
      });

      if (pr) {
        // If a PO was generated from this PR, cancel the PO and release reserved budget
        const po = await manager.getRepository(PurchaseOrder).findOne({
          where: { pr_id: pr.pr_id },
          relations: ['lines'],
        });

        if (po) {
          const activeStatuses = [
            PurchaseOrderStatus.VENDOR_CONFIRMED,
            PurchaseOrderStatus.PROCESSING_PAYMENT,
            PurchaseOrderStatus.PAID,
            PurchaseOrderStatus.PARTIALLY_RECEIVED,
            PurchaseOrderStatus.FULLY_RECEIVED,
            PurchaseOrderStatus.CLOSED,
          ];
          if (activeStatuses.includes(po.status)) {
            throw new BadRequestException(
              `ไม่สามารถดำเนินการปลดสิทธิ์ได้เนื่องจากผู้ขายได้ตอบรับคำสั่งซื้อหรือมีธุรกรรมการเงินเกิดขึ้นแล้ว (สถานะ PO: ${po.status})`,
            );
          }

          if (po.status !== PurchaseOrderStatus.CANCELLED && po.status !== PurchaseOrderStatus.REJECTED) {
            const oldStatus = po.status;
            po.status = PurchaseOrderStatus.CANCELLED;
            await manager.getRepository(PurchaseOrder).save(po);

            // Release reserved budget for the PO (unreceived portion)
            const ccDiffs: { [ccId: string]: number } = {};
            for (const poLine of po.lines) {
              if (poLine.pr_line_id && po.pr_id) {
                const prLine = await manager.getRepository(PurchaseRequisitionLine).findOne({
                  where: { line_id: poLine.pr_line_id },
                });
                if (prLine) {
                  const ccId = prLine.cost_center_id;
                  const unreceivedQty = Number(poLine.quantity) - Number(poLine.received_quantity);
                  if (unreceivedQty > 0) {
                    const amountToRelease = unreceivedQty * Number(poLine.unit_price);
                    ccDiffs[ccId] = (ccDiffs[ccId] || 0) + amountToRelease;
                  }
                }
              }
            }

            for (const ccId of Object.keys(ccDiffs)) {
              const amountToRelease = ccDiffs[ccId];
              const costCenter = await manager.getRepository(CostCenter).findOne({
                where: { cost_center_id: ccId },
                lock: { mode: 'pessimistic_write' },
              });
              if (costCenter) {
                const oldReserved = Number(costCenter.budget_reserved_amount);
                costCenter.budget_reserved_amount = Math.max(0, oldReserved - amountToRelease);
                await manager.getRepository(CostCenter).save(costCenter);

                // Log in Audit Trail
                const auditCC = manager.getRepository(AuditLog).create({
                  user_id: userId,
                  action: 'RELEASE_BUDGET_TIMEOUT_ESCALATE',
                  entity_type: 'CostCenter',
                  entity_id: ccId,
                  before_value_json: { reserved: oldReserved },
                  after_value_json: { reserved: costCenter.budget_reserved_amount },
                  timestamp: new Date(),
                });
                await manager.save(auditCC);
              }
            }

            // Create PO Audit Log
            const audit = manager.getRepository(AuditLog).create({
              user_id: userId,
              action: 'CANCEL_PO_TIMEOUT_ESCALATE',
              entity_type: 'PurchaseOrder',
              entity_id: po.po_id,
              before_value_json: { status: oldStatus },
              after_value_json: { status: PurchaseOrderStatus.CANCELLED },
              timestamp: new Date(),
            });
            await manager.save(audit);
          }
        }

        // Cancel the PR as well
        if (pr.status !== PurchaseRequisitionStatus.CANCELLED) {
          pr.status = PurchaseRequisitionStatus.CANCELLED;
          await manager.getRepository(PurchaseRequisition).save(pr);
        }
      }

      // 2. Fetch all quotations and calculate weighted scores
      const quotations = await manager.getRepository(BidQuotation).find({
        where: { rfq_id: rfq.rfq_id },
        relations: ['lines', 'vendor'],
      });

      if (quotations.length < 2) {
        throw new BadRequestException('ไม่สามารถเปลี่ยนตัวผู้ชนะได้เนื่องจากไม่มีผู้ประมูลสำรอง (มีผู้เสนอราคาเพียง 1 ราย)');
      }

      // Calculate total price for each quotation to find min_price for scaling commercial score
      const quoteTotals = quotations.map((q) => {
        const total = q.lines.reduce((sum, line) => {
          const rfqItem = rfq.items.find((item) => item.rfq_item_id === line.rfq_item_id);
          const qty = rfqItem ? Number(rfqItem.quantity) : 1;
          return sum + qty * Number(line.unit_price);
        }, 0);
        return { quote_id: q.quote_id, total };
      });

      const validTotals = quoteTotals.filter((t) => t.total > 0);
      const minPrice = validTotals.length > 0 ? Math.min(...validTotals.map((t) => t.total)) : 0;

      // Calculate weighted score for each quotation
      const scoredQuotations = quotations.map((q) => {
        const totalObj = quoteTotals.find((t) => t.quote_id === q.quote_id);
        const total = totalObj ? totalObj.total : 0;

        const techScore = Number(q.technical_score || 80);
        const commScore = total > 0 ? (minPrice / total) * 100 : 0;

        const techWeight = Number(rfq.technical_weight || 0);
        const commWeight = Number(rfq.commercial_weight || 100);

        const score = (techScore * techWeight / 100) + (commScore * commWeight / 100);

        return {
          quote: q,
          total,
          score,
        };
      });

      // Sort by score descending
      scoredQuotations.sort((a, b) => b.score - a.score);

      // Current winner is scoredQuotations[0] (should match winner_quote_id)
      // Runner-up is scoredQuotations[1]
      const runnerUp = scoredQuotations[1];
      if (!runnerUp) {
        throw new BadRequestException('ไม่พบผู้เสนอราคาสำรองที่มีคะแนนถัดไป');
      }

      // Update RFQ Winner Fields
      rfq.winner_quote_id = runnerUp.quote.quote_id;
      rfq.is_escalated = true;
      await manager.getRepository(BiddingEvent).save(rfq);

      // Update quote statuses
      for (const sq of scoredQuotations) {
        sq.quote.status = sq.quote.quote_id === runnerUp.quote.quote_id
          ? BidQuotationStatus.SELECTED
          : BidQuotationStatus.NOT_SELECTED;
        await manager.getRepository(BidQuotation).save(sq.quote);
      }

      // 3. Auto-generate a new PR for the runner-up
      const prNoPrefix = `PR${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}`;
      const prCount = await manager.getRepository(PurchaseRequisition).count({
        where: { pr_no: Like(`${prNoPrefix}%`) },
      });
      const prNo = `${prNoPrefix}${(prCount + 1).toString().padStart(3, '0')}`;

      const defaultCC = await manager.getRepository(CostCenter).findOne({
        where: { cc_code: 'CC-IT-01' },
      });
      if (!defaultCC) {
        throw new BadRequestException('ไม่พบศูนย์ต้นทุนไอทีมาตรฐาน (CC-IT-01) ในระบบ');
      }

      const prLinesData = runnerUp.quote.lines.map((qLine) => {
        const rfqItem = rfq.items.find((item) => item.rfq_item_id === qLine.rfq_item_id);
        const qty = rfqItem ? Number(rfqItem.quantity) : 1;
        const lineTotal = qty * Number(qLine.unit_price);

        return {
          item_id: rfqItem?.item_id || null,
          item_name: rfqItem?.item_name || 'Item from RFQ (Runner-up)',
          quantity: qty,
          uom: rfqItem?.uom || 'ชิ้น',
          unit_price: Number(qLine.unit_price),
          total_price: lineTotal,
          cost_center_id: defaultCC.cost_center_id,
          quotation_url: qLine.quotation_url || null,
        };
      });

      const newPr = manager.getRepository(PurchaseRequisition).create({
        pr_no: prNo,
        requester_id: userId,
        company_id: pr ? pr.company_id : '00000001-0000-0000-0000-000000000001',
        status: PurchaseRequisitionStatus.PENDING_APPROVAL,
        total_amount: runnerUp.total,
        description: `Auto-generated from Awarded Bidding RFQ: ${rfq.rfq_no} - ${rfq.title} (Timeout Escalation Re-award)`,
      });
      const savedPr = await manager.getRepository(PurchaseRequisition).save(newPr);

      const prLines = prLinesData.map((lineData) =>
        manager.getRepository(PurchaseRequisitionLine).create({
          pr_id: savedPr.pr_id,
          ...lineData,
        }),
      );
      await manager.getRepository(PurchaseRequisitionLine).save(prLines);

      // Reserve budget for the new PR
      defaultCC.budget_reserved_amount = Number(defaultCC.budget_reserved_amount) + runnerUp.total;
      await manager.getRepository(CostCenter).save(defaultCC);

      // Notify the runner-up vendor
      const vendorUser = await manager.getRepository(AppUser).findOne({
        where: { email: Like('%vendor%') }
      }) || { user_id: '00000008-0000-0000-0000-000000000001' };

      const notification = manager.getRepository(Notification).create({
        recipient_user_id: vendorUser.user_id,
        channel: 'System',
        trigger_event: 'BiddingAwardedEscalated',
        message: `แจ้งเตือนสิทธิ์สำรอง: ข้อเสนอราคาของคุณสำหรับ RFQ: ${rfq.rfq_no} ได้รับการเลื่อนสิทธิ์ขึ้นเป็นผู้ชนะการประมูลเนื่องจากรายก่อนหน้าไม่เข้าตอบรับตามกำหนดเวลา กรุณาเข้าสู่ระบบเพื่อดำเนินการ`,
        read_flag: false,
      });
      await manager.getRepository(Notification).save(notification);

      return {
        rfq_no: rfq.rfq_no,
        is_escalated: rfq.is_escalated,
        winner_quote_id: rfq.winner_quote_id,
        new_pr_no: savedPr.pr_no,
      };
    });
  }

  async decryptRFQ(rfqId: string, userId: string, password?: string) {
    const bcrypt = require('bcrypt');
    return await this.dataSource.transaction(async (manager) => {
      const rfq = await manager.getRepository(BiddingEvent).findOne({
        where: { rfq_id: rfqId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!rfq) {
        throw new NotFoundException('ไม่พบเอกสาร RFQ');
      }

      if (rfq.bid_type !== 'SealedBid') {
        throw new BadRequestException('โครงการประมูลนี้ไม่ใช่แบบ Sealed Bid จึงไม่ต้องทำพิธีเปิดซอง');
      }

      if (rfq.is_decrypted) {
        throw new BadRequestException('โครงการประมูลนี้ได้รับการถอดรหัสแล้ว');
      }

      const members = rfq.committee_members || [];
      if (!members.includes(userId)) {
        throw new ForbiddenException('คุณไม่มีสิทธิ์เป็นคณะกรรมการสำหรับโครงการนี้');
      }

      const user = await manager.getRepository(AppUser).findOne({ where: { user_id: userId } });
      if (!user) {
        throw new NotFoundException('ไม่พบผู้ใช้ในระบบ');
      }

      const isMatch = await bcrypt.compare(password || '', user.password_hash);
      if (!isMatch) {
        throw new BadRequestException('รหัสผ่านไม่ถูกต้อง');
      }

      const keys = rfq.decryption_keys || {};
      keys[userId] = { decrypted: true, entered_at: new Date().toISOString() };
      rfq.decryption_keys = keys;

      const decryptedCount = Object.values(keys).filter((k: any) => k.decrypted).length;

      if (decryptedCount >= 2) {
        rfq.is_decrypted = true;
        rfq.status = BiddingStatus.UNDER_EVALUATION;

        const audit = manager.getRepository(AuditLog).create({
          user_id: userId,
          action: 'SEALED_BID_DECRYPTION_CEREMONY',
          entity_type: 'BiddingEvent',
          entity_id: rfqId,
          before_value_json: { is_decrypted: false },
          after_value_json: { is_decrypted: true, keys },
          timestamp: new Date(),
        });
        await manager.save(audit);
      }

      await manager.save(rfq);

      return {
        is_decrypted: rfq.is_decrypted,
        decrypted_count: decryptedCount,
        decryption_keys: rfq.decryption_keys,
      };
    });
  }

  async getCommitteeCandidates() {
    const users = await this.dataSource.getRepository(AppUser).find({
      relations: ['user_roles', 'user_roles.role'],
    });

    const candidateRoles = ['Approver', 'Buyer', 'Admin'];
    return users.filter(user =>
      user.user_roles && user.user_roles.some(ur => ur.role && candidateRoles.includes(ur.role.role_name))
    ).map(u => ({
      user_id: u.user_id,
      username: u.username,
      email: u.email,
      role: u.user_roles?.[0]?.role?.role_name || 'Member',
    }));
  }

  async recommendVendors(category?: string) {
    const query = this.dataSource.getRepository(Vendor).createQueryBuilder('vendor')
      .where('vendor.status = :status', { status: 'Active' });

    if (category) {
      query.andWhere('vendor.business_category LIKE :category', { category: `%${category}%` });
    }

    return await query
      .orderBy('vendor.evaluation_score', 'DESC')
      .getMany();
  }

  async submitShortlistForApproval(rfqId: string, approverId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const rfq = await manager.getRepository(BiddingEvent).findOne({ where: { rfq_id: rfqId } });
      if (!rfq) throw new NotFoundException('ไม่พบเอกสาร RFQ');

      rfq.shortlist_approver_id = approverId;
      rfq.shortlist_approved = false;
      rfq.status = BiddingStatus.PENDING_COMMITTEE_APPROVAL;

      await manager.save(rfq);
      return rfq;
    });
  }

  async approveShortlist(rfqId: string, approverId: string, approved: boolean) {
    return await this.dataSource.transaction(async (manager) => {
      const rfq = await manager.getRepository(BiddingEvent).findOne({ where: { rfq_id: rfqId } });
      if (!rfq) throw new NotFoundException('ไม่พบเอกสาร RFQ');

      // Allow approval if user is the designated approver OR if no approver was set
      if (rfq.shortlist_approver_id && rfq.shortlist_approver_id !== approverId) {
        throw new ForbiddenException('คุณไม่มีสิทธิ์อนุมัติ Shortlist สำหรับโครงการนี้');
      }

      if (approved) {
        rfq.shortlist_approved = true;
        rfq.status = BiddingStatus.OPEN_FOR_QUOTATION;
      } else {
        rfq.shortlist_approved = false;
        rfq.status = BiddingStatus.REJECTED;
      }

      await manager.save(rfq);

      // Create Audit Log
      const audit = manager.getRepository(AuditLog).create({
        user_id: approverId,
        action: approved ? 'SHORTLIST_APPROVED' : 'SHORTLIST_REJECTED',
        entity_type: 'BiddingEvent',
        entity_id: rfqId,
        before_value_json: { shortlist_approved: false },
        after_value_json: { shortlist_approved: rfq.shortlist_approved, status: rfq.status },
        timestamp: new Date(),
      });
      await manager.save(audit);

      return rfq;
    });
  }
}

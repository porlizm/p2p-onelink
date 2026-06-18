import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { BiddingEvent } from '../database/entities/bidding-event.entity';
import { RfqItem } from '../database/entities/rfq-item.entity';
import { RfqVendor } from '../database/entities/rfq-vendor.entity';
import { BidQuotation } from '../database/entities/bid-quotation.entity';
import { BidQuotationLine } from '../database/entities/bid-quotation-line.entity';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';
import { PurchaseRequisitionLine } from '../database/entities/purchase-requisition-line.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { CreateRfqDto } from './dto/create-rfq.dto';
import { SubmitQuoteDto } from './dto/submit-quote.dto';
import { BiddingStatus, BidQuotationStatus, PurchaseRequisitionStatus } from '@p2p/shared';

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

      // 2. Save RFQ Header
      const rfq = manager.getRepository(BiddingEvent).create({
        rfq_no: rfqNo,
        title: dto.title,
        description: dto.description || null,
        close_date: new Date(dto.close_date),
        status: BiddingStatus.OPEN_FOR_QUOTATION,
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
      const lines = dto.lines.map((line) =>
        manager.getRepository(BidQuotationLine).create({
          quote_id: savedQuote.quote_id,
          rfq_item_id: line.rfq_item_id,
          unit_price: line.unit_price,
          delivery_days: line.delivery_days,
          quotation_url: line.quotation_url || null,
        }),
      );
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

  async getComparison(rfqId: string, userId: string) {
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

    // Strict validation: Buyers cannot view competitor prices while bidding is active
    if (isBiddingOpen) {
      throw new ForbiddenException(
        'ระเบียบจัดซื้อห้ามเปิดซองเสนอราคาก่อนถึงวันและเวลาที่กำหนดเปิดซอง',
      );
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
      const pr = manager.getRepository(PurchaseRequisition).create({
        pr_no: prNo,
        requester_id: userId,
        company_id: companyId,
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

      return {
        rfq_no: rfq.rfq_no,
        status: rfq.status,
        pr_no: savedPr.pr_no,
      };
    });
  }
}

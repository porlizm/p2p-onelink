import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { GoodsReceipt } from '../database/entities/goods-receipt.entity';
import { GoodsReceiptLine } from '../database/entities/gr-line.entity';
import { GoodsReceiptAttachment } from '../database/entities/gr-attachment.entity';
import { PurchaseOrder } from '../database/entities/purchase-order.entity';
import { PurchaseOrderLine } from '../database/entities/purchase-order-line.entity';
import { PurchaseRequisitionLine } from '../database/entities/purchase-requisition-line.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { Stock } from '../database/entities/stock.entity';
import { Claim } from '../database/entities/claim.entity';
import { ReturnNote } from '../database/entities/return-note.entity';
import { CreateGrDto, CreateClaimDto } from './dto/gr.dto';
import { GoodsReceiptStatus, PurchaseOrderStatus, ClaimStatus, ReturnNoteStatus } from '@p2p/shared';

@Injectable()
export class GrService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(GoodsReceipt)
    private grRepo: Repository<GoodsReceipt>,
    @InjectRepository(Stock)
    private stockRepo: Repository<Stock>,
  ) {}

  async createGr(dto: CreateGrDto, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Fetch PO
      const po = await manager.getRepository(PurchaseOrder).findOne({
        where: { po_id: dto.po_id },
        relations: ['lines'],
      });

      if (!po) {
        throw new NotFoundException('ไม่พบเอกสาร PO');
      }

      // 2. Generate GR No (GR-yyyy-xxxx)
      const now = new Date();
      const yyyy = now.getFullYear();
      const prefix = `GR-${yyyy}-`;

      const count = await manager.getRepository(GoodsReceipt).count({
        where: { gr_no: Like(`${prefix}%`) },
      });
      const grNo = `${prefix}${(count + 1).toString().padStart(4, '0')}`;

      // 3. Create GR Header
      const gr = manager.getRepository(GoodsReceipt).create({
        gr_no: grNo,
        po_id: po.po_id,
        receive_type: dto.receive_type,
        receive_date: new Date(dto.receive_date),
        partial_flag: false, // will update later if partial
        quality_score: dto.quality_score || 5.0,
        received_by: userId,
        status: GoodsReceiptStatus.PENDING_RECEIPT,
      });

      const savedGr = await manager.getRepository(GoodsReceipt).save(gr);

      // 4. Create GR Lines and update PO quantities / budget / stock
      const grLines: GoodsReceiptLine[] = [];
      let totalOrdered = 0;
      let totalReceived = 0;

      for (const lineDto of dto.lines) {
        const poLine = po.lines.find((l) => l.po_line_id === lineDto.po_line_id);
        if (!poLine) {
          throw new BadRequestException(`ไม่พบรายการสินค้า PO Line ${lineDto.po_line_id}`);
        }

        const qtyOrdered = Number(poLine.quantity);
        const qtyReceived = Number(lineDto.qty_received);
        const varianceQty = qtyReceived - qtyOrdered;

        totalOrdered += qtyOrdered;
        totalReceived += qtyReceived;

        // Create GR Line
        const grLine = manager.getRepository(GoodsReceiptLine).create({
          gr_id: savedGr.gr_id,
          po_line_id: poLine.po_line_id,
          item_id: poLine.item_id,
          qty_ordered: qtyOrdered,
          qty_received: qtyReceived,
          tolerance_percent: 5.0,
          variance_qty: varianceQty,
        });
        grLines.push(grLine);

        // Update PO Line received quantity
        poLine.received_quantity = Number(poLine.received_quantity) + qtyReceived;
        await manager.getRepository(PurchaseOrderLine).save(poLine);

        // Budget migration (Reserved -> Used)
        if (poLine.pr_line_id) {
          const prLine = await manager.getRepository(PurchaseRequisitionLine).findOne({
            where: { line_id: poLine.pr_line_id },
          });
          if (prLine && prLine.cost_center_id) {
            const costCenter = await manager.getRepository(CostCenter).findOne({
              where: { cost_center_id: prLine.cost_center_id },
              lock: { mode: 'pessimistic_write' },
            });
            if (costCenter) {
              const amountReceived = qtyReceived * Number(poLine.unit_price);
              costCenter.budget_reserved_amount = Math.max(0, Number(costCenter.budget_reserved_amount) - amountReceived);
              costCenter.budget_used_amount = Number(costCenter.budget_used_amount) + amountReceived;
              await manager.getRepository(CostCenter).save(costCenter);
            }
          }
        }

        // Stock Update
        if (poLine.item_id) {
          let stock = await manager.getRepository(Stock).findOne({
            where: { item_id: poLine.item_id, company_id: po.company_id },
            lock: { mode: 'pessimistic_write' },
          });

          if (stock) {
            stock.qty_onhand = Number(stock.qty_onhand) + qtyReceived;
            stock.last_sync_at = new Date();
          } else {
            stock = manager.getRepository(Stock).create({
              item_id: poLine.item_id,
              company_id: po.company_id,
              qty_onhand: qtyReceived,
              last_sync_at: new Date(),
            });
          }
          await manager.getRepository(Stock).save(stock);
        }
      }

      await manager.getRepository(GoodsReceiptLine).save(grLines);

      // Save attachments
      if (dto.attachments && dto.attachments.length > 0) {
        const grAtts = dto.attachments.map((att) =>
          manager.getRepository(GoodsReceiptAttachment).create({
            gr_id: savedGr.gr_id,
            file_url: att.file_url,
            file_type: att.file_type,
          })
        );
        await manager.getRepository(GoodsReceiptAttachment).save(grAtts);
      }

      // 5. Update PO status & GR status
      const isPartial = totalReceived < totalOrdered;
      savedGr.partial_flag = isPartial;
      savedGr.status = isPartial ? GoodsReceiptStatus.PARTIAL_RECEIPT : GoodsReceiptStatus.FULL_RECEIPT;
      if (dto.receive_type === 'ServiceAcceptance') {
        savedGr.status = GoodsReceiptStatus.SERVICE_ACCEPTED;
      }
      await manager.getRepository(GoodsReceipt).save(savedGr);

      po.status = isPartial ? PurchaseOrderStatus.PARTIALLY_RECEIVED : PurchaseOrderStatus.FULLY_RECEIVED;
      await manager.getRepository(PurchaseOrder).save(po);

      return {
        ...savedGr,
        lines: grLines,
      };
    });
  }

  async findAll(userId: string) {
    return await this.grRepo.find({
      relations: ['po', 'po.vendor', 'receiver'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(grId: string) {
    const gr = await this.grRepo.findOne({
      where: { gr_id: grId },
      relations: ['po', 'po.vendor', 'receiver', 'lines', 'lines.item', 'lines.po_line', 'attachments'],
    });

    if (!gr) {
      throw new NotFoundException('ไม่พบเอกสาร GR');
    }

    return gr;
  }

  async createClaim(grId: string, dto: CreateClaimDto, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const gr = await manager.getRepository(GoodsReceipt).findOne({
        where: { gr_id: grId },
      });

      if (!gr) {
        throw new NotFoundException('ไม่พบเอกสาร GR');
      }

      // Create claim
      const claim = manager.getRepository(Claim).create({
        gr_id: gr.gr_id,
        claim_type: dto.claim_type,
        description: dto.description,
        raised_by: userId,
        status: ClaimStatus.OPEN,
      });

      const savedClaim = await manager.getRepository(Claim).save(claim);

      // Create return note if quantity exists
      if (dto.return_qty && dto.return_qty > 0) {
        const retNote = manager.getRepository(ReturnNote).create({
          claim_id: savedClaim.claim_id,
          gr_id: gr.gr_id,
          return_qty: dto.return_qty,
          return_reason: dto.return_reason || dto.description,
          status: ReturnNoteStatus.PENDING,
        });
        await manager.getRepository(ReturnNote).save(retNote);
      }

      // Update GR status
      gr.status = GoodsReceiptStatus.CLAIM_RAISED;
      await manager.getRepository(GoodsReceipt).save(gr);

      return savedClaim;
    });
  }

  async findStock() {
    return await this.stockRepo.find({
      relations: ['item', 'company'],
      order: { last_sync_at: 'DESC' },
    });
  }

  async syncStock() {
    const stocks = await this.stockRepo.find();
    const now = new Date();
    for (const s of stocks) {
      s.last_sync_at = now;
      await this.stockRepo.save(s);
    }
    return { success: true, count: stocks.length, synced_at: now };
  }
}

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
import { Item } from '../database/entities/item.entity';
import { AssetRentalLog } from '../database/entities/asset-rental-log.entity';
import { LicenseSubscription } from '../database/entities/license-subscription.entity';
import { Asset } from '../database/entities/asset.entity';
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
      let score = dto.quality_score || 5.0;
      if (score > 5.0) {
        score = score / 2.0;
      }
      score = Math.min(5.0, Math.max(0, score));

      const gr = manager.getRepository(GoodsReceipt).create({
        gr_no: grNo,
        po_id: po.po_id,
        receive_type: dto.receive_type,
        receive_date: new Date(dto.receive_date),
        partial_flag: false, // will update later if partial
        quality_score: score,
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
          qc_passed_qty: lineDto.qc_passed_qty !== undefined ? Number(lineDto.qc_passed_qty) : qtyReceived,
          qc_failed_qty: lineDto.qc_failed_qty !== undefined ? Number(lineDto.qc_failed_qty) : 0,
          qc_status: lineDto.qc_status || 'Passed',
          bin_location: lineDto.bin_location || null,
          qc_remarks: lineDto.qc_remarks || null,
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

          // Asset Rental & License Log Creation
          const itemObj = await manager.getRepository(Item).findOne({ where: { item_id: poLine.item_id } });
          if (itemObj) {
            if (itemObj.item_type === 'Rental') {
              const rentalLog = manager.getRepository(AssetRentalLog).create({
                item_name: itemObj.item_name,
                asset_tag: `AST-${Date.now().toString().slice(-6)}-${poLine.po_line_id.slice(-4)}`,
                owner_bu_id: itemObj.owner_bu_id || '00000002-0000-0000-0000-000000000001', // default IT BU
                rented_to_bu_id: '00000001-0000-0000-0000-000000000001', // default corporate BU
                owner_name: 'ฝ่ายดูแลสินทรัพย์ IT',
                renter_name: 'ผู้ใช้แผนกตรวจรับ',
                po_id: po.po_id,
                start_date: new Date(),
                end_date: new Date(Date.now() + 86400000 * 365), // 1 year
                status: 'Active',
              });
              await manager.getRepository(AssetRentalLog).save(rentalLog);
            } else if (itemObj.item_type === 'License') {
              const licenseSub = manager.getRepository(LicenseSubscription).create({
                license_name: itemObj.item_name,
                license_key: `KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
                vendor_id: po.vendor_id,
                seats_count: Math.round(qtyReceived),
                po_id: po.po_id,
                expiry_date: new Date(Date.now() + 86400000 * 365), // 1 year expiry
                status: 'Active',
              });
              await manager.getRepository(LicenseSubscription).save(licenseSub);
            }

            // Create unified Asset record (US-144)
            const prefix = `AST-${new Date().getFullYear()}-`;
            const count = await manager.getRepository(Asset).count({
              where: { asset_tag: Like(`${prefix}%`) },
            });
            const tag = `${prefix}${(count + 1).toString().padStart(4, '0')}`;

            const newAsset = manager.getRepository(Asset).create({
              asset_tag: tag,
              asset_name: itemObj.item_name,
              asset_type: itemObj.item_type || 'Goods',
              item_id: itemObj.item_id,
              unit_price: Number(poLine.unit_price),
              total_qty: qtyReceived,
              distributed_qty: 0,
              remaining_qty: qtyReceived,
              owner_bu_id: itemObj.owner_bu_id || '00000002-0000-0000-0000-000000000001',
              acquisition_date: new Date(),
              expiry_date: itemObj.item_type === 'License' ? new Date(Date.now() + 86400000 * 365) : null,
              license_key: itemObj.item_type === 'License' ? `KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}` : null,
              po_id: po.po_id,
              status: 'In Stock',
            });
            await manager.getRepository(Asset).save(newAsset);
          }
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

      // 4.5 Check QC Failed quantities to auto-create Vendor Claim & Return Note
      let totalFailedQty = 0;
      for (const lineDto of dto.lines) {
        if (lineDto.qc_failed_qty && lineDto.qc_failed_qty > 0) {
          totalFailedQty += Number(lineDto.qc_failed_qty);
        }
      }

      let isClaimRaised = false;
      if (totalFailedQty > 0) {
        const claim = manager.getRepository(Claim).create({
          gr_id: savedGr.gr_id,
          claim_type: 'Claim',
          description: `พบสินค้าเสียหายจากการตรวจสอบคุณภาพ (QC Failed: ${totalFailedQty} ชิ้น) ของใบตรวจรับเลขที่ ${savedGr.gr_no}`,
          raised_by: userId,
          status: ClaimStatus.OPEN,
        });
        const savedClaim = await manager.getRepository(Claim).save(claim);

        const retNote = manager.getRepository(ReturnNote).create({
          claim_id: savedClaim.claim_id,
          gr_id: savedGr.gr_id,
          return_qty: totalFailedQty,
          return_reason: `พบสินค้าเสียหายจากการตรวจสอบคุณภาพ (QC Failed: ${totalFailedQty} ชิ้น) ของใบตรวจรับเลขที่ ${savedGr.gr_no}`,
          status: ReturnNoteStatus.PENDING,
        });
        await manager.getRepository(ReturnNote).save(retNote);

        savedGr.status = GoodsReceiptStatus.CLAIM_RAISED;
        isClaimRaised = true;
      }

      // 5. Update PO status & GR status
      const isPartial = totalReceived < totalOrdered;
      savedGr.partial_flag = isPartial;
      if (!isClaimRaised) {
        savedGr.status = isPartial ? GoodsReceiptStatus.PARTIAL_RECEIPT : GoodsReceiptStatus.FULL_RECEIPT;
        if (dto.receive_type === 'ServiceAcceptance') {
          savedGr.status = GoodsReceiptStatus.SERVICE_ACCEPTED;
        }
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

  async findAll(user: any) {
    const where: any = {};
    
    // Row-Level Security: Warehouse role only sees GRs from their own company
    if (user && user.role === 'Warehouse' && user.companyId) {
      where.po = { company_id: user.companyId };
    }

    return await this.grRepo.find({
      where,
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
    // Return proper stock records (for catalog items with item_id)
    const stockRecords = await this.stockRepo.find({
      relations: ['item', 'company'],
      order: { last_sync_at: 'DESC' },
    });

    // Also aggregate received quantities from GR lines that have no item_id (free-text items)
    const freeTextStock: any[] = await this.dataSource.query(`
      SELECT
        pol.item_name,
        SUM(grl.qty_received) AS qty_onhand,
        MAX(goods_receipt.receive_date) AS last_sync_at
      FROM gr_line grl
      JOIN goods_receipt ON goods_receipt.gr_id = grl.gr_id
      JOIN purchase_order_line pol ON pol.po_line_id = grl.po_line_id
      WHERE grl.item_id IS NULL AND pol.item_name IS NOT NULL
      GROUP BY pol.item_name
    `).catch(() => []);

    const freeTextMapped = freeTextStock.map((row: any) => ({
      stock_id: null,
      item_id: null,
      company_id: null,
      qty_onhand: Number(row.qty_onhand),
      last_sync_at: row.last_sync_at,
      item: { item_name: row.item_name, item_type: 'Goods' },
      company: null,
    }));

    return [...stockRecords, ...freeTextMapped];
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

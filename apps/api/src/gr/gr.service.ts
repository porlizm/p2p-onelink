import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like, EntityManager } from 'typeorm';
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
import { CreateGrDto, CreateClaimDto, MatchGrToPoDto, QcDecisionDto } from './dto/gr.dto';
import { GoodsReceiptStatus, PurchaseOrderStatus, ClaimStatus, ReturnNoteStatus, StockMovementType } from '@p2p/shared';
import { StockService } from '../stock/stock.service';

const DEFAULT_TOLERANCE_PERCENT = 5.0;

@Injectable()
export class GrService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(GoodsReceipt)
    private grRepo: Repository<GoodsReceipt>,
    @InjectRepository(Stock)
    private stockRepo: Repository<Stock>,
    private stockService: StockService,
  ) {}

  /** Over-receipt beyond tolerance needs explicit sign-off (matches doc's Partial/Over/Short Receipt exception). */
  private assertWithinTolerance(itemLabel: string, qtyOrdered: number, qtyReceived: number, tolerancePercent: number, approved: boolean) {
    if (qtyOrdered <= 0) return;
    const overPct = ((qtyReceived - qtyOrdered) / qtyOrdered) * 100;
    if (overPct > tolerancePercent && !approved) {
      throw new BadRequestException(
        `รายการ "${itemLabel}" รับเกินจำนวนสั่งซื้อ ${overPct.toFixed(1)}% ซึ่งเกินเกณฑ์ผ่อนปรน (${tolerancePercent}%) กรุณาขออนุมัติ Over Receipt ก่อนบันทึกรับ`,
      );
    }
  }

  private async migrateBudgetForReceipt(manager: EntityManager, poLine: PurchaseOrderLine, qtyReceived: number) {
    if (!poLine.pr_line_id) return;
    const prLine = await manager.getRepository(PurchaseRequisitionLine).findOne({ where: { line_id: poLine.pr_line_id } });
    if (!prLine || !prLine.cost_center_id) return;
    const costCenter = await manager.getRepository(CostCenter).findOne({
      where: { cost_center_id: prLine.cost_center_id },
      lock: { mode: 'pessimistic_write' },
    });
    if (!costCenter) return;
    const amountReceived = qtyReceived * Number(poLine.unit_price);
    costCenter.budget_reserved_amount = Math.max(0, Number(costCenter.budget_reserved_amount) - amountReceived);
    costCenter.budget_used_amount = Number(costCenter.budget_used_amount) + amountReceived;
    await manager.getRepository(CostCenter).save(costCenter);
  }

  private async updateStockForReceipt(
    manager: EntityManager,
    itemId: string,
    companyId: string,
    qtyReceived: number,
    referenceDocId: string,
    userId: string,
    lotNo?: string | null,
    serialNo?: string | null,
    expiryDate?: Date | null,
  ) {
    // Goes through StockService so every stock change (from GR, Transfer, Adjustment, Write-off) is
    // recorded in one ledger (StockMovement) — GR no longer mutates Stock.qty_onhand directly.
    await this.stockService.recordMovement(
      {
        itemId,
        companyId,
        movementType: StockMovementType.GR,
        qtyIn: qtyReceived,
        referenceDocType: 'GoodsReceipt',
        referenceDocId,
        userId,
        lotNo,
        serialNo,
        expiryDate,
      },
      manager,
    );
  }

  async createGr(dto: CreateGrDto, userId: string) {
    if (!dto.po_id) {
      return this.createPendingMatchGr(dto, userId);
    }

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
      let anyRequiresQc = false;

      for (const lineDto of dto.lines) {
        const poLine = po.lines.find((l) => l.po_line_id === lineDto.po_line_id);
        if (!poLine) {
          throw new BadRequestException(`ไม่พบรายการสินค้า PO Line ${lineDto.po_line_id}`);
        }

        const qtyOrdered = Number(poLine.quantity);
        const qtyReceived = Number(lineDto.qty_received);
        const varianceQty = qtyReceived - qtyOrdered;

        this.assertWithinTolerance(poLine.item_name, qtyOrdered, qtyReceived, DEFAULT_TOLERANCE_PERCENT, !!lineDto.over_receipt_approved);

        totalOrdered += qtyOrdered;
        totalReceived += qtyReceived;

        const itemObj = poLine.item_id ? await manager.getRepository(Item).findOne({ where: { item_id: poLine.item_id } }) : null;
        const requiresQc = !!itemObj?.requires_qc;
        if (requiresQc) anyRequiresQc = true;

        // Create GR Line — items requiring QC are held Pending until a QC Staff decision is submitted.
        const grLine = manager.getRepository(GoodsReceiptLine).create({
          gr_id: savedGr.gr_id,
          po_line_id: poLine.po_line_id,
          item_id: poLine.item_id,
          qty_ordered: qtyOrdered,
          qty_received: qtyReceived,
          tolerance_percent: DEFAULT_TOLERANCE_PERCENT,
          variance_qty: varianceQty,
          requires_qc: requiresQc,
          qc_passed_qty: requiresQc ? 0 : qtyReceived,
          qc_failed_qty: 0,
          qc_status: requiresQc ? 'Pending' : 'Passed',
          bin_location: lineDto.bin_location || null,
          lot_no: lineDto.lot_no || null,
          serial_no: lineDto.serial_no || null,
          expiry_date: lineDto.expiry_date ? new Date(lineDto.expiry_date) : null,
        });
        grLines.push(grLine);

        // Update PO Line received quantity — goods have physically arrived even if QC is still pending
        poLine.received_quantity = Number(poLine.received_quantity) + qtyReceived;
        await manager.getRepository(PurchaseOrderLine).save(poLine);

        if (poLine.pr_line_id) {
          await this.migrateBudgetForReceipt(manager, poLine, qtyReceived);
        }

        // Stock is only posted immediately for items that don't require QC — QC-held stock updates
        // happen once qcDecision() clears (or partially clears) the line.
        if (poLine.item_id && !requiresQc) {
          await this.updateStockForReceipt(
            manager,
            poLine.item_id,
            po.company_id,
            qtyReceived,
            savedGr.gr_id,
            userId,
            lineDto.lot_no,
            lineDto.serial_no,
            lineDto.expiry_date ? new Date(lineDto.expiry_date) : null,
          );
          await this.createAssetSideEffects(manager, poLine, po, qtyReceived);
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

      // 5. Finalize status
      const isPartial = totalReceived < totalOrdered;
      savedGr.partial_flag = isPartial;

      if (anyRequiresQc) {
        // Hold for QC — PO stays as-is until qcDecision() runs; only receiving evidence is recorded here.
        savedGr.status = GoodsReceiptStatus.PENDING_QC;
      } else if (dto.receive_type === 'ServiceAcceptance') {
        savedGr.status = GoodsReceiptStatus.SERVICE_ACCEPTED;
        po.status = isPartial ? PurchaseOrderStatus.PARTIALLY_RECEIVED : PurchaseOrderStatus.FULLY_RECEIVED;
        await manager.getRepository(PurchaseOrder).save(po);
      } else {
        savedGr.status = isPartial ? GoodsReceiptStatus.PARTIAL_RECEIPT : GoodsReceiptStatus.FULL_RECEIPT;
        po.status = isPartial ? PurchaseOrderStatus.PARTIALLY_RECEIVED : PurchaseOrderStatus.FULLY_RECEIVED;
        await manager.getRepository(PurchaseOrder).save(po);
      }
      await manager.getRepository(GoodsReceipt).save(savedGr);

      return {
        ...savedGr,
        lines: grLines,
      };
    });
  }

  private async createAssetSideEffects(manager: EntityManager, poLine: PurchaseOrderLine, po: PurchaseOrder, qtyReceived: number) {
    if (!poLine.item_id) return;
    const itemObj = await manager.getRepository(Item).findOne({ where: { item_id: poLine.item_id } });
    if (!itemObj) return;

    if (itemObj.item_type === 'Rental') {
      const rentalLog = manager.getRepository(AssetRentalLog).create({
        item_name: itemObj.item_name,
        asset_tag: `AST-${Date.now().toString().slice(-6)}-${poLine.po_line_id.slice(-4)}`,
        owner_bu_id: itemObj.owner_bu_id || '00000002-0000-0000-0000-000000000001',
        rented_to_bu_id: '00000001-0000-0000-0000-000000000001',
        owner_name: 'ฝ่ายดูแลสินทรัพย์ IT',
        renter_name: 'ผู้ใช้แผนกตรวจรับ',
        po_id: po.po_id,
        start_date: new Date(),
        end_date: new Date(Date.now() + 86400000 * 365),
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
        expiry_date: new Date(Date.now() + 86400000 * 365),
        status: 'Active',
      });
      await manager.getRepository(LicenseSubscription).save(licenseSub);
    }

    const prefix = `AST-${new Date().getFullYear()}-`;
    const count = await manager.getRepository(Asset).count({ where: { asset_tag: Like(`${prefix}%`) } });
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

  /** "Receive without PO" — records the physical receipt and waits for a buyer/warehouse action to match it to a PO. */
  private async createPendingMatchGr(dto: CreateGrDto, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const prefix = `GR-${yyyy}-`;
      const count = await manager.getRepository(GoodsReceipt).count({ where: { gr_no: Like(`${prefix}%`) } });
      const grNo = `${prefix}${(count + 1).toString().padStart(4, '0')}`;

      let score = dto.quality_score || 5.0;
      if (score > 5.0) score = score / 2.0;
      score = Math.min(5.0, Math.max(0, score));

      const gr = manager.getRepository(GoodsReceipt).create({
        gr_no: grNo,
        po_id: null,
        pending_match: true,
        receive_type: dto.receive_type,
        receive_date: new Date(dto.receive_date),
        partial_flag: false,
        quality_score: score,
        received_by: userId,
        status: GoodsReceiptStatus.PENDING_VALIDATION,
      });
      const savedGr = await manager.getRepository(GoodsReceipt).save(gr);

      const grLines = dto.lines.map((lineDto) =>
        manager.getRepository(GoodsReceiptLine).create({
          gr_id: savedGr.gr_id,
          po_line_id: null,
          item_id: lineDto.item_id || null,
          item_name: lineDto.item_name || null,
          qty_ordered: 0,
          qty_received: Number(lineDto.qty_received),
          tolerance_percent: DEFAULT_TOLERANCE_PERCENT,
          variance_qty: 0,
          qc_status: 'Passed',
          bin_location: lineDto.bin_location || null,
          lot_no: lineDto.lot_no || null,
          serial_no: lineDto.serial_no || null,
          expiry_date: lineDto.expiry_date ? new Date(lineDto.expiry_date) : null,
        }),
      );
      await manager.getRepository(GoodsReceiptLine).save(grLines);

      if (dto.attachments && dto.attachments.length > 0) {
        const grAtts = dto.attachments.map((att) =>
          manager.getRepository(GoodsReceiptAttachment).create({ gr_id: savedGr.gr_id, file_url: att.file_url, file_type: att.file_type }),
        );
        await manager.getRepository(GoodsReceiptAttachment).save(grAtts);
      }

      return { ...savedGr, lines: grLines };
    });
  }

  /** Matches a previously-recorded pending-match GR to a PO, then posts budget/stock exactly like a normal receipt. */
  async matchGrToPo(grId: string, dto: MatchGrToPoDto, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const gr = await manager.getRepository(GoodsReceipt).findOne({ where: { gr_id: grId }, relations: ['lines'] });
      if (!gr) throw new NotFoundException('ไม่พบเอกสาร GR');
      if (!gr.pending_match) {
        throw new BadRequestException('เอกสาร GR นี้ไม่ได้อยู่ในสถานะรอจับคู่กับ PO');
      }

      const po = await manager.getRepository(PurchaseOrder).findOne({ where: { po_id: dto.po_id }, relations: ['lines'] });
      if (!po) throw new NotFoundException('ไม่พบเอกสาร PO');

      let totalOrdered = 0;
      let totalReceived = 0;

      for (const mapping of dto.lines) {
        const grLine = gr.lines.find((l) => l.gr_line_id === mapping.gr_line_id);
        const poLine = po.lines.find((l) => l.po_line_id === mapping.po_line_id);
        if (!grLine || !poLine) {
          throw new BadRequestException('ไม่พบรายการที่ต้องการจับคู่');
        }

        const qtyOrdered = Number(poLine.quantity);
        const qtyReceived = Number(grLine.qty_received);
        this.assertWithinTolerance(poLine.item_name, qtyOrdered, qtyReceived, DEFAULT_TOLERANCE_PERCENT, false);

        totalOrdered += qtyOrdered;
        totalReceived += qtyReceived;

        grLine.po_line_id = poLine.po_line_id;
        grLine.item_id = grLine.item_id || poLine.item_id;
        grLine.qty_ordered = qtyOrdered;
        grLine.variance_qty = qtyReceived - qtyOrdered;
        await manager.getRepository(GoodsReceiptLine).save(grLine);

        poLine.received_quantity = Number(poLine.received_quantity) + qtyReceived;
        await manager.getRepository(PurchaseOrderLine).save(poLine);

        if (poLine.pr_line_id) {
          await this.migrateBudgetForReceipt(manager, poLine, qtyReceived);
        }
        if (poLine.item_id) {
          await this.updateStockForReceipt(manager, poLine.item_id, po.company_id, qtyReceived, gr.gr_id, userId, grLine.lot_no, grLine.serial_no, grLine.expiry_date);
        }
      }

      const isPartial = totalReceived < totalOrdered;
      gr.po_id = po.po_id;
      gr.pending_match = false;
      gr.partial_flag = isPartial;
      gr.status = isPartial ? GoodsReceiptStatus.PARTIAL_RECEIPT : GoodsReceiptStatus.FULL_RECEIPT;
      await manager.getRepository(GoodsReceipt).save(gr);

      po.status = isPartial ? PurchaseOrderStatus.PARTIALLY_RECEIVED : PurchaseOrderStatus.FULLY_RECEIVED;
      await manager.getRepository(PurchaseOrder).save(po);

      return gr;
    });
  }

  /** QC Staff decision on lines that were held Pending — separate actor/step from the warehouse receiving action. */
  async submitQcDecision(grId: string, dto: QcDecisionDto, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const gr = await manager.getRepository(GoodsReceipt).findOne({
        where: { gr_id: grId },
        relations: ['lines', 'po'],
      });
      if (!gr) throw new NotFoundException('ไม่พบเอกสาร GR');
      if (gr.status !== GoodsReceiptStatus.PENDING_QC) {
        throw new BadRequestException(`ไม่สามารถบันทึกผล QC ได้เนื่องจากเอกสารอยู่ในสถานะ ${gr.status}`);
      }

      let totalFailedQty = 0;
      let totalPassedQty = 0;

      for (const decision of dto.lines) {
        const grLine = gr.lines.find((l) => l.gr_line_id === decision.gr_line_id && l.requires_qc);
        if (!grLine) {
          throw new BadRequestException(`ไม่พบรายการที่รอผล QC (${decision.gr_line_id})`);
        }
        grLine.qc_passed_qty = Number(decision.qc_passed_qty);
        grLine.qc_failed_qty = Number(decision.qc_failed_qty);
        grLine.qc_remarks = decision.qc_remarks || null;
        grLine.qc_status = grLine.qc_failed_qty > 0
          ? (grLine.qc_passed_qty > 0 ? 'Partial' : 'Failed')
          : 'Passed';
        await manager.getRepository(GoodsReceiptLine).save(grLine);

        totalFailedQty += grLine.qc_failed_qty;
        totalPassedQty += grLine.qc_passed_qty;

        // Post stock only for the quantity that actually cleared QC.
        if (grLine.item_id && grLine.qc_passed_qty > 0 && gr.po) {
          await this.updateStockForReceipt(manager, grLine.item_id, gr.po.company_id, grLine.qc_passed_qty, gr.gr_id, userId, grLine.lot_no, grLine.serial_no, grLine.expiry_date);
        }
      }

      let isClaimRaised = false;
      if (totalFailedQty > 0) {
        const claim = manager.getRepository(Claim).create({
          gr_id: gr.gr_id,
          claim_type: 'Claim',
          description: `พบสินค้าเสียหายจากการตรวจสอบคุณภาพ (QC Failed: ${totalFailedQty} ชิ้น) ของใบตรวจรับเลขที่ ${gr.gr_no}`,
          raised_by: userId,
          status: ClaimStatus.OPEN,
        });
        const savedClaim = await manager.getRepository(Claim).save(claim);

        const retNote = manager.getRepository(ReturnNote).create({
          claim_id: savedClaim.claim_id,
          gr_id: gr.gr_id,
          return_qty: totalFailedQty,
          return_reason: `พบสินค้าเสียหายจากการตรวจสอบคุณภาพ (QC Failed: ${totalFailedQty} ชิ้น) ของใบตรวจรับเลขที่ ${gr.gr_no}`,
          status: ReturnNoteStatus.PENDING,
        });
        await manager.getRepository(ReturnNote).save(retNote);
        isClaimRaised = true;
      }

      gr.status = isClaimRaised
        ? GoodsReceiptStatus.CLAIM_RAISED
        : totalFailedQty > 0
          ? GoodsReceiptStatus.QC_PARTIAL_PASSED
          : GoodsReceiptStatus.QC_PASSED;
      await manager.getRepository(GoodsReceipt).save(gr);

      if (gr.po_id) {
        const po = await manager.getRepository(PurchaseOrder).findOne({ where: { po_id: gr.po_id }, relations: ['lines'] });
        if (po) {
          const totalOrdered = po.lines.reduce((sum, l) => sum + Number(l.quantity), 0);
          const totalReceived = po.lines.reduce((sum, l) => sum + Number(l.received_quantity), 0);
          po.status = totalReceived < totalOrdered ? PurchaseOrderStatus.PARTIALLY_RECEIVED : PurchaseOrderStatus.FULLY_RECEIVED;
          await manager.getRepository(PurchaseOrder).save(po);
        }
      }

      return gr;
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

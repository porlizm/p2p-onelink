import { Injectable, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager, Like, LessThanOrEqual, IsNull, Not } from 'typeorm';
import { randomUUID } from 'crypto';
import { Stock } from '../database/entities/stock.entity';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { StockMovementType, StockRecordStatus } from '@p2p/shared';
import { ApprovalService } from '../approval/approval.service';
import { CreateTransferDto, CreateAdjustmentDto, CreateWriteOffDto, CreateCycleCountDto } from './dto/stock.dto';

export interface RecordMovementParams {
  itemId: string;
  companyId: string;
  warehouse?: string;
  location?: string | null;
  lotNo?: string | null;
  serialNo?: string | null;
  expiryDate?: Date | null;
  movementType: StockMovementType;
  qtyIn?: number;
  qtyOut?: number;
  referenceDocType?: string | null;
  referenceDocId?: string | null;
  reason?: string | null;
  userId?: string | null;
}

@Injectable()
export class StockService implements OnModuleInit {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Stock)
    private stockRepo: Repository<Stock>,
    @InjectRepository(StockMovement)
    private movementRepo: Repository<StockMovement>,
    private approvalService: ApprovalService,
  ) {}

  onModuleInit() {
    this.approvalService.registerHandler('StockAdjustment', {
      onApprove: (movementId) => this.finalizePendingMovement(movementId),
      onReject: (movementId) => this.cancelPendingMovement(movementId),
      onRevise: (movementId) => this.cancelPendingMovement(movementId),
    });
  }

  private async nextMovementNo(manager: EntityManager) {
    const now = new Date();
    const prefix = `MV${now.getFullYear().toString().slice(-2)}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    const count = await manager.getRepository(StockMovement).count({ where: { movement_no: Like(`${prefix}%`) } });
    return `${prefix}${(count + 1).toString().padStart(4, '0')}`;
  }

  /** Single choke point that mutates Stock.qty_onhand — every module (GR, Transfer, Adjustment, Write-off) goes through here. */
  async recordMovement(params: RecordMovementParams, existingManager?: EntityManager): Promise<StockMovement> {
    const run = async (manager: EntityManager) => {
      const warehouse = params.warehouse || 'MAIN';
      const location = params.location ?? null;
      const qtyIn = Number(params.qtyIn || 0);
      const qtyOut = Number(params.qtyOut || 0);

      let stock = await manager.getRepository(Stock).findOne({
        where: { item_id: params.itemId, company_id: params.companyId, warehouse, location: location ?? IsNull() },
        lock: { mode: 'pessimistic_write' },
      });
      if (!stock) {
        stock = manager.getRepository(Stock).create({
          item_id: params.itemId,
          company_id: params.companyId,
          warehouse,
          location,
          qty_onhand: 0,
        });
      }
      stock.qty_onhand = Number(stock.qty_onhand) + qtyIn - qtyOut;
      stock.last_sync_at = new Date();
      await manager.getRepository(Stock).save(stock);

      const movement = manager.getRepository(StockMovement).create({
        movement_no: await this.nextMovementNo(manager),
        item_id: params.itemId,
        company_id: params.companyId,
        warehouse,
        location,
        lot_no: params.lotNo || null,
        serial_no: params.serialNo || null,
        expiry_date: params.expiryDate || null,
        movement_type: params.movementType,
        qty_in: qtyIn,
        qty_out: qtyOut,
        balance_after: stock.qty_onhand,
        reference_doc_type: params.referenceDocType || null,
        reference_doc_id: params.referenceDocId || null,
        reason: params.reason || null,
        user_id: params.userId || null,
        status: StockRecordStatus.POSTED,
      });
      return manager.getRepository(StockMovement).save(movement);
    };

    if (existingManager) return run(existingManager);
    return this.dataSource.transaction(run);
  }

  /** Adjustment/Write-off need approval before Stock is actually touched — create a Pending record first. */
  private async createPendingMovement(
    params: RecordMovementParams & { requestedQty: number },
  ): Promise<StockMovement> {
    return this.dataSource.transaction(async (manager) => {
      const movement = manager.getRepository(StockMovement).create({
        movement_no: await this.nextMovementNo(manager),
        item_id: params.itemId,
        company_id: params.companyId,
        warehouse: params.warehouse || 'MAIN',
        location: params.location ?? null,
        movement_type: params.movementType,
        qty_in: params.qtyIn || 0,
        qty_out: params.qtyOut || 0,
        balance_after: null,
        reference_doc_type: params.referenceDocType || null,
        reference_doc_id: params.referenceDocId || null,
        reason: params.reason || null,
        user_id: params.userId || null,
        status: StockRecordStatus.PENDING_APPROVAL,
      });
      const saved = await manager.getRepository(StockMovement).save(movement);

      await this.approvalService.initiateRoute('StockAdjustment', saved.movement_id, params.companyId, params.requestedQty);
      return saved;
    });
  }

  private async finalizePendingMovement(movementId: string) {
    const movement = await this.movementRepo.findOne({ where: { movement_id: movementId } });
    if (!movement || movement.status !== StockRecordStatus.PENDING_APPROVAL) return;

    await this.recordMovement({
      itemId: movement.item_id,
      companyId: movement.company_id,
      warehouse: movement.warehouse,
      location: movement.location,
      movementType: movement.movement_type,
      qtyIn: Number(movement.qty_in),
      qtyOut: Number(movement.qty_out),
      referenceDocType: movement.reference_doc_type,
      referenceDocId: movement.reference_doc_id,
      reason: movement.reason,
      userId: movement.user_id,
    });

    movement.status = StockRecordStatus.CANCELLED; // superseded by the Posted movement created above
    await this.movementRepo.save(movement);
  }

  private async cancelPendingMovement(movementId: string) {
    const movement = await this.movementRepo.findOne({ where: { movement_id: movementId } });
    if (!movement) return;
    movement.status = StockRecordStatus.CANCELLED;
    await this.movementRepo.save(movement);
  }

  async createTransfer(dto: CreateTransferDto, userId: string) {
    if (dto.from_warehouse === dto.to_warehouse && (dto.from_location || null) === (dto.to_location || null)) {
      throw new BadRequestException('ต้นทางและปลายทางต้องไม่ใช่ตำแหน่งเดียวกัน');
    }
    const sourceStock = await this.stockRepo.findOne({
      where: { item_id: dto.item_id, company_id: dto.company_id, warehouse: dto.from_warehouse, location: dto.from_location ?? IsNull() },
    });
    if (!sourceStock || Number(sourceStock.qty_onhand) < dto.qty) {
      throw new BadRequestException('สต็อกต้นทางไม่เพียงพอสำหรับการโอนย้าย');
    }

    const referenceDocId = randomUUID();
    await this.recordMovement({
      itemId: dto.item_id,
      companyId: dto.company_id,
      warehouse: dto.from_warehouse,
      location: dto.from_location,
      movementType: StockMovementType.TRANSFER,
      qtyOut: dto.qty,
      referenceDocType: 'StockTransfer',
      referenceDocId,
      reason: dto.reason,
      userId,
    });
    await this.recordMovement({
      itemId: dto.item_id,
      companyId: dto.company_id,
      warehouse: dto.to_warehouse,
      location: dto.to_location,
      movementType: StockMovementType.TRANSFER,
      qtyIn: dto.qty,
      referenceDocType: 'StockTransfer',
      referenceDocId,
      reason: dto.reason,
      userId,
    });

    return { transfer_id: referenceDocId, status: 'Completed' };
  }

  async createAdjustment(dto: CreateAdjustmentDto, userId: string) {
    const stock = await this.stockRepo.findOne({
      where: { item_id: dto.item_id, company_id: dto.company_id, warehouse: dto.warehouse || 'MAIN', location: dto.location ?? IsNull() },
    });
    const systemQty = Number(stock?.qty_onhand || 0);
    const diff = Number(dto.counted_qty) - systemQty;
    if (diff === 0) {
      throw new BadRequestException('จำนวนนับจริงเท่ากับยอดในระบบ ไม่จำเป็นต้องปรับปรุง');
    }

    return this.createPendingMovement({
      itemId: dto.item_id,
      companyId: dto.company_id,
      warehouse: dto.warehouse,
      location: dto.location,
      movementType: StockMovementType.ADJUSTMENT,
      qtyIn: diff > 0 ? diff : 0,
      qtyOut: diff < 0 ? Math.abs(diff) : 0,
      referenceDocType: 'StockAdjustment',
      reason: `Physical Count ${dto.counted_qty} vs System ${systemQty}: ${dto.reason}`,
      userId,
      requestedQty: Math.abs(diff),
    });
  }

  async createWriteOff(dto: CreateWriteOffDto, userId: string) {
    return this.createPendingMovement({
      itemId: dto.item_id,
      companyId: dto.company_id,
      warehouse: dto.warehouse,
      location: dto.location,
      movementType: StockMovementType.WRITE_OFF,
      qtyOut: dto.qty,
      referenceDocType: 'StockWriteOff',
      reason: dto.reason,
      userId,
      requestedQty: dto.qty,
    });
  }

  /** Cycle Count reuses the Adjustment approval path (Create Count Plan / dedicated board is a follow-up UI). */
  async createCycleCount(dto: CreateCycleCountDto, userId: string) {
    const stock = await this.stockRepo.findOne({
      where: { item_id: dto.item_id, company_id: dto.company_id, warehouse: dto.warehouse || 'MAIN', location: dto.location ?? IsNull() },
    });
    const systemQty = Number(stock?.qty_onhand || 0);
    const diff = Number(dto.counted_qty) - systemQty;
    if (diff === 0) {
      return { message: 'จำนวนนับจริงตรงกับระบบ ไม่มีผลต่าง', system_qty: systemQty, counted_qty: dto.counted_qty };
    }

    return this.createPendingMovement({
      itemId: dto.item_id,
      companyId: dto.company_id,
      warehouse: dto.warehouse,
      location: dto.location,
      movementType: StockMovementType.ADJUSTMENT,
      qtyIn: diff > 0 ? diff : 0,
      qtyOut: diff < 0 ? Math.abs(diff) : 0,
      referenceDocType: 'CycleCount',
      reason: dto.reason || `Cycle Count difference: counted ${dto.counted_qty} vs system ${systemQty}`,
      userId,
      requestedQty: Math.abs(diff),
    });
  }

  async listMovements(itemId?: string) {
    return this.movementRepo.find({
      where: itemId ? { item_id: itemId } : {},
      relations: ['item'],
      order: { created_at: 'DESC' },
    });
  }

  async getNearExpiry(daysAhead = 90) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysAhead);
    return this.movementRepo.find({
      where: {
        expiry_date: LessThanOrEqual(cutoff),
        status: StockRecordStatus.POSTED,
      },
      relations: ['item'],
      order: { expiry_date: 'ASC' },
    });
  }

  async getLowStock() {
    return this.stockRepo.find({
      where: { min_stock_level: Not(IsNull()) },
      relations: ['item'],
    }).then((rows) => rows.filter((r) => Number(r.qty_onhand) <= Number(r.min_stock_level)));
  }
}

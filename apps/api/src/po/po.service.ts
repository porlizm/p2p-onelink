import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { PurchaseOrder } from '../database/entities/purchase-order.entity';
import { PurchaseOrderLine } from '../database/entities/purchase-order-line.entity';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';
import { PurchaseRequisitionLine } from '../database/entities/purchase-requisition-line.entity';
import { ItemPrice } from '../database/entities/item-price.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { ConfirmPoDto, RequestRevisionDto, RevisePoDto } from './dto/po.dto';
import { PurchaseOrderStatus, PurchaseRequisitionStatus } from '@p2p/shared';
import { AuditLog } from '../database/entities/audit-log.entity';

@Injectable()
export class PoService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PurchaseOrder)
    private poRepo: Repository<PurchaseOrder>,
  ) {}

  async convertPrToPo(prId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Fetch PR with lines
      const pr = await manager.getRepository(PurchaseRequisition).findOne({
        where: { pr_id: prId },
        relations: ['lines'],
      });

      if (!pr) {
        throw new NotFoundException('ไม่พบเอกสาร PR');
      }

      if (pr.status === PurchaseRequisitionStatus.CONVERTED_TO_PO) {
        throw new BadRequestException('เอกสาร PR นี้ได้รับการแปลงเป็น PO แล้ว');
      }

      if (!pr.lines || pr.lines.length === 0) {
        throw new BadRequestException('เอกสาร PR ต้องมีอย่างน้อย 1 รายการ');
      }

      // 2. Determine Vendor
      let vendorId = '00000008-0000-0000-0000-000000000001'; // Default: Vendor 1 (บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด)
      const firstLine = pr.lines[0];
      if (firstLine.item_id) {
        const itemPrice = await manager.getRepository(ItemPrice).findOne({
          where: { item_id: firstLine.item_id },
        });
        if (itemPrice) {
          vendorId = itemPrice.vendor_id;
        }
      }

      // 3. Generate PO No (POyyMMxxx)
      const now = new Date();
      const yy = now.getFullYear().toString().slice(-2);
      const mm = (now.getMonth() + 1).toString().padStart(2, '0');
      const prefix = `PO${yy}${mm}`;

      const count = await manager.getRepository(PurchaseOrder).count({
        where: { po_no: Like(`${prefix}%`) },
      });
      const poNo = `${prefix}${(count + 1).toString().padStart(3, '0')}`;

      const totalAmount = Number(pr.total_amount);
      const m1_amt = Number((totalAmount * 0.3).toFixed(2));
      const m2_amt = Number((totalAmount - m1_amt).toFixed(2));

      const milestones = [
        {
          milestone_id: 'm1_' + Math.random().toString(36).substring(2, 9),
          title: 'งวดที่ 1 - มัดจำ (30%)',
          percentage: 30,
          amount: m1_amt,
          status: 'Pending' as 'Pending',
          error_code: null,
          error_message: null,
        },
        {
          milestone_id: 'm2_' + Math.random().toString(36).substring(2, 9),
          title: 'งวดที่ 2 - ส่งมอบงานส่วนที่เหลือ (70%)',
          percentage: 70,
          amount: m2_amt,
          status: 'Pending' as 'Pending',
          error_code: null,
          error_message: null,
        }
      ];

      // 4. Create PO Header
      const po = manager.getRepository(PurchaseOrder).create({
        po_no: poNo,
        pr_id: pr.pr_id,
        vendor_id: vendorId,
        company_id: pr.company_id,
        status: PurchaseOrderStatus.SENT_TO_VENDOR,
        total_amount: pr.total_amount,
        revision_no: 0,
        estimated_delivery_date: null,
        payment_milestones: milestones,
      });

      const savedPo = await manager.getRepository(PurchaseOrder).save(po);

      // 5. Create PO Lines
      const poLines = pr.lines.map((prLine) => {
        return manager.getRepository(PurchaseOrderLine).create({
          po_id: savedPo.po_id,
          pr_line_id: prLine.line_id,
          item_id: prLine.item_id,
          item_name: prLine.item_name,
          quantity: Number(prLine.quantity),
          uom: prLine.uom,
          unit_price: Number(prLine.unit_price),
          total_price: Number(prLine.total_price),
        });
      });

      await manager.getRepository(PurchaseOrderLine).save(poLines);

      // 6. Update PR status
      pr.status = PurchaseRequisitionStatus.CONVERTED_TO_PO;
      await manager.getRepository(PurchaseRequisition).save(pr);

      return {
        ...savedPo,
        lines: poLines,
      };
    });
  }

  async listPOs(userId: string) {
    return await this.poRepo.find({
      relations: ['lines', 'vendor', 'company', 'pr'],
      order: { created_at: 'DESC' },
    });
  }

  async getPODetails(poId: string) {
    const po = await this.poRepo.findOne({
      where: { po_id: poId },
      relations: ['lines', 'vendor', 'company', 'pr', 'pr.lines'],
    });

    if (!po) {
      throw new NotFoundException('ไม่พบเอกสาร PO');
    }

    return po;
  }

  async listVendorPOs(vendorId: string) {
    return await this.poRepo.find({
      where: { vendor_id: vendorId },
      relations: ['lines', 'vendor', 'company', 'pr'],
      order: { created_at: 'DESC' },
    });
  }

  async confirmPO(poId: string, vendorId: string, dto: ConfirmPoDto) {
    const po = await this.poRepo.findOne({
      where: { po_id: poId, vendor_id: vendorId },
    });

    if (!po) {
      throw new NotFoundException('ไม่พบเอกสาร PO หรือไม่ได้รับอนุญาต');
    }

    po.status = PurchaseOrderStatus.VENDOR_CONFIRMED;
    po.estimated_delivery_date = new Date(dto.estimated_delivery_date);

    return await this.poRepo.save(po);
  }

  async requestRevision(poId: string, vendorId: string, dto: RequestRevisionDto) {
    const po = await this.poRepo.findOne({
      where: { po_id: poId, vendor_id: vendorId },
    });

    if (!po) {
      throw new NotFoundException('ไม่พบเอกสาร PO หรือไม่ได้รับอนุญาต');
    }

    po.status = PurchaseOrderStatus.REVISION_REQUESTED;

    return await this.poRepo.save(po);
  }

  async revisePO(poId: string, dto: RevisePoDto, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const po = await manager.getRepository(PurchaseOrder).findOne({
        where: { po_id: poId },
        relations: ['lines', 'pr', 'pr.lines'],
      });

      if (!po) {
        throw new NotFoundException('ไม่พบเอกสาร PO');
      }

      // Increment revision, reset status
      po.revision_no = po.revision_no + 1;
      po.status = PurchaseOrderStatus.SENT_TO_VENDOR;

      // Update lines
      let totalAmount = 0;
      const ccDiffs: { [ccId: string]: number } = {};

      for (const lineDto of dto.lines) {
        const poLine = po.lines.find((l) => l.po_line_id === lineDto.po_line_id);
        if (!poLine) {
          throw new BadRequestException(`ไม่พบรายการสินค้า PO Line ${lineDto.po_line_id}`);
        }

        const oldLineTotal = Number(poLine.total_price);
        const newLineTotal = Number(lineDto.quantity) * Number(lineDto.unit_price);

        poLine.quantity = lineDto.quantity;
        poLine.unit_price = lineDto.unit_price;
        poLine.total_price = newLineTotal;

        await manager.getRepository(PurchaseOrderLine).save(poLine);

        // Track difference to adjust budget reservation if linked to PR
        if (poLine.pr_line_id && po.pr_id) {
          const prLine = await manager.getRepository(PurchaseRequisitionLine).findOne({
            where: { line_id: poLine.pr_line_id },
          });
          if (prLine) {
            const ccId = prLine.cost_center_id;
            const diff = newLineTotal - oldLineTotal;
            ccDiffs[ccId] = (ccDiffs[ccId] || 0) + diff;
          }
        }
      }

      // Re-calculate total amount
      const allPoLines = await manager.getRepository(PurchaseOrderLine).find({
        where: { po_id: poId },
      });
      totalAmount = allPoLines.reduce((sum, line) => sum + Number(line.total_price), 0);
      po.total_amount = totalAmount;

      // Update payment milestones proportionally if they exist
      if (po.payment_milestones && po.payment_milestones.length > 0) {
        const milestones = [...po.payment_milestones];
        let remainingAmount = totalAmount;
        for (let i = 0; i < milestones.length; i++) {
          const ms = milestones[i];
          if (i === milestones.length - 1) {
            ms.amount = Number(remainingAmount.toFixed(2));
          } else {
            const amt = Number((totalAmount * (ms.percentage / 100)).toFixed(2));
            ms.amount = amt;
            remainingAmount -= amt;
          }
          ms.error_code = null;
          ms.error_message = null;
          ms.status = 'Pending';
        }
        po.payment_milestones = milestones;
      }

      const savedPo = await manager.getRepository(PurchaseOrder).save(po);

      // Adjust Cost Center budget reservations if there are changes
      for (const ccId of Object.keys(ccDiffs)) {
        const diff = ccDiffs[ccId];
        if (diff !== 0) {
          const costCenter = await manager.getRepository(CostCenter).findOne({
            where: { cost_center_id: ccId },
            lock: { mode: 'pessimistic_write' },
          });
          if (costCenter) {
            costCenter.budget_reserved_amount = Number(costCenter.budget_reserved_amount) + diff;
            await manager.getRepository(CostCenter).save(costCenter);
          }
        }
      }

      return {
        ...savedPo,
        lines: allPoLines,
      };
    });
  }

  async triggerPayment(poId: string) {
    const po = await this.poRepo.findOne({ where: { po_id: poId } });
    if (!po) {
      throw new NotFoundException('ไม่พบเอกสาร PO');
    }
    po.status = PurchaseOrderStatus.PROCESSING_PAYMENT;
    return await this.poRepo.save(po);
  }

  async paymentCallback(poNo: string, status: 'Success' | 'Failed') {
    const po = await this.poRepo.findOne({ where: { po_no: poNo } });
    if (!po) {
      throw new NotFoundException('ไม่พบเอกสาร PO');
    }
    po.status = status === 'Success' ? PurchaseOrderStatus.PAID : PurchaseOrderStatus.VENDOR_CONFIRMED;
    return await this.poRepo.save(po);
  }

  async rejectPO(poId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const po = await manager.getRepository(PurchaseOrder).findOne({
        where: { po_id: poId },
        relations: ['lines', 'pr', 'pr.lines'],
      });

      if (!po) {
        throw new NotFoundException('ไม่พบเอกสาร PO');
      }

      if (
        po.status !== PurchaseOrderStatus.PENDING_APPROVAL &&
        po.status !== PurchaseOrderStatus.SENT_TO_VENDOR
      ) {
        throw new BadRequestException(`ไม่สามารถปฏิเสธได้เนื่องจากเอกสารอยู่ในสถานะ ${po.status}`);
      }

      const beforeValue = { status: po.status };
      po.status = PurchaseOrderStatus.REJECTED;
      const saved = await manager.getRepository(PurchaseOrder).save(po);

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
            action: 'RELEASE_BUDGET_PO_REJECT',
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
        action: 'REJECT_PO',
        entity_type: 'PurchaseOrder',
        entity_id: poId,
        before_value_json: beforeValue,
        after_value_json: { status: po.status },
        timestamp: new Date(),
      });
      await manager.save(audit);

      return saved;
    });
  }

  async cancelPO(poId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const po = await manager.getRepository(PurchaseOrder).findOne({
        where: { po_id: poId },
        relations: ['lines', 'pr', 'pr.lines'],
      });

      if (!po) {
        throw new NotFoundException('ไม่พบเอกสาร PO');
      }

      const invalidStatuses = [
        PurchaseOrderStatus.PAID,
        PurchaseOrderStatus.FULLY_RECEIVED,
        PurchaseOrderStatus.CLOSED,
        PurchaseOrderStatus.CANCELLED,
        PurchaseOrderStatus.REJECTED,
      ];
      if (invalidStatuses.includes(po.status)) {
        throw new BadRequestException(`ไม่สามารถยกเลิกได้เนื่องจากเอกสารอยู่ในสถานะ ${po.status}`);
      }

      const beforeValue = { status: po.status };
      po.status = PurchaseOrderStatus.CANCELLED;
      const saved = await manager.getRepository(PurchaseOrder).save(po);

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
            action: 'RELEASE_BUDGET_PO_CANCEL',
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
        action: 'CANCEL_PO',
        entity_type: 'PurchaseOrder',
        entity_id: poId,
        before_value_json: beforeValue,
        after_value_json: { status: po.status },
        timestamp: new Date(),
      });
      await manager.save(audit);

      return saved;
    });
  }
}


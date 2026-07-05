import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { PurchaseOrder } from '../database/entities/purchase-order.entity';
import { PurchaseOrderLine } from '../database/entities/purchase-order-line.entity';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';
import { PurchaseRequisitionLine } from '../database/entities/purchase-requisition-line.entity';
import { ItemPrice } from '../database/entities/item-price.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { ConfirmPoDto, RequestRevisionDto, RevisePoDto, RejectPoDto } from './dto/po.dto';
import { PurchaseOrderStatus, PurchaseRequisitionStatus, ApprovalDecision } from '@p2p/shared';
import { AuditLog } from '../database/entities/audit-log.entity';
import { PurchaseContract } from '../database/entities/purchase-contract.entity';
import { Notification } from '../database/entities/notification.entity';
import { ApprovalService } from '../approval/approval.service';

@Injectable()
export class PoService implements OnModuleInit {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PurchaseOrder)
    private poRepo: Repository<PurchaseOrder>,
    private approvalService: ApprovalService,
  ) {}

  onModuleInit() {
    this.approvalService.registerHandler('PurchaseOrder', {
      onApprove: (poId, decidedBy) => this.handleApproved(poId, decidedBy),
      onReject: (poId, reason, decidedBy) => this.handleRejected(poId, reason, decidedBy),
      onRevise: (poId, reason, decidedBy) => this.handleReviseRequested(poId, reason, decidedBy),
    });
  }

  async convertPrToPo(prId: string, userId: string, overrideVendorId?: string) {
    const result = await this.dataSource.transaction(async (manager) => {
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

      // 2. Determine Vendor — use override if provided, else look up from item price, else default
      let vendorId = '00000008-0000-0000-0000-000000000001';
      if (overrideVendorId) {
        vendorId = overrideVendorId;
      } else {
        const firstLine = pr.lines[0];
        if (firstLine.item_id) {
          const itemPrice = await manager.getRepository(ItemPrice).findOne({
            where: { item_id: firstLine.item_id },
          });
          if (itemPrice) {
            vendorId = itemPrice.vendor_id;
          }
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

      // 4. Create PO Header — starts Pending Approval; only reaches SentToVendor once the DOA route (below) clears.
      const po = manager.getRepository(PurchaseOrder).create({
        po_no: poNo,
        pr_id: pr.pr_id,
        vendor_id: vendorId,
        company_id: pr.company_id,
        status: PurchaseOrderStatus.PENDING_APPROVAL,
        total_amount: pr.total_amount,
        revision_no: 0,
        estimated_delivery_date: null,
        payment_milestones: milestones,
        contract_id: pr.contract_id || null,
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

      // Contract Utilization Limit Control (Deduct budget on PO creation if linked to contract)
      if (pr.contract_id) {
        const contract = await manager.getRepository(PurchaseContract).findOne({
          where: { contract_id: pr.contract_id },
          lock: { mode: 'pessimistic_write' },
        });
        if (contract) {
          const oldRemaining = Number(contract.remaining_amount);
          contract.remaining_amount = oldRemaining - totalAmount;
          await manager.save(contract);

          const totalAmt = Number(contract.total_amount);
          const usedAmt = totalAmt - contract.remaining_amount;
          const utilizationPct = (usedAmt / totalAmt) * 100;

          if (utilizationPct >= 80) {
            const pctText = utilizationPct >= 90 ? '90%' : '80%';
            const msg = `สัญญากลางเลขที่ ${contract.contract_no} ถูกใช้งานไปแล้วเกิน ${pctText} (${utilizationPct.toFixed(2)}%) วงเงินคงเหลือปัจจุบันคือ ${contract.remaining_amount} THB`;
            const notification = manager.getRepository(Notification).create({
              recipient_user_id: userId,
              channel: 'System',
              trigger_event: 'CONTRACT_LIMIT_WARNING',
              message: msg,
              read_flag: false,
            });
            await manager.save(notification);
          }
        }
      }

      // 6. Update PR status
      pr.status = PurchaseRequisitionStatus.CONVERTED_TO_PO;
      await manager.getRepository(PurchaseRequisition).save(pr);

      return { po: savedPo, lines: poLines, companyId: pr.company_id, totalAmount };
    });

    // DOA-driven approval routing happens after the PO itself is durably committed (same reasoning as PR).
    await this.approvalService.initiateRoute('PurchaseOrder', result.po.po_id, result.companyId, result.totalAmount);

    return {
      ...result.po,
      lines: result.lines,
    };
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

  // ── US-0309: PO Split by vendor/line ──
  async splitPO(poId: string, lineIds: string[], newVendorId?: string) {
    return await this.dataSource.transaction(async (manager) => {
      const po = await manager.getRepository(PurchaseOrder).findOne({
        where: { po_id: poId },
        relations: ['lines'],
      });
      if (!po) throw new NotFoundException('ไม่พบเอกสาร PO');
      if (!lineIds || lineIds.length === 0) {
        throw new BadRequestException('กรุณาเลือกอย่างน้อย 1 รายการเพื่อแยกใบสั่งซื้อ');
      }
      if (lineIds.length >= po.lines.length) {
        throw new BadRequestException('ต้องเหลืออย่างน้อย 1 รายการในใบสั่งซื้อเดิม');
      }

      const linesToMove = po.lines.filter((l) => lineIds.includes(l.po_line_id));
      if (linesToMove.length !== lineIds.length) {
        throw new BadRequestException('พบรายการที่ไม่ตรงกับใบสั่งซื้อนี้');
      }

      const now = new Date();
      const yy = now.getFullYear().toString().slice(-2);
      const mm = (now.getMonth() + 1).toString().padStart(2, '0');
      const prefix = `PO${yy}${mm}`;
      const count = await manager.getRepository(PurchaseOrder).count({
        where: { po_no: Like(`${prefix}%`) },
      });
      const newPoNo = `${prefix}${(count + 1).toString().padStart(3, '0')}`;

      const movedTotal = linesToMove.reduce((sum, l) => sum + Number(l.total_price), 0);

      const newPo = manager.getRepository(PurchaseOrder).create({
        po_no: newPoNo,
        pr_id: po.pr_id,
        vendor_id: newVendorId || po.vendor_id,
        company_id: po.company_id,
        status: po.status,
        total_amount: movedTotal,
        revision_no: 0,
        estimated_delivery_date: po.estimated_delivery_date,
        payment_milestones: po.payment_milestones,
        contract_id: po.contract_id,
        split_from_po_id: po.po_id,
      });
      const savedNewPo = await manager.getRepository(PurchaseOrder).save(newPo);

      for (const line of linesToMove) {
        line.po_id = savedNewPo.po_id;
        await manager.getRepository(PurchaseOrderLine).save(line);
      }

      po.total_amount = Number(po.total_amount) - movedTotal;
      await manager.getRepository(PurchaseOrder).save(po);

      return { original_po_id: po.po_id, new_po_id: savedNewPo.po_id, new_po_no: newPoNo };
    });
  }

  async listVendorPOs(vendorId: string) {
    return await this.poRepo.find({
      where: { vendor_id: vendorId },
      relations: ['lines', 'vendor', 'company', 'pr'],
      order: { created_at: 'DESC' },
    });
  }

  async confirmPO(poId: string, _vendorId: string, dto: ConfirmPoDto) {
    const po = await this.poRepo.findOne({ where: { po_id: poId } });

    if (!po) {
      throw new NotFoundException('ไม่พบเอกสาร PO');
    }

    po.status = PurchaseOrderStatus.VENDOR_CONFIRMED;
    po.estimated_delivery_date = new Date(dto.estimated_delivery_date);

    return await this.poRepo.save(po);
  }

  async requestRevision(poId: string, _vendorId: string, dto: RequestRevisionDto) {
    const po = await this.poRepo.findOne({ where: { po_id: poId } });

    if (!po) {
      throw new NotFoundException('ไม่พบเอกสาร PO');
    }

    po.status = PurchaseOrderStatus.REVISION_REQUESTED;

    return await this.poRepo.save(po);
  }

  async rejectByVendor(poId: string, vendorId: string, dto: RejectPoDto) {
    return await this.dataSource.transaction(async (manager) => {
      const po = await manager.getRepository(PurchaseOrder).findOne({ where: { po_id: poId } });
      if (!po) {
        throw new NotFoundException('ไม่พบเอกสาร PO');
      }
      if (po.status !== PurchaseOrderStatus.SENT_TO_VENDOR) {
        throw new BadRequestException(`ไม่สามารถปฏิเสธได้เนื่องจากเอกสารอยู่ในสถานะ ${po.status}`);
      }

      const beforeValue = { status: po.status };
      po.status = PurchaseOrderStatus.REJECTED;
      const saved = await manager.getRepository(PurchaseOrder).save(po);

      const audit = manager.getRepository(AuditLog).create({
        user_id: vendorId,
        action: 'VENDOR_REJECT_PO',
        entity_type: 'PurchaseOrder',
        entity_id: poId,
        before_value_json: beforeValue,
        after_value_json: { status: po.status, reason: dto.reason },
        timestamp: new Date(),
      });
      await manager.save(audit);

      return saved;
    });
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

      // Validate against Contract Remaining Amount if linked (US-114 Validation)
      if (po.contract_id) {
        const contract = await manager.getRepository(PurchaseContract).findOne({
          where: { contract_id: po.contract_id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!contract) {
          throw new NotFoundException('ไม่พบสัญญากลางที่ผูกกับใบสั่งซื้อนี้');
        }
        const diff = totalAmount - Number(po.total_amount);
        if (diff > 0 && Number(contract.remaining_amount) < diff) {
          throw new BadRequestException(
            `ยอดปรับปรุงรวมใหม่ของ PO เพิ่มขึ้น ${diff} THB เกินวงเงินคงเหลือของสัญญากลาง (วงเงินคงเหลือปัจจุบัน ${contract.remaining_amount} THB)`
          );
        }
        contract.remaining_amount = Number(contract.remaining_amount) - diff;
        await manager.save(contract);

        const totalAmt = Number(contract.total_amount);
        const usedAmt = totalAmt - contract.remaining_amount;
        const utilizationPct = (usedAmt / totalAmt) * 100;

        if (utilizationPct >= 80) {
          const pctText = utilizationPct >= 90 ? '90%' : '80%';
          const msg = `สัญญากลางเลขที่ ${contract.contract_no} ถูกใช้งานไปแล้วเกิน ${pctText} (${utilizationPct.toFixed(2)}%) วงเงินคงเหลือปัจจุบันคือ ${contract.remaining_amount} THB`;
          const notification = manager.getRepository(Notification).create({
            recipient_user_id: userId,
            channel: 'System',
            trigger_event: 'CONTRACT_LIMIT_WARNING',
            message: msg,
            read_flag: false,
          });
          await manager.save(notification);
        }
      }

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

  /** Legacy single-shot endpoints: resolve the caller's active Approval Task and decide it via the workflow engine. */
  async approvePO(poId: string, userId: string, userRoles: string[]) {
    const task = await this.approvalService.findMyPendingTaskForDocument('PurchaseOrder', poId, userId, userRoles);
    await this.approvalService.decide(task.task_id, userId, userRoles, ApprovalDecision.APPROVE);
    return this.poRepo.findOne({ where: { po_id: poId } });
  }

  async rejectPO(poId: string, userId: string, userRoles: string[], reason: string) {
    const task = await this.approvalService.findMyPendingTaskForDocument('PurchaseOrder', poId, userId, userRoles);
    await this.approvalService.decide(task.task_id, userId, userRoles, ApprovalDecision.REJECT, reason);
    return this.poRepo.findOne({ where: { po_id: poId } });
  }

  async returnPOForRevise(poId: string, userId: string, userRoles: string[], reason: string) {
    const task = await this.approvalService.findMyPendingTaskForDocument('PurchaseOrder', poId, userId, userRoles);
    await this.approvalService.decide(task.task_id, userId, userRoles, ApprovalDecision.REVISE, reason);
    return this.poRepo.findOne({ where: { po_id: poId } });
  }

  private async handleApproved(poId: string, decidedBy: string) {
    return await this.dataSource.transaction(async (manager) => {
      const po = await manager.getRepository(PurchaseOrder).findOne({ where: { po_id: poId } });
      if (!po) return;

      const beforeValue = { status: po.status };
      po.status = PurchaseOrderStatus.SENT_TO_VENDOR;
      await manager.getRepository(PurchaseOrder).save(po);

      const audit = manager.getRepository(AuditLog).create({
        user_id: decidedBy,
        action: 'APPROVE_PO',
        entity_type: 'PurchaseOrder',
        entity_id: poId,
        before_value_json: beforeValue,
        after_value_json: { status: po.status },
        timestamp: new Date(),
      });
      await manager.save(audit);
    });
  }

  private async handleReviseRequested(poId: string, reason: string, decidedBy: string) {
    return await this.dataSource.transaction(async (manager) => {
      const po = await manager.getRepository(PurchaseOrder).findOne({ where: { po_id: poId } });
      if (!po) return;

      const beforeValue = { status: po.status };
      po.status = PurchaseOrderStatus.REVISION_REQUESTED;
      await manager.getRepository(PurchaseOrder).save(po);

      const audit = manager.getRepository(AuditLog).create({
        user_id: decidedBy,
        action: 'RETURN_FOR_REVISE_PO',
        entity_type: 'PurchaseOrder',
        entity_id: poId,
        before_value_json: beforeValue,
        after_value_json: { status: po.status, reason },
        timestamp: new Date(),
      });
      await manager.save(audit);
    });
  }

  private async handleRejected(poId: string, reason: string, decidedBy: string) {
    return await this.dataSource.transaction(async (manager) => {
      const po = await manager.getRepository(PurchaseOrder).findOne({
        where: { po_id: poId },
        relations: ['lines', 'pr', 'pr.lines'],
      });
      if (!po) return;

      const beforeValue = { status: po.status };
      po.status = PurchaseOrderStatus.REJECTED;
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
            user_id: decidedBy,
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

      // Release contract budget if linked
      if (po.contract_id) {
        const contract = await manager.getRepository(PurchaseContract).findOne({
          where: { contract_id: po.contract_id },
          lock: { mode: 'pessimistic_write' },
        });
        if (contract) {
          contract.remaining_amount = Number(contract.remaining_amount) + Number(po.total_amount);
          await manager.save(contract);
        }
      }

      // Create PO Audit Log
      const audit = manager.getRepository(AuditLog).create({
        user_id: decidedBy,
        action: 'REJECT_PO',
        entity_type: 'PurchaseOrder',
        entity_id: poId,
        before_value_json: beforeValue,
        after_value_json: { status: po.status, reason },
        timestamp: new Date(),
      });
      await manager.save(audit);
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

      // Release contract budget if linked
      if (po.contract_id) {
        const contract = await manager.getRepository(PurchaseContract).findOne({
          where: { contract_id: po.contract_id },
          lock: { mode: 'pessimistic_write' },
        });
        if (contract) {
          contract.remaining_amount = Number(contract.remaining_amount) + Number(po.total_amount);
          await manager.save(contract);
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


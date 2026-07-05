import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';
import { PurchaseRequisitionLine } from '../database/entities/purchase-requisition-line.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { CreatePrDto } from './dto/create-pr.dto';
import { PurchaseRequisitionStatus, ApprovalDecision } from '@p2p/shared';
import { AuditLog } from '../database/entities/audit-log.entity';
import { PurchaseContract } from '../database/entities/purchase-contract.entity';
import { AnnualPlan } from '../database/entities/annual-plan.entity';
import { Item } from '../database/entities/item.entity';
import { ApprovalService } from '../approval/approval.service';

@Injectable()
export class PrService implements OnModuleInit {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PurchaseRequisition)
    private prRepo: Repository<PurchaseRequisition>,
    @InjectRepository(CostCenter)
    private ccRepo: Repository<CostCenter>,
    private approvalService: ApprovalService,
  ) {}

  onModuleInit() {
    this.approvalService.registerHandler('PurchaseRequisition', {
      onApprove: (prId, decidedBy) => this.handleApproved(prId, decidedBy),
      onReject: (prId, reason, decidedBy) => this.handleRejected(prId, reason, decidedBy),
      onRevise: (prId, reason, decidedBy) => this.handleReviseRequired(prId, reason, decidedBy),
    });
  }

  async createPR(createPrDto: CreatePrDto, userId: string, companyId: string) {
    if (!createPrDto.lines || createPrDto.lines.length === 0) {
      throw new BadRequestException('PR must have at least one line item');
    }

    const result = await this.dataSource.transaction(async (manager) => {
      // 1. Generate PR No
      const now = new Date();
      const yy = now.getFullYear().toString().slice(-2);
      const mm = (now.getMonth() + 1).toString().padStart(2, '0');
      const prefix = `PR${yy}${mm}`;

      // Using locking or sequential counting inside transaction
      const count = await manager.getRepository(PurchaseRequisition).count({
        where: {
          pr_no: Like(`${prefix}%`),
        },
      });
      const prNo = `${prefix}${(count + 1).toString().padStart(3, '0')}`;

      // 2. Group lines by cost center to calculate totals for budget check
      const ccTotals: { [ccId: string]: number } = {};
      let totalAmount = 0;

      for (const line of createPrDto.lines) {
        const lineTotal = Number(line.quantity) * Number(line.unit_price);
        ccTotals[line.cost_center_id] = (ccTotals[line.cost_center_id] || 0) + lineTotal;
        totalAmount += lineTotal;
      }

      // Check Contract Validity & Remaining Amount (US-114 Validation)
      if (createPrDto.contract_id) {
        const contract = await manager.getRepository(PurchaseContract).findOne({
          where: { contract_id: createPrDto.contract_id },
        });
        if (!contract) {
          throw new NotFoundException('ไม่พบสัญญากลางที่ระบุ');
        }
        if (contract.status !== 'Signed') {
          throw new BadRequestException(`สัญญาจัดซื้อยังอยู่ในสถานะ "${contract.status}" และไม่สามารถจัดซื้อได้ (ต้องประทับตราและลงนามครบถ้วน)`);
        }
        if (Number(contract.remaining_amount) < totalAmount) {
          throw new BadRequestException(
            `ยอดขอซื้อรวม (${totalAmount} THB) เกินวงเงินคงเหลือของสัญญากลาง (วงเงินคงเหลือปัจจุบัน ${contract.remaining_amount} THB)`
          );
        }
      }

      // 3. Check budget for each Cost Center
      let isOverBudget = false;
      let withinTolerance = true;
      const costCenters: CostCenter[] = [];

      for (const ccId of Object.keys(ccTotals)) {
        // Query with Pessimistic Write lock to avoid race conditions/dirty reads
        const costCenter = await manager.getRepository(CostCenter).findOne({
          where: { cost_center_id: ccId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!costCenter) {
          throw new NotFoundException(`Cost Center ${ccId} not found`);
        }

        const requestedAmount = ccTotals[ccId];
        const remainingBudget = Number(costCenter.annual_budget_amount) - Number(costCenter.budget_used_amount) - Number(costCenter.budget_reserved_amount);

        if (requestedAmount > remainingBudget) {
          isOverBudget = true;
          const overrunAmount = requestedAmount - remainingBudget;
          const tolerancePct = Number(costCenter.budget_overrun_tolerance_pct || 5.0);
          const toleranceAmt = Number(costCenter.budget_overrun_tolerance_amount || 20000.0);
          const pctLimit = remainingBudget > 0 ? (remainingBudget * (tolerancePct / 100)) : 0;

          const isCcTolerance = overrunAmount <= toleranceAmt || (remainingBudget > 0 && overrunAmount <= pctLimit);
          if (!isCcTolerance) {
            withinTolerance = false;
          }
        }
        costCenters.push(costCenter);
      }

      // Determine PR status & overrun flag
      let status = PurchaseRequisitionStatus.PENDING_APPROVAL;
      let isBudgetOverrun = false;

      if (isOverBudget) {
        if (withinTolerance) {
          status = PurchaseRequisitionStatus.PENDING_APPROVAL;
          isBudgetOverrun = true;
        } else {
          throw new BadRequestException('ไม่สามารถสร้างใบขอซื้อได้: งบประมาณจัดซื้อเกินวงเงินคงเหลือและเกินเกณฑ์ผ่อนปรน (Tolerance) ของแผนกท่าน กรุณายื่นคำขอปรับเพิ่มงบประมาณ');
        }
      }

      // Check Unplanned Purchase (Planning Control)
      let isUnplanned = false;
      const currentYear = new Date().getFullYear();
      for (const line of createPrDto.lines) {
        let category = 'Unknown';
        if (line.item_id) {
          const item = await manager.getRepository(Item).findOne({
            where: { item_id: line.item_id }
          });
          if (item) {
            category = item.item_type;
          }
        }
        if (category === 'Unknown' || !category) {
          if (line.item_name.includes('อุปกรณ์ไอที') || line.item_name.includes('IT')) {
            category = 'อุปกรณ์ไอที';
          } else {
            category = line.item_name;
          }
        }

        const plan = await manager.getRepository(AnnualPlan).findOne({
          where: {
            year: currentYear,
            business_category: category,
          }
        }) || await manager.getRepository(AnnualPlan).findOne({
          where: {
            year: currentYear,
            business_category: Like(`%${category}%`),
          }
        });

        if (!plan) {
          isUnplanned = true;
        } else {
          const lineTotal = Number(line.quantity) * Number(line.unit_price);
          if (Number(plan.remaining_budget) < lineTotal) {
            isUnplanned = true;
          } else {
            // Deduct the budget
            plan.remaining_budget = Number(plan.remaining_budget) - lineTotal;
            await manager.save(plan);
          }
        }
      }

      // 4. Create and save PR Header
      const pr = manager.getRepository(PurchaseRequisition).create({
        pr_no: prNo,
        requester_id: userId,
        company_id: companyId,
        status,
        total_amount: totalAmount,
        description: createPrDto.description,
        is_budget_overrun: isBudgetOverrun,
        is_unplanned: isUnplanned,
        approver_role: null,
        contract_id: createPrDto.contract_id || null,
      });

      const savedPr = await manager.getRepository(PurchaseRequisition).save(pr);

      // 5. Create and save PR Lines
      const prLines = createPrDto.lines.map((line) => {
        const lineTotal = Number(line.quantity) * Number(line.unit_price);
        return manager.getRepository(PurchaseRequisitionLine).create({
          pr_id: savedPr.pr_id,
          item_id: line.item_id || null,
          item_name: line.item_name,
          quantity: line.quantity,
          uom: line.uom,
          unit_price: line.unit_price,
          total_price: lineTotal,
          cost_center_id: line.cost_center_id,
          quotation_url: line.quotation_url || null,
          is_requirement_based: line.is_requirement_based || false,
          scope_of_work: line.scope_of_work || null,
        });
      });

      await manager.getRepository(PurchaseRequisitionLine).save(prLines);

      // 6. Update Cost Center budget reserved amount if NOT over budget
      if (status === PurchaseRequisitionStatus.PENDING_APPROVAL) {
        for (const costCenter of costCenters) {
          const reservedIncrement = ccTotals[costCenter.cost_center_id];
          costCenter.budget_reserved_amount = Number(costCenter.budget_reserved_amount) + reservedIncrement;
          await manager.getRepository(CostCenter).save(costCenter);
        }
      }

      return { pr: savedPr, lines: prLines, totalAmount, status };
    });

    // DOA-driven approval routing happens after the PR itself is durably committed, so a missing
    // DOA rule blocks the workflow (per the doc) rather than losing the PR the requester just created.
    if (result.status === PurchaseRequisitionStatus.PENDING_APPROVAL) {
      const tasks = await this.approvalService.initiateRoute('PurchaseRequisition', result.pr.pr_id, companyId, result.totalAmount);
      result.pr.approver_role = tasks.map((t) => t.approver_role).join(' / ');
      await this.prRepo.save(result.pr);
    }

    return {
      ...result.pr,
      lines: result.lines,
    };
  }

  async listPRs(userId: string) {
    return await this.prRepo.find({
      where: { requester_id: userId },
      relations: ['lines', 'lines.cost_center'],
      order: { created_at: 'DESC' },
    });
  }

  async getPRDetails(prId: string, userId: string) {
    const pr = await this.prRepo.findOne({
      where: { pr_id: prId, requester_id: userId },
      relations: ['lines', 'lines.cost_center', 'requester', 'company'],
    });

    if (!pr) {
      throw new NotFoundException('PR not found');
    }

    return pr;
  }

  async getCostCenters() {
    return this.ccRepo.find();
  }

  /** Legacy single-shot endpoint: resolves the caller's active Approval Task and decides it via the workflow engine. */
  async approvePR(prId: string, userId: string, userRoles: string[]) {
    const task = await this.approvalService.findMyPendingTaskForDocument('PurchaseRequisition', prId, userId, userRoles);
    await this.approvalService.decide(task.task_id, userId, userRoles, ApprovalDecision.APPROVE);
    return this.prRepo.findOne({ where: { pr_id: prId }, relations: ['lines'] });
  }

  async rejectPR(prId: string, userId: string, userRoles: string[], reason: string) {
    const task = await this.approvalService.findMyPendingTaskForDocument('PurchaseRequisition', prId, userId, userRoles);
    await this.approvalService.decide(task.task_id, userId, userRoles, ApprovalDecision.REJECT, reason);
    return this.prRepo.findOne({ where: { pr_id: prId }, relations: ['lines'] });
  }

  async revisePR(prId: string, userId: string, userRoles: string[], reason: string) {
    const task = await this.approvalService.findMyPendingTaskForDocument('PurchaseRequisition', prId, userId, userRoles);
    await this.approvalService.decide(task.task_id, userId, userRoles, ApprovalDecision.REVISE, reason);
    return this.prRepo.findOne({ where: { pr_id: prId }, relations: ['lines'] });
  }

  /** Requester resubmits a PR that came back with Revise Required — re-enters DOA routing (no line edits in this pass). */
  async resubmitPR(prId: string, userId: string) {
    const pr = await this.prRepo.findOne({ where: { pr_id: prId, requester_id: userId } });
    if (!pr) {
      throw new NotFoundException('ไม่พบเอกสาร PR');
    }
    if (pr.status !== PurchaseRequisitionStatus.REVISE_REQUIRED) {
      throw new BadRequestException(`ไม่สามารถส่งใหม่ได้เนื่องจากเอกสารอยู่ในสถานะ ${pr.status}`);
    }

    pr.status = PurchaseRequisitionStatus.RESUBMITTED;
    await this.prRepo.save(pr);

    const tasks = await this.approvalService.initiateRoute('PurchaseRequisition', pr.pr_id, pr.company_id, Number(pr.total_amount));
    pr.status = PurchaseRequisitionStatus.PENDING_APPROVAL;
    pr.approver_role = tasks.map((t) => t.approver_role).join(' / ');
    return this.prRepo.save(pr);
  }

  private async handleApproved(prId: string, decidedBy: string) {
    return await this.dataSource.transaction(async (manager) => {
      const pr = await manager.getRepository(PurchaseRequisition).findOne({ where: { pr_id: prId } });
      if (!pr) return;

      const beforeValue = { status: pr.status };
      pr.status = PurchaseRequisitionStatus.APPROVED;
      await manager.getRepository(PurchaseRequisition).save(pr);

      const audit = manager.getRepository(AuditLog).create({
        user_id: decidedBy,
        action: 'APPROVE_PR',
        entity_type: 'PurchaseRequisition',
        entity_id: prId,
        before_value_json: beforeValue,
        after_value_json: { status: pr.status },
        timestamp: new Date(),
      });
      await manager.save(audit);
    });
  }

  private async handleReviseRequired(prId: string, reason: string, decidedBy: string) {
    return await this.dataSource.transaction(async (manager) => {
      const pr = await manager.getRepository(PurchaseRequisition).findOne({ where: { pr_id: prId } });
      if (!pr) return;

      const beforeValue = { status: pr.status };
      pr.status = PurchaseRequisitionStatus.REVISE_REQUIRED;
      await manager.getRepository(PurchaseRequisition).save(pr);

      const audit = manager.getRepository(AuditLog).create({
        user_id: decidedBy,
        action: 'REVISE_REQUIRED_PR',
        entity_type: 'PurchaseRequisition',
        entity_id: prId,
        before_value_json: beforeValue,
        after_value_json: { status: pr.status, reason },
        timestamp: new Date(),
      });
      await manager.save(audit);
    });
  }

  private async handleRejected(prId: string, reason: string, decidedBy: string) {
    return await this.dataSource.transaction(async (manager) => {
      const pr = await manager.getRepository(PurchaseRequisition).findOne({
        where: { pr_id: prId },
        relations: ['lines'],
      });
      if (!pr) return;

      const beforeValue = { status: pr.status };
      pr.status = PurchaseRequisitionStatus.REJECTED;
      await manager.getRepository(PurchaseRequisition).save(pr);

      // Release reserved budget
      const ccTotals: { [ccId: string]: number } = {};
      for (const line of pr.lines) {
        ccTotals[line.cost_center_id] = (ccTotals[line.cost_center_id] || 0) + Number(line.total_price);
      }

      for (const ccId of Object.keys(ccTotals)) {
        const costCenter = await manager.getRepository(CostCenter).findOne({
          where: { cost_center_id: ccId },
          lock: { mode: 'pessimistic_write' },
        });
        if (costCenter) {
          const oldReserved = Number(costCenter.budget_reserved_amount);
          const amountToRelease = ccTotals[ccId];
          costCenter.budget_reserved_amount = Math.max(0, oldReserved - amountToRelease);
          await manager.getRepository(CostCenter).save(costCenter);

          const auditCC = manager.getRepository(AuditLog).create({
            user_id: decidedBy,
            action: 'RELEASE_BUDGET_PR_REJECT',
            entity_type: 'CostCenter',
            entity_id: ccId,
            before_value_json: { reserved: oldReserved },
            after_value_json: { reserved: costCenter.budget_reserved_amount },
            timestamp: new Date(),
          });
          await manager.save(auditCC);
        }
      }

      // Restore AnnualPlan budget if not unplanned
      if (!pr.is_unplanned) {
        const currentYear = new Date().getFullYear();
        for (const line of pr.lines) {
          let category = 'Unknown';
          if (line.item_id) {
            const item = await manager.getRepository(Item).findOne({
              where: { item_id: line.item_id }
            });
            if (item) {
              category = item.item_type;
            }
          }
          if (category === 'Unknown' || !category) {
            if (line.item_name.includes('อุปกรณ์ไอที') || line.item_name.includes('IT')) {
              category = 'อุปกรณ์ไอที';
            } else {
              category = line.item_name;
            }
          }

          const plan = await manager.getRepository(AnnualPlan).findOne({
            where: {
              year: currentYear,
              business_category: category,
            }
          }) || await manager.getRepository(AnnualPlan).findOne({
            where: {
              year: currentYear,
              business_category: Like(`%${category}%`),
            }
          });

          if (plan) {
            const lineTotal = Number(line.quantity) * Number(line.unit_price);
            plan.remaining_budget = Number(plan.remaining_budget) + lineTotal;
            await manager.save(plan);
          }
        }
      }

      const audit = manager.getRepository(AuditLog).create({
        user_id: decidedBy,
        action: 'REJECT_PR',
        entity_type: 'PurchaseRequisition',
        entity_id: prId,
        before_value_json: beforeValue,
        after_value_json: { status: pr.status, reason },
        timestamp: new Date(),
      });
      await manager.save(audit);
    });
  }

  async cancelPR(prId: string, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const pr = await manager.getRepository(PurchaseRequisition).findOne({
        where: { pr_id: prId },
        relations: ['lines'],
      });

      if (!pr) {
        throw new NotFoundException('ไม่พบเอกสาร PR');
      }

      if (
        pr.status !== PurchaseRequisitionStatus.PENDING_APPROVAL &&
        pr.status !== PurchaseRequisitionStatus.APPROVED
      ) {
        throw new BadRequestException(`ไม่สามารถยกเลิกได้เนื่องจากเอกสารอยู่ในสถานะ ${pr.status}`);
      }

      const beforeValue = { status: pr.status };
      pr.status = PurchaseRequisitionStatus.CANCELLED;
      const saved = await manager.getRepository(PurchaseRequisition).save(pr);

      // Release reserved budget
      const ccTotals: { [ccId: string]: number } = {};
      for (const line of pr.lines) {
        ccTotals[line.cost_center_id] = (ccTotals[line.cost_center_id] || 0) + Number(line.total_price);
      }

      for (const ccId of Object.keys(ccTotals)) {
        const costCenter = await manager.getRepository(CostCenter).findOne({
          where: { cost_center_id: ccId },
          lock: { mode: 'pessimistic_write' },
        });
        if (costCenter) {
          const oldReserved = Number(costCenter.budget_reserved_amount);
          const amountToRelease = ccTotals[ccId];
          costCenter.budget_reserved_amount = Math.max(0, oldReserved - amountToRelease);
          await manager.getRepository(CostCenter).save(costCenter);

          // Log budget change in Audit Trail
          const auditCC = manager.getRepository(AuditLog).create({
            user_id: userId,
            action: 'RELEASE_BUDGET_PR_CANCEL',
            entity_type: 'CostCenter',
            entity_id: ccId,
            before_value_json: { reserved: oldReserved },
            after_value_json: { reserved: costCenter.budget_reserved_amount },
            timestamp: new Date(),
          });
          await manager.save(auditCC);
        }
      }

      // Restore AnnualPlan budget if not unplanned
      if (!pr.is_unplanned) {
        const currentYear = new Date().getFullYear();
        for (const line of pr.lines) {
          let category = 'Unknown';
          if (line.item_id) {
            const item = await manager.getRepository(Item).findOne({
              where: { item_id: line.item_id }
            });
            if (item) {
              category = item.item_type;
            }
          }
          if (category === 'Unknown' || !category) {
            if (line.item_name.includes('อุปกรณ์ไอที') || line.item_name.includes('IT')) {
              category = 'อุปกรณ์ไอที';
            } else {
              category = line.item_name;
            }
          }

          const plan = await manager.getRepository(AnnualPlan).findOne({
            where: {
              year: currentYear,
              business_category: category,
            }
          }) || await manager.getRepository(AnnualPlan).findOne({
            where: {
              year: currentYear,
              business_category: Like(`%${category}%`),
            }
          });

          if (plan) {
            const lineTotal = Number(line.quantity) * Number(line.unit_price);
            plan.remaining_budget = Number(plan.remaining_budget) + lineTotal;
            await manager.save(plan);
          }
        }
      }

      // Create PR Audit Log
      const audit = manager.getRepository(AuditLog).create({
        user_id: userId,
        action: 'CANCEL_PR',
        entity_type: 'PurchaseRequisition',
        entity_id: prId,
        before_value_json: beforeValue,
        after_value_json: { status: pr.status },
        timestamp: new Date(),
      });
      await manager.save(audit);

      return saved;
    });
  }
}

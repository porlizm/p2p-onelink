import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';
import { PurchaseRequisitionLine } from '../database/entities/purchase-requisition-line.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { CreatePrDto } from './dto/create-pr.dto';
import { PurchaseRequisitionStatus } from '@p2p/shared';

@Injectable()
export class PrService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PurchaseRequisition)
    private prRepo: Repository<PurchaseRequisition>,
    @InjectRepository(CostCenter)
    private ccRepo: Repository<CostCenter>,
  ) {}

  async createPR(createPrDto: CreatePrDto, userId: string, companyId: string) {
    if (!createPrDto.lines || createPrDto.lines.length === 0) {
      throw new BadRequestException('PR must have at least one line item');
    }

    return await this.dataSource.transaction(async (manager) => {
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

      // 3. Check budget for each Cost Center
      let isOverBudget = false;
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
        }
        costCenters.push(costCenter);
      }

      // Determine PR status
      const status = isOverBudget
        ? PurchaseRequisitionStatus.BLOCKED_OVER_BUDGET
        : PurchaseRequisitionStatus.PENDING_APPROVAL;

      // 4. Create and save PR Header
      const pr = manager.getRepository(PurchaseRequisition).create({
        pr_no: prNo,
        requester_id: userId,
        company_id: companyId,
        status,
        total_amount: totalAmount,
        description: createPrDto.description,
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

      return {
        ...savedPr,
        lines: prLines,
      };
    });
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
}


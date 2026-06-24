import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { BudgetRequest } from '../database/entities/budget-request.entity';
import { CostCenter } from '../database/entities/cost-center.entity';

@Injectable()
export class BudgetService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(BudgetRequest)
    private budgetRequestRepo: Repository<BudgetRequest>,
    @InjectRepository(CostCenter)
    private costCenterRepo: Repository<CostCenter>,
  ) {}

  async createRequest(costCenterId: string, requestedAmount: number, reason: string, username: string) {
    if (requestedAmount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
    const cc = await this.costCenterRepo.findOne({ where: { cost_center_id: costCenterId } });
    if (!cc) {
      throw new NotFoundException('Cost Center not found');
    }

    const request = this.budgetRequestRepo.create({
      cost_center_id: costCenterId,
      requested_amount: requestedAmount,
      reason,
      status: 'Pending',
      created_by: username,
    });

    return await this.budgetRequestRepo.save(request);
  }

  async getRequests() {
    return await this.budgetRequestRepo.find({
      relations: ['cost_center', 'cost_center.business_unit'],
      order: { created_at: 'DESC' },
    });
  }

  async approveRequest(requestId: string) {
    return await this.dataSource.transaction(async (manager) => {
      const request = await manager.getRepository(BudgetRequest).findOne({
        where: { request_id: requestId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!request) {
        throw new NotFoundException('Budget request not found');
      }

      if (request.status !== 'Pending') {
        throw new BadRequestException(`Request status is already ${request.status}`);
      }

      const costCenter = await manager.getRepository(CostCenter).findOne({
        where: { cost_center_id: request.cost_center_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!costCenter) {
        throw new NotFoundException('Cost Center not found');
      }

      // Approve request
      request.status = 'Approved';
      await manager.save(request);

      // Increase cost center budget
      costCenter.annual_budget_amount = Number(costCenter.annual_budget_amount) + Number(request.requested_amount);
      await manager.save(costCenter);

      return { request, costCenter };
    });
  }

  async rejectRequest(requestId: string) {
    const request = await this.budgetRequestRepo.findOne({ where: { request_id: requestId } });
    if (!request) {
      throw new NotFoundException('Budget request not found');
    }
    if (request.status !== 'Pending') {
      throw new BadRequestException(`Request status is already ${request.status}`);
    }
    request.status = 'Rejected';
    return await this.budgetRequestRepo.save(request);
  }

  async transferBudget(fromCcId: string, toCcId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Transfer amount must be greater than zero');
    }
    if (fromCcId === toCcId) {
      throw new BadRequestException('Cannot transfer budget to the same Cost Center');
    }

    return await this.dataSource.transaction(async (manager) => {
      const fromCc = await manager.getRepository(CostCenter).findOne({
        where: { cost_center_id: fromCcId },
        lock: { mode: 'pessimistic_write' },
      });
      const toCc = await manager.getRepository(CostCenter).findOne({
        where: { cost_center_id: toCcId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromCc || !toCc) {
        throw new NotFoundException('One or both Cost Centers not found');
      }

      const remainingBudget = Number(fromCc.annual_budget_amount) - Number(fromCc.budget_used_amount) - Number(fromCc.budget_reserved_amount);
      if (amount > remainingBudget) {
        throw new BadRequestException(`Insufficient budget in source Cost Center. Available: ${remainingBudget}`);
      }

      fromCc.annual_budget_amount = Number(fromCc.annual_budget_amount) - amount;
      toCc.annual_budget_amount = Number(toCc.annual_budget_amount) + amount;

      await manager.save(fromCc);
      await manager.save(toCc);

      return { fromCc, toCc };
    });
  }

  async resetBudget() {
    return await this.dataSource.transaction(async (manager) => {
      const costCenters = await manager.getRepository(CostCenter).find();
      for (const cc of costCenters) {
        const currentYear = parseInt(cc.fiscal_year || '2026', 10);
        cc.fiscal_year = (currentYear + 1).toString();
        cc.annual_budget_amount = 0;
        cc.budget_reserved_amount = 0;
        cc.budget_used_amount = 0;
        await manager.save(cc);
      }
      return { message: 'All Cost Center budgets have been reset for the new fiscal year', count: costCenters.length };
    });
  }

  async updateTolerance(ccId: string, pct: number, amt: number) {
    if (pct < 0 || amt < 0) {
      throw new BadRequestException('Tolerance limits must be non-negative values');
    }
    const costCenter = await this.costCenterRepo.findOne({ where: { cost_center_id: ccId } });
    if (!costCenter) {
      throw new NotFoundException('Cost Center not found');
    }

    costCenter.budget_overrun_tolerance_pct = pct;
    costCenter.budget_overrun_tolerance_amount = amt;
    return await this.costCenterRepo.save(costCenter);
  }
}

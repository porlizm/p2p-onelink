import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnnualPlan } from '../database/entities/annual-plan.entity';
import { DemandCollection } from '../database/entities/demand-collection.entity';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(AnnualPlan)
    private annualPlanRepo: Repository<AnnualPlan>,
    @InjectRepository(DemandCollection)
    private demandRepo: Repository<DemandCollection>,
  ) {}

  async getAnnualPlans() {
    return await this.annualPlanRepo.find({ order: { year: 'DESC', business_category: 'ASC' } });
  }

  async uploadAnnualPlan(year: number, items: { business_category: string; budget_limit: number }[]) {
    // Clear existing for the year to overwrite cleanly
    await this.annualPlanRepo.delete({ year });

    const newPlans = items.map((item) =>
      this.annualPlanRepo.create({
        year,
        business_category: item.business_category,
        budget_limit: Number(item.budget_limit),
        remaining_budget: Number(item.budget_limit),
      }),
    );

    return await this.annualPlanRepo.save(newPlans);
  }

  async getDemandCollections() {
    return await this.demandRepo.find({
      relations: ['company', 'plan'],
      order: { created_at: 'DESC' },
    });
  }

  async submitDemand(dto: {
    company_id: string;
    item_name: string;
    quantity: number;
    estimated_amount: number;
    plan_id?: string;
  }) {
    const demand = this.demandRepo.create({
      company_id: dto.company_id,
      item_name: dto.item_name,
      quantity: Number(dto.quantity),
      estimated_amount: Number(dto.estimated_amount),
      plan_id: dto.plan_id || null,
    });

    return await this.demandRepo.save(demand);
  }
}

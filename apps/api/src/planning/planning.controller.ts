import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PlanningService } from './planning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('planning')
@UseGuards(JwtAuthGuard)
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}

  @Get('annual-plans')
  async getAnnualPlans() {
    return this.planningService.getAnnualPlans();
  }

  @Post('upload')
  async uploadAnnualPlan(
    @Body() body: { year: number; items: { business_category: string; budget_limit: number }[] },
  ) {
    return this.planningService.uploadAnnualPlan(body.year, body.items);
  }

  @Get('demands')
  async getDemandCollections() {
    return this.planningService.getDemandCollections();
  }

  @Post('demand')
  async submitDemand(
    @Body() body: {
      company_id: string;
      item_name: string;
      quantity: number;
      estimated_amount: number;
      plan_id?: string;
    },
  ) {
    return this.planningService.submitDemand(body);
  }
}

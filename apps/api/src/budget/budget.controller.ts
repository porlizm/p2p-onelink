import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { BudgetService } from './budget.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@p2p/shared';

@Controller('budget')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Post('request')
  async createRequest(
    @Body() body: { cost_center_id: string; requested_amount: number; reason: string },
    @Req() req: any,
  ) {
    const username = req.user?.username || 'System';
    return this.budgetService.createRequest(body.cost_center_id, body.requested_amount, body.reason, username);
  }

  @Get('requests')
  async getRequests() {
    return this.budgetService.getRequests();
  }

  @Patch('request/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ACCOUNTING, UserRole.ADMIN)
  async approveRequest(@Param('id') id: string) {
    return this.budgetService.approveRequest(id);
  }

  @Patch('request/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ACCOUNTING, UserRole.ADMIN)
  async rejectRequest(@Param('id') id: string) {
    return this.budgetService.rejectRequest(id);
  }

  @Post('transfer')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ACCOUNTING, UserRole.ADMIN)
  async transferBudget(
    @Body() body: { from_cost_center_id: string; to_cost_center_id: string; amount: number },
  ) {
    return this.budgetService.transferBudget(body.from_cost_center_id, body.to_cost_center_id, body.amount);
  }

  @Post('reset')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ACCOUNTING, UserRole.ADMIN)
  async resetBudget() {
    return this.budgetService.resetBudget();
  }

  @Patch('cost-center/:id/tolerance')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ACCOUNTING, UserRole.ADMIN)
  async updateTolerance(
    @Param('id') id: string,
    @Body() body: { budget_overrun_tolerance_pct: number; budget_overrun_tolerance_amount: number },
  ) {
    return this.budgetService.updateTolerance(id, body.budget_overrun_tolerance_pct, body.budget_overrun_tolerance_amount);
  }
}

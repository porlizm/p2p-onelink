import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { BudgetRequest } from '../database/entities/budget-request.entity';
import { CostCenter } from '../database/entities/cost-center.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BudgetRequest, CostCenter])],
  controllers: [BudgetController],
  providers: [BudgetService],
  exports: [BudgetService],
})
export class BudgetModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlanningController } from './planning.controller';
import { PlanningService } from './planning.service';
import { AnnualPlan } from '../database/entities/annual-plan.entity';
import { DemandCollection } from '../database/entities/demand-collection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnnualPlan, DemandCollection])],
  controllers: [PlanningController],
  providers: [PlanningService],
  exports: [PlanningService],
})
export class PlanningModule {}

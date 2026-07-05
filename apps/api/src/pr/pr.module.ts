import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrService } from './pr.service';
import { PrController } from './pr.controller';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';
import { PurchaseRequisitionLine } from '../database/entities/purchase-requisition-line.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { ApprovalModule } from '../approval/approval.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseRequisition,
      PurchaseRequisitionLine,
      CostCenter,
    ]),
    ApprovalModule,
  ],
  providers: [PrService],
  controllers: [PrController],
  exports: [PrService],
})
export class PrModule {}

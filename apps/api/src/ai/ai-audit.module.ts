import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAuditController } from './ai-audit.controller';
import { AiAuditService } from './ai-audit.service';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseRequisition])],
  controllers: [AiAuditController],
  providers: [AiAuditService],
  exports: [AiAuditService],
})
export class AiAuditModule {}

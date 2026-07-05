import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseContract } from '../database/entities/purchase-contract.entity';
import { Vendor } from '../database/entities/vendor.entity';
import { PurchaseOrder } from '../database/entities/purchase-order.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { Notification } from '../database/entities/notification.entity';
import { ContractMilestone } from '../database/entities/contract-milestone.entity';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseContract, Vendor, PurchaseOrder, AuditLog, Notification, ContractMilestone])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}

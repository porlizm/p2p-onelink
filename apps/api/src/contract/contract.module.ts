import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseContract } from '../database/entities/purchase-contract.entity';
import { Vendor } from '../database/entities/vendor.entity';
import { ContractController } from './contract.controller';
import { ContractService } from './contract.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseContract, Vendor])],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}

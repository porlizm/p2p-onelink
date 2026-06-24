import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorService } from './vendor.service';
import { VendorController } from './vendor.controller';
import { Vendor } from '../database/entities/vendor.entity';
import { VendorEvaluation } from '../database/entities/vendor-evaluation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor, VendorEvaluation])],
  providers: [VendorService],
  controllers: [VendorController],
  exports: [VendorService],
})
export class VendorModule {}

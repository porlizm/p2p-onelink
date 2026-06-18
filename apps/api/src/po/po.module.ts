import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoService } from './po.service';
import { PoController } from './po.controller';
import { PurchaseOrder } from '../database/entities/purchase-order.entity';
import { PurchaseOrderLine } from '../database/entities/purchase-order-line.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseOrder,
      PurchaseOrderLine,
    ]),
  ],
  providers: [PoService],
  controllers: [PoController],
  exports: [PoService],
})
export class PoModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { Stock } from '../database/entities/stock.entity';
import { StockMovement } from '../database/entities/stock-movement.entity';
import { ApprovalModule } from '../approval/approval.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Stock, StockMovement]),
    ApprovalModule,
  ],
  providers: [StockService],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}

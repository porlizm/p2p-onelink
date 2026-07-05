import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrService } from './gr.service';
import { GrController } from './gr.controller';
import { GoodsReceipt } from '../database/entities/goods-receipt.entity';
import { GoodsReceiptLine } from '../database/entities/gr-line.entity';
import { GoodsReceiptAttachment } from '../database/entities/gr-attachment.entity';
import { Stock } from '../database/entities/stock.entity';
import { Claim } from '../database/entities/claim.entity';
import { ReturnNote } from '../database/entities/return-note.entity';
import { StockModule } from '../stock/stock.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GoodsReceipt,
      GoodsReceiptLine,
      GoodsReceiptAttachment,
      Stock,
      Claim,
      ReturnNote,
    ]),
    StockModule,
  ],
  providers: [GrService],
  controllers: [GrController],
  exports: [GrService],
})
export class GrModule {}

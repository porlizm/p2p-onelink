import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiddingService } from './bidding.service';
import { BiddingController } from './bidding.controller';
import { BiddingEvent } from '../database/entities/bidding-event.entity';
import { RfqItem } from '../database/entities/rfq-item.entity';
import { RfqVendor } from '../database/entities/rfq-vendor.entity';
import { BidQuotation } from '../database/entities/bid-quotation.entity';
import { BidQuotationLine } from '../database/entities/bid-quotation-line.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { ApprovalModule } from '../approval/approval.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BiddingEvent,
      RfqItem,
      RfqVendor,
      BidQuotation,
      BidQuotationLine,
      CostCenter,
    ]),
    ApprovalModule,
  ],
  providers: [BiddingService],
  controllers: [BiddingController],
  exports: [BiddingService],
})
export class BiddingModule {}

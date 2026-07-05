import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendorMessage } from '../database/entities/vendor-message.entity';
import { Vendor } from '../database/entities/vendor.entity';
import { VendorMessageController } from './vendor-message.controller';
import { VendorMessageService } from './vendor-message.service';

@Module({
  imports: [TypeOrmModule.forFeature([VendorMessage, Vendor])],
  controllers: [VendorMessageController],
  providers: [VendorMessageService],
})
export class VendorMessageModule {}

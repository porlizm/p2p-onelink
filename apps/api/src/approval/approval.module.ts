import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApprovalService } from './approval.service';
import { ApprovalController } from './approval.controller';
import { ApprovalTask } from '../database/entities/approval-task.entity';
import { ApprovalDelegation } from '../database/entities/approval-delegation.entity';
import { DOARule } from '../database/entities/doa-rule.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApprovalTask, ApprovalDelegation, DOARule]),
    NotificationModule,
  ],
  providers: [ApprovalService],
  controllers: [ApprovalController],
  exports: [ApprovalService],
})
export class ApprovalModule {}

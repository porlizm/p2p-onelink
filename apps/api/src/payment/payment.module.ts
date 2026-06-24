import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { PaymentRequest } from '../database/entities/payment-request.entity';
import { PaymentProposal } from '../database/entities/payment-proposal.entity';
import { BankFile } from '../database/entities/bank-file.entity';
import { Lane } from '../database/entities/lane.entity';
import { Invoice } from '../database/entities/invoice.entity';
import { CostCenter } from '../database/entities/cost-center.entity';
import { IntegrationLog } from '../database/entities/integration-log.entity';
import { PurchaseRequisition } from '../database/entities/purchase-requisition.entity';
import { BusinessUnit } from '../database/entities/business-unit.entity';
import { CreditDebitNote } from '../database/entities/credit-debit-note.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentRequest,
      PaymentProposal,
      BankFile,
      Lane,
      Invoice,
      CostCenter,
      IntegrationLog,
      PurchaseRequisition,
      BusinessUnit,
      CreditDebitNote,
    ]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}

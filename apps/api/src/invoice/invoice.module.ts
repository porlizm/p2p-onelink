import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceService } from './invoice.service';
import { OcrService } from './ocr.service';
import { InvoiceController } from './invoice.controller';
import { Invoice } from '../database/entities/invoice.entity';
import { InvoiceLine } from '../database/entities/invoice-line.entity';
import { InvoiceAttachment } from '../database/entities/invoice-attachment.entity';
import { CreditDebitNote } from '../database/entities/credit-debit-note.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      InvoiceLine,
      InvoiceAttachment,
      CreditDebitNote,
    ]),
  ],
  providers: [InvoiceService, OcrService],
  controllers: [InvoiceController],
  exports: [InvoiceService, OcrService],
})
export class InvoiceModule {}

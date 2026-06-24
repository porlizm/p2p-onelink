import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Invoice } from '../database/entities/invoice.entity';
import { InvoiceLine } from '../database/entities/invoice-line.entity';
import { InvoiceAttachment } from '../database/entities/invoice-attachment.entity';
import { PurchaseOrder } from '../database/entities/purchase-order.entity';
import { GoodsReceipt } from '../database/entities/goods-receipt.entity';
import { CreateInvoiceDto } from './dto/invoice.dto';
import { InvoiceStatus } from '@p2p/shared';

@Injectable()
export class InvoiceService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
  ) {}

  async createInvoice(dto: CreateInvoiceDto, userId: string) {
    return await this.dataSource.transaction(async (manager) => {
      // 1. Duplicate Detection Key
      const normalizedNo = dto.invoice_no.trim().toLowerCase();
      const dupCheckKey = `${normalizedNo}_${dto.vendor_id}_${dto.total_amount}`;

      // Check if duplicate check key already exists
      const existing = await manager.getRepository(Invoice).findOne({
        where: { dup_check_key: dupCheckKey },
      });

      if (existing) {
        // According to requirements, duplicate invoice is recorded as DuplicateRejected
        const invoice = manager.getRepository(Invoice).create({
          invoice_no: dto.invoice_no,
          vendor_id: dto.vendor_id,
          po_id: dto.po_id || null,
          gr_id: dto.gr_id || null,
          company_id: '00000001-0000-0000-0000-000000000001', // default company
          invoice_type: dto.invoice_type,
          invoice_date: new Date(dto.invoice_date),
          due_date: new Date(dto.due_date),
          match_type: dto.gr_id ? '3Way' : (dto.po_id ? '2Way' : 'None'),
          match_status: 'Mismatch',
          vat_amount: dto.vat_amount || 0,
          wht_amount: dto.wht_amount || 0,
          gl_account_code: dto.gl_account_code || null,
          cost_center_id: dto.cost_center_id || null,
          project_code: dto.project_code || null,
          total_amount: dto.total_amount,
          dup_check_key: `${dupCheckKey}_rejected_${Date.now()}`, // append timestamp to bypass DB unique constraint on rejected ones
          status: InvoiceStatus.DUPLICATE_REJECTED,
          created_via: 'KeyIn',
        });
        const saved = await manager.getRepository(Invoice).save(invoice);
        throw new BadRequestException('ตรวจพบเอกสารวางบิลซ้ำซ้อนในระบบ ใบแจ้งหนี้ถูกปฏิเสธโดยอัตโนมัติ');
      }

      // 2. Create Invoice
      const invoice = manager.getRepository(Invoice).create({
        invoice_no: dto.invoice_no,
        vendor_id: dto.vendor_id,
        po_id: dto.po_id || null,
        gr_id: dto.gr_id || null,
        company_id: '00000001-0000-0000-0000-000000000001',
        invoice_type: dto.invoice_type,
        invoice_date: new Date(dto.invoice_date),
        due_date: new Date(dto.due_date),
        match_type: dto.gr_id ? '3Way' : (dto.po_id ? '2Way' : 'None'),
        match_status: 'Pending',
        vat_amount: dto.vat_amount || 0,
        wht_amount: dto.wht_amount || 0,
        gl_account_code: dto.gl_account_code || null,
        cost_center_id: dto.cost_center_id || null,
        project_code: dto.project_code || null,
        total_amount: dto.total_amount,
        dup_check_key: dupCheckKey,
        status: InvoiceStatus.CREATED,
        created_via: 'KeyIn',
      });

      const savedInvoice = await manager.getRepository(Invoice).save(invoice);

      // Create lines
      const invoiceLines = dto.lines.map((line) =>
        manager.getRepository(InvoiceLine).create({
          invoice_id: savedInvoice.invoice_id,
          po_line_id: line.po_line_id || null,
          item_id: line.item_id,
          qty: Number(line.qty),
          unit_price: Number(line.unit_price),
          line_total: Number(line.qty) * Number(line.unit_price),
          expense_code: line.expense_code || null,
          cost_center_id: line.cost_center_id || dto.cost_center_id || null,
        })
      );
      await manager.getRepository(InvoiceLine).save(invoiceLines);

      // Create attachments
      if (dto.attachments && dto.attachments.length > 0) {
        const invAtts = dto.attachments.map((att) =>
          manager.getRepository(InvoiceAttachment).create({
            invoice_id: savedInvoice.invoice_id,
            file_url: att.file_url,
            document_type: att.document_type,
          })
        );
        await manager.getRepository(InvoiceAttachment).save(invAtts);
      }

      // Run matching engine synchronously
      if (savedInvoice.po_id) {
        // Let's run matching engine
        await this.runMatchingEngineTx(savedInvoice.invoice_id, manager);
      } else {
        // Non-PO auto matches
        savedInvoice.match_status = 'Matched';
        savedInvoice.status = InvoiceStatus.READY_FOR_PAYMENT;
        await manager.getRepository(Invoice).save(savedInvoice);
      }

      return await manager.getRepository(Invoice).findOne({
        where: { invoice_id: savedInvoice.invoice_id },
        relations: ['lines', 'attachments'],
      });
    });
  }

  async findAll(userId: string) {
    return await this.invoiceRepo.find({
      relations: ['vendor', 'po', 'gr', 'cost_center'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(invoiceId: string) {
    const invoice = await this.invoiceRepo.findOne({
      where: { invoice_id: invoiceId },
      relations: ['vendor', 'po', 'gr', 'cost_center', 'lines', 'lines.item', 'lines.po_line', 'attachments', 'credit_debit_notes'],
    });

    if (!invoice) {
      throw new NotFoundException('ไม่พบเอกสาร Invoice');
    }

    return invoice;
  }

  async runMatchingEngine(invoiceId: string) {
    return await this.dataSource.transaction(async (manager) => {
      return await this.runMatchingEngineTx(invoiceId, manager);
    });
  }

  private async runMatchingEngineTx(invoiceId: string, manager: any) {
    const invoice = await manager.getRepository(Invoice).findOne({
      where: { invoice_id: invoiceId },
      relations: ['lines', 'po', 'po.lines', 'gr', 'gr.lines'],
    });

    if (!invoice) {
      throw new NotFoundException('ไม่พบเอกสาร Invoice');
    }

    if (!invoice.po_id) {
      invoice.match_status = 'Matched';
      invoice.status = InvoiceStatus.READY_FOR_PAYMENT;
      return await manager.getRepository(Invoice).save(invoice);
    }

    invoice.status = InvoiceStatus.MATCHING;
    await manager.getRepository(Invoice).save(invoice);

    const po = invoice.po;
    const gr = invoice.gr;
    const tolerance = 5.0; // 5% tolerance
    let isMatched = true;

    for (const invLine of invoice.lines) {
      // Find PO Line
      const poLine = po.lines.find(
        (l: any) => l.po_line_id === invLine.po_line_id || l.item_id === invLine.item_id
      );

      if (!poLine) {
        isMatched = false;
        continue;
      }

      // 1. Price Matching (Invoice Price vs PO Price)
      const priceDiffPercent = (Math.abs(Number(invLine.unit_price) - Number(poLine.unit_price)) / Number(poLine.unit_price)) * 100;
      if (priceDiffPercent > tolerance) {
        isMatched = false;
      }

      // 2. Quantity Matching
      if (invoice.match_type === '3Way' && gr) {
        // 3-Way Match (Invoice Qty vs GR Qty)
        const grLine = gr.lines.find(
          (l: any) => l.po_line_id === poLine.po_line_id || l.item_id === invLine.item_id
        );
        if (!grLine) {
          isMatched = false;
        } else {
          const qtyDiffPercent = (Math.abs(Number(invLine.qty) - Number(grLine.qty_received)) / Number(grLine.qty_received)) * 100;
          if (qtyDiffPercent > tolerance) {
            isMatched = false;
          }
        }
      } else {
        // 2-Way Match (Invoice Qty vs PO Qty)
        const qtyDiffPercent = (Math.abs(Number(invLine.qty) - Number(poLine.quantity)) / Number(poLine.quantity)) * 100;
        if (qtyDiffPercent > tolerance) {
          isMatched = false;
        }
      }
    }

    // 3. Update Match Status
    if (isMatched) {
      invoice.match_status = 'Matched';
      invoice.status = InvoiceStatus.READY_FOR_PAYMENT; // automatically goes to Matched -> GLAllocated -> ReadyForPayment
    } else {
      invoice.match_status = 'Mismatch';
      invoice.status = InvoiceStatus.MISMATCH_EXCEPTION;
    }

    return await manager.getRepository(Invoice).save(invoice);
  }
}

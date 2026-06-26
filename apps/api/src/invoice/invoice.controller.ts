import { Controller, Post, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { OcrService } from './ocr.service';
import { CreateInvoiceDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoice')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly ocrService: OcrService,
  ) {}

  @Post('upload')
  async uploadInvoiceForOcr(@Body() body: { file_url: string }) {
    return this.ocrService.extractInvoiceData(body.file_url || 'mock-invoice-file.pdf');
  }

  @Post()
  async createInvoice(@Body() dto: CreateInvoiceDto, @Req() req: any) {
    const { userId } = req.user;
    return this.invoiceService.createInvoice(dto, userId);
  }

  @Get()
  async findAll(@Req() req: any) {
    const { userId } = req.user;
    return this.invoiceService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoiceService.findOne(id);
  }

  @Post(':id/match')
  async matchInvoice(@Param('id') id: string) {
    return this.invoiceService.runMatchingEngine(id);
  }
}

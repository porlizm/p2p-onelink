import { IsString, IsUUID, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceLineDto {
  @IsUUID()
  @IsOptional()
  po_line_id?: string;

  @IsUUID()
  item_id: string;

  @IsNumber()
  qty: number;

  @IsNumber()
  unit_price: number;

  @IsString()
  @IsOptional()
  expense_code?: string;

  @IsUUID()
  @IsOptional()
  cost_center_id?: string;
}

export class CreateInvoiceAttachmentDto {
  @IsString()
  file_url: string;

  @IsString()
  document_type: string;
}

export class CreateInvoiceDto {
  @IsString()
  invoice_no: string;

  @IsUUID()
  vendor_id: string;

  @IsUUID()
  @IsOptional()
  po_id?: string;

  @IsUUID()
  @IsOptional()
  gr_id?: string;

  @IsString()
  invoice_type: string; // Domestic, Foreign, PO, NonPO

  @IsString()
  invoice_date: string;

  @IsString()
  due_date: string;

  @IsNumber()
  @IsOptional()
  vat_amount?: number;

  @IsNumber()
  @IsOptional()
  wht_amount?: number;

  @IsString()
  @IsOptional()
  gl_account_code?: string;

  @IsUUID()
  @IsOptional()
  cost_center_id?: string;

  @IsString()
  @IsOptional()
  project_code?: string;

  @IsNumber()
  total_amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineDto)
  lines: CreateInvoiceLineDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceAttachmentDto)
  attachments?: CreateInvoiceAttachmentDto[];
}

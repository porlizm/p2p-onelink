import { IsString, IsUUID, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGrLineDto {
  @IsUUID()
  @IsOptional()
  po_line_id?: string;

  @IsString()
  @IsOptional()
  item_id?: string;

  @IsString()
  @IsOptional()
  item_name?: string;

  @IsNumber()
  qty_received: number;

  @IsBoolean()
  @IsOptional()
  over_receipt_approved?: boolean;

  @IsString()
  @IsOptional()
  lot_no?: string;

  @IsString()
  @IsOptional()
  serial_no?: string;

  @IsString()
  @IsOptional()
  expiry_date?: string;

  @IsString()
  @IsOptional()
  bin_location?: string;
}

export class CreateGrAttachmentDto {
  @IsString()
  file_url: string;

  @IsString()
  file_type: string;
}

export class CreateGrDto {
  @IsUUID()
  @IsOptional()
  po_id?: string;

  @IsString()
  receive_type: string;

  @IsString()
  receive_date: string;

  @IsNumber()
  @IsOptional()
  quality_score?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGrLineDto)
  lines: CreateGrLineDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateGrAttachmentDto)
  attachments?: CreateGrAttachmentDto[];
}

export class CreateClaimDto {
  @IsString()
  claim_type: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsOptional()
  return_qty?: number;

  @IsString()
  @IsOptional()
  return_reason?: string;
}

export class MatchGrLineDto {
  @IsUUID()
  gr_line_id: string;

  @IsUUID()
  po_line_id: string;
}

export class MatchGrToPoDto {
  @IsUUID()
  po_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchGrLineDto)
  lines: MatchGrLineDto[];
}

export class QcLineDecisionDto {
  @IsUUID()
  gr_line_id: string;

  @IsNumber()
  qc_passed_qty: number;

  @IsNumber()
  qc_failed_qty: number;

  @IsString()
  @IsOptional()
  qc_remarks?: string;
}

export class QcDecisionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QcLineDecisionDto)
  lines: QcLineDecisionDto[];
}

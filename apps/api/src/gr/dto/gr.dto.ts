import { IsString, IsUUID, IsNumber, IsBoolean, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGrLineDto {
  @IsUUID()
  po_line_id: string;

  @IsNumber()
  qty_received: number;

  @IsNumber()
  @IsOptional()
  qc_passed_qty?: number;

  @IsNumber()
  @IsOptional()
  qc_failed_qty?: number;

  @IsString()
  @IsOptional()
  qc_status?: string;

  @IsString()
  @IsOptional()
  bin_location?: string;

  @IsString()
  @IsOptional()
  qc_remarks?: string;
}

export class CreateGrAttachmentDto {
  @IsString()
  file_url: string;

  @IsString()
  file_type: string;
}

export class CreateGrDto {
  @IsUUID()
  po_id: string;

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

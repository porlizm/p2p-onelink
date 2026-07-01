import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class ConvertPrToPoDto {
  @IsString()
  @IsOptional()
  vendor_id?: string;

  @IsString()
  @IsOptional()
  delivery_date?: string;

  @IsString()
  @IsOptional()
  payment_terms?: string;
}

export class ConfirmPoDto {
  @IsDateString()
  @IsNotEmpty()
  estimated_delivery_date: string;
}

export class RequestRevisionDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class RevisePoLineDto {
  @IsString()
  @IsNotEmpty()
  po_line_id: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;
}

export class RevisePoDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RevisePoLineDto)
  lines: RevisePoLineDto[];
}

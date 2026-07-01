import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';


export class SubmitQuoteLineDto {
  @IsString()
  @IsNotEmpty()
  rfq_item_id: string;

  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  delivery_days?: number;

  @IsString()
  @IsOptional()
  quotation_url?: string;

  @IsString()
  @IsOptional()
  vendor_remarks?: string;
}

export class SubmitQuoteDto {
  @IsString()
  @IsNotEmpty()
  rfq_id: string;

  @IsString()
  @IsOptional()
  vendor_id?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmitQuoteLineDto)
  lines: SubmitQuoteLineDto[];
}

import { IsString, IsNotEmpty, IsEmail, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VendorContactDto {
  @IsString()
  @IsNotEmpty()
  contact_name: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  email: string;
}

class VendorAddressDto {
  @IsString()
  @IsNotEmpty()
  address_line1: string;

  @IsString()
  @IsOptional()
  address_line2?: string;

  @IsString()
  @IsNotEmpty()
  subdistrict: string;

  @IsString()
  @IsNotEmpty()
  district: string;

  @IsString()
  @IsNotEmpty()
  province: string;

  @IsString()
  @IsNotEmpty()
  postal_code: string;
}

class VendorBankDto {
  @IsString()
  @IsNotEmpty()
  bank_name: string;

  @IsString()
  @IsOptional()
  bank_branch?: string;

  @IsString()
  @IsNotEmpty()
  account_no: string;

  @IsString()
  @IsNotEmpty()
  account_name: string;
}

class VendorDocumentDto {
  @IsString()
  @IsNotEmpty()
  document_type: string;

  @IsString()
  @IsNotEmpty()
  file_url: string;

  @IsString()
  @IsOptional()
  expiry_date?: string;
}

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  tax_id: string;

  @IsString()
  @IsNotEmpty()
  vendor_name: string;

  @IsString()
  @IsNotEmpty()
  vendor_type: string;

  @IsString()
  @IsOptional()
  business_category?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorContactDto)
  contacts: VendorContactDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorAddressDto)
  addresses: VendorAddressDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorBankDto)
  bank_accounts: VendorBankDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VendorDocumentDto)
  documents: VendorDocumentDto[];
}

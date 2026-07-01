import { Controller, Get, Post, Body, Param, Ip, Query } from '@nestjs/common';
import { ContractService } from './contract.service';

@Controller()
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post('contract')
  async createContract(
    @Body() body: {
      vendor_id: string;
      title: string;
      start_date: string;
      end_date: string;
      total_amount: number;
      document_url?: string;
    },
  ) {
    return this.contractService.createContract(body);
  }

  @Get('contract')
  async getContracts() {
    return this.contractService.getContracts();
  }

  @Get('contract/vendor/:vendorId')
  async getContractsByVendor(@Param('vendorId') vendorId: string) {
    return this.contractService.getContractsByVendor(vendorId);
  }

  @Post('contract/:id/sign')
  async signContract(
    @Param('id') id: string,
    @Body() body: { role: 'buyer' | 'vendor'; name: string; ip?: string },
    @Ip() clientIp: string,
  ) {
    const ip = body.ip || clientIp || '127.0.0.1';
    return this.contractService.signContract(id, {
      role: body.role,
      name: body.name,
      ip,
    });
  }

  @Post('contract/:id/submit-approval')
  async submitApproval(@Param('id') id: string) {
    return this.contractService.submitApproval(id);
  }

  @Post('contract/:id/approve')
  async approveContract(@Param('id') id: string) {
    return this.contractService.approveContract(id);
  }

  @Post('contract/:id/reject')
  async rejectContract(@Param('id') id: string) {
    return this.contractService.rejectContract(id);
  }

  @Post('contract/:id/amend')
  async amendContract(
    @Param('id') id: string,
    @Body() body: {
      title: string;
      start_date: string;
      end_date: string;
      total_amount: number;
      contract_type?: string;
      contract_period?: string;
      resources?: any[];
      rental_details?: any;
      warranty_details?: any;
    },
  ) {
    return this.contractService.amendContract(id, body);
  }

  @Post('contract/check-expirations')
  async checkExpirations(@Query('simulateDays') simulateDays?: string) {
    const days = simulateDays ? Number(simulateDays) : undefined;
    return this.contractService.checkContractExpirations(days);
  }
}

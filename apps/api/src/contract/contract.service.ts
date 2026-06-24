import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseContract } from '../database/entities/purchase-contract.entity';
import { Vendor } from '../database/entities/vendor.entity';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(PurchaseContract)
    private readonly contractRepo: Repository<PurchaseContract>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  async createContract(body: {
    vendor_id: string;
    title: string;
    start_date: string;
    end_date: string;
    total_amount: number;
    document_url?: string;
  }) {
    const vendor = await this.vendorRepo.findOne({ where: { vendor_id: body.vendor_id } });
    if (!vendor) throw new NotFoundException('Vendor not found');

    const contractNo = `CNT-2026-${Math.floor(Math.random() * 9000) + 1000}`;
    const contract = this.contractRepo.create({
      contract_no: contractNo,
      vendor_id: body.vendor_id,
      title: body.title,
      start_date: new Date(body.start_date),
      end_date: new Date(body.end_date),
      total_amount: body.total_amount,
      remaining_amount: body.total_amount,
      status: 'PendingSignature',
      document_url: body.document_url || `/uploads/documents/contract_template.pdf`,
      signatures: {},
    });

    return this.contractRepo.save(contract);
  }

  async getContracts() {
    return this.contractRepo.find({
      relations: ['vendor'],
      order: { created_at: 'DESC' },
    });
  }

  async getContractsByVendor(vendorId: string) {
    return this.contractRepo.find({
      where: { vendor_id: vendorId },
      relations: ['vendor'],
      order: { created_at: 'DESC' },
    });
  }

  async signContract(
    id: string,
    signatory: { role: 'buyer' | 'vendor'; ip: string; name: string },
  ) {
    const contract = await this.contractRepo.findOne({ where: { contract_id: id } });
    if (!contract) throw new NotFoundException('Contract not found');

    if (contract.status === 'Signed') {
      throw new BadRequestException('Contract is already fully signed');
    }

    const signatures = contract.signatures || {};
    if (signatory.role === 'buyer') {
      signatures.buyer = {
        signed_at: new Date().toISOString(),
        ip: signatory.ip,
        name: signatory.name,
      };
    } else {
      signatures.vendor = {
        signed_at: new Date().toISOString(),
        ip: signatory.ip,
        name: signatory.name,
      };
    }

    contract.signatures = signatures;

    // If both signed, move to 'Signed' status
    if (signatures.buyer && signatures.vendor) {
      contract.status = 'Signed';
    } else {
      contract.status = 'PendingSignature';
    }

    return this.contractRepo.save(contract);
  }
}

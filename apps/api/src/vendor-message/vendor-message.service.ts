import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VendorMessage } from '../database/entities/vendor-message.entity';
import { Vendor } from '../database/entities/vendor.entity';

@Injectable()
export class VendorMessageService {
  constructor(
    @InjectRepository(VendorMessage)
    private readonly repo: Repository<VendorMessage>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
  ) {}

  async getThreads() {
    const vendors = await this.vendorRepo.find();
    const messages = await this.repo.find({ order: { created_at: 'DESC' } });

    return vendors
      .map((v) => {
        const vendorMessages = messages.filter((m) => m.vendor_id === v.vendor_id);
        const lastMessage = vendorMessages[0] || null;
        const unreadCount = vendorMessages.filter((m) => !m.read_flag && m.sender_role === 'Vendor').length;
        return {
          vendor_id: v.vendor_id,
          vendor_name: v.vendor_name,
          last_message: lastMessage?.body || null,
          last_message_at: lastMessage?.created_at || null,
          unread_count: unreadCount,
        };
      })
      .filter((t) => t.last_message !== null)
      .sort((a, b) => new Date(b.last_message_at!).getTime() - new Date(a.last_message_at!).getTime());
  }

  async getMessages(vendorId: string) {
    return this.repo.find({
      where: { vendor_id: vendorId },
      order: { created_at: 'ASC' },
    });
  }

  async sendMessage(body: { vendor_id: string; sender_role: 'Buyer' | 'Vendor'; sender_name: string; subject?: string; body: string }) {
    const vendor = await this.vendorRepo.findOne({ where: { vendor_id: body.vendor_id } });
    if (!vendor) throw new NotFoundException('ไม่พบคู่ค้าที่ระบุ');

    const message = this.repo.create({
      vendor_id: body.vendor_id,
      sender_role: body.sender_role,
      sender_name: body.sender_name,
      subject: body.subject || null,
      body: body.body,
      read_flag: false,
    });
    return this.repo.save(message);
  }

  async markRead(vendorId: string, readerRole: 'Buyer' | 'Vendor') {
    const oppositeRole = readerRole === 'Buyer' ? 'Vendor' : 'Buyer';
    await this.repo.update({ vendor_id: vendorId, sender_role: oppositeRole, read_flag: false }, { read_flag: true });
    return { success: true };
  }
}

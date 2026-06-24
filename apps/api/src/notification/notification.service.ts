import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../database/entities/notification.entity';
import { AppUser } from '../database/entities/app-user.entity';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepo: Repository<Notification>,
    @InjectRepository(AppUser)
    private userRepo: Repository<AppUser>,
  ) {}

  async createNotification(recipientUserId: string, channel: string, event: string, message: string) {
    const notif = this.notificationRepo.create({
      recipient_user_id: recipientUserId,
      channel,
      trigger_event: event,
      message,
      read_flag: false,
    });
    return await this.notificationRepo.save(notif);
  }

  async checkUnreadNotifications() {
    // Query all unread notifications with trigger_event = 'BiddingAwarded'
    const unreadNotifications = await this.notificationRepo.find({
      where: {
        read_flag: false,
        trigger_event: 'BiddingAwarded',
      },
    });

    const emailedVendors = [];
    const loggedEmails = [];

    for (const notif of unreadNotifications) {
      const user = await this.userRepo.findOne({ where: { user_id: notif.recipient_user_id } });
      const email = user?.email || 'vendor@example.com';
      const vendorName = user?.username || 'Vendor';

      emailedVendors.push({
        notification_id: notif.notification_id,
        recipient_user_id: notif.recipient_user_id,
        email,
        message: notif.message,
      });

      const emailLog = `[EMAIL SENT] To: ${email} | Subject: แจ้งเตือน: กรุณาลงนามและอัปโหลดเอกสารใบสั่งซื้อ (PO) | Body: สวัสดีคุณ ${vendorName}, คุณมีใบสั่งซื้อรอการอัปโหลด กรุณาเข้าสู่ระบบ e-Procurement Portal เพื่อดำเนินการ.`;
      console.log(emailLog);
      loggedEmails.push(emailLog);
    }

    return {
      success: true,
      processed_count: unreadNotifications.length,
      emailed_vendors: emailedVendors,
      logged_emails: loggedEmails,
    };
  }

  async getNotifications(userId: string) {
    return await this.notificationRepo.find({
      where: { recipient_user_id: userId },
      order: { created_at: 'DESC' },
    });
  }

  async markAsRead(notificationId: string) {
    const notif = await this.notificationRepo.findOne({ where: { notification_id: notificationId } });
    if (notif) {
      notif.read_flag = true;
      await this.notificationRepo.save(notif);
    }
    return { success: true };
  }
}

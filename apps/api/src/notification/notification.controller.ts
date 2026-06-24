import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('vendor-notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('check-unread')
  async checkUnread() {
    return this.notificationService.checkUnreadNotifications();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyNotifications(@Req() req: any) {
    const { userId } = req.user;
    return this.notificationService.getNotifications(userId);
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  async markRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }
}

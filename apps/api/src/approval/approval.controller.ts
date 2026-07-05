import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApprovalService } from './approval.service';
import { DecideTaskDto } from './dto/decide-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('approval')
@UseGuards(JwtAuthGuard)
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get('my-tasks')
  async myTasks(@Req() req: any) {
    const { roles, role } = req.user;
    return this.approvalService.getMyTasks(roles && roles.length ? roles : [role]);
  }

  @Get('document/:documentType/:documentId')
  async forDocument(@Param('documentType') documentType: string, @Param('documentId') documentId: string) {
    return this.approvalService.getTasksForDocument(documentType, documentId);
  }

  @Post('tasks/:id/decide')
  async decide(@Param('id') id: string, @Body() dto: DecideTaskDto, @Req() req: any) {
    const { userId, roles, role } = req.user;
    return this.approvalService.decide(id, userId, roles && roles.length ? roles : [role], dto.decision, dto.reason);
  }

  @Post('check-escalations')
  async checkEscalations() {
    return this.approvalService.checkEscalations();
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { AiAuditService } from './ai-audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiAuditController {
  constructor(private readonly aiAuditService: AiAuditService) {}

  @Get('audit-split')
  async auditSplitPurchases() {
    return this.aiAuditService.detectSplitPurchases();
  }
}

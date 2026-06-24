import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CatalogSubmissionService } from './catalog-submission.service';

@Controller('api')
export class CatalogSubmissionController {
  constructor(private readonly catalogService: CatalogSubmissionService) {}

  @Post('catalog-submission/upload')
  async uploadCatalog(
    @Body() body: {
      vendor_id: string;
      items: Array<{
        item_name: string;
        item_type: string;
        uom: string;
        unit_price: number;
      }>;
    },
  ) {
    return this.catalogService.uploadCatalog(body.vendor_id, body.items);
  }

  @Get('catalog-submission')
  async getSubmissions() {
    return this.catalogService.getSubmissions();
  }

  @Post('catalog-submission/:id/review')
  async reviewSubmission(
    @Param('id') id: string,
    @Body() body: { action: 'Approved' | 'Rejected'; user_id: string },
  ) {
    return this.catalogService.reviewSubmission(id, body.action, body.user_id);
  }
}

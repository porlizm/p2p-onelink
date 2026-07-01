import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller()
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // 1. Create Payment Request
  @Post('payment/request')
  async createPaymentRequest(
    @Body() body: { 
      invoice_id: string; 
      due_date: string; 
      lane_id?: string; 
      created_by: string;
      alternative_payee_name?: string;
      alternative_payee_bank?: string;
      alternative_payee_account?: string;
      currency?: string;
      fx_rate?: number;
      swift_code?: string;
      intermediary_bank_details?: string;
    },
  ) {
    return this.paymentService.createPaymentRequest(body);
  }

  // 2. Fetch all payment requests
  @Get('payment/request')
  async getPaymentRequests() {
    return this.paymentService.getPaymentRequests();
  }

  // 2.1 Fetch single payment request
  @Get('payment/request/:id')
  async getPaymentRequestById(@Param('id') id: string) {
    return this.paymentService.getPaymentRequestById(id);
  }

  // 3. Update status (SoD step)
  @Patch('payment/request/:id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.paymentService.updateStatus(id, status);
  }

  // 4. Create Proposal
  @Post('payment/proposal')
  async createProposal(@Body() body: { request_ids: string[] }) {
    return this.paymentService.createProposal(body);
  }

  // 4.1 Fetch proposals
  @Get('payment/proposal')
  async getProposals() {
    return this.paymentService.getProposals();
  }

  // 4.2 Approve Proposal (Finance Manager)
  @Patch('payment/proposal/:id/approve')
  async approveProposal(@Param('id') id: string) {
    return this.paymentService.approveProposal(id);
  }

  // 5. Generate Bank File
  @Post('payment/proposal/:id/generate-bank-file')
  async generateBankFile(@Param('id') id: string) {
    return this.paymentService.generateBankFile(id);
  }

  // 5.1 Fetch generated bank files
  @Get('payment/bank-files')
  async getBankFiles() {
    return this.paymentService.getBankFiles();
  }

  // 6. Lanes
  @Get('payment/lanes')
  async getLanes() {
    return this.paymentService.getLanes();
  }

  // 7. Assign Lane
  @Patch('payment/request/:id/assign-lane')
  async assignLane(@Param('id') id: string, @Body('lane_id') laneId: string) {
    return this.paymentService.assignLane(id, laneId);
  }

  // 8. Dashboard KPIs & Charts
  @Get('dashboard/kpis')
  async getDashboardKpis() {
    return this.paymentService.getDashboardKpis();
  }

  // 9. Integration Logs
  @Get('integration-log')
  async getIntegrationLogs() {
    return this.paymentService.getIntegrationLogs();
  }

  // 10. Retry Integration
  @Post('integration-log/:id/retry')
  async retryIntegration(@Param('id') id: string) {
    return this.paymentService.retryIntegration(id);
  }

  // 11. Create Credit/Debit Note
  @Post('payment/credit-debit-note')
  async createCreditDebitNote(
    @Body() body: { invoice_id: string; type: string; amount: number; reason: string },
  ) {
    return this.paymentService.createCreditDebitNote(body);
  }

  // 11.1 Fetch Credit/Debit Notes by Invoice ID
  @Get('payment/credit-debit-note/:invoiceId')
  async getCreditDebitNotesByInvoice(@Param('invoiceId') invoiceId: string) {
    return this.paymentService.getCreditDebitNotesByInvoice(invoiceId);
  }

  // 11.2 Approve Credit/Debit Note
  @Post('payment/credit-debit-note/:id/approve')
  async approveCreditDebitNote(@Param('id') id: string) {
    return this.paymentService.approveCreditDebitNote(id);
  }

  // 12. Hold Payment Request
  @Patch('payment/request/:id/hold')
  async holdPayment(@Param('id') id: string) {
    return this.paymentService.holdPayment(id);
  }

  // 13. Unhold Payment Request
  @Patch('payment/request/:id/unhold')
  async unholdPayment(@Param('id') id: string) {
    return this.paymentService.unholdPayment(id);
  }

  // 14. Reverse Payment Request
  @Post('payment/request/:id/reverse')
  async reversePayment(@Param('id') id: string) {
    return this.paymentService.reversePayment(id);
  }

  // 15. Trigger External Payment
  @Post('payment/trigger')
  async triggerPayment(
    @Body() body: { po_id: string; milestone_id?: string; selected_cn_ids?: string[] },
  ) {
    return this.paymentService.triggerPayment(body.po_id, body.milestone_id, body.selected_cn_ids);
  }

  // 16. Payment callback webhook
  @Post('payment/callback')
  async paymentCallback(
    @Body() body: { po_no: string; status: 'Success' | 'Failed'; error_code?: string; error_message?: string },
  ) {
    return this.paymentService.paymentCallback(body.po_no, body.status, body.error_code, body.error_message);
  }
}

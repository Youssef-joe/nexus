import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  async createPaymentIntent(
    @Body() body: { projectId: string },
    @Request() req
  ) {
    return this.paymentsService.createPaymentIntent(
      body.projectId,
      req.user.id
    );
  }

  @Post('confirm-payment')
  async confirmPayment(@Body() body: { paymentIntentId: string }) {
    return this.paymentsService.confirmPayment(body.paymentIntentId);
  }

  @Post('create-payout')
  async createPayout(
    @Body() body: { professionalId: string; amount: number; projectId: string },
    @Request() req
  ) {
    // Only organizations can create payouts
    if (req.user.role !== 'organization') {
      throw new Error('Unauthorized');
    }
    
    return this.paymentsService.createPayout(
      body.professionalId,
      body.amount,
      body.projectId
    );
  }

  @Get('history')
  async getPaymentHistory(@Request() req) {
    return this.paymentsService.getPaymentHistory(req.user.id, req.user.role);
  }

  @Post('setup-payout-account')
  async setupPayoutAccount(@Request() req) {
    return this.paymentsService.createConnectedAccount(
      req.user.id,
      req.user.email
    );
  }
}
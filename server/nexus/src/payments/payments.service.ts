import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { Payment, PaymentDocument } from '../schemas/payment.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-12-18.acacia',
    });
  }

  async createPaymentIntent(projectId: string, organizationId: string) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.organizationId.toString() !== organizationId) {
      throw new Error('Unauthorized');
    }

    // Calculate platform fee (5% of project budget)
    const platformFee = Math.round(project.budget * 0.05 * 100); // Convert to cents
    const amount = Math.round(project.budget * 100); // Convert to cents

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      application_fee_amount: platformFee,
      metadata: {
        projectId: projectId,
        organizationId: organizationId,
      },
    });

    // Save payment record
    const payment = new this.paymentModel({
      projectId,
      organizationId,
      amount: project.budget,
      platformFee: platformFee / 100,
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
    });

    await payment.save();

    return {
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    };
  }

  async confirmPayment(paymentIntentId: string) {
    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    
    const payment = await this.paymentModel.findOne({
      stripePaymentIntentId: paymentIntentId,
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (paymentIntent.status === 'succeeded') {
      payment.status = 'completed';
      payment.completedAt = new Date();
      await payment.save();

      // Update project status to funded
      await this.projectModel.findByIdAndUpdate(payment.projectId, {
        status: 'funded',
        fundedAt: new Date(),
      });

      return { success: true, payment };
    }

    return { success: false, status: paymentIntent.status };
  }

  async createPayout(professionalId: string, amount: number, projectId: string) {
    const professional = await this.userModel.findById(professionalId);
    if (!professional || !professional.stripeAccountId) {
      throw new Error('Professional Stripe account not found');
    }

    const transfer = await this.stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: professional.stripeAccountId,
      metadata: {
        projectId,
        professionalId,
      },
    });

    // Record payout
    const payout = new this.paymentModel({
      projectId,
      professionalId,
      amount,
      type: 'payout',
      stripeTransferId: transfer.id,
      status: 'completed',
      completedAt: new Date(),
    });

    await payout.save();

    return payout;
  }

  async getPaymentHistory(userId: string, role: string) {
    const filter: any = {};
    
    if (role === 'organization') {
      filter.organizationId = userId;
    } else if (role === 'professional') {
      filter.professionalId = userId;
    }

    return this.paymentModel
      .find(filter)
      .populate('projectId', 'title')
      .populate('organizationId', 'firstName lastName companyName')
      .populate('professionalId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async createConnectedAccount(userId: string, email: string) {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Update user with Stripe account ID
    await this.userModel.findByIdAndUpdate(userId, {
      stripeAccountId: account.id,
    });

    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${this.configService.get('FRONTEND_URL')}/profile?setup=failed`,
      return_url: `${this.configService.get('FRONTEND_URL')}/profile?setup=success`,
      type: 'account_onboarding',
    });

    return { accountId: account.id, onboardingUrl: accountLink.url };
  }
}
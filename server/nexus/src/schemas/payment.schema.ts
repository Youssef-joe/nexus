import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled'
}

export enum PaymentType {
  PROJECT_PAYMENT = 'project_payment',
  PAYOUT = 'payout',
  SUBSCRIPTION = 'subscription',
  REFUND = 'refund'
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Project' })
  projectId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  organizationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  professionalId?: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 0 })
  platformFee: number;

  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ required: true, enum: PaymentType, default: PaymentType.PROJECT_PAYMENT })
  type: PaymentType;

  @Prop()
  stripePaymentIntentId?: string;

  @Prop()
  stripeTransferId?: string;

  @Prop()
  stripeRefundId?: string;

  @Prop()
  description?: string;

  @Prop()
  completedAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop()
  failureReason?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
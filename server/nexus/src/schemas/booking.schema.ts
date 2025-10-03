import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export enum BookingType {
  CONSULTATION = 'consultation',
  TRAINING_SESSION = 'training_session',
  WORKSHOP = 'workshop',
  MEETING = 'meeting'
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  organizationId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  professionalId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project' })
  projectId?: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  startTime: Date;

  @Prop({ required: true })
  endTime: Date;

  @Prop({ required: true, enum: BookingType })
  type: BookingType;

  @Prop({ default: BookingStatus.PENDING, enum: BookingStatus })
  status: BookingStatus;

  @Prop()
  meetingLink?: string;

  @Prop()
  location?: string;

  @Prop({ default: false })
  isOnline: boolean;

  @Prop({ type: [String] })
  attendees?: string[];

  @Prop()
  notes?: string;

  @Prop({ default: true })
  reminderEnabled: boolean;

  @Prop({ default: 24 })
  reminderHours: number;

  @Prop({ default: false })
  reminderSent: boolean;

  @Prop()
  cancelledBy?: Types.ObjectId;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
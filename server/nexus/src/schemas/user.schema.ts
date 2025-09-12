import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ORGANIZATION = 'organization',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ default: UserStatus.PENDING_VERIFICATION, enum: UserStatus })
  status: UserStatus;

  @Prop({ default: false })
  verified: boolean;

  @Prop()
  avatar?: string;

  @Prop()
  phone?: string;

  @Prop()
  location?: string;

  @Prop()
  bio?: string;

  @Prop({ type: [String] })
  languages?: string[];

  @Prop()
  verificationToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({ default: Date.now })
  lastLogin?: Date;

  // Organization-specific fields
  @Prop()
  companyName?: string;

  @Prop()
  companySize?: string;

  @Prop()
  industry?: string;

  // Professional-specific fields
  @Prop({ type: [String] })
  skills?: string[];

  @Prop({ type: [String] })
  certifications?: string[];

  @Prop()
  experience?: number;

  @Prop()
  hourlyRate?: number;

  @Prop({ default: 0 })
  rating?: number;

  @Prop({ default: 0 })
  totalReviews?: number;

  @Prop({ default: 0 })
  completedProjects?: number;

  // Payment-related fields
  @Prop()
  stripeAccountId?: string;

  @Prop({ default: false })
  payoutSetupCompleted?: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
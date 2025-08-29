import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ApplicationDocument = Application & Document;

export enum ApplicationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

@Schema({ timestamps: true })
export class Application {
  @Prop({ required: true, type: Types.ObjectId, ref: 'Project' })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  professionalId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  organizationId: Types.ObjectId;

  @Prop({ default: ApplicationStatus.PENDING, enum: ApplicationStatus })
  status: ApplicationStatus;

  @Prop({ required: true })
  coverLetter: string;

  @Prop({ required: true })
  proposedRate: number;

  @Prop()
  estimatedDuration?: string;

  @Prop({ type: [String] })
  attachments?: string[];

  @Prop()
  aiMatchingScore?: number;

  @Prop({ type: Object })
  aiAnalysis?: Record<string, any>;
}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
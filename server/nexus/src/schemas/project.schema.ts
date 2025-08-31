import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

export enum ProjectStatus {
  DRAFT = 'draft',
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ProjectType {
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term',
  PROJECT_BASED = 'project_based'
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  organizationId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  professionalId?: Types.ObjectId;

  @Prop({ required: true, enum: ProjectType })
  type: ProjectType;

  @Prop({ default: ProjectStatus.OPEN, enum: ProjectStatus })
  status: ProjectStatus;

  @Prop({ type: [String] })
  requiredSkills: string[];

  @Prop({ required: true })
  budget: number;

  @Prop()
  duration?: string;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop({ type: [String] })
  deliverables: string[];

  @Prop()
  location?: string;

  @Prop({ default: false })
  isRemote: boolean;

  @Prop({ type: [String] })
  languages: string[];

  @Prop({ default: 0 })
  applicationsCount: number;

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop()
  aiMatchingScore?: number;

  @Prop({ type: Object })
  aiInsights?: Record<string, any>;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
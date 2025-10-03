import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ResourceDocument = Resource & Document;

export enum ResourceType {
  ARTICLE = 'article',
  WEBINAR = 'webinar',
  COURSE = 'course'
}

export enum ResourceStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

@Schema({ timestamps: true })
export class Resource {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, enum: ResourceType })
  type: ResourceType;

  @Prop({ default: ResourceStatus.PUBLISHED, enum: ResourceStatus })
  status: ResourceStatus;

  @Prop()
  content?: string;

  @Prop()
  videoUrl?: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: [String] })
  categories: string[];

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  authorId: Types.ObjectId;

  @Prop()
  duration?: number; // in minutes

  @Prop()
  difficulty?: string; // beginner, intermediate, advanced

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop({ default: 0 })
  likesCount: number;

  @Prop()
  externalUrl?: string;

  @Prop()
  scheduledDate?: Date; // for webinars

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: false })
  isPremium: boolean;
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);
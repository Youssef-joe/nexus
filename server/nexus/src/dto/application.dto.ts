import { IsString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApplicationStatus } from '../schemas/application.schema';

export class CreateApplicationDto {
  @IsString()
  projectId: string;

  @IsString()
  coverLetter: string;

  @IsNumber()
  proposedRate: number;

  @IsOptional()
  @IsString()
  estimatedDuration?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class UpdateApplicationStatusDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @IsOptional()
  @IsString()
  message?: string;
}
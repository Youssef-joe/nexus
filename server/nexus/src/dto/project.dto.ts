import { IsString, IsArray, IsNumber, IsOptional, IsEnum, IsBoolean, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectType, ProjectStatus } from '../schemas/project.schema';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(ProjectType)
  type: ProjectType;

  @IsArray()
  @IsString({ each: true })
  requiredSkills: string[];

  @IsNumber()
  budget: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsArray()
  @IsString({ each: true })
  deliverables: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsBoolean()
  isRemote: boolean;

  @IsArray()
  @IsString({ each: true })
  languages: string[];
}

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requiredSkills?: string[];

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deliverables?: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  isRemote?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];
}
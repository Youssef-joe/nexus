import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { AIService } from '../ai/ai.service';

@Injectable()
export class MatchingService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private aiService: AIService,
  ) {}

  async findMatchingProfessionals(projectId: string, limit: number = 10) {
    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const professionals = await this.userModel
      .find({ 
        role: UserRole.PROFESSIONAL,
        verified: true,
        status: 'active'
      })
      .select('firstName lastName skills experience certifications languages hourlyRate rating completedProjects avatar bio')
      .exec();

    const matchedProfessionals = await Promise.all(
      professionals.map(async (professional) => {
        const matchScore = await this.aiService.matchProfessionalToProject(
          professional.toObject(),
          project.toObject()
        );

        return {
          professional: professional.toObject(),
          matchScore,
          matchLevel: this.getMatchLevel(matchScore),
        };
      })
    );

    return matchedProfessionals
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  async findMatchingProjects(professionalId: string, limit: number = 10) {
    const professional = await this.userModel.findById(professionalId);
    if (!professional || professional.role !== UserRole.PROFESSIONAL) {
      throw new Error('Professional not found');
    }

    const projects = await this.projectModel
      .find({ status: 'open' })
      .populate('organizationId', 'firstName lastName companyName verified')
      .exec();

    const matchedProjects = await Promise.all(
      projects.map(async (project) => {
        const matchScore = await this.aiService.matchProfessionalToProject(
          professional.toObject(),
          project.toObject()
        );

        return {
          project: project.toObject(),
          matchScore,
          matchLevel: this.getMatchLevel(matchScore),
        };
      })
    );

    return matchedProjects
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  private getMatchLevel(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very_good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }
}
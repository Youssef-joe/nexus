import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { AIService } from '../ai/ai.service';

export interface MatchResult {
  professional: any;
  matchScore: number;
  matchLevel: string;
  skillsMatch: number;
  experienceMatch: number;
  budgetMatch: number;
  languageMatch: number;
  locationMatch: number;
  availabilityMatch: number;
  industryMatch: number;
  ratingBonus: number;
  reasoning: string;
}

export interface ProjectMatchResult {
  project: any;
  matchScore: number;
  matchLevel: string;
  reasoning: string;
}

@Injectable()
export class MatchingService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private aiService: AIService,
  ) {}

  async findMatchingProfessionals(projectId: string, limit: number = 10): Promise<MatchResult[]> {
    const project = await this.projectModel.findById(projectId).populate('organizationId', 'companyName firstName lastName');
    if (!project) {
      throw new Error('Project not found');
    }

    // Get all active verified professionals with enhanced fields
    const professionals = await this.userModel
      .find({
        role: UserRole.PROFESSIONAL,
        verified: true,
        status: 'active',
      })
      .select('firstName lastName skills experience certifications languages hourlyRate rating completedProjects bio location specializations industries projectTypes availability remoteWork minBudget maxBudget preferredLocations')
      .exec();

    const matches: MatchResult[] = [];

    for (const professional of professionals) {
      const matchScore = await this.calculateMatchScore(professional, project);
      const matchLevel = this.getMatchLevel(matchScore);
      
      matches.push({
        professional: professional.toObject(),
        matchScore,
        matchLevel,
        skillsMatch: this.calculateSkillsMatch(professional.skills || [], project.requiredSkills || []),
        experienceMatch: this.calculateExperienceMatch(professional.experience || professional.yearsOfExperience || 0, project),
        budgetMatch: this.calculateBudgetMatch(professional.hourlyRate || 0, project.budget, project.duration || ''),
        languageMatch: this.calculateLanguageMatch(professional.languages || [], project.languages || []),
        locationMatch: this.calculateLocationMatch(professional, project),
        availabilityMatch: this.calculateAvailabilityMatch(professional, project),
        industryMatch: this.calculateIndustryMatch(professional.industries || [], project),
        ratingBonus: this.calculateRatingBonus(professional.rating || 0),
        reasoning: await this.generateMatchReasoning(professional, project, matchScore),
      });
    }

    // Sort by match score and limit results
    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  async findMatchingProjects(professionalId: string, limit: number = 10): Promise<ProjectMatchResult[]> {
    const professional = await this.userModel.findById(professionalId);
    if (!professional || professional.role !== UserRole.PROFESSIONAL) {
      throw new Error('Professional not found');
    }

    // Get all open projects
    const projects = await this.projectModel
      .find({ status: 'open' })
      .populate('organizationId', 'firstName lastName companyName')
      .exec();

    const matches: ProjectMatchResult[] = [];

    for (const project of projects) {
      const matchScore = await this.calculateMatchScore(professional, project);
      const matchLevel = this.getMatchLevel(matchScore);
      
      matches.push({
        project: project.toObject(),
        matchScore,
        matchLevel,
        reasoning: await this.generateMatchReasoning(professional, project, matchScore),
      });
    }

    return matches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  private async calculateMatchScore(professional: any, project: any): Promise<number> {
    // Use AI for comprehensive scoring
    const aiScore = await this.aiService.matchProfessionalToProject(professional, project);
    
    // Fallback to rule-based scoring if AI fails
    if (aiScore > 0) {
      return aiScore;
    }

    return this.calculateRuleBasedScore(professional, project);
  }

  private calculateRuleBasedScore(professional: any, project: any): number {
    const skillsScore = this.calculateSkillsMatch(professional.skills || [], project.requiredSkills || []);
    const experienceScore = this.calculateExperienceMatch(professional.experience || professional.yearsOfExperience || 0, project);
    const budgetScore = this.calculateBudgetMatch(professional.hourlyRate || 0, project.budget, project.duration || '');
    const languageScore = this.calculateLanguageMatch(professional.languages || [], project.languages || []);
    const ratingScore = this.calculateRatingBonus(professional.rating || 0);
    const locationScore = this.calculateLocationMatch(professional, project);
    const availabilityScore = this.calculateAvailabilityMatch(professional, project);
    const industryScore = this.calculateIndustryMatch(professional.industries || [], project);

    // Enhanced weighted scoring
    const totalScore = (
      skillsScore * 0.30 +        // 30% skills
      experienceScore * 0.20 +    // 20% experience
      budgetScore * 0.15 +        // 15% budget
      languageScore * 0.10 +      // 10% language
      locationScore * 0.10 +      // 10% location
      availabilityScore * 0.05 +  // 5% availability
      industryScore * 0.05 +      // 5% industry
      ratingScore * 0.05          // 5% rating
    );

    return Math.round(totalScore);
  }

  private calculateSkillsMatch(professionalSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 100;
    
    const normalizedProfSkills = professionalSkills.map(s => s.toLowerCase().trim());
    const normalizedReqSkills = requiredSkills.map(s => s.toLowerCase().trim());
    
    let matchCount = 0;
    let partialMatchCount = 0;

    for (const reqSkill of normalizedReqSkills) {
      // Exact match
      if (normalizedProfSkills.includes(reqSkill)) {
        matchCount++;
      } else {
        // Partial match (contains keywords)
        const hasPartialMatch = normalizedProfSkills.some(profSkill => 
          profSkill.includes(reqSkill) || reqSkill.includes(profSkill)
        );
        if (hasPartialMatch) {
          partialMatchCount++;
        }
      }
    }

    const exactMatchScore = (matchCount / normalizedReqSkills.length) * 100;
    const partialMatchScore = (partialMatchCount / normalizedReqSkills.length) * 50;
    
    return Math.min(100, exactMatchScore + partialMatchScore);
  }

  private calculateExperienceMatch(experience: number, project: any): number {
    // Determine required experience based on project complexity
    let requiredExperience = 3; // Default

    if (project.type === 'consulting' || project.budget > 20000) {
      requiredExperience = 7;
    } else if (project.type === 'training' || project.budget > 10000) {
      requiredExperience = 5;
    }

    if (experience >= requiredExperience) {
      return 100;
    } else if (experience >= requiredExperience * 0.7) {
      return 80;
    } else if (experience >= requiredExperience * 0.5) {
      return 60;
    } else {
      return Math.max(20, (experience / requiredExperience) * 100);
    }
  }

  private calculateBudgetMatch(hourlyRate: number, projectBudget: number, duration: string): number {
    if (hourlyRate === 0) return 50; // Neutral if no rate specified

    // Estimate project hours based on duration
    let estimatedHours = 40; // Default
    
    if (duration?.includes('month')) {
      const months = parseInt(duration) || 1;
      estimatedHours = months * 40;
    } else if (duration?.includes('week')) {
      const weeks = parseInt(duration) || 1;
      estimatedHours = weeks * 10;
    }

    const estimatedCost = hourlyRate * estimatedHours;
    const budgetRatio = projectBudget / estimatedCost;

    if (budgetRatio >= 1.2) return 100; // Budget is 20% higher than cost
    if (budgetRatio >= 1.0) return 90;  // Budget matches cost
    if (budgetRatio >= 0.8) return 70;  // Budget is 80% of cost
    if (budgetRatio >= 0.6) return 50;  // Budget is 60% of cost
    return 20; // Budget too low
  }

  private calculateLanguageMatch(professionalLangs: string[], projectLangs: string[]): number {
    if (projectLangs.length === 0) return 100;

    const normalizedProfLangs = professionalLangs.map(l => l.toLowerCase());
    const normalizedProjLangs = projectLangs.map(l => l.toLowerCase());

    const matchCount = normalizedProjLangs.filter(lang => 
      normalizedProfLangs.includes(lang)
    ).length;

    return (matchCount / normalizedProjLangs.length) * 100;
  }

  private calculateRatingBonus(rating: number): number {
    return rating * 20; // Convert 5-star rating to 0-100 scale
  }

  private calculateLocationMatch(professional: any, project: any): number {
    // Remote work preference
    if (professional.remoteWork && (project.location === 'Remote' || project.location?.toLowerCase().includes('remote'))) {
      return 100;
    }

    // Preferred locations match
    if (professional.preferredLocations?.length > 0 && project.location) {
      const hasLocationMatch = professional.preferredLocations.some((loc: string) => 
        project.location.toLowerCase().includes(loc.toLowerCase()) ||
        loc.toLowerCase().includes(project.location.toLowerCase())
      );
      if (hasLocationMatch) return 90;
    }

    // Same location as professional's current location
    if (professional.location && project.location) {
      if (professional.location.toLowerCase().includes(project.location.toLowerCase()) ||
          project.location.toLowerCase().includes(professional.location.toLowerCase())) {
        return 80;
      }
    }

    return 50; // Neutral score if no clear match
  }

  private calculateAvailabilityMatch(professional: any, project: any): number {
    if (!professional.availability) return 70; // Neutral if not specified

    // Match project urgency with availability
    if (project.urgency === 'high' && professional.availability === 'full-time') return 100;
    if (project.urgency === 'medium' && ['full-time', 'part-time'].includes(professional.availability)) return 90;
    if (project.urgency === 'low' && professional.availability === 'contract') return 85;
    
    return 70; // Default score
  }

  private calculateIndustryMatch(professionalIndustries: string[], project: any): number {
    if (professionalIndustries.length === 0) return 70; // Neutral if not specified

    // Get organization industry from populated data
    const orgIndustry = project.organizationId?.industry || project.industry;
    if (!orgIndustry) return 70;

    const hasIndustryMatch = professionalIndustries.some(industry => 
      industry.toLowerCase().includes(orgIndustry.toLowerCase()) ||
      orgIndustry.toLowerCase().includes(industry.toLowerCase())
    );

    return hasIndustryMatch ? 100 : 60;
  }

  private getMatchLevel(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'very_good';
    if (score >= 70) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }

  private async generateMatchReasoning(professional: any, project: any, score: number): Promise<string> {
    const skillsMatch = this.calculateSkillsMatch(professional.skills || [], project.requiredSkills || []);
    const experienceMatch = this.calculateExperienceMatch(professional.experience || professional.yearsOfExperience || 0, project);
    const budgetMatch = this.calculateBudgetMatch(professional.hourlyRate || 0, project.budget, project.duration || '');
    const locationMatch = this.calculateLocationMatch(professional, project);
    const industryMatch = this.calculateIndustryMatch(professional.industries || [], project);

    let reasoning = `Match score: ${score}%. `;

    // Skills assessment
    if (skillsMatch >= 80) {
      reasoning += 'Excellent skills alignment. ';
    } else if (skillsMatch >= 60) {
      reasoning += 'Good skills match with minor gaps. ';
    } else {
      reasoning += 'Skills require development. ';
    }

    // Experience assessment
    if (experienceMatch >= 80) {
      reasoning += 'Perfect experience level. ';
    } else if (experienceMatch >= 60) {
      reasoning += 'Adequate experience. ';
    } else {
      reasoning += 'May need mentoring. ';
    }

    // Location assessment
    if (locationMatch >= 90) {
      reasoning += 'Ideal location match. ';
    } else if (locationMatch >= 70) {
      reasoning += 'Good location compatibility. ';
    }

    // Industry assessment
    if (industryMatch >= 90) {
      reasoning += 'Strong industry background. ';
    }

    // Budget assessment
    if (budgetMatch >= 80) {
      reasoning += 'Budget is well-aligned.';
    } else if (budgetMatch >= 60) {
      reasoning += 'Budget is workable.';
    } else {
      reasoning += 'Budget may need negotiation.';
    }

    return reasoning;
  }
}
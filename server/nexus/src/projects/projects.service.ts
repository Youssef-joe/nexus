import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument, ProjectStatus } from '../schemas/project.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { Application, ApplicationDocument } from '../schemas/application.schema';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { AIService } from '../ai/ai.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    private aiService: AIService,
  ) {}

  async create(createProjectDto: CreateProjectDto, organizationId: string) {
    const project = new this.projectModel({
      ...createProjectDto,
      organizationId,
    });

    const savedProject = await project.save();

    // Generate AI insights for the project
    const aiInsights = await this.aiService.generateProjectInsights(savedProject);
    if (aiInsights) {
      savedProject.aiInsights = aiInsights;
      await savedProject.save();
    }

    return savedProject;
  }

  async findAll(query: any = {}) {
    const {
      page = 1,
      limit = 10,
      skills,
      type,
      budget_min,
      budget_max,
      location,
      isRemote,
      languages,
      sort = '-createdAt'
    } = query;

    const filter: any = { status: ProjectStatus.OPEN };

    if (skills) {
      filter.requiredSkills = { $in: skills.split(',') };
    }

    if (type) {
      filter.type = type;
    }

    if (budget_min || budget_max) {
      filter.budget = {};
      if (budget_min) filter.budget.$gte = Number(budget_min);
      if (budget_max) filter.budget.$lte = Number(budget_max);
    }

    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    if (isRemote !== undefined) {
      filter.isRemote = isRemote === 'true';
    }

    if (languages) {
      filter.languages = { $in: languages.split(',') };
    }

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .populate('organizationId', 'firstName lastName companyName avatar')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .exec(),
      this.projectModel.countDocuments(filter),
    ]);

    return {
      projects,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const project = await this.projectModel
      .findById(id)
      .populate('organizationId', 'firstName lastName companyName avatar verified rating')
      .populate('professionalId', 'firstName lastName avatar skills rating')
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Increment view count
    project.viewsCount += 1;
    await project.save();

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.projectModel.findById(id);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.organizationId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own projects');
    }

    Object.assign(project, updateProjectDto);
    return project.save();
  }

  async remove(id: string, userId: string) {
    const project = await this.projectModel.findById(id);
    
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.organizationId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own projects');
    }

    await this.projectModel.findByIdAndDelete(id);
    return { message: 'Project deleted successfully' };
  }

  async getMyProjects(userId: string, role: UserRole) {
    let filter: any = {};

    if (role === UserRole.ORGANIZATION) {
      filter.organizationId = userId;
    } else if (role === UserRole.PROFESSIONAL) {
      filter.professionalId = userId;
    }

    return this.projectModel
      .find(filter)
      .populate('organizationId', 'firstName lastName companyName avatar')
      .populate('professionalId', 'firstName lastName avatar skills rating')
      .sort('-createdAt')
      .exec();
  }

  async getRecommendedProjects(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user || user.role !== UserRole.PROFESSIONAL) {
      return [];
    }

    // Get all open projects
    const projects = await this.projectModel
      .find({ status: ProjectStatus.OPEN })
      .populate('organizationId', 'firstName lastName companyName avatar verified')
      .exec();

    // Calculate AI matching scores for each project
    const projectsWithScores = await Promise.all(
      projects.map(async (project) => {
        const matchScore = await this.aiService.matchProfessionalToProject(user, project);
        return {
          ...project.toObject(),
          aiMatchingScore: matchScore,
        };
      })
    );

    // Sort by matching score and return top 10
    return projectsWithScores
      .sort((a, b) => b.aiMatchingScore - a.aiMatchingScore)
      .slice(0, 10);
  }

  async searchProjects(query: string, filters: any = {}) {
    const searchFilter: any = {
      status: ProjectStatus.OPEN,
      $or: [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { requiredSkills: { $in: [new RegExp(query, 'i')] } },
      ],
    };

    // Apply additional filters
    if (filters.skills) {
      searchFilter.requiredSkills = { $in: filters.skills };
    }

    if (filters.type) {
      searchFilter.type = filters.type;
    }

    if (filters.budget_min || filters.budget_max) {
      searchFilter.budget = {};
      if (filters.budget_min) searchFilter.budget.$gte = Number(filters.budget_min);
      if (filters.budget_max) searchFilter.budget.$lte = Number(filters.budget_max);
    }

    return this.projectModel
      .find(searchFilter)
      .populate('organizationId', 'firstName lastName companyName avatar verified')
      .sort('-createdAt')
      .limit(20)
      .exec();
  }
}
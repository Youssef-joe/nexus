import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Application, ApplicationDocument, ApplicationStatus } from '../schemas/application.schema';
import { Project, ProjectDocument, ProjectStatus } from '../schemas/project.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { CreateApplicationDto, UpdateApplicationStatusDto } from '../dto/application.dto';
import { AIService } from '../ai/ai.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private aiService: AIService,
    private emailService: EmailService,
  ) {}

  async create(createApplicationDto: CreateApplicationDto, professionalId: string) {
    const project = await this.projectModel.findById(createApplicationDto.projectId);
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.status !== ProjectStatus.OPEN) {
      throw new ForbiddenException('Project is not accepting applications');
    }

    // Check if professional already applied
    const existingApplication = await this.applicationModel.findOne({
      projectId: createApplicationDto.projectId,
      professionalId,
    });

    if (existingApplication) {
      throw new ConflictException('You have already applied to this project');
    }

    const professional = await this.userModel.findById(professionalId);
    
    const application = new this.applicationModel({
      ...createApplicationDto,
      professionalId,
      organizationId: project.organizationId,
    });

    const savedApplication = await application.save();

    // Generate AI analysis for the application
    const aiAnalysis = await this.aiService.analyzeApplication(savedApplication, professional, project);
    if (aiAnalysis) {
      savedApplication.aiAnalysis = aiAnalysis;
      savedApplication.aiMatchingScore = aiAnalysis.overallScore;
      await savedApplication.save();
    }

    // Update project applications count
    project.applicationsCount += 1;
    await project.save();

    // Send notification to organization
    const organization = await this.userModel.findById(project.organizationId);
    if (organization) {
      await this.emailService.sendProjectNotification(
        organization.email,
        project.title,
        'application'
      );
    }

    return savedApplication;
  }

  async findAll(query: any = {}) {
    const { page = 1, limit = 10, status, projectId, professionalId } = query;
    
    const filter: any = {};
    if (status) filter.status = status;
    if (projectId) filter.projectId = projectId;
    if (professionalId) filter.professionalId = professionalId;

    const skip = (page - 1) * limit;

    const [applications, total] = await Promise.all([
      this.applicationModel
        .find(filter)
        .populate('projectId', 'title type budget status')
        .populate('professionalId', 'firstName lastName avatar skills rating completedProjects')
        .populate('organizationId', 'firstName lastName companyName avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .exec(),
      this.applicationModel.countDocuments(filter),
    ]);

    return {
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const application = await this.applicationModel
      .findById(id)
      .populate('projectId')
      .populate('professionalId', 'firstName lastName avatar skills rating completedProjects certifications')
      .populate('organizationId', 'firstName lastName companyName avatar')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  async updateStatus(id: string, updateStatusDto: UpdateApplicationStatusDto, userId: string) {
    const application = await this.applicationModel
      .findById(id)
      .populate('projectId')
      .populate('professionalId', 'firstName lastName email')
      .exec();

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    // Only organization can update application status
    if (application.organizationId.toString() !== userId) {
      throw new ForbiddenException('You can only update applications for your projects');
    }

    application.status = updateStatusDto.status;
    await application.save();

    // If accepted, update project with professional
    if (updateStatusDto.status === ApplicationStatus.ACCEPTED) {
      const project = await this.projectModel.findById(application.projectId);
      if (project) {
        project.professionalId = (application.professionalId as any)._id;
        project.status = ProjectStatus.IN_PROGRESS;
        await project.save();

        // Reject other applications for this project
        await this.applicationModel.updateMany(
          { 
            projectId: application.projectId,
            _id: { $ne: application._id },
            status: ApplicationStatus.PENDING 
          },
          { status: ApplicationStatus.REJECTED }
        );

        // Send acceptance notification
        await this.emailService.sendProjectNotification(
          (application.professionalId as any).email,
          project.title,
          'acceptance'
        );
      }
    }

    return application;
  }

  async getMyApplications(userId: string, role: UserRole) {
    let filter: any = {};

    if (role === UserRole.PROFESSIONAL) {
      filter.professionalId = userId;
    } else if (role === UserRole.ORGANIZATION) {
      filter.organizationId = userId;
    }

    return this.applicationModel
      .find(filter)
      .populate('projectId', 'title type budget status')
      .populate('professionalId', 'firstName lastName avatar skills rating')
      .populate('organizationId', 'firstName lastName companyName avatar')
      .sort('-createdAt')
      .exec();
  }

  async withdraw(id: string, userId: string) {
    const application = await this.applicationModel.findById(id);

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.professionalId.toString() !== userId) {
      throw new ForbiddenException('You can only withdraw your own applications');
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new ForbiddenException('You can only withdraw pending applications');
    }

    application.status = ApplicationStatus.WITHDRAWN;
    await application.save();

    // Update project applications count
    const project = await this.projectModel.findById(application.projectId);
    if (project && project.applicationsCount > 0) {
      project.applicationsCount -= 1;
      await project.save();
    }

    return { message: 'Application withdrawn successfully' };
  }
}
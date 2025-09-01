import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { Application, ApplicationDocument } from '../schemas/application.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Application.name) private applicationModel: Model<ApplicationDocument>,
  ) {}

  async getAdminStats() {
    const [
      totalUsers,
      totalOrganizations,
      totalProfessionals,
      totalProjects,
      totalApplications,
      activeProjects,
      completedProjects,
      draftProjects,
      inProgressProjects,
      cancelledProjects,
      verifiedUsers,
      unverifiedUsers,
      recentUsers,
      recentProjects,
      projectBudgets
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: UserRole.ORGANIZATION }),
      this.userModel.countDocuments({ role: UserRole.PROFESSIONAL }),
      this.projectModel.countDocuments(),
      this.applicationModel.countDocuments(),
      this.projectModel.countDocuments({ status: 'open' }),
      this.projectModel.countDocuments({ status: 'completed' }),
      this.projectModel.countDocuments({ status: 'draft' }),
      this.projectModel.countDocuments({ status: 'in_progress' }),
      this.projectModel.countDocuments({ status: 'cancelled' }),
      this.userModel.countDocuments({ verified: true }),
      this.userModel.countDocuments({ verified: false }),
      this.userModel.find().sort({ createdAt: -1 }).limit(10).select('firstName lastName role createdAt verified status'),
      this.projectModel.find().sort({ createdAt: -1 }).limit(10).populate('organizationId', 'firstName lastName companyName').select('title budget status createdAt'),
      this.projectModel.find().select('budget')
    ]);

    // Calculate real total revenue from project budgets
    const totalRevenue = projectBudgets.reduce((sum, project) => sum + (project.budget || 0), 0);
    
    // Calculate average project budget
    const averageProjectBudget = totalProjects > 0 ? totalRevenue / totalProjects : 0;

    // Get monthly user registration stats (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyStats = await this.userModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Get project status distribution
    const projectStatusStats = await this.projectModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get top organizations by project count
    const topOrganizations = await this.projectModel.aggregate([
      {
        $group: {
          _id: '$organizationId',
          projectCount: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'organization'
        }
      },
      {
        $unwind: '$organization'
      },
      {
        $project: {
          name: {
            $ifNull: [
              '$organization.companyName',
              { $concat: ['$organization.firstName', ' ', '$organization.lastName'] }
            ]
          },
          projectCount: 1,
          totalBudget: 1
        }
      },
      {
        $sort: { projectCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    return {
      totalUsers,
      totalOrganizations,
      totalProfessionals,
      totalProjects,
      totalApplications,
      totalRevenue,
      averageProjectBudget,
      activeProjects,
      completedProjects,
      draftProjects,
      inProgressProjects,
      cancelledProjects,
      verifiedUsers,
      unverifiedUsers,
      recentUsers: recentUsers.map(user => {
        const userObj = user.toObject();
        return {
          id: userObj._id,
          name: `${userObj.firstName} ${userObj.lastName}`,
          role: userObj.role,
          verified: userObj.verified,
          status: userObj.status,
          createdAt: (userObj as any).createdAt
        };
      }),
      recentProjects: recentProjects.map(project => {
        const projectObj = project.toObject();
        const org = projectObj.organizationId as any;
        return {
          id: projectObj._id,
          title: projectObj.title,
          organization: org?.companyName || `${org?.firstName} ${org?.lastName}`,
          budget: projectObj.budget,
          status: projectObj.status,
          createdAt: (projectObj as any).createdAt
        };
      }),
      monthlyStats,
      projectStatusStats,
      topOrganizations
    };
  }
}
import { Controller, Post } from '@nestjs/common';
import { Public } from './auth/public.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Project, ProjectDocument } from './schemas/project.schema';
import * as bcrypt from 'bcryptjs';

@Controller('seed')
export class SeedController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  @Public()
  @Post('database')
  async seedDatabase() {
    console.log('Seed database endpoint called');
    try {
      await this.userModel.deleteMany({});
      await this.projectModel.deleteMany({});

      const professionals = await this.userModel.insertMany([
        {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          password: await bcrypt.hash('password123', 10),
          role: UserRole.PROFESSIONAL,
          skills: ['Leadership Development', 'Team Building', 'Communication Skills', 'Change Management', 'Performance Coaching'],
          experience: 8,
          yearsOfExperience: 8,
          certifications: ['Certified Professional Coach (CPC)', 'Leadership Development Certificate'],
          languages: ['English', 'Arabic'],
          hourlyRate: 120,
          rating: 4.8,
          completedProjects: 25,
          bio: 'Senior L&D consultant specializing in leadership development',
          location: 'Dubai, UAE',
          industries: ['Technology', 'Finance', 'Healthcare'],
          specializations: ['Executive Coaching', 'Leadership Training'],
          projectTypes: ['project_based', 'long_term'],
          availability: 'full-time',
          remoteWork: true,
          preferredLocations: ['Dubai', 'Abu Dhabi', 'Remote'],
          minBudget: 5000,
          maxBudget: 50000,
          verified: true,
          status: 'active',
        },
        {
          firstName: 'Ahmed',
          lastName: 'Al-Rashid',
          email: 'ahmed.alrashid@email.com',
          password: await bcrypt.hash('password123', 10),
          role: UserRole.PROFESSIONAL,
          skills: ['Digital Transformation', 'Project Management', 'Agile Coaching', 'Strategic Planning', 'Innovation Management'],
          experience: 12,
          yearsOfExperience: 12,
          certifications: ['PMP', 'Certified Scrum Master', 'Digital Transformation Certificate'],
          languages: ['Arabic', 'English', 'French'],
          hourlyRate: 150,
          rating: 4.9,
          completedProjects: 40,
          bio: 'Digital transformation expert with extensive MENA experience',
          location: 'Riyadh, Saudi Arabia',
          industries: ['Banking', 'Government', 'Technology'],
          specializations: ['Digital Strategy', 'Agile Transformation'],
          projectTypes: ['long_term', 'short_term'],
          availability: 'full-time',
          remoteWork: false,
          preferredLocations: ['Riyadh', 'Dubai', 'Doha'],
          minBudget: 10000,
          maxBudget: 100000,
          verified: true,
          status: 'active',
        },
      ]);

      const organizations = await this.userModel.insertMany([
        {
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@techcorp.com',
          password: await bcrypt.hash('password123', 10),
          role: UserRole.ORGANIZATION,
          companyName: 'TechCorp Solutions',
          industry: 'Technology',
          companySize: '500-1000',
          location: 'Dubai, UAE',
          verified: true,
          status: 'active',
        },
      ]);

      await this.projectModel.insertMany([
        {
          title: 'Executive Leadership Development Program',
          description: 'Comprehensive 6-month leadership development program for senior managers transitioning to executive roles',
          requiredSkills: ['Leadership Development', 'Team Building', 'Change Management', 'Communication Skills', 'Executive Coaching'],
          budget: 15000,
          type: 'project_based',
          duration: '6 months',
          location: 'Dubai, UAE',
          languages: ['English', 'Arabic'],
          organizationId: organizations[0]._id,
          status: 'open',
          urgency: 'medium',
          targetAudience: 'Senior Managers',
          deliverables: ['Leadership Assessment Report', 'Executive Coaching Sessions', 'Training Materials'],
        },
        {
          title: 'Digital Transformation Workshop Series',
          description: 'Interactive workshop series to help employees adapt to digital transformation initiatives',
          requiredSkills: ['Digital Transformation', 'Change Management', 'Innovation Management', 'Project Management', 'Strategic Planning'],
          budget: 25000,
          type: 'long_term',
          duration: '4 months',
          location: 'Dubai, UAE',
          languages: ['English', 'Arabic'],
          organizationId: organizations[0]._id,
          status: 'open',
          urgency: 'high',
          targetAudience: 'All Employees',
          deliverables: ['Workshop Materials', 'Digital Roadmap', 'Training Videos'],
        },
      ]);

      return { 
        message: 'Database seeded successfully!',
        professionals: professionals.length,
        organizations: organizations.length,
        projects: 2,
        testCredentials: {
          professional: { email: 'sarah.johnson@email.com', password: 'password123', role: 'professional' },
          organization: { email: 'john.smith@techcorp.com', password: 'password123', role: 'organization' }
        }
      };
    } catch (error) {
      console.error('Seed error details:', error);
      return {
        error: 'Seeding failed',
        message: error.message,
        details: error.stack
      };
    }
  }
}
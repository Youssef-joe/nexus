import { Controller, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { Project, ProjectDocument } from './schemas/project.schema';
import * as bcrypt from 'bcryptjs';

@Controller('seed')
export class SimpleSeedController {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  @Post('database')
  async seedDatabase() {
    try {
      // Clear existing data
      await this.userModel.deleteMany({});
      await this.projectModel.deleteMany({});

      // Create professionals
      const professionals = await this.userModel.insertMany([
        {
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@email.com',
          password: await bcrypt.hash('password123', 10),
          role: UserRole.PROFESSIONAL,
          skills: ['Leadership Development', 'Team Building', 'Communication Skills', 'Change Management', 'Performance Coaching'],
          experience: 8,
          certifications: ['Certified Professional Coach (CPC)', 'Leadership Development Certificate'],
          languages: ['English', 'Arabic'],
          hourlyRate: 120,
          rating: 4.8,
          completedProjects: 25,
          bio: 'Senior L&D consultant specializing in leadership development',
          location: 'Dubai, UAE',
          verified: true,
          status: 'active',
        },
        {
          firstName: 'Ahmed',
          lastName: 'Al-Rashid',
          email: 'ahmed.alrashid@email.com',
          password: await bcrypt.hash('password123', 10),
          role: UserRole.PROFESSIONAL,
          skills: ['Digital Transformation', 'Project Management', 'Agile Coaching', 'Strategic Planning'],
          experience: 12,
          certifications: ['PMP', 'Certified Scrum Master'],
          languages: ['Arabic', 'English', 'French'],
          hourlyRate: 150,
          rating: 4.9,
          completedProjects: 40,
          bio: 'Digital transformation expert',
          location: 'Riyadh, Saudi Arabia',
          verified: true,
          status: 'active',
        },
      ]);

      // Create organizations
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

      // Create projects
      await this.projectModel.insertMany([
        {
          title: 'Executive Leadership Development Program',
          description: 'Comprehensive leadership development program for senior managers',
          requiredSkills: ['Leadership Development', 'Team Building', 'Change Management'],
          budget: 15000,
          type: 'training',
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
          title: 'Digital Transformation Workshop',
          description: 'Workshop series for digital transformation',
          requiredSkills: ['Digital Transformation', 'Change Management', 'Project Management'],
          budget: 25000,
          type: 'workshop',
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
        projects: 2
      };
    } catch (error) {
      console.error('Seed error:', error);
      throw error;
    }
  }
}
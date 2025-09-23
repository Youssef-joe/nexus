import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async seedDatabase() {
    // Clear existing data
    await this.userModel.deleteMany({});
    await this.projectModel.deleteMany({});

    // Seed professionals
    const professionals = await this.seedProfessionals();
    
    // Seed organizations
    const organizations = await this.seedOrganizations();
    
    // Seed projects
    await this.seedProjects(organizations);

    console.log('Database seeded successfully!');
    return { professionals: professionals.length, organizations: organizations.length };
  }

  private async seedProfessionals() {
    const professionalsData = [
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@email.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.PROFESSIONAL,
        skills: ['Leadership Development', 'Team Building', 'Communication Skills', 'Change Management', 'Performance Coaching'],
        experience: 8,
        certifications: ['Certified Professional Coach (CPC)', 'Leadership Development Certificate', 'Change Management Certification'],
        languages: ['English', 'Arabic'],
        hourlyRate: 120,
        rating: 4.8,
        completedProjects: 25,
        bio: 'Senior L&D consultant specializing in leadership development and organizational change',
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
        skills: ['Digital Transformation', 'Project Management', 'Agile Coaching', 'Strategic Planning', 'Innovation Management'],
        experience: 12,
        certifications: ['PMP', 'Certified Scrum Master', 'Digital Transformation Certificate'],
        languages: ['Arabic', 'English', 'French'],
        hourlyRate: 150,
        rating: 4.9,
        completedProjects: 40,
        bio: 'Digital transformation expert with extensive experience in MENA region',
        location: 'Riyadh, Saudi Arabia',
        verified: true,
        status: 'active',
      },
      {
        firstName: 'Maria',
        lastName: 'Rodriguez',
        email: 'maria.rodriguez@email.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.PROFESSIONAL,
        skills: ['Sales Training', 'Customer Service', 'Negotiation Skills', 'Presentation Skills', 'CRM Training'],
        experience: 6,
        certifications: ['Sales Training Certification', 'Customer Experience Certificate'],
        languages: ['English', 'Spanish'],
        hourlyRate: 95,
        rating: 4.6,
        completedProjects: 18,
        bio: 'Sales and customer service training specialist',
        location: 'Remote',
        verified: true,
        status: 'active',
      },
      {
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.chen@email.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.PROFESSIONAL,
        skills: ['Technical Training', 'Software Development', 'Data Analytics', 'AI/ML Training', 'Cybersecurity'],
        experience: 10,
        certifications: ['AWS Certified', 'Google Cloud Professional', 'Cybersecurity Certificate'],
        languages: ['English', 'Mandarin'],
        hourlyRate: 140,
        rating: 4.7,
        completedProjects: 32,
        bio: 'Technical training expert specializing in emerging technologies',
        location: 'Singapore',
        verified: true,
        status: 'active',
      },
    ];

    return await this.userModel.insertMany(professionalsData);
  }

  private async seedOrganizations() {
    const organizationsData = [
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
      {
        firstName: 'Fatima',
        lastName: 'Al-Zahra',
        email: 'fatima.alzahra@globalbank.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.ORGANIZATION,
        companyName: 'Global Banking Group',
        industry: 'Financial Services',
        companySize: '1000+',
        location: 'Doha, Qatar',
        verified: true,
        status: 'active',
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@retailplus.com',
        password: await bcrypt.hash('password123', 10),
        role: UserRole.ORGANIZATION,
        companyName: 'RetailPlus International',
        industry: 'Retail',
        companySize: '100-500',
        location: 'Kuwait City, Kuwait',
        verified: true,
        status: 'active',
      },
    ];

    return await this.userModel.insertMany(organizationsData);
  }

  private async seedProjects(organizations: any[]) {
    const projectsData = [
      {
        title: 'Executive Leadership Development Program',
        description: 'Comprehensive 6-month leadership development program for senior managers transitioning to executive roles. Focus on strategic thinking, team leadership, and change management.',
        requiredSkills: ['Leadership Development', 'Team Building', 'Change Management', 'Communication Skills', 'Executive Coaching'],
        budget: 15000,
        type: 'training',
        duration: '6 months',
        location: 'Dubai, UAE',
        languages: ['English', 'Arabic'],
        organizationId: organizations[0]._id,
        status: 'open',
        urgency: 'medium',
        targetAudience: 'Senior Managers',
        deliverables: ['Leadership Assessment Report', 'Executive Coaching Sessions (12 sessions)', 'Leadership Development Curriculum', 'Team Building Workshop Materials', 'Change Management Toolkit', '360-Degree Feedback Reports', 'Individual Development Plans', 'Group Training Sessions (24 sessions)', 'Leadership Competency Framework', 'Performance Metrics Dashboard', 'Final Program Evaluation Report', 'Certificate of Completion'],
      },
      {
        title: 'Digital Transformation Workshop Series',
        description: 'Interactive workshop series to help employees adapt to digital transformation initiatives. Covers change management, digital tools adoption, and innovation mindset.',
        requiredSkills: ['Digital Transformation', 'Change Management', 'Innovation Management', 'Project Management', 'Strategic Planning'],
        budget: 25000,
        type: 'workshop',
        duration: '4 months',
        location: 'Doha, Qatar',
        languages: ['English', 'Arabic'],
        organizationId: organizations[1]._id,
        status: 'open',
        urgency: 'high',
        targetAudience: 'All Employees',
        deliverables: ['Digital Readiness Assessment', 'Workshop Materials', 'Digital Adoption Roadmap', 'Change Management Plan', 'Innovation Framework', 'Training Videos', 'Progress Reports'],
      },
      {
        title: 'Sales Excellence Training Program',
        description: 'Comprehensive sales training program to improve sales team performance, customer relationship management, and negotiation skills.',
        requiredSkills: ['Sales Training', 'Customer Service', 'Negotiation Skills', 'Presentation Skills', 'CRM Training'],
        budget: 8000,
        type: 'training',
        duration: '3 months',
        location: 'Kuwait City, Kuwait',
        languages: ['English'],
        organizationId: organizations[2]._id,
        status: 'open',
        urgency: 'medium',
        targetAudience: 'Sales Team',
        deliverables: ['Sales Skills Assessment', 'Training Modules', 'CRM Training Materials', 'Negotiation Workshops', 'Performance Tracking System', 'Sales Playbook'],
      },
      {
        title: 'Cybersecurity Awareness Program',
        description: 'Organization-wide cybersecurity awareness and training program to enhance security posture and reduce cyber risks.',
        requiredSkills: ['Cybersecurity', 'Technical Training', 'Risk Management', 'Compliance Training'],
        budget: 12000,
        type: 'training',
        duration: '2 months',
        location: 'Remote',
        languages: ['English'],
        organizationId: organizations[0]._id,
        status: 'open',
        urgency: 'high',
        targetAudience: 'All Employees',
        deliverables: ['Security Assessment', 'Training Materials', 'Phishing Simulation', 'Security Policies', 'Incident Response Plan', 'Compliance Reports'],
      },
    ];

    return await this.projectModel.insertMany(projectsData);
  }
}
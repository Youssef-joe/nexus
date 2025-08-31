import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from '@ai-sdk/google';
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

@Injectable()
export class AIService {
  private model;

  constructor(private configService: ConfigService) {
    // Set the API key as environment variable
    const apiKey = this.configService.get('GEMINI_API_KEY');
    console.log('Gemini API Key configured:', !!apiKey);
    process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey;
    this.model = google('models/gemini-2.0-flash');
  }

  async matchProfessionalToProject(professional: any, project: any): Promise<number> {
    try {
      const prompt = `
        Analyze the match between this professional and project:
        
        Professional:
        - Skills: ${professional.skills?.join(', ') || 'None specified'}
        - Experience: ${professional.experience || 0} years
        - Certifications: ${professional.certifications?.join(', ') || 'None'}
        - Languages: ${professional.languages?.join(', ') || 'None'}
        - Hourly Rate: $${professional.hourlyRate || 0}
        - Rating: ${professional.rating || 0}/5
        
        Project:
        - Required Skills: ${project.requiredSkills?.join(', ') || 'None'}
        - Budget: $${project.budget}
        - Languages: ${project.languages?.join(', ') || 'None'}
        - Type: ${project.type}
        - Duration: ${project.duration || 'Not specified'}
        
        Calculate a match score from 0-100 based on:
        1. Skill alignment (40%)
        2. Experience relevance (25%)
        3. Budget compatibility (20%)
        4. Language match (10%)
        5. Professional rating (5%)
      `;

      const { object } = await generateObject({
        model: this.model,
        schema: z.object({
          matchScore: z.number().min(0).max(100),
          reasoning: z.string(),
          strengths: z.array(z.string()),
          concerns: z.array(z.string()),
        }),
        prompt,
      });

      return object.matchScore;
    } catch (error) {
      console.error('AI matching error:', error);
      return 0;
    }
  }

  async generateProjectInsights(project: any): Promise<any> {
    try {
      console.log('Generating AI insights for project:', project.title);
      
      const prompt = `
        Analyze this project and provide insights:
        
        Project Details:
        - Title: ${project.title}
        - Description: ${project.description}
        - Required Skills: ${project.requiredSkills?.join(', ') || 'None'}
        - Budget: $${project.budget}
        - Type: ${project.type}
        - Duration: ${project.duration || 'Not specified'}
        - Location: ${project.location || 'Remote'}
        
        Provide insights on:
        1. Market competitiveness
        2. Skill demand analysis
        3. Budget assessment
        4. Timeline feasibility
        5. Recommendations for improvement
      `;

      console.log('Calling Gemini API...');
      const { object } = await generateObject({
        model: this.model,
        schema: z.object({
          marketCompetitiveness: z.string(),
          skillDemand: z.string(),
          budgetAssessment: z.string(),
          timelineFeasibility: z.string(),
          recommendations: z.array(z.string()),
          riskFactors: z.array(z.string()),
          successProbability: z.number().min(0).max(100),
        }),
        prompt,
      });

      console.log('AI insights generated successfully:', object);
      return object;
    } catch (error) {
      console.error('AI insights error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      return null;
    }
  }

  async analyzeApplication(application: any, professional: any, project: any): Promise<any> {
    try {
      const prompt = `
        Analyze this job application:
        
        Professional Profile:
        - Skills: ${professional.skills?.join(', ') || 'None'}
        - Experience: ${professional.experience || 0} years
        - Rating: ${professional.rating || 0}/5
        - Completed Projects: ${professional.completedProjects || 0}
        
        Application:
        - Cover Letter: ${application.coverLetter}
        - Proposed Rate: $${application.proposedRate}
        - Estimated Duration: ${application.estimatedDuration || 'Not specified'}
        
        Project Requirements:
        - Required Skills: ${project.requiredSkills?.join(', ') || 'None'}
        - Budget: $${project.budget}
        - Duration: ${project.duration || 'Not specified'}
        
        Provide analysis on application quality and fit.
      `;

      const { object } = await generateObject({
        model: this.model,
        schema: z.object({
          overallScore: z.number().min(0).max(100),
          skillMatch: z.number().min(0).max(100),
          experienceRelevance: z.number().min(0).max(100),
          proposalQuality: z.number().min(0).max(100),
          rateCompetitiveness: z.number().min(0).max(100),
          strengths: z.array(z.string()),
          weaknesses: z.array(z.string()),
          recommendation: z.enum(['strongly_recommend', 'recommend', 'consider', 'not_recommended']),
          reasoning: z.string(),
        }),
        prompt,
      });

      return object;
    } catch (error) {
      console.error('AI application analysis error:', error);
      return null;
    }
  }

  async generateProjectRecommendations(userProfile: any): Promise<string[]> {
    try {
      const prompt = `
        Based on this user profile, suggest relevant L&D project types:
        
        User Profile:
        - Role: ${userProfile.role}
        - Skills: ${userProfile.skills?.join(', ') || 'None'}
        - Industry: ${userProfile.industry || 'Not specified'}
        - Experience: ${userProfile.experience || 0} years
        - Company Size: ${userProfile.companySize || 'Not specified'}
        
        Suggest 5-7 specific L&D project types that would be most relevant.
      `;

      const { text } = await generateText({
        model: this.model,
        prompt,
      });

      return text.split('\n').filter(line => line.trim().length > 0);
    } catch (error) {
      console.error('AI recommendations error:', error);
      return [];
    }
  }

  async generateSkillsAssessment(skills: string[], projectRequirements: string[]): Promise<any> {
    try {
      const prompt = `
        Compare these skills with project requirements:
        
        User Skills: ${skills.join(', ')}
        Project Requirements: ${projectRequirements.join(', ')}
        
        Provide a detailed skills gap analysis.
      `;

      const { object } = await generateObject({
        model: this.model,
        schema: z.object({
          matchingSkills: z.array(z.string()),
          missingSkills: z.array(z.string()),
          skillGapScore: z.number().min(0).max(100),
          recommendations: z.array(z.string()),
          learningPath: z.array(z.string()),
        }),
        prompt,
      });

      return object;
    } catch (error) {
      console.error('AI skills assessment error:', error);
      return null;
    }
  }
}
import { Controller, Get, Post, Body } from '@nestjs/common';
import { AIService } from './ai.service';

@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Get('test')
  async testAI() {
    console.log('AI test endpoint called');
    
    const testProject = {
      title: 'Test Project',
      description: 'Testing AI service',
      requiredSkills: ['Leadership', 'Training'],
      budget: 5000,
      type: 'project_based',
      duration: '3 months',
      location: 'Remote'
    };

    const insights = await this.aiService.generateProjectInsights(testProject);
    
    return {
      success: !!insights,
      insights: insights,
      message: insights ? 'AI service working' : 'AI service failed'
    };
  }
}
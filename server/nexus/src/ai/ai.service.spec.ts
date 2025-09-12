import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIService } from './ai.service';

// Mock the AI SDK
jest.mock('@ai-sdk/google', () => ({
  google: jest.fn(() => 'mock-model'),
}));

jest.mock('ai', () => ({
  generateObject: jest.fn(),
  generateText: jest.fn(),
}));

import { generateObject, generateText } from 'ai';

describe('AIService', () => {
  let service: AIService;
  let mockConfigService: any;

  const mockProfessional = {
    skills: ['Leadership', 'Training'],
    experience: 5,
    certifications: ['PMP'],
    languages: ['English'],
    hourlyRate: 100,
    rating: 4.5,
  };

  const mockProject = {
    title: 'Leadership Development',
    description: 'Training program for managers',
    requiredSkills: ['Leadership', 'Communication'],
    budget: 5000,
    languages: ['English'],
    type: 'training',
    duration: '3 months',
    location: 'Remote',
  };

  beforeEach(async () => {
    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    mockConfigService = {
      get: jest.fn().mockReturnValue('mock-api-key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AIService>(AIService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('matchProfessionalToProject', () => {
    it('should return match score successfully', async () => {
      const mockResponse = {
        object: {
          matchScore: 85,
          reasoning: 'Good skill match',
          strengths: ['Leadership experience'],
          concerns: ['Budget compatibility'],
        },
      };

      (generateObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.matchProfessionalToProject(
        mockProfessional,
        mockProject
      );

      expect(result).toBe(85);
      expect(generateObject).toHaveBeenCalledWith({
        model: 'mock-model',
        schema: expect.any(Object),
        prompt: expect.stringContaining('Leadership'),
      });
    });

    it('should return 0 on error', async () => {
      (generateObject as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await service.matchProfessionalToProject(
        mockProfessional,
        mockProject
      );

      expect(result).toBe(0);
    });

    it('should handle missing skills gracefully', async () => {
      const professionalWithoutSkills = { ...mockProfessional, skills: null };
      const mockResponse = { object: { matchScore: 30 } };

      (generateObject as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.matchProfessionalToProject(
        professionalWithoutSkills,
        mockProject
      );

      expect(result).toBe(30);
      expect(generateObject).toHaveBeenCalledWith(
        expect.objectContaining({
          prompt: expect.stringContaining('None specified'),
        })
      );
    });
  });

  describe('generateProjectInsights', () => {
    it('should generate project insights successfully', async () => {
      const mockInsights = {
        object: {
          marketCompetitiveness: 'Highly competitive',
          skillDemand: 'High demand for leadership skills',
          budgetAssessment: 'Budget is reasonable',
          timelineFeasibility: 'Timeline is achievable',
          recommendations: ['Add more specific requirements'],
          riskFactors: ['Market saturation'],
          successProbability: 75,
        },
      };

      (generateObject as jest.Mock).mockResolvedValue(mockInsights);

      const result = await service.generateProjectInsights(mockProject);

      expect(result).toEqual(mockInsights.object);
      expect(generateObject).toHaveBeenCalledWith({
        model: 'mock-model',
        schema: expect.any(Object),
        prompt: expect.stringContaining('Leadership Development'),
      });
    });

    it('should return null on error', async () => {
      (generateObject as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await service.generateProjectInsights(mockProject);

      expect(result).toBeNull();
    });
  });

  describe('analyzeApplication', () => {
    it('should analyze application successfully', async () => {
      const mockApplication = {
        coverLetter: 'I am interested in this project',
        proposedRate: 120,
        estimatedDuration: '2 months',
      };

      const mockAnalysis = {
        object: {
          overallScore: 80,
          skillMatch: 85,
          experienceRelevance: 75,
          proposalQuality: 80,
          rateCompetitiveness: 70,
          strengths: ['Good experience'],
          weaknesses: ['Rate slightly high'],
          recommendation: 'recommend',
          reasoning: 'Strong candidate overall',
        },
      };

      (generateObject as jest.Mock).mockResolvedValue(mockAnalysis);

      const result = await service.analyzeApplication(
        mockApplication,
        mockProfessional,
        mockProject
      );

      expect(result).toEqual(mockAnalysis.object);
      expect(generateObject).toHaveBeenCalledWith({
        model: 'mock-model',
        schema: expect.any(Object),
        prompt: expect.stringContaining('I am interested'),
      });
    });

    it('should return null on error', async () => {
      (generateObject as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await service.analyzeApplication({}, {}, {});

      expect(result).toBeNull();
    });
  });

  describe('generateSkillsAssessment', () => {
    it('should generate skills assessment successfully', async () => {
      const userSkills = ['Leadership', 'Training'];
      const projectRequirements = ['Leadership', 'Communication', 'Management'];

      const mockAssessment = {
        object: {
          matchingSkills: ['Leadership'],
          missingSkills: ['Communication', 'Management'],
          skillGapScore: 60,
          recommendations: ['Learn communication skills'],
          learningPath: ['Take communication course'],
        },
      };

      (generateObject as jest.Mock).mockResolvedValue(mockAssessment);

      const result = await service.generateSkillsAssessment(
        userSkills,
        projectRequirements
      );

      expect(result).toEqual(mockAssessment.object);
      expect(generateObject).toHaveBeenCalledWith({
        model: 'mock-model',
        schema: expect.any(Object),
        prompt: expect.stringContaining('Leadership, Training'),
      });
    });

    it('should return null on error', async () => {
      (generateObject as jest.Mock).mockRejectedValue(new Error('API Error'));

      const result = await service.generateSkillsAssessment([], []);

      expect(result).toBeNull();
    });
  });
});
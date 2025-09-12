import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { MatchingService } from './matching.service';
import { AIService } from '../ai/ai.service';
import { User, UserRole } from '../schemas/user.schema';
import { Project } from '../schemas/project.schema';

describe('MatchingService', () => {
  let service: MatchingService;
  let mockUserModel: any;
  let mockProjectModel: any;
  let mockAIService: any;

  const mockProfessional = {
    _id: 'prof123',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.PROFESSIONAL,
    skills: ['Leadership', 'Training'],
    experience: 5,
    hourlyRate: 100,
    rating: 4.5,
    verified: true,
    status: 'active',
    toObject: jest.fn().mockReturnThis(),
  };

  const mockProject = {
    _id: 'project123',
    title: 'Leadership Training',
    requiredSkills: ['Leadership', 'Communication'],
    budget: 5000,
    status: 'open',
    organizationId: 'org123',
    toObject: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    mockUserModel = {
      find: jest.fn(),
      findById: jest.fn(),
    };

    mockProjectModel = {
      find: jest.fn(),
      findById: jest.fn(),
    };

    mockAIService = {
      matchProfessionalToProject: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken(Project.name),
          useValue: mockProjectModel,
        },
        {
          provide: AIService,
          useValue: mockAIService,
        },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findMatchingProfessionals', () => {
    it('should find matching professionals successfully', async () => {
      mockProjectModel.findById.mockResolvedValue(mockProject);
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockProfessional]),
        }),
      });
      mockAIService.matchProfessionalToProject.mockResolvedValue(85);

      const result = await service.findMatchingProfessionals('project123', 5);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('professional');
      expect(result[0]).toHaveProperty('matchScore', 85);
      expect(result[0]).toHaveProperty('matchLevel', 'very_good');
      expect(mockUserModel.find).toHaveBeenCalledWith({
        role: UserRole.PROFESSIONAL,
        verified: true,
        status: 'active',
      });
    });

    it('should throw error if project not found', async () => {
      mockProjectModel.findById.mockResolvedValue(null);

      await expect(
        service.findMatchingProfessionals('invalid', 5)
      ).rejects.toThrow('Project not found');
    });

    it('should sort professionals by match score', async () => {
      const professionals = [
        { ...mockProfessional, _id: 'prof1' },
        { ...mockProfessional, _id: 'prof2' },
        { ...mockProfessional, _id: 'prof3' },
      ];

      mockProjectModel.findById.mockResolvedValue(mockProject);
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(professionals),
        }),
      });

      mockAIService.matchProfessionalToProject
        .mockResolvedValueOnce(70)
        .mockResolvedValueOnce(90)
        .mockResolvedValueOnce(80);

      const result = await service.findMatchingProfessionals('project123', 10);

      expect(result).toHaveLength(3);
      expect(result[0].matchScore).toBe(90);
      expect(result[1].matchScore).toBe(80);
      expect(result[2].matchScore).toBe(70);
    });

    it('should limit results correctly', async () => {
      const professionals = Array(15).fill(mockProfessional);
      
      mockProjectModel.findById.mockResolvedValue(mockProject);
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(professionals),
        }),
      });
      mockAIService.matchProfessionalToProject.mockResolvedValue(75);

      const result = await service.findMatchingProfessionals('project123', 5);

      expect(result).toHaveLength(5);
    });
  });

  describe('findMatchingProjects', () => {
    it('should find matching projects successfully', async () => {
      mockUserModel.findById.mockResolvedValue(mockProfessional);
      mockProjectModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockProject]),
        }),
      });
      mockAIService.matchProfessionalToProject.mockResolvedValue(88);

      const result = await service.findMatchingProjects('prof123', 5);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('project');
      expect(result[0]).toHaveProperty('matchScore', 88);
      expect(result[0]).toHaveProperty('matchLevel', 'very_good');
      expect(mockProjectModel.find).toHaveBeenCalledWith({ status: 'open' });
    });

    it('should throw error if professional not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);

      await expect(
        service.findMatchingProjects('invalid', 5)
      ).rejects.toThrow('Professional not found');
    });

    it('should throw error if user is not professional', async () => {
      mockUserModel.findById.mockResolvedValue({
        ...mockProfessional,
        role: UserRole.ORGANIZATION,
      });

      await expect(
        service.findMatchingProjects('org123', 5)
      ).rejects.toThrow('Professional not found');
    });
  });

  describe('getMatchLevel', () => {
    it('should return correct match levels', () => {
      expect((service as any).getMatchLevel(95)).toBe('excellent');
      expect((service as any).getMatchLevel(85)).toBe('very_good');
      expect((service as any).getMatchLevel(75)).toBe('good');
      expect((service as any).getMatchLevel(65)).toBe('fair');
      expect((service as any).getMatchLevel(45)).toBe('poor');
    });
  });
});
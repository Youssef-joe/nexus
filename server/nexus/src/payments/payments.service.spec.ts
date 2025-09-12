import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { Payment, PaymentStatus, PaymentType } from '../schemas/payment.schema';
import { Project } from '../schemas/project.schema';
import { User } from '../schemas/user.schema';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockPaymentModel: any;
  let mockProjectModel: any;
  let mockUserModel: any;
  let mockConfigService: any;

  const mockProject = {
    _id: 'project123',
    title: 'Test Project',
    budget: 5000,
    organizationId: 'org123',
  };

  const mockPayment = {
    _id: 'payment123',
    projectId: 'project123',
    organizationId: 'org123',
    amount: 5000,
    platformFee: 250,
    status: PaymentStatus.PENDING,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const MockPaymentModel = jest.fn().mockImplementation(() => mockPayment);
    mockPaymentModel = MockPaymentModel;
    mockPaymentModel.find = jest.fn();
    mockPaymentModel.findOne = jest.fn();
    mockPaymentModel.findByIdAndUpdate = jest.fn();

    mockProjectModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    mockUserModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue('sk_test_fake_key'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: getModelToken(Payment.name),
          useValue: mockPaymentModel,
        },
        {
          provide: getModelToken(Project.name),
          useValue: mockProjectModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      mockProjectModel.findById.mockResolvedValue(mockProject);
      const mockPaymentInstance = {
        ...mockPayment,
        save: jest.fn().mockResolvedValue(mockPayment),
      };
      mockPaymentModel.mockImplementation(() => mockPaymentInstance);

      // Mock Stripe payment intent creation
      const mockStripe = {
        paymentIntents: {
          create: jest.fn().mockResolvedValue({
            id: 'pi_test123',
            client_secret: 'pi_test123_secret',
          }),
        },
      };
      (service as any).stripe = mockStripe;

      const result = await service.createPaymentIntent('project123', 'org123');

      expect(result).toHaveProperty('clientSecret');
      expect(result).toHaveProperty('paymentId');
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 500000, // $5000 in cents
        currency: 'usd',
        application_fee_amount: 25000, // 5% platform fee
        metadata: {
          projectId: 'project123',
          organizationId: 'org123',
        },
      });
    });

    it('should throw error if project not found', async () => {
      mockProjectModel.findById.mockResolvedValue(null);

      await expect(
        service.createPaymentIntent('invalid', 'org123')
      ).rejects.toThrow('Project not found');
    });

    it('should throw error if unauthorized', async () => {
      mockProjectModel.findById.mockResolvedValue({
        ...mockProject,
        organizationId: 'different_org',
      });

      await expect(
        service.createPaymentIntent('project123', 'org123')
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      const mockStripe = {
        paymentIntents: {
          retrieve: jest.fn().mockResolvedValue({
            id: 'pi_test123',
            status: 'succeeded',
          }),
        },
      };
      (service as any).stripe = mockStripe;

      mockPaymentModel.findOne.mockResolvedValue({
        ...mockPayment,
        status: PaymentStatus.PENDING,
        save: jest.fn().mockResolvedValue(true),
      });

      const result = await service.confirmPayment('pi_test123');

      expect(result.success).toBe(true);
      expect(mockProjectModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'project123',
        {
          status: 'funded',
          fundedAt: expect.any(Date),
        }
      );
    });

    it('should handle failed payment', async () => {
      const mockStripe = {
        paymentIntents: {
          retrieve: jest.fn().mockResolvedValue({
            id: 'pi_test123',
            status: 'requires_payment_method',
          }),
        },
      };
      (service as any).stripe = mockStripe;

      mockPaymentModel.findOne.mockResolvedValue(mockPayment);

      const result = await service.confirmPayment('pi_test123');

      expect(result.success).toBe(false);
      expect(result.status).toBe('requires_payment_method');
    });
  });

  describe('getPaymentHistory', () => {
    it('should get payment history for organization', async () => {
      const mockPayments = [
        { ...mockPayment, type: PaymentType.PROJECT_PAYMENT },
      ];

      mockPaymentModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockPayments),
            }),
          }),
        }),
      });

      const result = await service.getPaymentHistory('org123', 'organization');

      expect(mockPaymentModel.find).toHaveBeenCalledWith({
        organizationId: 'org123',
      });
      expect(result).toEqual(mockPayments);
    });

    it('should get payment history for professional', async () => {
      const mockPayments = [
        { ...mockPayment, type: PaymentType.PAYOUT },
      ];

      mockPaymentModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockPayments),
            }),
          }),
        }),
      });

      const result = await service.getPaymentHistory('prof123', 'professional');

      expect(mockPaymentModel.find).toHaveBeenCalledWith({
        professionalId: 'prof123',
      });
      expect(result).toEqual(mockPayments);
    });
  });
});
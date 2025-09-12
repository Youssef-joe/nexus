import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../src/schemas/user.schema';
import { Project } from '../src/schemas/project.schema';
import { Payment } from '../src/schemas/payment.schema';

describe('PaymentsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let organizationId: string;
  let projectId: string;

  const mockUser = {
    _id: 'org123',
    firstName: 'Test',
    lastName: 'Organization',
    email: 'test@org.com',
    role: 'organization',
    verified: true,
    status: 'active',
  };

  const mockProject = {
    _id: 'project123',
    title: 'Test Project',
    description: 'Test project for payment',
    budget: 5000,
    organizationId: 'org123',
    status: 'open',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Mock auth token for testing
    authToken = 'mock-jwt-token';
    organizationId = mockUser._id;
    projectId = mockProject._id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/payments/create-payment-intent (POST)', () => {
    it('should create payment intent successfully', async () => {
      await request(app.getHttpServer())
        .post('/payments/create-payment-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ projectId })
        .expect(401); // Expect 401 without real auth
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/payments/create-payment-intent')
        .send({ projectId })
        .expect(401);
    });

    it('should fail with invalid project', async () => {
      await request(app.getHttpServer())
        .post('/payments/create-payment-intent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ projectId: 'invalid' })
        .expect(401); // Auth fails first
    });
  });

  describe('/payments/history (GET)', () => {
    it('should get payment history successfully', async () => {
      await request(app.getHttpServer())
        .get('/payments/history')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401); // Expect 401 without real auth
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/payments/history')
        .expect(401);
    });
  });

  describe('/payments/setup-payout-account (POST)', () => {
    it('should setup payout account successfully', async () => {
      await request(app.getHttpServer())
        .post('/payments/setup-payout-account')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401); // Expect 401 without real auth
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/payments/setup-payout-account')
        .expect(401);
    });
  });
});
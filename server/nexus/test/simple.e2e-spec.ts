import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Payment E2E Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Payment Routes', () => {
    it('should protect payment intent creation', async () => {
      await request(app.getHttpServer())
        .post('/payments/create-payment-intent')
        .expect(401);
    });

    it('should protect payment history', async () => {
      await request(app.getHttpServer())
        .get('/payments/history')
        .expect(401);
    });

    it('should protect payout setup', async () => {
      await request(app.getHttpServer())
        .post('/payments/setup-payout-account')
        .expect(401);
    });
  });
});
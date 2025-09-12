import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MatchingController (e2e)', () => {
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

  describe('Matching Routes Protection', () => {
    it('should protect professionals matching endpoint', async () => {
      await request(app.getHttpServer())
        .get('/matching/professionals/project123')
        .expect(401);
    });

    it('should protect projects matching endpoint', async () => {
      await request(app.getHttpServer())
        .get('/matching/projects')
        .expect(401);
    });

    it('should handle invalid project ID format', async () => {
      await request(app.getHttpServer())
        .get('/matching/professionals/invalid-id')
        .set('Authorization', 'Bearer fake-token')
        .expect(401); // Auth fails first
    });

    it('should handle limit parameter', async () => {
      await request(app.getHttpServer())
        .get('/matching/professionals/project123?limit=5')
        .expect(401);
    });

    it('should handle projects with limit parameter', async () => {
      await request(app.getHttpServer())
        .get('/matching/projects?limit=10')
        .expect(401);
    });
  });

  describe('Route Validation', () => {
    it('should return 404 for non-existent matching routes', async () => {
      await request(app.getHttpServer())
        .get('/matching/invalid-endpoint')
        .expect(404);
    });

    it('should handle malformed requests', async () => {
      await request(app.getHttpServer())
        .post('/matching/professionals')
        .expect(404); // POST not supported
    });
  });
});
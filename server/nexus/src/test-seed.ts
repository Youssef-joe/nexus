import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seeds/seed-data';

async function testSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);
  
  try {
    const result = await seedService.seedDatabase();
    console.log('Seed successful:', result);
  } catch (error) {
    console.error('Seed failed:', error);
  }
  
  await app.close();
}

testSeed();
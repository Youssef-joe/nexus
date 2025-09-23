import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed-data';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('database')
  async seedDatabase() {
    return await this.seedService.seedDatabase();
  }
}
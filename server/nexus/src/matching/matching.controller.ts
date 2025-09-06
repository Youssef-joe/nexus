import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('professionals/:projectId')
  async findMatchingProfessionals(
    @Param('projectId') projectId: string,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.matchingService.findMatchingProfessionals(projectId, limitNum);
  }

  @Get('projects')
  async findMatchingProjects(
    @Request() req,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.matchingService.findMatchingProjects(req.user.id, limitNum);
  }
}
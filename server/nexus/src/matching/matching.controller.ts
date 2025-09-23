import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('matching')
@UseGuards(JwtAuthGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Public()
  @Get('professionals/:projectId')
  async getMatchingProfessionals(
    @Param('projectId') projectId: string,
    @Request() req,
    @Query('limit') limit?: string
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.matchingService.findMatchingProfessionals(projectId, limitNum);
  }

  @Get('projects')
  async getMatchingProjects(
    @Request() req,
    @Query('limit') limit?: string
  ) {
    if (req.user.role !== 'professional') {
      throw new Error('Only professionals can access project recommendations');
    }
    
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.matchingService.findMatchingProjects(req.user.id, limitNum);
  }
}
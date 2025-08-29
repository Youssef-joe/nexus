import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Request, 
  Query,
  ForbiddenException 
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../schemas/user.schema';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Request() req) {
    if (req.user.role !== UserRole.ORGANIZATION) {
      throw new ForbiddenException('Only organizations can create projects');
    }
    return this.projectsService.create(createProjectDto, req.user._id);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.projectsService.findAll(query);
  }

  @Get('my-projects')
  async getMyProjects(@Request() req) {
    return this.projectsService.getMyProjects(req.user._id, req.user.role);
  }

  @Get('recommended')
  async getRecommendedProjects(@Request() req) {
    if (req.user.role !== UserRole.PROFESSIONAL) {
      throw new ForbiddenException('Only professionals can get recommendations');
    }
    return this.projectsService.getRecommendedProjects(req.user._id);
  }

  @Get('search')
  async searchProjects(@Query('q') query: string, @Query() filters: any) {
    return this.projectsService.searchProjects(query, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string, 
    @Body() updateProjectDto: UpdateProjectDto,
    @Request() req
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user._id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user._id);
  }
}
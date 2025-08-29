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
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from '../dto/application.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../schemas/user.schema';

@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  async create(@Body() createApplicationDto: CreateApplicationDto, @Request() req) {
    if (req.user.role !== UserRole.PROFESSIONAL) {
      throw new ForbiddenException('Only professionals can apply to projects');
    }
    return this.applicationsService.create(createApplicationDto, req.user._id);
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.applicationsService.findAll(query);
  }

  @Get('my-applications')
  async getMyApplications(@Request() req) {
    return this.applicationsService.getMyApplications(req.user._id, req.user.role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateApplicationStatusDto,
    @Request() req
  ) {
    if (req.user.role !== UserRole.ORGANIZATION) {
      throw new ForbiddenException('Only organizations can update application status');
    }
    return this.applicationsService.updateStatus(id, updateStatusDto, req.user._id);
  }

  @Delete(':id/withdraw')
  async withdraw(@Param('id') id: string, @Request() req) {
    if (req.user.role !== UserRole.PROFESSIONAL) {
      throw new ForbiddenException('Only professionals can withdraw applications');
    }
    return this.applicationsService.withdraw(id, req.user._id);
  }
}
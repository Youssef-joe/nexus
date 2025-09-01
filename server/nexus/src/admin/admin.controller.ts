import { Controller, Get, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getAdminStats(@Request() req) {
    if (req.user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can access this endpoint');
    }
    return this.adminService.getAdminStats();
  }
}
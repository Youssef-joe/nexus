import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto, UpdateResourceDto } from '../dto/resource.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ResourceType } from '../schemas/resource.schema';

@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createResourceDto: CreateResourceDto, @Request() req) {
    return this.resourcesService.create(createResourceDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('type') type?: ResourceType,
    @Query('category') category?: string,
    @Query('featured') featured?: string,
  ) {
    return this.resourcesService.findAll(type, category, featured === 'true');
  }

  @Get('featured')
  getFeatured() {
    return this.resourcesService.getFeatured();
  }

  @Get('categories')
  getCategories() {
    return this.resourcesService.getCategories();
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.resourcesService.search(query);
  }

  @Get('type/:type')
  getByType(@Param('type') type: ResourceType) {
    return this.resourcesService.getByType(type);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
    return this.resourcesService.update(id, updateResourceDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.resourcesService.remove(id);
  }
}
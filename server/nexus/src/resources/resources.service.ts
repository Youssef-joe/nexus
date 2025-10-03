import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, ResourceDocument, ResourceType, ResourceStatus } from '../schemas/resource.schema';
import { CreateResourceDto, UpdateResourceDto } from '../dto/resource.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
  ) {}

  async create(createResourceDto: CreateResourceDto, authorId: string): Promise<Resource> {
    const resource = new this.resourceModel({
      ...createResourceDto,
      authorId,
    });
    return resource.save();
  }

  async findAll(type?: ResourceType, category?: string, featured?: boolean): Promise<Resource[]> {
    const filter: any = { status: ResourceStatus.PUBLISHED };
    
    if (type) filter.type = type;
    if (category) filter.categories = category;
    if (featured) filter.isFeatured = true;

    return this.resourceModel
      .find(filter)
      .populate('authorId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceModel
      .findById(id)
      .populate('authorId', 'firstName lastName');
    
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }

    // Increment view count
    await this.resourceModel.findByIdAndUpdate(id, { $inc: { viewsCount: 1 } });
    
    return resource;
  }

  async update(id: string, updateResourceDto: UpdateResourceDto): Promise<Resource> {
    const resource = await this.resourceModel
      .findByIdAndUpdate(id, updateResourceDto, { new: true })
      .populate('authorId', 'firstName lastName');
    
    if (!resource) {
      throw new NotFoundException('Resource not found');
    }
    
    return resource;
  }

  async remove(id: string): Promise<void> {
    const result = await this.resourceModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Resource not found');
    }
  }

  async getFeatured(): Promise<Resource[]> {
    return this.resourceModel
      .find({ status: ResourceStatus.PUBLISHED, isFeatured: true })
      .populate('authorId', 'firstName lastName')
      .limit(6);
  }

  async getByType(type: ResourceType): Promise<Resource[]> {
    return this.resourceModel
      .find({ status: ResourceStatus.PUBLISHED, type })
      .populate('authorId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async search(query: string): Promise<Resource[]> {
    return this.resourceModel
      .find({
        status: ResourceStatus.PUBLISHED,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { tags: { $in: [new RegExp(query, 'i')] } },
        ],
      })
      .populate('authorId', 'firstName lastName')
      .sort({ createdAt: -1 });
  }

  async getCategories(): Promise<string[]> {
    const resources = await this.resourceModel.find({ status: ResourceStatus.PUBLISHED });
    const categories = resources.flatMap(r => r.categories);
    return [...new Set(categories)];
  }
}
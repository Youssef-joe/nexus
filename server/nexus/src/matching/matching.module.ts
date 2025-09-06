import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchingController } from './matching.controller';
import { MatchingService } from './matching.service';
import { User, UserSchema } from '../schemas/user.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { AIModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
    AIModule,
  ],
  controllers: [MatchingController],
  providers: [MatchingService],
  exports: [MatchingService],
})
export class MatchingModule {}
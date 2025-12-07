import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgressController } from './user-progress.controller';
import { UserProgressService } from './user-progress.service';
import { UserProgress, UserProgressSchema } from './schemas/user-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserProgress.name, schema: UserProgressSchema },
    ]),
  ],
  controllers: [UserProgressController],
  providers: [UserProgressService],
  exports: [UserProgressService],
})
export class UserProgressModule {}


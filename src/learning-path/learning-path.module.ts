import { Module } from '@nestjs/common';
import { LearningPathController } from './learning-path.controller';
import { LearningPathService } from './learning-path.service';
import { LearningStepsModule } from '../learning-steps/learning-steps.module';
import { UserProgressModule } from '../user-progress/user-progress.module';
import { StepAttemptsModule } from '../step-attempts/step-attempts.module';

@Module({
  imports: [
    LearningStepsModule,
    UserProgressModule,
    StepAttemptsModule,
  ],
  controllers: [LearningPathController],
  providers: [LearningPathService],
  exports: [LearningPathService],
})
export class LearningPathModule {}


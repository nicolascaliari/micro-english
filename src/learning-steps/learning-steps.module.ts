import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningStepsController } from './learning-steps.controller';
import { LearningStepsService } from './learning-steps.service';
import { LearningStep, LearningStepSchema } from './schemas/learning-step.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LearningStep.name, schema: LearningStepSchema },
    ]),
  ],
  controllers: [LearningStepsController],
  providers: [LearningStepsService],
  exports: [LearningStepsService],
})
export class LearningStepsModule {}


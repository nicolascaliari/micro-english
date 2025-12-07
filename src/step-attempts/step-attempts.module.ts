import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StepAttemptsController } from './step-attempts.controller';
import { StepAttemptsService } from './step-attempts.service';
import { StepAttempt, StepAttemptSchema } from './schemas/step-attempt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: StepAttempt.name, schema: StepAttemptSchema },
    ]),
  ],
  controllers: [StepAttemptsController],
  providers: [StepAttemptsService],
  exports: [StepAttemptsService],
})
export class StepAttemptsModule {}


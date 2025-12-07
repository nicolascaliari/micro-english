import { PartialType } from '@nestjs/mapped-types';
import { CreateLearningStepDto } from './create-learning-step.dto';

export class UpdateLearningStepDto extends PartialType(CreateLearningStepDto) {}


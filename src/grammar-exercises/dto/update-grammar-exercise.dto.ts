import { PartialType } from '@nestjs/mapped-types';
import { CreateGrammarExerciseDto } from './create-grammar-exercise.dto';

export class UpdateGrammarExerciseDto extends PartialType(CreateGrammarExerciseDto) {}


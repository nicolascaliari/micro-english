import { IsNumber, Min, Max } from 'class-validator';

export class CompleteStepDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @IsNumber()
  @Min(0)
  total_questions: number;

  @IsNumber()
  @Min(0)
  correct_answers: number;
}


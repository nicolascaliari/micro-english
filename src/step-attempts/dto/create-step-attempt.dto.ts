import { IsString, IsNumber, IsBoolean, IsOptional, IsDate, Min, Max } from 'class-validator';

export class CreateStepAttemptDto {
  @IsString()
  userId: string;

  @IsString()
  stepId: string;

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

  @IsOptional()
  @IsDate()
  started_at?: Date;

  @IsOptional()
  @IsDate()
  completed_at?: Date;

  @IsBoolean()
  passed: boolean;
}


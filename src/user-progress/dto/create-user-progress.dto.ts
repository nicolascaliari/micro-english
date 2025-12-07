import { IsString, IsOptional, IsIn, IsNumber, IsDate, Min, Max } from 'class-validator';

export class CreateUserProgressDto {
  @IsString()
  userId: string;

  @IsString()
  stepId: string;

  @IsOptional()
  @IsString()
  @IsIn(['locked', 'in_progress', 'completed'])
  status?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  attempts_count?: number;

  @IsOptional()
  @IsDate()
  completed_at?: Date;

  @IsOptional()
  @IsDate()
  unlocked_at?: Date;
}


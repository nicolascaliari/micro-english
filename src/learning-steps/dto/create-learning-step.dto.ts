import { IsString, IsNumber, IsArray, IsBoolean, IsOptional, IsIn, Min } from 'class-validator';

export class CreateLearningStepDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  emoji: string;

  @IsString()
  @IsIn(['vocabulary', 'grammar', 'tips', 'reading', 'listening', 'speaking'])
  type: string;

  @IsNumber()
  @Min(1)
  order: number;

  @IsString()
  categoryId: string;

  @IsNumber()
  @Min(0)
  required_score: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  unlock_requirements?: number[];

  @IsString()
  route: string;

  @IsString()
  color: string;

  @IsString()
  bg_color: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}


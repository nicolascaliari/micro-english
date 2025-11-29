import { IsNumber, Min } from 'class-validator';

export class UpdateStreakDto {
  @IsNumber()
  @Min(0)
  streak: number;
}


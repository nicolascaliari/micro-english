import { IsNumber, Min } from 'class-validator';

export class UpdatePointsDto {
  @IsNumber()
  points: number;
}


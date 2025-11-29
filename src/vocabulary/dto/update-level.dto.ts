import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateLevelDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  level: string;
}


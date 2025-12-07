import { IsString, IsNumber, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  order: number;
}


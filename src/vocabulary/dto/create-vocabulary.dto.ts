import { IsString, IsNotEmpty, IsOptional, IsArray, IsIn } from 'class-validator';

export class CreateVocabularyDto {
  @IsString()
  @IsNotEmpty()
  word: string;

  @IsString()
  @IsNotEmpty()
  translation: string;

  @IsString()
  @IsNotEmpty()
  example: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  level: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  audioUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}


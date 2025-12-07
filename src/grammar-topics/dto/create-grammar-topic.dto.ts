import { IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StructureExampleDto {
  @IsString()
  en: string;

  @IsString()
  es: string;
}

export class GrammarStructureDto {
  @IsString()
  rule: string;

  @IsString()
  pattern: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StructureExampleDto)
  examples?: StructureExampleDto[];
}

export class ExampleDto {
  @IsString()
  en: string;

  @IsString()
  es: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateGrammarTopicDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GrammarStructureDto)
  structure?: GrammarStructureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleDto)
  examples?: ExampleDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tips?: string[];
}


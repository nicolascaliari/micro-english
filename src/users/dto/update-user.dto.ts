import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional, IsDate, Min } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsNumber()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  streak?: number;

  @IsOptional()
  @IsDate()
  lastActivity?: Date;
}


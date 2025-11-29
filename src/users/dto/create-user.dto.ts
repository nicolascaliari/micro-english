import { IsEmail, IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsIn(['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])
  level?: string;
}


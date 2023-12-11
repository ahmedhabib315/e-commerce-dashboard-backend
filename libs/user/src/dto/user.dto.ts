import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/auth/enum/auth.enum';

export class CreateUser {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  name: string;
}
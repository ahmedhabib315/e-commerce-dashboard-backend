import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '../enum/auth.enum';

export class Signup {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role?: UserRole;
}

export class VerifyOtp {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(4)
  otp: string;
}

export class SignIn {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

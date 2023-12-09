import { IsEmail, IsEnum, IsString, MinLength, isString } from "class-validator";
import { UserRole } from "../enum/auth.enum";

export class Signup {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
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
import { IsEmail, IsEnum, IsOptional, IsString, MinLength, isString } from "class-validator";
import { UserRole } from "src/auth/enum/auth.enum";

export class DeleteUser {
  @IsEmail()
  email: string;
}
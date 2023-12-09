import { IsEmail, IsEnum, IsString, MinLength, isString } from "class-validator";

export class CreateUser {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password?: string;
}
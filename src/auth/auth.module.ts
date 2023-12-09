import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '@app/user';
import { OtpService } from '@app/otp';
import { PrismaService } from '@app/prisma';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, OtpService, PrismaService, JwtService],
})
export class AuthModule {}

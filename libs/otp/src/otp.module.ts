import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { PrismaService } from '@app/prisma';

@Module({
  providers: [OtpService, PrismaService],
  exports: [OtpService],
})
export class OtpModule {}
